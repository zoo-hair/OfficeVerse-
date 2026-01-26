# Backend GenAI Setup Guide

## 📋 Overview

The OfficeVerse backend handles all GenAI integration with Hugging Face Mistral-7B-Instruct API. This ensures:
- ✅ API keys stay secure on server
- ✅ Centralized AI response handling
- ✅ Consistent error handling
- ✅ Rate limiting & monitoring
- ✅ Future multi-user support

## 🚀 Getting Started

### Step 1: Get Hugging Face API Key

1. Visit [Hugging Face](https://huggingface.co/)
2. Log in or create account
3. Go to **Settings > Access Tokens**
4. Create new token with **read** permissions
5. Copy the token (looks like: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### Step 2: Configure Backend

**Option A: application.properties** (Development)

Open `officeVerse_server/src/main/resources/application.properties`:

```properties
# GenAI Configuration
genai.huggingface.api-key=hf_your_actual_api_key_here
genai.huggingface.model=mistralai/Mistral-7B-Instruct
```

**Option B: Environment Variable** (Production/Recommended)

```bash
export GENAI_HUGGINGFACE_API_KEY=hf_your_actual_api_key_here
export GENAI_HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct
```

**Option C: application-prod.properties** (Production)

Create `officeVerse_server/src/main/resources/application-prod.properties`:

```properties
genai.huggingface.api-key=${GENAI_HUGGINGFACE_API_KEY}
genai.huggingface.model=${GENAI_HUGGINGFACE_MODEL:mistralai/Mistral-7B-Instruct}

# Spring profile
spring.profiles.active=prod
```

### Step 3: Start Backend

```bash
cd officeVerse_server
gradle bootRun
```

Watch for startup message:
```
Started OffficevVerseApplication in X.XXX seconds
```

### Step 4: Verify Configuration

Test the health endpoint:

```bash
curl http://localhost:8080/api/genai/health
```

Expected response:
```json
{
  "status": "UP",
  "service": "GenAI",
  "timestamp": 1706259000000,
  "available": true
}
```

## 📁 Backend Files

### New Files Created

**GenAIController.java** - REST API endpoints
```
POST /api/genai/query    - Process AI prompts
GET  /api/genai/status   - Get service status
GET  /api/genai/health   - Health check
```

### Modified Files

**genAIService.java** - Enhanced with Hugging Face integration
```
- queryMistral()           - Call Hugging Face API
- parseHuggingFaceResponse() - Parse JSON response
- isConfigured()           - Check API key
- getStatus()              - Return status info
```

## 🔌 API Endpoints

### POST /api/genai/query

Send a prompt to the AI model.

**Request:**
```json
{
  "prompt": "What is machine learning?",
  "roomId": "room123",
  "timestamp": "2024-01-26T10:30:00Z"
}
```

**Response (Success):**
```json
{
  "success": true,
  "response": "Machine learning is a subset of artificial intelligence...",
  "roomId": "room123",
  "timestamp": 1706259000000
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Hugging Face API key not configured. Set 'genai.huggingface.api-key' in application properties."
}
```

### GET /api/genai/status

Get current service status.

**Response:**
```json
{
  "available": true,
  "model": "mistralai/Mistral-7B-Instruct",
  "provider": "Hugging Face Inference API",
  "configuredKey": true,
  "endpoint": "Mistral-7B-Instruct",
  "ready": true
}
```

### GET /api/genai/health

Health check endpoint.

**Response:**
```json
{
  "status": "UP",
  "service": "GenAI",
  "timestamp": 1706259000000,
  "available": true
}
```

## ⚙️ Configuration Options

### Model Parameters

Edit `genAIService.java` `queryMistral()` method:

```java
// Adjust response length (tokens)
parameters.put("max_new_tokens", 256);  // Shorter
parameters.put("max_new_tokens", 512);  // Default
parameters.put("max_new_tokens", 1024); // Longer

// Adjust creativity vs consistency
parameters.put("temperature", 0.3);  // More consistent
parameters.put("temperature", 0.7);  // Default
parameters.put("temperature", 1.0);  // More creative

// Diversity in sampling
parameters.put("top_p", 0.8);  // Less diverse
parameters.put("top_p", 0.9);  // Default
parameters.put("top_p", 0.95); // More diverse
```

### Supported Models

Update `application.properties`:

```properties
# Mistral Models
genai.huggingface.model=mistralai/Mistral-7B-Instruct
genai.huggingface.model=mistralai/Mistral-7B-Instruct-v0.1

# Alternative Models (requires genAIService.java updates)
# genai.huggingface.model=meta-llama/Llama-2-7b-chat-hf
# genai.huggingface.model=tiiuae/falcon-7b-instruct
```

## 🧪 Testing

### Test with cURL

```bash
# Health check
curl http://localhost:8080/api/genai/health

# Get status
curl http://localhost:8080/api/genai/status

# Send prompt
curl -X POST http://localhost:8080/api/genai/query \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is AI?",
    "roomId": "test-room"
  }'
```

### Test with Postman

1. Create POST request to `http://localhost:8080/api/genai/query`
2. Set header: `Content-Type: application/json`
3. Body:
```json
{
  "prompt": "Explain quantum computing",
  "roomId": "room123"
}
```
4. Send and check response

### Test with Code

```java
// Example Spring Boot test
@SpringBootTest
@AutoConfigureMockMvc
public class GenAIControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    public void testQueryEndpoint() throws Exception {
        String requestBody = "{\"prompt\": \"Hello\", \"roomId\": \"test\"}";
        
        mockMvc.perform(post("/api/genai/query")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody))
            .andExpect(status().isOk());
    }
}
```

## 🐛 Troubleshooting

### Error: "API key not configured"

**Solution:**
```properties
# Make sure this is set in application.properties
genai.huggingface.api-key=hf_your_actual_key_here
```

Or:
```bash
export GENAI_HUGGINGFACE_API_KEY=hf_your_actual_key_here
```

### Error: "401 Unauthorized from Hugging Face"

**Solution:**
- Verify API key is correct on Hugging Face
- Check token has read permissions
- Create a new token if needed

### Error: "503 Service Unavailable"

**Solution:**
- Check Hugging Face status: https://status.huggingface.co
- Model may be loading (first request is slow)
- Retry request in a few seconds

### Error: "Connection timeout"

**Solution:**
- Check internet connection
- Verify Hugging Face is accessible
- Check firewall settings

### Slow Responses

**Solution:**
- First request loads model (can be 10+ seconds)
- Subsequent requests are faster (3-5 seconds)
- Consider upgrading Hugging Face plan

### High Memory Usage

**Solution:**
- Each request uses minimal resources
- Hugging Face handles model loading
- Monitor backend logs
- Adjust max_new_tokens if needed

## 🔒 Security Best Practices

### API Key Protection

✅ **DO:**
- Store in environment variables
- Use `application-prod.properties` for production
- Rotate keys periodically
- Monitor usage at huggingface.co

❌ **DON'T:**
- Commit API key to Git
- Log API key
- Expose in error messages
- Share with frontend

### Input Validation

✅ **Current Implementation:**
- Max prompt length: 500 characters
- Non-empty check
- Type validation

✅ **Add Later:**
- Rate limiting per user/room
- Content filtering
- Prompt sanitization

### Error Handling

✅ **Current Implementation:**
- Safe error messages
- No API key exposure
- Detailed server logs

## 📊 Monitoring

### Logs

Watch logs during development:
```bash
gradle bootRun | grep -i genai
```

### Production Monitoring

Add to `application.properties`:
```properties
# Logging
logging.level.com.offficeVerse.service.genAIService=DEBUG
logging.file.name=logs/genai.log

# Actuator (monitoring)
management.endpoints.web.exposure.include=health,metrics
```

### Metrics

Access metrics:
```bash
curl http://localhost:8080/actuator/metrics
```

## 🚀 Deployment

### Development
```bash
gradle bootRun
```

### JAR Build & Run
```bash
gradle build
java -jar build/libs/officeverse-*.jar
```

### Docker (Optional)

Create `Dockerfile`:
```dockerfile
FROM openjdk:17
ENV GENAI_HUGGINGFACE_API_KEY=${GENAI_HUGGINGFACE_API_KEY}
COPY build/libs/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

Build and run:
```bash
gradle build
docker build -t officeverse .
docker run -e GENAI_HUGGINGFACE_API_KEY=hf_xxx officeverse
```

## 📈 Performance Tips

1. **Caching**: Cache frequently asked questions
2. **Async Processing**: Consider async request handling
3. **Rate Limiting**: Add rate limits per user/room
4. **Timeouts**: Set request timeouts for Hugging Face calls
5. **Batch Requests**: Queue multiple prompts efficiently

## 🎓 Resources

- [Spring Boot REST Guide](https://spring.io/guides/gs/rest-service/)
- [Hugging Face API Docs](https://huggingface.co/docs/api-inference)
- [Mistral Model](https://huggingface.co/mistralai/Mistral-7B-Instruct)
- [Jackson JSON](https://github.com/FasterXML/jackson)

## 📞 Support

**For Backend Issues:**
- Check `application.properties` configuration
- Review server logs
- Verify Hugging Face API key

**For API Issues:**
- Test with cURL
- Check Hugging Face status
- Review request/response format

**For Model Issues:**
- Check Hugging Face documentation
- Try different models
- Monitor API quotas

---

**Backend Version**: 1.0
**Status**: Production Ready
**Last Updated**: January 26, 2026
**Architecture**: Server-Side GenAI Integration
