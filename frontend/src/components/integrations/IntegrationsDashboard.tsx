import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  icon?: string;
}

interface IntegrationsDashboardProps {
  onAddIntegration?: () => void;
}

export const IntegrationsDashboard: React.FC<IntegrationsDashboardProps> = ({ 
  onAddIntegration 
}) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<Set<string>>(new Set());

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setIntegrations([
        {
          id: 'quickbooks-1',
          name: 'QuickBooks',
          type: 'accounting',
          status: 'connected',
          lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          icon: '📊'
        },
        {
          id: 'gusto-1',
          name: 'Gusto',
          type: 'payroll',
          status: 'connected',
          lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          icon: '💰'
        },
        {
          id: 'slack-1',
          name: 'Slack',
          type: 'communication',
          status: 'disconnected',
          icon: '💬'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSync = async (integrationId: string) => {
    setSyncing(prev => new Set(prev).add(integrationId));
    
    // Simulate sync
    setTimeout(() => {
      setIntegrations(prev => prev.map(int => 
        int.id === integrationId 
          ? { ...int, lastSync: new Date() }
          : int
      ));
      setSyncing(prev => {
        const next = new Set(prev);
        next.delete(integrationId);
        return next;
      });
    }, 2000);
  };

  const handleRemove = async (integrationId: string) => {
    if (confirm('Are you sure you want to remove this integration?')) {
      setIntegrations(prev => prev.filter(int => int.id !== integrationId));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="success">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  const formatLastSync = (date?: Date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} days ago`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Integrations</h2>
          <p className="text-gray-600 mt-1">
            Connect your favorite HR tools for seamless data synchronization
          </p>
        </div>
        <Button onClick={onAddIntegration} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Integration
        </Button>
      </div>

      {integrations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No integrations yet</h3>
            <p className="text-gray-600 mb-4">
              Connect your first integration to start syncing data automatically
            </p>
            <Button onClick={onAddIntegration} variant="outline">
              Browse Available Integrations
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <Card key={integration.id} className="relative overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{integration.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription className="capitalize">
                        {integration.type}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusIcon(integration.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(integration.status)}
                    <span className="text-sm text-gray-500">
                      Last sync: {formatLastSync(integration.lastSync)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleSync(integration.id)}
                      disabled={integration.status !== 'connected' || syncing.has(integration.id)}
                    >
                      {syncing.has(integration.id) ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Sync Now
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(integration.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro tip:</strong> Set up automatic syncing to keep your data 
          up-to-date across all platforms. Most integrations support real-time 
          or scheduled synchronization.
        </AlertDescription>
      </Alert>
    </div>
  );
};