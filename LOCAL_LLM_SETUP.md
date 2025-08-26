# 🔄 Local LLM Integration Guide

This guide explains how to connect Spectra to a local Large Language Model (LLM) running on your phone or local device. This enables offline AI capabilities and reduces API costs.

## 📱 Supported Local LLM Setups

### Option 1: Ollama (Recommended)
Ollama is the easiest way to run LLMs locally on mobile devices.

**Installation on Android:**
1. Install [Termux](https://termux.dev/) on your Android device
2. In Termux, run:
   ```bash
   pkg update && pkg upgrade
   pkg install curl
   curl -fsSL https://ollama.ai/install.sh | sh
   ```
3. Start Ollama server:
   ```bash
   ollama serve --host 0.0.0.0
   ```
4. Install a model:
   ```bash
   ollama pull llama2  # or llama2:7b for smaller model
   ```

### Option 2: LM Studio
LM Studio provides a user-friendly interface for running local LLMs.

**Setup:**
1. Install [LM Studio](https://lmstudio.ai/) on your device
2. Download a model (e.g., Llama 2, Mistral, or Code Llama)
3. Start the local server with OpenAI-compatible API
4. Note the server address (usually `http://localhost:1234`)

### Option 3: Text Generation WebUI
Advanced setup for more customization options.

**Setup:**
1. Install [text-generation-webui](https://github.com/oobabooga/text-generation-webui)
2. Enable API mode in settings
3. Start with `--api` flag
4. Use the API endpoint (usually `http://localhost:7860`)

## ⚙️ Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Local LLM Configuration
LOCAL_LLM_ENDPOINT=http://192.168.1.100:11434  # Your phone's IP address
LOCAL_LLM_MODEL=llama2                          # Model name
LOCAL_LLM_API_TYPE=ollama                       # ollama, openai-compatible, text-generation-webui
LOCAL_LLM_API_KEY=                              # Optional authentication
```

### Finding Your Phone's IP Address

**Android:**
1. Go to Settings > Wi-Fi
2. Tap on your connected network
3. Look for "IP address" (e.g., 192.168.1.100)

**Alternative using Termux:**
```bash
ip route get 1 | awk '{print $7}'
```

### Port Configuration

Common ports used by local LLM servers:
- **Ollama**: 11434
- **LM Studio**: 1234
- **Text Generation WebUI**: 7860

Make sure your firewall allows connections on these ports.

## 🔧 Usage in Spectra

### Basic Usage

```javascript
import { queryLLM } from './llm_integrations/llm_client.js';

// Query your local LLM
const response = await queryLLM('Hello, how are you?', 'local', {
  endpoint: 'http://192.168.1.100:11434',
  model: 'llama2',
  apiType: 'ollama',
  temperature: 0.7,
  maxTokens: 512
});

console.log(response);
```

### Testing Connection

```javascript
import { testLocalLLMConnection } from './llm_integrations/llm_client.js';

// Test if your local LLM is accessible
const test = await testLocalLLMConnection(
  'http://192.168.1.100:11434',
  'ollama'
);

if (test.success) {
  console.log('✅ Connected! Available models:', test.models);
} else {
  console.error('❌ Connection failed:', test.error);
}
```

### Service Status Check

```javascript
import { getServiceStatus } from './llm_integrations/llm_client.js';

const status = getServiceStatus();
console.log('Local LLM status:', status.local);
console.log('Local config:', status.localConfig);
```

## 📱 Mobile-Specific Considerations

### Network Access
- **Localhost doesn't work** in mobile apps - use actual IP addresses
- Both devices must be on the **same Wi-Fi network**
- Consider using **mobile hotspot** if needed

### Performance Tips
1. **Use smaller models** for better mobile performance:
   - `llama2:7b` instead of `llama2:13b`
   - `mistral:7b` for faster responses
   - `phi` for very resource-constrained devices

2. **Optimize parameters**:
   ```javascript
   const options = {
     temperature: 0.7,    // Lower for more focused responses
     maxTokens: 256,      // Shorter responses = faster generation
     topP: 0.9           // Control response diversity
   };
   ```

3. **Set appropriate timeouts**:
   ```javascript
   const options = {
     timeout: 60000  // 60 seconds for mobile LLMs
   };
   ```

### Security Considerations
- Local LLMs run on your device - **no data leaves your network**
- Consider using **API keys** for additional security
- **Firewall rules** to restrict access to trusted devices only

## 🚨 Troubleshooting

### Common Issues

**"Cannot connect to local LLM"**
- Verify the IP address and port
- Check if the LLM server is running
- Ensure both devices are on the same network
- Test with `curl` or browser: `http://192.168.1.100:11434/api/tags`

**"Request timed out"**
- Local LLMs can be slow, especially on mobile
- Increase timeout value
- Try a smaller model
- Check device temperature (throttling)

**"Model not found"**
- Verify the model name matches exactly
- List available models first
- For Ollama: `ollama list`

### Network Testing

Test your connection with curl:

```bash
# Test Ollama
curl http://192.168.1.100:11434/api/tags

# Test OpenAI-compatible
curl http://192.168.1.100:1234/v1/models

# Test basic connectivity
ping 192.168.1.100
```

## 💡 Recommended Models for Mobile

### For Basic Chat (2-4GB RAM)
- `phi` (2.7B parameters) - Very fast, good for simple tasks
- `llama2:7b-chat-q4_0` - Quantized version, good balance

### For Better Quality (6-8GB RAM)
- `llama2:7b` - Standard 7B model
- `mistral:7b` - Often faster than Llama 2
- `codellama:7b` - For code-related tasks

### For High-End Devices (12GB+ RAM)
- `llama2:13b` - Better quality responses
- `mixtral:8x7b` - Mixture of experts model

## 🔄 Integration with Spectra

Once configured, you can use local LLMs in Spectra just like any other provider:

1. **Set environment variables** in your `.env` file
2. **Use 'local' provider** in your API calls
3. **Configure the mobile app** to use your phone's IP
4. **Test connectivity** before deployment

The local LLM will work with all Spectra features:
- ✅ Voice conversations
- ✅ Memory persistence  
- ✅ Batch processing
- ✅ Real-time responses
- ✅ Offline operation

## 📚 Additional Resources

- [Ollama Documentation](https://ollama.ai/docs)
- [LM Studio Guide](https://lmstudio.ai/docs)
- [Text Generation WebUI Wiki](https://github.com/oobabooga/text-generation-webui/wiki)
- [Capacitor Network Plugin](https://capacitorjs.com/docs/apis/network) for network detection

---

**Next Steps:**
1. Choose your local LLM solution
2. Set up the server on your phone
3. Configure Spectra with the local endpoint
4. Test the integration
5. Enjoy offline AI conversations! 🎉