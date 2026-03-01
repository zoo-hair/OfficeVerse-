export class VoiceManager {
    constructor(socket, playerId, onStatusChange, onIncomingCall) {
        this.socket = socket;
        this.playerId = playerId;
        this.onStatusChange = onStatusChange || (() => { });
        this.onIncomingCall = onIncomingCall || (() => { });

        // Unified Active Calls Map: <PlayerId, { peerConnection, remoteAudio }>
        this.activeCalls = {};
        this.localStream = null;
        this.isInMeeting = false;
        this.currentRoomId = null;

        // Pending 1-on-1 offer
        this.pendingOffer = null;

        // ICE servers
        this.configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };

        // Queue for ICE candidates that arrive before RemoteDescription is set
        this.pendingCandidates = {}; // <PlayerId, [candidates]>
    }

    // --- Meeting Logic ---

    joinMeeting(roomId) {
        if (this.isInMeeting) return;
        this.isInMeeting = true;
        this.currentRoomId = roomId;
        this.onStatusChange("Joined Meeting. Waiting for others...", false);

        // Initialize local stream immediately
        this.getLocalStream().then(() => {
            if (this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(`MEETING_JOIN:${roomId}:${this.playerId}`);
            }
        }).catch(e => console.error("Mic error on join:", e));
    }

    leaveMeeting() {
        if (!this.isInMeeting) return;
        this.isInMeeting = false;

        if (this.socket.readyState === WebSocket.OPEN && this.currentRoomId) {
            this.socket.send(`MEETING_LEAVE:${this.currentRoomId}:${this.playerId}`);
        }

        this.currentRoomId = null;
        this.endAllCalls();
        this.onStatusChange("Left Meeting.");
    }

    // --- Signal Handling ---

    async handleSignal(senderId, payload) {
        // 1. Special Meeting Signals
        if (payload.startsWith("MEETING_LIST:")) {
            const listStr = payload.substring(13);
            if (listStr.length > 0) {
                const ids = listStr.split(',');
                console.log("Meeting participants to call:", ids);
                // Call everyone in the list
                ids.forEach(id => {
                    if (id && id !== String(this.playerId)) {
                        this.startCall(id, true);
                    }
                });
            }
            return;
        }

        if (payload.startsWith("MEETING_USER_JOINED:")) {
            const newPlayerId = payload.split(':')[1];
            if (newPlayerId == this.playerId) return; // Ignore self
            console.log(`Player ${newPlayerId} joined meeting.`);
            this.onStatusChange(`Player ${newPlayerId} joined meeting.`);
            // We wait for them to call us
            return;
        }

        if (payload.startsWith("MEETING_USER_LEFT:")) {
            const leftPlayerId = payload.split(':')[1];
            console.log(`Player ${leftPlayerId} left meeting.`);
            this.endCall(leftPlayerId, true); // Treat as remote end
            this.onStatusChange(`Player ${leftPlayerId} left meeting.`);
            return;
        }

        // 2. WebRTC Signals (JSON)
        let data;
        try {
            data = JSON.parse(payload);
        } catch (e) {
            console.error("Failed to parse signal:", payload);
            return;
        }

        console.log("Received signal:", data.type, "from", senderId);

        if (data.type === 'offer') {
            // A. Meeting Auto-Accept
            if (this.isInMeeting) {
                console.log("Auto-accepting meeting call from", senderId);
                await this.acceptCall(senderId, data.sdp);
                return;
            }

            // B. 1-on-1 Logic (Busy Check)
            if (Object.keys(this.activeCalls).length > 0) {
                console.log("Busy: rejecting", senderId);
                this.sendSignal(senderId, { type: 'busy' });
                return;
            }

            // C. 1-on-1 Incoming
            this.pendingOffer = { senderId, sdp: data.sdp };
            this.onIncomingCall(senderId);

        } else if (data.type === 'answer') {
            const call = this.activeCalls[senderId];
            if (call && call.peerConnection) {
                try {
                    await call.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
                    console.log("Remote description set (answer) for", senderId);

                    // Update caller status to Connected
                    if (!this.isInMeeting) {
                        this.onStatusChange("Connected.", true);
                    }

                    // Process any queued candidates
                    await this.processQueuedCandidates(senderId);
                } catch (e) { console.error("Error setting remote desc (answer)", e); }
            }

        } else if (data.type === 'candidate') {
            const call = this.activeCalls[senderId];
            const pc = call ? call.peerConnection : null;

            if (pc && pc.remoteDescription && pc.remoteDescription.type) {
                // Remote description is set, add candidate directly
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                    console.log("Added ICE candidate from", senderId);
                } catch (e) { console.error("Error adding ICE", e); }
            } else {
                // Queue candidate until remote description is set
                console.log("Queuing ICE candidate from", senderId);
                if (!this.pendingCandidates[senderId]) this.pendingCandidates[senderId] = [];
                this.pendingCandidates[senderId].push(data.candidate);
            }

        } else if (data.type === 'bye') {
            this.endCall(senderId, true);
            if (!this.isInMeeting) this.onStatusChange("Call ended by remote.");

        } else if (data.type === 'busy') {
            this.endCall(senderId, true); // Clean up local
            if (!this.isInMeeting) this.onStatusChange(`Player ${senderId} is busy.`);

        } else if (data.type === 'reject') {
            this.endCall(senderId, true);
            if (!this.isInMeeting) this.onStatusChange("Call rejected.");
        }
    }

    // --- Call Management ---

    async startCall(targetId, isMeeting = false) {
        if (this.activeCalls[targetId]) return;

        if (!isMeeting) {
            this.onStatusChange(`Calling Player ${targetId}...`, true);
        }

        await this.getLocalStream();
        const pc = this.createPeerConnection(targetId);

        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.sendSignal(targetId, { type: 'offer', sdp: offer });
        } catch (err) {
            console.error("Error creating offer:", err);
            this.endCall(targetId);
        }
    }

    async acceptCall(targetId, remoteSdp) {
        if (this.activeCalls[targetId]) return; // Already exists?

        await this.getLocalStream();
        const pc = this.createPeerConnection(targetId);

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(remoteSdp));
            console.log("Remote description set (offer) from", targetId);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            this.sendSignal(targetId, { type: 'answer', sdp: answer });

            if (!this.isInMeeting) {
                this.onStatusChange("Connected.", true);
            }

            // Process any queued candidates
            await this.processQueuedCandidates(targetId);
        } catch (err) {
            console.error("Error accepting call:", err);
            this.endCall(targetId);
        }
    }

    // Used by UI for 1-on-1 accept
    async acceptIncomingCall() {
        if (!this.pendingOffer) return;
        const { senderId, sdp } = this.pendingOffer;
        this.pendingOffer = null;

        this.onStatusChange("Connecting...", true);
        await this.acceptCall(senderId, sdp);
    }

    rejectIncomingCall() {
        if (this.pendingOffer) {
            this.sendSignal(this.pendingOffer.senderId, { type: 'reject' });
            this.pendingOffer = null;
        }
    }

    createPeerConnection(targetId) {
        console.log("Creating PeerConnection for", targetId);
        const pc = new RTCPeerConnection(this.configuration);

        // Add Local Tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => pc.addTrack(track, this.localStream));
        }

        // Create Audio Element
        const audio = document.createElement('audio');
        audio.autoplay = true;
        document.body.appendChild(audio);

        this.activeCalls[targetId] = { peerConnection: pc, remoteAudio: audio };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignal(targetId, { type: 'candidate', candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            console.log(`Received track from ${targetId}`, event.streams[0].id);
            if (audio.srcObject !== event.streams[0]) {
                audio.srcObject = event.streams[0];
                audio.muted = false;
                audio.play().then(() => {
                    console.log(`Audio playing for ${targetId}`);
                }).catch(e => console.error("Autoplay failed", e));
            }
        };

        pc.onconnectionstatechange = () => {
            console.log(`PC State ${targetId}: ${pc.connectionState}`);
            if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
                this.endCall(targetId);
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log(`ICE State ${targetId}: ${pc.iceConnectionState}`);
        };

        return pc;
    }

    async getLocalStream() {
        if (this.localStream) return this.localStream;
        try {
            console.log("Requesting Mic Access...");
            this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            console.log("Mic Access Granted.");
            return this.localStream;
        } catch (err) {
            console.error("Mic Error:", err);
            this.onStatusChange("Mic Access Failed. Check Permissions.");
            throw err;
        }
    }

    async processQueuedCandidates(targetId) {
        const candidates = this.pendingCandidates[targetId];
        const call = this.activeCalls[targetId];
        if (!candidates || !call || !call.peerConnection) return;

        console.log(`Processing ${candidates.length} queued candidates for ${targetId}`);
        while (candidates.length > 0) {
            const candidate = candidates.shift();
            try {
                await call.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                console.log("Added queued ICE candidate for", targetId);
            } catch (e) {
                console.error("Error adding queued ICE:", e);
            }
        }
        delete this.pendingCandidates[targetId];
    }

    sendSignal(targetId, data) {
        if (this.socket.readyState === WebSocket.OPEN) {
            const json = JSON.stringify(data);
            this.socket.send(`VOICE_SIGNAL:${this.playerId}:${targetId}:${json}`);
        }
    }

    // Ends a specific call or ALL calls if no targetId
    endCall(targetId, isRemote = false) {
        if (targetId) {
            const call = this.activeCalls[targetId];
            if (call) {
                console.log(`Ending call with ${targetId} (Remote: ${isRemote})`);
                if (!isRemote) this.sendSignal(targetId, { type: 'bye' });

                call.peerConnection.onconnectionstatechange = null; // Prevent loops
                call.peerConnection.close();

                if (call.remoteAudio) {
                    call.remoteAudio.pause();
                    call.remoteAudio.srcObject = null;
                    call.remoteAudio.remove();
                }
                delete this.activeCalls[targetId];
                delete this.pendingCandidates[targetId];
            }
        } else {
            // Triggered by UI "End Call" -> End Everything
            console.log("Ending ALL calls");
            Object.keys(this.activeCalls).forEach(id => this.endCall(id));

            this.onStatusChange("Call ended.");
            if (this.isInMeeting) {
                this.leaveMeeting();
            }
        }

        // Cleanup stream if fully idle
        if (Object.keys(this.activeCalls).length === 0 && !this.isInMeeting) {
            if (this.localStream) {
                console.log("Stopping local stream");
                this.localStream.getTracks().forEach(t => t.stop());
                this.localStream = null;
            }
        }
    }

    endAllCalls() {
        Object.keys(this.activeCalls).forEach(id => this.endCall(id, true));
    }
}
