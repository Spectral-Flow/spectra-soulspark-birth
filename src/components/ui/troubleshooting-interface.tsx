/**
 * SPECTRA Troubleshooting Interface
 * Comprehensive diagnostic and help system
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Copy, 
  Download, 
  RefreshCw,
  Terminal,
  Bug,
  HelpCircle,
  Wrench
} from 'lucide-react';
import { diagnostics, type DiagnosticReport, type ServiceStatus } from '@/lib/diagnostics';

interface TroubleshootingProps {
  onClose?: () => void;
}

export function TroubleshootingInterface({ onClose: _onClose }: TroubleshootingProps) {
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const loadDiagnostics = async () => {
    setLoading(true);
    try {
      const report = await diagnostics.generateFullReport();
      setDiagnosticReport(report);
    } catch (error) {
      console.error('Failed to generate diagnostic report:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReport = async () => {
    if (!diagnosticReport) return;
    
    try {
      const markdown = await diagnostics.generateMarkdownReport();
      await navigator.clipboard.writeText(markdown);
      alert('Diagnostic report copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy report:', error);
    }
  };

  const downloadReport = async () => {
    if (!diagnosticReport) return;

    try {
      const markdown = await diagnostics.generateMarkdownReport();
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spectra-diagnostic-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const runQuickDiagnostic = () => {
    // Run quick diagnostic commands
    console.log('🔍 Running quick diagnostics...');
    
    try {
      // Test voice system
      (window as unknown as Record<string, unknown>).testSpectraVoice?.();
      console.log('✅ Voice system test initiated');
      
      // Test API keys
      (window as unknown as Record<string, unknown>).testApiKeys?.();
      console.log('✅ API key test initiated');
      
      // Test backend
      fetch('/api/health')
        .then(response => response.json())
        .then(data => console.log('✅ Backend health:', data))
        .catch(error => console.error('❌ Backend error:', error));
        
      console.log('📊 Check console for detailed results');
    } catch (error) {
      console.error('❌ Quick diagnostic failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Generating diagnostic report...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="w-6 h-6" />
          SPECTRA Troubleshooting
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runQuickDiagnostic}>
            <Terminal className="w-4 h-4 mr-2" />
            Quick Test
          </Button>
          <Button variant="outline" onClick={loadDiagnostics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={copyReport}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Report
          </Button>
          <Button variant="outline" onClick={downloadReport}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="commands">Commands</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {diagnosticReport && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Browser</h4>
                      <p>{diagnosticReport.systemInfo.browser} {diagnosticReport.systemInfo.version}</p>
                      <p className="text-sm text-muted-foreground">{diagnosticReport.systemInfo.platform}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Memory</h4>
                      {diagnosticReport.systemInfo.memory ? (
                        <p>{Math.round(diagnosticReport.systemInfo.memory.used / 1024 / 1024)}MB used</p>
                      ) : (
                        <p className="text-muted-foreground">Not available</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Service Status</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <ServiceStatus 
                        name="ElevenLabs" 
                        status={diagnosticReport.serviceStatus.elevenlabs}
                      />
                      <ServiceStatus 
                        name="OpenAI" 
                        status={diagnosticReport.serviceStatus.openai}
                      />
                      <ServiceStatus 
                        name="Web Speech" 
                        status={diagnosticReport.serviceStatus.webSpeech}
                      />
                      <ServiceStatus 
                        name="Backend" 
                        status={diagnosticReport.serviceStatus.backend}
                      />
                    </div>
                  </div>

                  {diagnosticReport.recommendations.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-semibold">Recommendations:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {diagnosticReport.recommendations.map((rec: string, idx: number) => (
                              <li key={idx} className="text-sm">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <ServiceDetailsPanel diagnosticReport={diagnosticReport} />
        </TabsContent>

        <TabsContent value="environment" className="space-y-4">
          <EnvironmentPanel diagnosticReport={diagnosticReport} />
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <ErrorsPanel diagnosticReport={diagnosticReport} />
        </TabsContent>

        <TabsContent value="commands" className="space-y-4">
          <CommandsPanel />
        </TabsContent>

        <TabsContent value="help" className="space-y-4">
          <HelpPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ServiceStatus({ name, status }: { name: string; status: ServiceStatus[keyof ServiceStatus] }) {
  const isHealthy = status.available && (!Object.prototype.hasOwnProperty.call(status, 'apiKey') || status.apiKey);
  
  return (
    <div className="flex items-center gap-2 p-2 rounded border">
      {isHealthy ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
      <span className="text-sm font-medium">{name}</span>
      {status.error && (
        <Badge variant="destructive" className="text-xs">
          Error
        </Badge>
      )}
    </div>
  );
}

function ServiceDetailsPanel({ diagnosticReport }: { diagnosticReport: DiagnosticReport }) {
  if (!diagnosticReport) return null;

  return (
    <div className="space-y-4">
      {Object.entries(diagnosticReport.serviceStatus).map(([service, status]) => (
        <Card key={service}>
          <CardHeader>
            <CardTitle className="capitalize">{service}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Available:</span>
                {status.available ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
              
              {Object.prototype.hasOwnProperty.call(status, 'apiKey') && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">API Key:</span>
                  {status.apiKey ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}

              {status.endpoints && (
                <div>
                  <span className="font-medium">Endpoints:</span>
                  <div className="ml-4 space-y-1">
                    {Object.entries(status.endpoints || {}).map(([endpoint, available]) => (
                      <div key={endpoint} className="flex items-center gap-2">
                        {available ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500" />
                        )}
                        <span className="text-sm">{endpoint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {status.error && (
                <Alert>
                  <Bug className="h-4 w-4" />
                  <AlertDescription>{status.error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EnvironmentPanel({ diagnosticReport }: { diagnosticReport: DiagnosticReport }) {
  if (!diagnosticReport) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment Variables</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(diagnosticReport.environmentVariables).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-2 rounded border">
              <span className="font-mono text-sm">{key}</span>
              <div className="flex items-center gap-2">
                {value ? (
                  <Badge variant="default">Set</Badge>
                ) : (
                  <Badge variant="secondary">Not Set</Badge>
                )}
                {value ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorsPanel({ diagnosticReport }: { diagnosticReport: DiagnosticReport }) {
  if (!diagnosticReport) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Errors</CardTitle>
      </CardHeader>
      <CardContent>
        {diagnosticReport.errors.length === 0 ? (
          <p className="text-muted-foreground">No recent errors detected ✅</p>
        ) : (
          <div className="space-y-2">
            {diagnosticReport.errors.slice(-10).reverse().map((error, idx) => (
              <Alert key={idx}>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">{error.type}</Badge>
                      <span className="text-xs text-muted-foreground">{error.timestamp}</span>
                    </div>
                    <p className="font-medium">{error.message}</p>
                    {error.stack && (
                      <details className="text-xs">
                        <summary className="cursor-pointer">Stack trace</summary>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CommandsPanel() {
  const commands = [
    {
      title: 'Test Voice System',
      command: 'testSpectraVoice()',
      description: 'Test the complete voice system with all providers'
    },
    {
      title: 'Test ElevenLabs',
      command: 'testElevenLabsVoice()',
      description: 'Test ElevenLabs voice synthesis specifically'
    },
    {
      title: 'Test API Keys',
      command: 'testApiKeys()',
      description: 'Check if API keys are configured and working'
    },
    {
      title: 'Backend Health',
      command: 'fetch("/api/health").then(r => r.json()).then(console.log)',
      description: 'Check backend health status'
    },
    {
      title: 'Full Diagnostic Report',
      command: 'showDiagnosticReport()',
      description: 'Generate and display a complete diagnostic report'
    },
    {
      title: 'Clear Error Log',
      command: 'diagnostics.errors = []',
      description: 'Clear the captured error log'
    }
  ];

  const runCommand = (command: string) => {
    try {
      console.log(`> ${command}`);
      eval(command);
    } catch (error) {
      console.error('Command failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Debugging Commands</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {commands.map((cmd, idx) => (
            <div key={idx} className="p-3 border rounded">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{cmd.title}</h4>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => runCommand(cmd.command)}
                >
                  <Terminal className="w-3 h-3 mr-1" />
                  Run
                </Button>
              </div>
              <code className="text-xs bg-muted p-1 rounded block mb-1">
                {cmd.command}
              </code>
              <p className="text-sm text-muted-foreground">{cmd.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function HelpPanel() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Common Issues & Solutions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Voice not working</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Check if API keys are set in environment variables</li>
              <li>Ensure browser has microphone permissions</li>
              <li>Try using Web Speech API fallback</li>
              <li>Check browser console for errors</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Backend not responding</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Start backend with <code>npm run dev:backend</code></li>
              <li>Check if backend is running on port 3000</li>
              <li>Verify environment variables are set</li>
              <li>Check network connectivity</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">API key errors</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Verify API keys are valid and not expired</li>
              <li>Check API key permissions and quotas</li>
              <li>Ensure proper VITE_ prefix for client-side keys</li>
              <li>Use server-side keys for production</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Performance issues</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Enable WebGPU if supported by browser</li>
              <li>Reduce audio buffer size in settings</li>
              <li>Disable streaming if experiencing lag</li>
              <li>Clear browser cache and reload</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Need More Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>If you're still experiencing issues:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Copy the diagnostic report using the button above</li>
              <li>Check the browser console for additional errors</li>
              <li>Review the documentation in the project README</li>
              <li>Check for known issues in the project repository</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TroubleshootingInterface;