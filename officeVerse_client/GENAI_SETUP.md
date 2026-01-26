# GenAI Zone Integration - Setup Guide

This guide walks you through setting up the GenAI zone interaction feature. The backend handles Mistral-7B-Instruct integration via Hugging Face Inference API.

## 📋 Overview

The GenAI zone feature allows players to:
1. Enter a designated **genAI zone** in the office map
2. Press **F** to open the AI Assistant UI panel
3. Type prompts/queries into the input field
4. Backend processes request via Mistral-7B-Instruct AI model
5. Receive responses and view conversation history in chat interface

## 🏗️ Architecture

```
Frontend (Client)              Backend (Server)           External API
┌─────────────────┐          ┌──────────────────┐       ┌──────────────┐
│  UI Panel       │──POST──→ │  GenAIController │──────→│  Hugging Face│
│  Prompt Input   │          │  genAIService    │       │  Mistral API │
│  Chat Display   │←─Response│  (calls HF API)  │←──────│              │
└─────────────────┘          └──────────────────┘       └──────────────┘
```

## 🚀 Getting Started

### Backend Setup

#### Step 1: Get Hugging Face API Key

1. Visit [Hugging Face](https://huggingface.co/)
2. Sign up or log in to your account
3. Navigate to **Settings > Access Tokens**
4. Create a new token with **read** permissions
5. Copy your API key

#### Step 2: Configure Backend

Add to `officeVerse_server/src/main/resources/application.properties`:

```properties
# GenAI Configuration
genai.huggingface.api-key=hf_your_actual_api_key_here
genai.huggingface.model=mistralai/Mistral-7B-Instruct
```

Or via environment variables:
```bash
export GENAI_HUGGINGFACE_API_KEY=hf_your_actual_api_key_here
```

#### Step 3: Verify Backend Configuration

Test the endpoint:
```bash
curl http://localhost:8080/api/genai/health
```

Expected response:
```json
{
  "status": "UP",
  "service": "GenAI",
  "available": true
}
```

### Frontend Setup

No special configuration needed! The frontend automatically communicates with:
- **Endpoint**: `http://localhost:8080/api/genai/query`
- **Method**: POST
- **Response Time**: ~3-5 seconds (depends on Hugging Face)

#### Step 4: Verify Zone Setup

Make sure your Tiled map (`assets/maps/office_map.json`) has a zone named `genAI` in its object layer named `zone`.

You can verify this by:
1. Opening your map file in Tiled Editor
2. Looking for an object layer named `zone`
3. Confirming there's a rectangle object named `genAI` in that layer

If the zone doesn't exist, add it:
1. Create/select the `zone` object layer in Tiled
2. Use the Rectangle tool to draw a zone area
3. Name it `genAI` (case-sensitive)
4. Save the map

#### Step 5: Test the Feature

1. Start your backend server
2. Start your OfficeVerse client application
3. Navigate to the GenAI zone in your office
4. You should see the prompt: **[F] Use AI Assistant**
5. Press **F** to open the AI Assistant panel
6. Type a prompt and press Enter or click Send
7. The AI should respond with an answer

## 📁 Files Modified/Created

### Frontend Files:
- **`src/network/GenAIModule.js`** - Client-side API communication with backend
- **`index.html`** - Added GenAI panel HTML structure
- **`src/styles/ui.css`** - Added GenAI panel styling
- **`src/game/scenes/OfficeScene.js`** - Added GenAI UI handlers and zone interaction

### Backend Files:
- **`src/main/java/com/offficeVerse/controller/GenAIController.java`** - REST API endpoints (NEW)
- **`src/main/java/com/offficeVerse/service/genAIService.java`** - Hugging Face API integration

### Configuration Files:
- **`application.properties`** - Add GenAI configuration (SEE STEP 2 ABOVE)

## 🎮 API Endpoints

### Query Endpoint
```
POST /api/genai/query
Content-Type: application/json

Request:
{
  "prompt": "What is machine learning?",
  "roomId": "room123",
  "timestamp": "2024-01-26T10:30:00Z"
}

Response:
{
  "success": true,
  "response": "Machine learning is a subset of artificial intelligence...",
  "roomId": "room123",
  "timestamp": 1706259000000
}
```

### Status Endpoint
```
GET /api/genai/status

Response:
{
  "available": true,
  "model": "mistralai/Mistral-7B-Instruct",
  "provider": "Hugging Face Inference API",
  "configuredKey": true,
  "endpoint": "Mistral-7B-Instruct",
  "ready": true
}
```

### Health Endpoint
```
GET /api/genai/health

Response:
{
  "status": "UP",
  "service": "GenAI",
  "timestamp": 1706259000000,
  "available": true
}
```

## 🎮 User Interface

### GenAI Panel Components:

1. **Header**
   - Title: "AI Assistant 🤖"
   - Close button (X)

2. **Chat History**
   - Displays conversation between user and AI
   - User messages appear on the right (blue)
   - AI responses appear on the left (light blue)
   - System messages appear centered (gray)
   - Auto-scrolls to latest message

3. **Input Area**
   - Text input field (max 500 characters)
   - Send button
   - Loading spinner while waiting for response

## 💡 Usage Examples

### Example 1: General Query
```
User: What are best practices for project management?
AI: [Response with practical advice]
```

### Example 2: Code Help
```
User: How do I create a JavaScript promise?
AI: [Code example with explanation]
```

### Example 3: Office-Related Questions
```
User: How can I improve team productivity?
AI: [Team management suggestions]
```

## ⚙️ Advanced Configuration

### Modify Model Parameters

Edit `genAIService.java` queryMistral method:

```java
parameters.put("max_new_tokens", 512);    // Increase for longer responses
parameters.put("temperature", 0.7);       // Lower = consistent, Higher = creative
parameters.put("top_p", 0.9);            // Affects response diversity
```

### Switch Models

Edit `application.properties`:
```properties
genai.huggingface.model=mistralai/Mistral-7B-Instruct-v0.1
```

Other options:
- `mistralai/Mistral-7B-Instruct`
- `mistralai/Mistral-7B-v0.1`
- Or any other Hugging Face model

## 🐛 Troubleshooting

### Issue: "Failed to process GenAI request"
**Solution**: 
- Check backend is running on port 8080
- Verify API key is set in application.properties
- Check internet connection

### Issue: "Hugging Face API key not configured"
**Solution**: 
- Set `genai.huggingface.api-key` in application.properties
- Or set environment variable: `GENAI_HUGGINGFACE_API_KEY`
- Restart backend server

### Issue: API Error 401 Unauthorized
**Solution**: 
- Verify your Hugging Face API key is valid
- Check token has read permissions
- Create a new token if needed

### Issue: API Error 503 Service Unavailable
**Solution**:
- Check Hugging Face service status: https://status.huggingface.co
- Model may be loading (first request can be slow)
- Try again in a few seconds

### Issue: Requests are slow
**Solution**:
- First request to a model loads it (can take 10+ seconds)
- Subsequent requests are faster (~3-5 seconds)
- Consider using Hugging Face Pro for faster inference
- Model is running on shared GPU infrastructure

### Issue: "Prompt too long" error
**Solution**:
- Prompts are limited to 500 characters
- Try breaking into multiple shorter questions

## 🔐 Security Considerations

1. **API Key Management**:
   - Keep API key in environment variables, not committed to repo
   - Use `application-prod.properties` for production
   - Never expose API key in client-side code

2. **Input Validation**:
   - Backend validates prompt length (500 char max)
   - All input is text-only
   - SQL injection protection via Spring Data

3. **Rate Limiting**:
   - Monitor Hugging Face account usage
   - Free tier has daily limits
   - Consider implementing backend rate limiting

## 📝 Keyboard Shortcuts

- **F** - Open AI Assistant when in genAI zone
- **Enter** - Send prompt (in input field)
- **X** - Close the panel

## 🎓 Learning Resources

- [Hugging Face Documentation](https://huggingface.co/docs)
- [Mistral-7B-Instruct Model](https://huggingface.co/mistralai/Mistral-7B-Instruct)
- [Inference API Guide](https://huggingface.co/docs/api-inference/index)
- [Spring Boot REST Controller Guide](https://spring.io/guides/gs/rest-service/)

## 📞 Support

For issues with:
- **Backend Integration**: Review GenAIController.java and genAIService.java
- **Mistral Model**: Check Hugging Face documentation
- **Hugging Face API**: Visit their support or community forums
- **Frontend Panel**: Check browser console for JavaScript errors

---

**Last Updated**: January 26, 2026
**Feature Status**: Active & Ready for Production
**Architecture**: Server-Side GenAI Integration

