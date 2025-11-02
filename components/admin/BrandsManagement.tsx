'use client'

import { useState } from 'react'
import { Plus, Edit, Save, X, Palette, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import ImageUpload from './ImageUpload'

interface Brand {
  id: string
  name: string
  domain: string
  subdomain: string | null
  is_active: boolean
  color_primary: string
  color_secondary: string
  color_accent: string
  color_success: string
  color_error: string
  logo_url: string | null
  logo_dark_url: string | null
  favicon_url: string | null
  hero_title: string
  hero_subtitle: string
  hero_cta_text: string
  hero_secondary_cta_text: string
  feature_1_title: string
  feature_1_description: string
  feature_2_title: string
  feature_2_description: string
  feature_3_title: string
  feature_3_description: string
  company_name: string | null
  support_email: string | null
  privacy_policy_url: string | null
  terms_of_service_url: string | null
  domain_verified?: boolean
  domain_verification_checked_at?: string
  dns_records?: any
}

interface BrandsManagementProps {
  initialBrands: Brand[]
}

export default function BrandsManagement({ initialBrands }: BrandsManagementProps) {
  const [brands, setBrands] = useState<Brand[]>(initialBrands)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null)

  const emptyBrand: Partial<Brand> = {
    name: '',
    domain: '',
    subdomain: '',
    is_active: true,
    color_primary: '#0066CC',
    color_secondary: '#7C3AED',
    color_accent: '#F59E0B',
    color_success: '#10B981',
    color_error: '#EF4444',
    hero_title: 'Marketing ROI Calculator',
    hero_subtitle: 'Calculate your current marketing performance and model prospective scenarios',
    hero_cta_text: 'Get Started Free',
    hero_secondary_cta_text: 'View Demo',
    feature_1_title: 'Real-Time Analysis',
    feature_1_description: 'Calculate ROI instantly',
    feature_2_title: 'Scenario Modeling',
    feature_2_description: 'Model what-if scenarios',
    feature_3_title: 'AI-Powered Insights',
    feature_3_description: 'Get intelligent recommendations',
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setIsCreating(false)
  }

  const handleCreate = () => {
    setEditingBrand(emptyBrand as Brand)
    setIsCreating(true)
  }

  const handleCancel = () => {
    setEditingBrand(null)
    setIsCreating(false)
  }

  const handleSave = async () => {
    if (!editingBrand) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/brands', {
        method: isCreating ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingBrand),
      })

      if (response.ok) {
        const savedBrand = await response.json()
        if (isCreating) {
          setBrands([savedBrand, ...brands])
        } else {
          setBrands(brands.map(b => b.id === savedBrand.id ? savedBrand : b))
        }
        handleCancel()
      } else {
        alert('Failed to save brand')
      }
    } catch (error) {
      console.error('Error saving brand:', error)
      alert('Error saving brand')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: keyof Brand, value: any) => {
    if (!editingBrand) return
    setEditingBrand({ ...editingBrand, [field]: value })
  }

  const handleVerifyDomain = async (brandId: string) => {
    setVerifyingDomain(brandId)
    try {
      const response = await fetch(`/api/admin/brands/${brandId}/verify-domain`, {
        method: 'POST',
      })

      const result = await response.json()

      if (response.ok) {
        // Update brand in state
        setBrands(brands.map(b =>
          b.id === brandId
            ? {
                ...b,
                domain_verified: result.verified,
                domain_verification_checked_at: new Date().toISOString(),
                dns_records: result.dnsRecords,
              }
            : b
        ))

        if (result.verified) {
          alert('Domain verified successfully!')
        } else if (result.dnsRecords) {
          alert(`Domain not yet verified. Please add these DNS records:\n\n${result.dnsRecords.map((r: any) => `${r.type}: ${r.name} → ${r.value}`).join('\n')}`)
        } else {
          alert(result.error || 'Domain verification pending')
        }
      } else {
        alert(result.error || 'Failed to verify domain')
      }
    } catch (error) {
      console.error('Domain verification error:', error)
      alert('Error verifying domain')
    } finally {
      setVerifyingDomain(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Brand Management</h2>
          <p className="text-neutral-600">Manage white-label brands and customize their appearance</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Brand
        </button>
      </div>

      {/* Editing Form */}
      {editingBrand && (
        <div className="bg-white rounded-lg shadow-lg p-8 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-900">
              {isCreating ? 'Create New Brand' : 'Edit Brand'}
            </h3>
            <button onClick={handleCancel} className="text-neutral-500 hover:text-neutral-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  value={editingBrand.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Domain *</label>
                <input
                  type="text"
                  value={editingBrand.domain}
                  onChange={(e) => handleChange('domain', e.target.value)}
                  placeholder="example.com"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Subdomain</label>
                <input
                  type="text"
                  value={editingBrand.subdomain || ''}
                  onChange={(e) => handleChange('subdomain', e.target.value)}
                  placeholder="brand"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                <select
                  value={editingBrand.is_active ? 'active' : 'inactive'}
                  onChange={(e) => handleChange('is_active', e.target.value === 'active')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Colors */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3 flex items-center">
                <Palette className="mr-2 h-5 w-5" />
                Brand Colors
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {['color_primary', 'color_secondary', 'color_accent', 'color_success', 'color_error'].map((colorKey) => (
                  <div key={colorKey}>
                    <label className="block text-sm font-medium text-neutral-700 mb-1 capitalize">
                      {colorKey.replace('color_', '')}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={editingBrand[colorKey as keyof Brand] as string}
                        onChange={(e) => handleChange(colorKey as keyof Brand, e.target.value)}
                        className="h-10 w-14 rounded border border-neutral-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editingBrand[colorKey as keyof Brand] as string}
                        onChange={(e) => handleChange(colorKey as keyof Brand, e.target.value)}
                        className="flex-1 px-2 py-1 border border-neutral-300 rounded text-sm font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Branding Assets */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3">Branding Assets</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ImageUpload
                  brandId={editingBrand.id}
                  fileType="logo"
                  currentUrl={editingBrand.logo_url}
                  onUploadComplete={(url) => handleChange('logo_url', url)}
                  label="Logo"
                />
                <ImageUpload
                  brandId={editingBrand.id}
                  fileType="logo_dark"
                  currentUrl={editingBrand.logo_dark_url}
                  onUploadComplete={(url) => handleChange('logo_dark_url', url)}
                  label="Dark Logo"
                />
                <ImageUpload
                  brandId={editingBrand.id}
                  fileType="favicon"
                  currentUrl={editingBrand.favicon_url}
                  onUploadComplete={(url) => handleChange('favicon_url', url)}
                  label="Favicon"
                />
              </div>
            </div>

            {/* Or use URLs directly */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3">Or Use URLs</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={editingBrand.logo_url || ''}
                    onChange={(e) => handleChange('logo_url', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Dark Logo URL</label>
                  <input
                    type="url"
                    value={editingBrand.logo_dark_url || ''}
                    onChange={(e) => handleChange('logo_dark_url', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Favicon URL</label>
                  <input
                    type="url"
                    value={editingBrand.favicon_url || ''}
                    onChange={(e) => handleChange('favicon_url', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>
            </div>

            {/* Landing Page Copy */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3">Landing Page Copy</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Hero Title</label>
                  <input
                    type="text"
                    value={editingBrand.hero_title}
                    onChange={(e) => handleChange('hero_title', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Hero Subtitle</label>
                  <textarea
                    value={editingBrand.hero_subtitle}
                    onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Primary CTA Text</label>
                    <input
                      type="text"
                      value={editingBrand.hero_cta_text}
                      onChange={(e) => handleChange('hero_cta_text', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Secondary CTA Text</label>
                    <input
                      type="text"
                      value={editingBrand.hero_secondary_cta_text}
                      onChange={(e) => handleChange('hero_secondary_cta_text', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Brand'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brands List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => {
          const isCustomDomain = brand.domain && !brand.domain.includes('localhost')
          const isSubdomainOnly = !isCustomDomain || brand.subdomain

          return (
            <div key={brand.id} className="bg-white rounded-lg shadow p-6 border border-neutral-200 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-neutral-900 text-lg">{brand.name}</h3>
                  <p className="text-sm text-neutral-500">{brand.domain}</p>
                  {brand.subdomain && (
                    <p className="text-xs text-neutral-400">Subdomain: {brand.subdomain}</p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${brand.is_active ? 'bg-success/10 text-success-dark' : 'bg-neutral-100 text-neutral-600'}`}>
                  {brand.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Domain Setup Instructions */}
              {isCustomDomain && (
                <div className="mb-4 space-y-3">
                  {/* Vercel Deployment URL */}
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-xs font-medium text-neutral-700 mb-1">Point your domain to:</p>
                    <code className="text-xs font-mono text-blue-700 bg-white px-2 py-1 rounded border border-blue-300 block">
                      cname.vercel-dns.com
                    </code>
                    <p className="text-xs text-neutral-500 mt-2">
                      Add a CNAME record in your DNS settings pointing to the above address
                    </p>
                  </div>

                  {/* Domain Verification Status */}
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-neutral-600">Domain Status:</span>
                      {brand.domain_verified ? (
                        <span className="flex items-center text-xs text-success-dark">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </span>
                      ) : brand.domain_verification_checked_at ? (
                        <span className="flex items-center text-xs text-warning-dark">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pending
                        </span>
                      ) : (
                        <span className="flex items-center text-xs text-neutral-500">
                          <XCircle className="h-3 w-3 mr-1" />
                          Not Checked
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleVerifyDomain(brand.id)}
                      disabled={verifyingDomain === brand.id}
                      className="w-full px-2 py-1 text-xs bg-white border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50 transition flex items-center justify-center disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${verifyingDomain === brand.id ? 'animate-spin' : ''}`} />
                      {verifyingDomain === brand.id ? 'Checking...' : 'Verify Domain'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 mb-4">
                {[brand.color_primary, brand.color_secondary, brand.color_accent].map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded border border-neutral-200"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              <button
                onClick={() => handleEdit(brand)}
                className="w-full px-3 py-2 border border-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition flex items-center justify-center"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Brand
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
