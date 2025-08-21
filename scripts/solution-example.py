#!/usr/bin/env python3

"""
Problem Statement Solution - EXACT implementation
==================================================

This script demonstrates how the original Python code from the problem statement
works with our OpenRouter API endpoint implementation.

ORIGINAL CODE (from problem statement):
```python
import requests
import json
import os

url = "https://openrouter.ai/api/v1/chat/completions"
headers = {
  "Authorization": f"Bearer {os.environ.get('OPENROUTER_API_KEY')}",
  "Content-Type": "application/json"
}
payload = {
  "model": "@preset/spectra",
  "messages": [
    {
      "role": "user",
      "content": "Hello! How are you today?"
    }
  ]
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())
```

SOLUTION: Replace the URL and remove the Authorization header
Our endpoint handles the API key server-side for security.
"""

import requests
import json
import os

def original_script_adapted():
    """
    The original script adapted to work with our endpoint
    Only changes: URL and removed Authorization header
    """
    
    # Change URL to our endpoint (deploy this to get your URL)
    url = "https://your-deployed-app.vercel.app/api/openrouter/chat"
    
    # Remove Authorization header - our endpoint handles API key server-side
    headers = {
        "Content-Type": "application/json"
    }
    
    # Payload remains exactly the same
    payload = {
        "model": "@preset/spectra",
        "messages": [
            {
                "role": "user",
                "content": "Hello! How are you today?"
            }
        ]
    }
    
    response = requests.post(url, headers=headers, json=payload)
    print(response.json())

def show_differences():
    """Show the minimal changes needed"""
    
    print("🔄 MIGRATION FROM ORIGINAL SCRIPT")
    print("=================================")
    print()
    print("BEFORE (original problem statement):")
    print('url = "https://openrouter.ai/api/v1/chat/completions"')
    print('headers = {')
    print('  "Authorization": f"Bearer {os.environ.get(\'OPENROUTER_API_KEY\')}",')
    print('  "Content-Type": "application/json"')
    print('}')
    print()
    print("AFTER (using our endpoint):")
    print('url = "https://your-app.vercel.app/api/openrouter/chat"')
    print('headers = {')
    print('  "Content-Type": "application/json"')
    print('  # Authorization removed - handled server-side')
    print('}')
    print()
    print("✅ Payload remains EXACTLY the same!")
    print("✅ Response format is identical!")
    print("✅ Just deploy and change the URL!")

def test_localhost():
    """Test with localhost for development"""
    
    print("\n🧪 TESTING WITH LOCALHOST")
    print("=========================")
    
    # Test with local development server
    url = "http://localhost:3000/api/openrouter/chat"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "model": "@preset/spectra",
        "messages": [
            {
                "role": "user",
                "content": "Hello! How are you today?"
            }
        ]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        print(f"Status: {response.status_code}")
        print("Response:")
        print(json.dumps(response.json(), indent=2))
        
    except requests.exceptions.ConnectionError:
        print("❌ No server running on localhost:3000")
        print("💡 Run: vercel dev")
        print("💡 Or deploy to Vercel and test with production URL")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("🎯 OpenRouter @preset/spectra Implementation")
    print("==========================================")
    print()
    print("This script shows how to use the implemented endpoint")
    print("with the EXACT same format as the problem statement.")
    print()
    
    show_differences()
    test_localhost()
    
    print("\n📋 DEPLOYMENT STEPS")
    print("==================")
    print("1. Set OPENROUTER_API_KEY in your Vercel environment variables")
    print("2. Deploy to Vercel: vercel --prod")
    print("3. Update the URL in your Python script")
    print("4. Remove the Authorization header")
    print("5. ✅ Done! Your script now works with full security.")
    
    print("\n🌟 BENEFITS OF OUR IMPLEMENTATION")
    print("================================")
    print("✅ Server-side API key handling (more secure)")
    print("✅ No API key exposure in client code")
    print("✅ Same request/response format as OpenRouter")
    print("✅ Built-in CORS support for web apps")
    print("✅ Integrated with SPECTRA backend API client")
    print("✅ Comprehensive error handling")
    print("✅ TypeScript support")