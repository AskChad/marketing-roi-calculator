'use client'

import { useState, useRef } from 'react'
import { Upload, Image as ImageIcon, X } from 'lucide-react'

interface ImageUploadProps {
  brandId: string
  fileType: 'logo' | 'logo_dark' | 'favicon'
  currentUrl: string | null
  onUploadComplete: (url: string) => void
  label: string
}

export default function ImageUpload({
  brandId,
  fileType,
  currentUrl,
  onUploadComplete,
  label,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('brandId', brandId)
      formData.append('fileType', fileType)

      const response = await fetch('/api/admin/brands/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.url) {
        onUploadComplete(result.url)
      } else {
        alert(result.error || 'Upload failed')
        setPreviewUrl(currentUrl)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file')
      setPreviewUrl(currentUrl)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onUploadComplete('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>

      <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt={label}
              className={`mx-auto object-contain ${
                fileType === 'favicon' ? 'h-16 w-16' : 'h-32 w-auto max-w-full'
              }`}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-0 right-0 bg-danger text-white p-1 rounded-full hover:bg-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="text-neutral-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 text-neutral-400" />
            <p className="text-sm">No image uploaded</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/x-icon,image/vnd.microsoft.icon"
          onChange={handleFileSelect}
          className="hidden"
          id={`upload-${fileType}`}
        />

        <label
          htmlFor={`upload-${fileType}`}
          className={`inline-flex items-center px-4 py-2 mt-3 border border-neutral-300 rounded-lg cursor-pointer
            ${uploading ? 'bg-neutral-200 cursor-not-allowed' : 'bg-white hover:bg-neutral-50'}
            text-sm font-medium text-neutral-700 transition`}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : previewUrl ? 'Change Image' : 'Upload Image'}
        </label>

        <p className="text-xs text-neutral-500 mt-2">
          PNG, JPG, SVG, WEBP, or ICO (max 5MB)
        </p>
      </div>
    </div>
  )
}
