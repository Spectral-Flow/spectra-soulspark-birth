/**
 * Local LLM Configuration Component
 * Allows users to configure local LLM settings in the mobile app
 */

import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { AlertCircle, CheckCircle, Wifi, WifiOff } from "lucide-react";

interface LLMConfig {
  endpoint: string;
  model: string;
  apiType: string;
  apiKey: string;
}

interface TestStatus {
  success: boolean;
  message: string;
  models?: string[];
}

export function LocalLLMConfig() {
  const [config, setConfig] = useState<LLMConfig>({
    endpoint: localStorage.getItem('localLLM_endpoint') || 'http://192.168.1.100:11434',
    model: localStorage.getItem('localLLM_model') || 'llama2',
    apiType: localStorage.getItem('localLLM_apiType') || 'ollama',
    apiKey: localStorage.getItem('localLLM_apiKey') || ''
  });

  const [testStatus, setTestStatus] = useState<TestStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Save config to localStorage when it changes
  useEffect(() => {
    Object.keys(config).forEach(key => {
      const configKey = key as keyof LLMConfig;
      localStorage.setItem(`localLLM_${key}`, config[configKey]);
    });
  }, [config]);

  const updateConfig = (key: keyof LLMConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const testConnection = async () => {
    setIsLoading(true);
    setTestStatus(null);

    try {
      // Call the backend API to test the connection
      const response = await fetch('/api/test-local-llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      const result = await response.json();

      if (result.success) {
        setTestStatus({
          success: true,
          message: 'Connected successfully!',
          models: result.models
        });
        setAvailableModels(result.models || []);
      } else {
        setTestStatus({
          success: false,
          message: result.error || 'Connection failed'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestStatus({
        success: false,
        message: `Network error: ${errorMessage}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNetworkTips = () => {
    const isLocalhost = config.endpoint.includes('localhost') || config.endpoint.includes('127.0.0.1');
    
    if (isLocalhost) {
      return (
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle size={16} />
            <span className="text-sm font-medium">Network Tip</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Mobile apps can't access localhost. Use your device's IP address instead.
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi size={20} />
          Local LLM Configuration
        </CardTitle>
        <CardDescription>
          Connect Spectra to a local LLM running on your phone or network
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Endpoint Configuration */}
        <div className="space-y-2">
          <Label htmlFor="endpoint">LLM Server Endpoint</Label>
          <Input
            id="endpoint"
            placeholder="http://192.168.1.100:11434"
            value={config.endpoint}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateConfig('endpoint', e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Use your phone's IP address and the LLM server port
          </p>
          {getNetworkTips()}
        </div>

        {/* API Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="apiType">API Type</Label>
          <Select value={config.apiType} onValueChange={(value: string) => updateConfig('apiType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select API type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ollama">Ollama</SelectItem>
              <SelectItem value="openai-compatible">OpenAI Compatible</SelectItem>
              <SelectItem value="text-generation-webui">Text Generation WebUI</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Choose the type of local LLM server you're running
          </p>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <Label htmlFor="model">Model Name</Label>
          <Input
            id="model"
            placeholder="llama2"
            value={config.model}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateConfig('model', e.target.value)}
          />
          {availableModels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {availableModels.slice(0, 5).map((model, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => updateConfig('model', model)}
                >
                  {model}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Optional API Key */}
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key (Optional)</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Leave empty if not required"
            value={config.apiKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateConfig('apiKey', e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Only needed if your local LLM requires authentication
          </p>
        </div>

        {/* Test Connection */}
        <div className="space-y-3">
          <Button 
            onClick={testConnection} 
            disabled={isLoading || !config.endpoint}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </Button>

          {testStatus && (
            <div className={`p-3 rounded-lg border ${
              testStatus.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {testStatus.success ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <WifiOff size={16} className="text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  testStatus.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testStatus.message}
                </span>
              </div>
              
              {testStatus.success && testStatus.models && (
                <div className="mt-2">
                  <p className="text-sm text-green-700">
                    Available models: {testStatus.models.length || 0}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Setup Tips */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Quick Setup Tips:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Both devices must be on the same Wi-Fi network</li>
            <li>• Find your phone's IP in Wi-Fi settings</li>
            <li>• Common ports: Ollama (11434), LM Studio (1234)</li>
            <li>• Try smaller models like 'llama2:7b' for better performance</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}