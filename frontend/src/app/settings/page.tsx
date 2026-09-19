'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { DataTable, Column, Pagination } from '@/components/ui/Table'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { Tabs, TabPanel } from '@/components/ui/Tabs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Loader2, Plus, Search, Eye, Edit, Users, Building2, PlugZap, CreditCard, Shield, Database, Globe, Bell, MoreVertical, Trash2, Save, TestTube, Link2, Key, Wifi, AlertCircle, CheckCircle, ShoppingCart, MessageSquare, Truck, BarChart3 } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'
import { USER_ROLE_OPTIONS, INTEGRATION_TYPE_OPTIONS } from '@/types'
import { businessSettingsSchema } from '@/lib/validations/schemas'

const SETTINGS_TABS = [
  { value: 'business', label: 'Business', icon: <Building2 className="w-4 h-4" /> },
  { value: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
  { value: 'integrations', label: 'Integrations', icon: <Link2 className="w-4 h-4" /> },
  { value: 'roles', label: 'Roles & Permissions', icon: <Shield className="w-4 h-4" /> },
]

export default function SettingsPageWrapper() {
  return (
    <Suspense fallback={null}>
      <SettingsPage />
    </Suspense>
  )
}

function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState('business')
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [integrations, setIntegrations] = useState<any[]>([])
  const [testLoading, setTestLoading] = useState<string | null>(null)
  const [syncLoading, setSyncLoading] = useState<string | null>(null)

  // Business Settings Form State
  const [formData, setFormData] = useState({
    businessName: '',
    logo: '',
    currency: 'PKR',
    currencySymbol: 'Rs.',
    timezone: 'Asia/Karachi',
    dateFormat: 'DD/MM/YYYY',
    taxNumber: '',
    taxRate: 0,
    lowStockThreshold: 10,
    address: '',
    phone: '',
    email: '',
    website: '',
  })

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      if (data.success) {
        setSettings(data.data)
        setFormData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch settings')
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      if (data.success) setUsers(data.data)
    } catch (error) {
      console.error('Failed to fetch users')
    }
  }

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations')
      const data = await response.json()
      if (data.success) setIntegrations(data.data)
    } catch (error) {
      console.error('Failed to fetch integrations')
    }
  }

  useEffect(() => {
    fetchSettings()
    fetchUsers()
    fetchIntegrations()
  }, [])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && SETTINGS_TABS.some(t => t.value === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }))
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Settings saved' })
        setSettings(data.data)
      } else {
        addToast({ type: 'error', title: 'Failed to save', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to save settings' })
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Settings</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Configure business settings, users, and integrations</p>
        </div>
      </div>

      <Tabs tabs={SETTINGS_TABS} activeTab={activeTab} onChange={setActiveTab} variant="line" className="mb-6" />

      <TabPanel value="business" activeTab={activeTab}>
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Business Name" name="businessName" value={formData.businessName} onChange={handleInputChange} required />
              <Input label="Currency" name="currency" value={formData.currency} onChange={handleInputChange} />
              <Input label="Currency Symbol" name="currencySymbol" value={formData.currencySymbol} onChange={handleInputChange} />
              <Input label="Timezone" name="timezone" value={formData.timezone} onChange={handleInputChange} />
              <Input label="Date Format" name="dateFormat" value={formData.dateFormat} onChange={handleInputChange} />
              <Input label="Tax Number" name="taxNumber" value={formData.taxNumber} onChange={handleInputChange} />
              <Input label="Tax Rate (%)" name="taxRate" type="number" step="0.01" value={formData.taxRate} onChange={handleInputChange} />
              <Input label="Low Stock Threshold" name="lowStockThreshold" type="number" value={formData.lowStockThreshold} onChange={handleInputChange} />
              <Input label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} />
              <Input label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
              <Input label="Website" name="website" value={formData.website} onChange={handleInputChange} />
              <Input label="Logo URL" name="logo" value={formData.logo} onChange={handleInputChange} />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} isLoading={loading}>
                <Save className="w-4 h-4 mr-2" />Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value="users" activeTab={activeTab}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold dark:text-secondary-100">User Management</h2>
          <Button onClick={() => router.push('/settings/users/new')}>
            <Plus className="w-4 h-4 mr-2" />Add User
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={[
                { key: 'name', header: 'Name', width: '180px' },
                { key: 'email', header: 'Email', width: '220px' },
                { key: 'role', header: 'Role', width: '150px', render: (row) => <Badge variant={row.role === 'SUPER_ADMIN' ? 'danger' : row.role === 'ADMIN' ? 'primary' : 'secondary'}>{row.role}</Badge> },
                { key: 'isActive', header: 'Status', width: '100px', render: (row) => <Badge variant={row.isActive ? 'success' : 'secondary'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
                { key: 'lastLoginAt', header: 'Last Login', width: '150px', render: (row) => row.lastLoginAt ? formatDate(row.lastLoginAt) : 'Never' },
                { key: 'actions', header: 'Actions', width: '120px', render: (row) => (
                  <Dropdown trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>} items={[
                    { label: 'Edit', value: 'edit', icon: <Edit className="w-4 h-4" />, onClick: () => router.push(`/settings/users/${row.id}/edit`) },
                    { label: 'Reset Password', value: 'password', icon: <Key className="w-4 h-4" />, onClick: () => router.push(`/settings/users/${row.id}/password`) },
                  ]} />
                )},
              ]}
              data={users}
              keyExtractor={(row) => row.id}
              loading={loading}
              emptyMessage="No users found"
              striped
              hoverable
            />
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value="integrations" activeTab={activeTab}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold dark:text-secondary-100">Integrations</h2>
          <Button onClick={() => router.push('/admin/integrations')}>
            <Plus className="w-4 h-4 mr-2" />Add Integration
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <Card key={integration.id} variant="bordered" className="h-full">
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-${integration.type === 'SHOPIFY' ? 'purple' : integration.type === 'WHATSAPP' ? 'green' : integration.type === 'COURIER' ? 'blue' : 'orange'}-100`}>
                    {integration.type === 'SHOPIFY' && <ShoppingCart className="w-5 h-5" />}
                    {integration.type === 'WHATSAPP' && <MessageSquare className="w-5 h-5" />}
                    {integration.type === 'COURIER' && <Truck className="w-5 h-5" />}
                    {integration.type === 'META_ADS' && <BarChart3 className="w-5 h-5" />}
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
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-secondary-500 dark:text-secondary-400">Last Sync</p><p>{integration.lastSyncAt ? formatDate(integration.lastSyncAt) : 'Never'}</p></div>
                  <div><p className="text-secondary-500 dark:text-secondary-400">Last Success</p><p>{integration.lastSuccessAt ? formatDate(integration.lastSuccessAt) : 'Never'}</p></div>
                  {integration.lastFailureAt && (
                    <div className="col-span-2 text-danger-600">
                      <p className="text-secondary-500 dark:text-secondary-400">Last Error</p>
                      <p className="text-sm">{integration.lastError}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2 border-t border-secondary-100">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleTestIntegration(integration.id)} isLoading={testLoading === integration.id}>
                    <Wifi className="w-4 h-4 mr-1" />Test
                  </Button>
                  <Button variant="primary" size="sm" className="flex-1" onClick={() => handleSyncIntegration(integration.id)} isLoading={syncLoading === integration.id}>
                    <Database className="w-4 h-4 mr-1" />Sync
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
              <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">No Integrations</h3>
              <p className="text-secondary-500 dark:text-secondary-400 mb-4">Connect Shopify, WhatsApp, Courier, or Meta Ads</p>
              <Button onClick={() => router.push('/admin/integrations')}>
                <Plus className="w-4 h-4 mr-2" />Add Integration
              </Button>
            </Card>
          )}
        </div>
      </TabPanel>

      <TabPanel value="roles" activeTab={activeTab}>
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Permission</th>
                    {USER_ROLE_OPTIONS.map(role => (
                      <th key={role.value} className="px-4 py-3 text-center font-semibold">{role.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  <tr>
                    <td className="px-4 py-3 font-medium">All Access</td>
                    {USER_ROLE_OPTIONS.map(role => (
                      <td key={role.value} className="px-4 py-3 text-center">
                        {role.value === 'SUPER_ADMIN' ? <CheckCircle className="w-5 h-5 text-success-600 mx-auto" /> : '-'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Orders Management</td>
                    {USER_ROLE_OPTIONS.map(role => (
                      <td key={role.value} className="px-4 py-3 text-center">
                        {['SUPER_ADMIN', 'ADMIN', 'ORDER_MANAGER'].includes(role.value) ? <CheckCircle className="w-5 h-5 text-success-600 mx-auto" /> : '-'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Financial/Accounting</td>
                    {USER_ROLE_OPTIONS.map(role => (
                      <td key={role.value} className="px-4 py-3 text-center">
                        {['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS'].includes(role.value) ? <CheckCircle className="w-5 h-5 text-success-600 mx-auto" /> : '-'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Inventory/Stock</td>
                    {USER_ROLE_OPTIONS.map(role => (
                      <td key={role.value} className="px-4 py-3 text-center">
                        {['SUPER_ADMIN', 'ADMIN', 'STOCK_MANAGER'].includes(role.value) ? <CheckCircle className="w-5 h-5 text-success-600 mx-auto" /> : '-'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">User Management</td>
                    {USER_ROLE_OPTIONS.map(role => (
                      <td key={role.value} className="px-4 py-3 text-center">
                        {['SUPER_ADMIN', 'ADMIN'].includes(role.value) ? <CheckCircle className="w-5 h-5 text-success-600 mx-auto" /> : '-'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabPanel>
    </div>
  )
}