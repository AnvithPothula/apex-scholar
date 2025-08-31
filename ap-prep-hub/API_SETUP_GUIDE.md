# API Key Setup Guide

## Multiple API Key Configuration

To avoid rate limiting issues and ensure continuous test generation, you can configure up to 5 API keys. The system will automatically rotate between available keys when one gets rate limited.

### Environment Variables

Add these environment variables to your `.env` file:

```bash
# Primary API key (required)
REACT_APP_GEMINI_API_KEY=your_primary_api_key_here

# Additional API keys (optional but recommended)
REACT_APP_GEMINI_API_KEY_2=your_second_api_key_here
REACT_APP_GEMINI_API_KEY_3=your_third_api_key_here
REACT_APP_GEMINI_API_KEY_4=your_fourth_api_key_here
REACT_APP_GEMINI_API_KEY_5=your_fifth_api_key_here
```

### How to Get Google Gemini API Keys

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" 
4. Create a new API key or use an existing one
5. Copy the API key and add it to your `.env` file

### Rate Limiting Information

- **Free tier**: 15 requests per minute per API key
- **Rate limit reset**: 1 hour after being rate limited
- **Automatic rotation**: The system automatically switches to the next available key when one gets rate limited
- **Error handling**: Clear error messages when all keys are exhausted

### Recommended Setup

For best performance, configure at least 3 API keys:
- This allows continuous operation even when 2 keys are rate limited
- Provides redundancy for uninterrupted test generation
- Ensures smooth user experience during peak usage

### Troubleshooting

If you see "All API keys are rate limited" error:
1. Wait 1 hour for keys to reset, OR
2. Add more API keys to your environment variables
3. Restart your development server after adding new keys

### System Benefits

- **Intelligent rotation**: Automatically switches between available keys
- **Rate limit tracking**: Remembers which keys are rate limited and when they reset
- **Seamless fallback**: Users experience minimal interruption
- **Error transparency**: Clear messaging about API status and solutions
