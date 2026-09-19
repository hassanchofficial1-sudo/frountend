'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loader2, Plus, Wifi, Database, Trash2, AlertCircle, CheckCircle, ShoppingCart, MessageSquare, Truck, BarChart3, Link2, ExternalLink, RefreshCw, Save } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'
import { INTEGRATION_TYPE_OPTIONS } from '@/types'

const INTEGRATION_ICONS: Record<string, React.ReactNode> = {
  SHOPIFY: <ShoppingCart className="w-5 h-5" />,
  WHATSAPP: <MessageSquare className="w-5 h-5" />,
  COURIER: <Truck className="w-5 h-5" />,
  META_ADS: <BarChart3 className="w-5 h-5" />,
}

const INTEGRATION_COLORS: Record<string, string> = {
  SHOPIFY: 'purple',
  WHATSAPP: 'green',
  COURIER: 'blue',
  META_ADS: 'orange',
}

const INTEGRATION_DESCRIPTIONS: Record<string, string> = {
  SHOPIFY: 'Sync orders, customers, and products from your Shopify store',
  WHATSAPP: 'Create orders from WhatsApp messages and send notifications',
  COURIER: 'Book shipments, track deliveries, and manage COD settlements',
  META_ADS: 'Sync Facebook/Instagram ad spend and campaign performance',
}

export default function AdminIntegrationsPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [integrations, setIntegrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [testLoading, setTestLoading] = useState<string | null>(null)
  const [syncLoading, setSyncLoading] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    type: 'SHOPIFY',
    name: '',
    config: {} as Record<string, string>,
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [syncAllLoading, setSyncAllLoading] = useState(false)

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations')
      const data = await response.json()
      if (data.success) setIntegrations(data.data)
    } catch (error) {
      console.error('Failed to fetch integrations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const handleTestIntegration = async (id: string) => {
    setTestLoading(id)
    try {
      const response = await fetch(`/api/integrations/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Connection test', message: data.data.connected ? 'Connected successfully' : 'Connection failed' })
        fetchIntegrations()
      } else {
        addToast({ type: 'error', title: 'Test failed', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to test connection' })
    } finally {
      setTestLoading(null)
    }
  }

  const handleSyncIntegration = async (id: string) => {
    setSyncLoading(id)
    try {
      const response = await fetch(`/api/integrations/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Sync completed', message: `Synced ${data.data.synced} records` })
        fetchIntegrations()
      } else {
        addToast({ type: 'error', title: 'Sync failed', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to sync' })
    } finally {
      setSyncLoading(null)
    }
  }

  const handleDeleteIntegration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return
    try {
      const response = await fetch(`/api/integrations/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Integration deleted' })
        fetchIntegrations()
      } else {
        addToast({ type: 'error', title: 'Failed to delete', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete integration' })
    }
  }

  const handleCreateIntegration = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Integration created' })
        setShowCreateModal(false)
        setCreateForm({ type: 'SHOPIFY', name: '', config: {} })
        fetchIntegrations()
      } else {
        addToast({ type: 'error', title: 'Failed to create', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to create integration' })
    } finally {
      setCreateLoading(false)
    }
  }

  const handleSyncAllFromEnv = async () => {
    setSyncAllLoading(true)
    try {
      const response = await fetch('/api/integrations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncShopify: true, syncMeta: true }),
      })
      const data = await response.json()
      if (data.success) {
        const shopify = data.data?.shopify
        const meta = data.data?.meta
        const parts: string[] = []
        if (shopify && !shopify.error) parts.push(`Shopify: ${shopify.synced} synced`)
        if (meta && !meta.error) parts.push(`Meta: ${meta.synced} synced`)
        if (shopify?.error && typeof shopify.error === 'string') parts.push(`Shopify: ${shopify.error}`)
        if (meta?.error && typeof meta.error === 'string') parts.push(`Meta: ${meta.error}`)
        addToast({ type: 'success', title: 'Sync completed', message: parts.join(' | ') || 'Done' })
        fetchIntegrations()
      } else {
        addToast({ type: 'error', title: 'Sync failed', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to sync' })
    } finally {
      setSyncAllLoading(false)
    }
  }

  const getConfigFields = (type: string) => {
    switch (type) {
      case 'SHOPIFY':
        return [
          { key: 'storeUrl', label: 'Store URL', type: 'text', placeholder: 'your-store.myshopify.com', required: true },
          { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'shpat_...', required: true },
          { key: 'apiVersion', label: 'API Version', type: 'text', placeholder: '2024-01', required: true },
          { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: 'optional', required: false },
        ]
      case 'WHATSAPP':
        return [
          { key: 'apiUrl', label: 'API URL', type: 'text', placeholder: 'https://graph.facebook.com/v18.0', required: true },
          { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'your-access-token', required: true },
          { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', placeholder: '123456789', required: true },
          { key: 'webhookVerifyToken', label: 'Webhook Verify Token', type: 'password', placeholder: 'your-verify-token', required: true },
          { key: 'appSecret', label: 'App Secret', type: 'password', placeholder: 'your-app-secret', required: true },
        ]
      case 'COURIER':
        return [
          { key: 'apiUrl', label: 'API URL', type: 'text', placeholder: 'https://api.courier.com', required: true },
          { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'your-api-key', required: true },
          { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'optional', required: false },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'optional', required: false },
          { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: 'optional', required: false },
        ]
      case 'META_ADS':
        return [
          { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'your-meta-access-token', required: true },
          { key: 'adAccountId', label: 'Ad Account ID', type: 'text', placeholder: 'act_123456789', required: true },
          { key: 'appId', label: 'App ID', type: 'text', placeholder: 'your-app-id', required: true },
          { key: 'appSecret', label: 'App Secret', type: 'password', placeholder: 'your-app-secret', required: true },
        ]
      default:
        return []
    }
  }

  const handleConfigChange = (key: string, value: string) => {
    setCreateForm(prev => ({ ...prev, config: { ...prev.config, [key]: value } }))
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Integrations</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Manage external service connections</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleSyncAllFromEnv}
            isLoading={syncAllLoading}
            disabled={syncAllLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />Sync All (from .env.local)
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />Add Integration
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} variant="bordered" className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-secondary-200 rounded w-1/3" />
                <div className="h-4 bg-secondary-200 rounded w-1/4 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-secondary-200 rounded w-full mb-2" />
                <div className="h-4 bg-secondary-200 rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <Card key={integration.id} variant="bordered" className="h-full">
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-${INTEGRATION_COLORS[integration.type]}-100`}>
                    {INTEGRATION_ICONS[integration.type]}
                  </div>
                  <div>
                    <h4 className="font-semibold">{integration.name}</h4>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">{integration.type}</p>
                  </div>
                </div>
                <Badge variant={integration.isConnected ? 'success' : 'secondary'}>
                  {integration.isConnected ? (
                    <> <CheckCircle className="w-4 h-4 inline mr-1" /> Connected </>
                  ) : (
                    <> <AlertCircle className="w-4 h-4 inline mr-1" /> Not Connected </>
                  )}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-secondary-600 dark:text-secondary-400">{INTEGRATION_DESCRIPTIONS[integration.type]}</p>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-secondary-500 dark:text-secondary-400">Last Sync</p>
                    <p>{integration.lastSyncAt ? formatDate(integration.lastSyncAt) : 'Never'}</p>
                  </div>
                  <div>
                    <p className="text-secondary-500 dark:text-secondary-400">Last Success</p>
                    <p>{integration.lastSuccessAt ? formatDate(integration.lastSuccessAt) : 'Never'}</p>
                  </div>
                  {integration.lastFailureAt && (
                    <div className="col-span-2 text-danger-600">
                      <p className="text-secondary-500 dark:text-secondary-400">Last Error</p>
                      <p className="text-sm">{integration.lastError}</p>
                    </div>
                  )}
                  {integration.syncLogs && integration.syncLogs.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-secondary-500 dark:text-secondary-400 text-sm">Recent Syncs</p>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {integration.syncLogs.slice(0, 3).map((log: any) => (
                          <div key={log.id} className="flex items-center justify-between text-xs p-2 bg-secondary-50 dark:bg-secondary-800 rounded">
                            <span className={log.status === 'SUCCESS' ? 'text-success-600' : log.status === 'FAILED' ? 'text-danger-600' : 'text-warning-600'}>
                              {log.status}
                            </span>
                            <span>{formatDate(log.startedAt)}</span>
                            <span>{log.recordsSynced} synced, {log.recordsFailed} failed</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2 border-t border-secondary-100 dark:border-secondary-700">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleTestIntegration(integration.id)} isLoading={testLoading === integration.id}>
                    <Wifi className="w-4 h-4 mr-1" />Test
                  </Button>
                  <Button variant="primary" size="sm" className="flex-1" onClick={() => handleSyncIntegration(integration.id)} isLoading={syncLoading === integration.id}>
                    <Database className="w-4 h-4 mr-1" />Sync Now
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteIntegration(integration.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {integrations.length === 0 && (
            <Card variant="bordered" className="col-span-full text-center py-12">
              <Link2 className="w-12 h-12 mx-auto text-secondary-300 mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">No Integrations Configured</h3>
              <p className="text-secondary-500 dark:text-secondary-400 mb-4">Connect Shopify, WhatsApp, Courier, or Meta Ads to sync data</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />Add Integration
              </Button>
            </Card>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold dark:text-secondary-100">Add Integration</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                <ExternalLink className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={handleCreateIntegration} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Integration Type</label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, type: e.target.value, config: {} }))}
                  className="w-full px-4 py-2.5 border border-secondary-300 dark:border-secondary-600 dark:bg-secondary-800 dark:text-secondary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {INTEGRATION_TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Integration Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Main Shopify Store"
                  className="w-full px-4 py-2.5 border border-secondary-300 dark:border-secondary-600 dark:bg-secondary-800 dark:text-secondary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Configuration</label>
                <div className="space-y-4">
                  {getConfigFields(createForm.type).map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        {field.label} {field.required && <span className="text-danger-600">*</span>}
                      </label>
                      <input
                        type={field.type}
                        value={createForm.config[field.key] || ''}
                        onChange={(e) => handleConfigChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full px-4 py-2.5 border border-secondary-300 dark:border-secondary-600 dark:bg-secondary-800 dark:text-secondary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)} disabled={createLoading}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={createLoading}>
                  <Save className="w-4 h-4 mr-2" />Create Integration
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}