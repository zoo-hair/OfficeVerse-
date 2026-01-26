# Quick Start Guide - GenAI Feature (Server-Side)

## ⚡ 5-Minute Setup

### Step 1: Backend Configuration (2 minutes)

Get your Hugging Face API key:
1. Go to https://huggingface.co/settings/tokens
2. Create new token (read access)
3. Copy the token

Add to `officeVerse_server/src/main/resources/application.properties`:
```properties
genai.huggingface.api-key=YOUR_TOKEN_HERE
genai.huggingface.model=mistralai/Mistral-7B-Instruct
```

### Step 2: Start Backend (1 minute)
```bash
cd officeVerse_server
gradle bootRun
```

Or using Maven:
```bash
mvn spring-boot:run
```

Expected output:
```
Started OffficevVerseApplication in 5 seconds
```

### Step 3: Test Backend (1 minute)
```bash
curl http://localhost:8080/api/genai/health
```

Expected response:
```json
{"status":"UP","service":"GenAI","available":true}
```

### Step 4: Start Frontend & Test (1 minute)
1. Start your OfficeVerse client
2. Find the GenAI zone (look for it on minimap)
3. Press F when you see "[F] Use AI Assistant"
4. Type a question and press Enter
5. Wait for response (~3-5 seconds)

Done! ✅

---

## 🎮 How to Use

### Opening AI Assistant
1. Walk to the GenAI zone in your office
2. You'll see: **[F] Use AI Assistant**
3. Press **F** to open the panel

### Chatting with AI
1. Type your question in the input field
2. Press **Enter** or click **Send**
3. Wait for AI to respond
4. Continue conversation normally

### Closing Panel
- Click the **X** button in the top right
- Or press Escape (optional)

---

## 💡 Example Questions to Try

```
"What is quantum computing?"
"How do I write a Python function?"
"Tell me about project management"
"What are good communication tips?"
"Explain machine learning"
```

---

## ⚙️ Configuration File Locations

**Backend Configuration File**:
- Location: `officeVerse_server/src/main/resources/application.properties`
- Key Setting: `genai.huggingface.api-key=hf_your_api_key_here`

**Environment Variable** (Alternative):
```bash
export GENAI_HUGGINGFACE_API_KEY=hf_your_api_key_here
```

**Model Configuration**:
```properties
genai.huggingface.model=mistralai/Mistral-7B-Instruct
```

---

## 📊 API Endpoints

### For Developers

#### Query Endpoint
```bash
curl -X POST http://localhost:8080/api/genai/query \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is AI?",
    "roomId": "room123"
  }'
```

#### Status Endpoint
```bash
curl http://localhost:8080/api/genai/status
```

#### Health Check
```bash
curl http://localhost:8080/api/genai/health
```

---

## 🎯 Features

| Feature | Status |
|---------|--------|
| Chat UI | ✅ Active |
| Text Input | ✅ Active |
| Send Prompt | ✅ Active |
| Display Responses | ✅ Active |
| Chat History | ✅ Active |
| Loading Indicator | ✅ Active |
| Error Handling | ✅ Active |
| Enter Key Support | ✅ Active |
| Dark Theme UI | ✅ Active |

---

## 📱 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **F** | Open AI Assistant |
| **Enter** | Send Message (while in input) |
| **X** | Close Panel |
| **Esc** | Close Panel (optional) |

---

## 🔍 Troubleshooting

### Backend won't start?
→ Check Java/Gradle installation
→ Check port 8080 is available
→ Check logs for errors

### Health check fails?
→ Backend not running
→ Check `gradle bootRun` output
→ Verify port 8080

### "Failed to process GenAI request"?
→ Check backend is running
→ Verify API key in application.properties
→ Check internet connection

### No response after waiting?
→ Check your internet connection
→ Verify API key on Hugging Face website
→ Check Hugging Face service status

### Response is slow?
→ Normal - first response takes ~3-5 seconds
→ Model is loading from cache
→ Hugging Face free tier may have delays

### "GenAI service not available"?
→ API key not configured
→ Add to application.properties
→ Restart backend server

---

## 📍 Zone Location

The GenAI zone is located in your office map. To find it:
1. Open minimap in bottom-right corner
2. Look for the genAI zone label
3. Walk into the zone area

If you don't see the GenAI zone:
→ Check your Tiled map file has a `genAI` zone defined in `zone` object layer
→ Make sure map is saved and reloaded

---

## 💰 Hugging Face Pricing

**Your Free Tier Usage:**
- Requests per month: Depends on plan
- Cost: Free for small usage
- Monitor at: https://huggingface.co/settings/billing/overview

**Upgrade Options:**
- **Free**: Unlimited, but slow
- **Starter**: $9/month for better performance
- **Pro**: $50/month+ for priority access

---

## 🌐 What You Can Ask

✅ General knowledge questions
✅ Programming help
✅ Writing assistance
✅ Problem solving
✅ Explanations & learning
✅ Creative writing
✅ Code debugging
✅ And much more!

❌ Real-time data (weather, stocks, news)
❌ File uploads
❌ Image processing
❌ Very recent events (knowledge cutoff)

---

## 📞 Quick Help Links

- **Backend Troubleshooting**: Check application.properties
- **Hugging Face API Docs**: https://huggingface.co/docs/api-inference
- **Mistral Model**: https://huggingface.co/mistralai/Mistral-7B-Instruct
- **Spring Boot Guide**: https://spring.io/projects/spring-boot
- **Status Page**: https://status.huggingface.co

---

## 🚀 Deployment

### Production Checklist

- [ ] API key set via environment variable (not in code)
- [ ] Backend running on prod server
- [ ] Frontend pointing to correct backend URL
- [ ] SSL/HTTPS enabled for production
- [ ] Rate limiting configured
- [ ] Error logging enabled
- [ ] Monitoring setup (optional)
- [ ] Backup/recovery plan (optional)

### Environment Variables for Production

```bash
export GENAI_HUGGINGFACE_API_KEY=hf_prod_key_here
export GENAI_HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct
```

---

## 🛠️ Architecture

```
Frontend                Backend            Hugging Face
┌─────────┐          ┌────────┐          ┌──────────┐
│ UI Chat │──POST──→ │ Spring │──POST──→ │ Mistral  │
│ Input   │          │ Boot   │          │ API      │
│ Display │←─────────│ Server │←────────│          │
└─────────┘          └────────┘          └──────────┘
```

All API keys and secrets on backend only!

---

**Version**: 1.0
**Last Updated**: January 26, 2026
**Status**: Production Ready
**Architecture**: Server-Side Integration ✅
