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
import { Loader2, Plus, Search, Eye, Edit, BarChart3, MoreVertical, Trash2, TrendingUp, DollarSign, MousePointer, Target } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { useToast } from '@/components/ui/Toast'

const MARKETING_TABS = [
  { value: 'all', label: 'All Campaigns' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'google', label: 'Google' },
]

export default function MarketingPageWrapper() {
  return (
    <Suspense fallback={null}>
      <MarketingPage />
    </Suspense>
  )
}

function MarketingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [activeTab, setActiveTab] = useState('all')
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
  const [viewCampaign, setViewCampaign] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
    sortBy: 'date',
    sortOrder: 'desc' as 'asc' | 'desc',
    query: searchParams.get('query') || '',
    platform: searchParams.get('platform') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
  })

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      if (activeTab !== 'all') {
        params.set('platform', activeTab.toUpperCase())
      }

      const response = await fetch(`/api/marketing?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setCampaigns(data.data)
        setTotalPages(data.meta.totalPages)
        setTotal(data.meta.total)
      } else {
        addToast({ type: 'error', title: 'Failed to fetch campaigns', message: data.error })
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch campaigns' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [activeTab, filters.page, filters.sortBy, filters.sortOrder])

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value))
    })
    router.push(`/marketing?${params.toString()}`, { scroll: false })
  }, [filters.query, filters.platform, filters.from, filters.to])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'FACEBOOK': return <Badge variant="primary">Facebook</Badge>
      case 'INSTAGRAM': return <Badge variant="danger">Instagram</Badge>
      case 'GOOGLE': return <Badge variant="success">Google</Badge>
      default: return <Badge variant="secondary">{platform}</Badge>
    }
  }

  const columns: Column<any>[] = [
    { key: 'date', header: 'Date', width: '120px', sortable: true, render: (row) => formatDate(row.date, 'DD MMM YYYY') },
    { key: 'platform', header: 'Platform', width: '120px', render: (row) => getPlatformBadge(row.platform) },
    { key: 'campaignName', header: 'Campaign', width: '200px', render: (row) => row.campaignName || '-' },
    { key: 'adSetName', header: 'Ad Set', width: '180px', render: (row) => row.adSetName || '-' },
    { key: 'adName', header: 'Ad', width: '180px', render: (row) => row.adName || '-' },
    { key: 'amount', header: 'Spend', width: '130px', sortable: true, render: (row) => <span className="font-medium">{formatCurrency(row.amount)}</span> },
    { key: 'impressions', header: 'Impressions', width: '120px', render: (row) => row.impressions ? row.impressions.toLocaleString() : '-' },
    { key: 'clicks', header: 'Clicks', width: '100px', render: (row) => row.clicks ? row.clicks.toLocaleString() : '-' },
    { key: 'ctr', header: 'CTR', width: '100px', render: (row) => row.impressions && row.clicks ? `${((row.clicks / row.impressions) * 100).toFixed(2)}%` : '-' },
    { key: 'cpc', header: 'CPC', width: '100px', render: (row) => row.cpc ? formatCurrency(row.cpc) : '-' },
    { key: 'roas', header: 'ROAS', width: '100px', render: (row) => row.roas ? `${row.roas.toFixed(2)}x` : '-' },
    { key: 'actions', header: 'Actions', width: '100px', render: (row) => (
      <Dropdown
        trigger={<Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>}
        items={[
          { label: 'View', value: 'view', icon: <Eye className="w-4 h-4" />, onClick: () => setViewCampaign(row) },
          { label: 'Edit', value: 'edit', icon: <Edit className="w-4 h-4" />, onClick: () => router.push(`/marketing/${row.id}/edit`) },
          { label: 'Delete', value: 'delete', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => setDeleteConfirm(row.id) },
        ]}
      />
    )},
  ]

  const handleSelectionChange = (keys: string[]) => setSelectedCampaigns(keys)

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      const response = await fetch(`/api/marketing/${deleteConfirm}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        addToast({ type: 'success', title: 'Campaign deleted' })
        fetchCampaigns()
      } else {
        addToast({ type: 'error', title: 'Failed to delete', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete campaign' })
    }
    setDeleteConfirm(null)
  }

  const totalSpend = campaigns.reduce((sum, c) => sum + c.amount, 0)
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0)
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0)
  const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0)
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00'
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0
  const avgRoas = totalSpend > 0 ? (campaigns.reduce((sum, c) => sum + (c.roas || 0), 0) / campaigns.length).toFixed(2) : '0.00'

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Marketing Ads</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">Track advertising spend and performance across platforms</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => router.push('/marketing/new')}>
            <Plus className="w-4 h-4 mr-2" />Add Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Total Spend</p>
                <p className="text-2xl font-bold text-secondary-900">{formatCurrency(totalSpend)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Impressions</p>
                <p className="text-2xl font-bold text-secondary-900">{totalImpressions.toLocaleString()}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Clicks</p>
                <p className="text-2xl font-bold text-secondary-900">{totalClicks.toLocaleString()}</p>
              </div>
              <MousePointer className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Avg ROAS</p>
                <p className="text-2xl font-bold text-secondary-900">{avgRoas}x</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs tabs={MARKETING_TABS} activeTab={activeTab} onChange={setActiveTab} variant="pills" className="mb-4" />

      <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 shadow-card mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            placeholder="Search campaigns..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="lg:col-span-2"
          />
          <Select
            value={filters.platform}
            onChange={(e) => handleFilterChange('platform', e.target.value)}
            options={[{ value: '', label: 'All Platforms' }, { value: 'FACEBOOK', label: 'Facebook' }, { value: 'INSTAGRAM', label: 'Instagram' }, { value: 'GOOGLE', label: 'Google' }]}
            placeholder="All Platforms"
          />
          <div className="flex gap-2">
            <Input type="date" value={filters.from} onChange={(e) => handleFilterChange('from', e.target.value)} placeholder="From" className="w-full" />
            <Input type="date" value={filters.to} onChange={(e) => handleFilterChange('to', e.target.value)} placeholder="To" className="w-full" />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={campaigns}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setViewCampaign(row)}
        selectedKeys={selectedCampaigns}
        onSelectionChange={handleSelectionChange}
        loading={loading}
        emptyMessage="No campaigns found"
        showCheckboxes
        striped
        hoverable
      />

      {total > 0 && (
        <Pagination
          currentPage={filters.page}
          totalPages={totalPages}
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
          showPageSize
          pageSize={filters.limit}
          onPageSizeChange={(limit) => setFilters(prev => ({ ...prev, limit, page: 1 }))}
        />
      )}

      {viewCampaign && (
        <Modal
          isOpen={!!viewCampaign}
          onClose={() => setViewCampaign(null)}
          title={`Campaign: ${viewCampaign.campaignName || viewCampaign.adName || 'Details'}`}
          size="lg"
        >
          <CampaignDetail campaign={viewCampaign} onClose={() => setViewCampaign(null)} />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        message="Are you sure you want to delete this campaign record?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

function CampaignDetail({ campaign, onClose }: { campaign: any; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant={
            campaign.platform === 'FACEBOOK' ? 'primary' :
            campaign.platform === 'INSTAGRAM' ? 'danger' :
            campaign.platform === 'GOOGLE' ? 'success' : 'secondary'
          }>{campaign.platform}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><p className="text-secondary-500 dark:text-secondary-400">Date</p><p className="font-medium">{formatDate(campaign.date)}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Campaign</p><p className="font-medium">{campaign.campaignName || '-'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Ad Set</p><p className="font-medium">{campaign.adSetName || '-'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Ad Name</p><p className="font-medium">{campaign.adName || '-'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Spend</p><p className="font-medium text-success-600 text-xl">{formatCurrency(campaign.amount)}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Impressions</p><p className="font-medium">{campaign.impressions ? campaign.impressions.toLocaleString() : '-'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Clicks</p><p className="font-medium">{campaign.clicks ? campaign.clicks.toLocaleString() : '-'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">Conversions</p><p className="font-medium">{campaign.conversions ? campaign.conversions.toLocaleString() : '-'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">CTR</p><p className="font-medium">{campaign.impressions && campaign.clicks ? `${((campaign.clicks / campaign.impressions) * 100).toFixed(2)}%` : '-'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">CPC</p><p className="font-medium">{campaign.cpc ? formatCurrency(campaign.cpc) : '-'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">CPM</p><p className="font-medium">{campaign.cpm ? formatCurrency(campaign.cpm) : '-'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">CPA</p><p className="font-medium">{campaign.cpa ? formatCurrency(campaign.cpa) : '-'}</p></div>
        <div><p className="text-secondary-500 dark:text-secondary-400">ROAS</p><p className="font-medium">{campaign.roas ? `${campaign.roas.toFixed(2)}x` : '-'}</p></div>
      </div>

      {campaign.notes && (
        <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4">
          <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">Notes</h4>
          <p className="text-secondary-600 dark:text-secondary-400">{campaign.notes}</p>
        </div>
      )}
    </div>
  )
}

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText = 'Cancel', variant, isLoading }: any) {
  if (!isOpen) return null
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-secondary-600 dark:text-secondary-400 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>{cancelText}</Button>
        <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>{confirmText}</Button>
      </div>
    </Modal>
  )
}