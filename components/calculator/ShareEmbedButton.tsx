'use client'

import { useState } from 'react'
import { Share2, Copy, Check, X } from 'lucide-react'

export default function ShareEmbedButton() {
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const embedUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/embed/calculator`
    : '/embed/calculator'

  const embedCode = `<iframe
  src="${embedUrl}"
  width="100%"
  height="800"
  frameborder="0"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
  title="ROI Calculator"
></iframe>`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        Share / Embed
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-neutral-900">Share Calculator</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-neutral-600" />
              </button>
            </div>

            <p className="text-neutral-600 mb-6">
              Embed this calculator on your website or share the direct link with prospects.
            </p>

            {/* Direct Link */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Direct Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={embedUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-900 text-sm"
                />
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(embedUrl)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-lg transition flex items-center gap-2"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy
                </button>
              </div>
            </div>

            {/* Embed Code */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Embed Code
              </label>
              <div className="relative">
                <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                  {embedCode}
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded transition flex items-center gap-1.5 text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Preview
              </label>
              <div className="border-2 border-neutral-200 rounded-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="400"
                  style={{ border: 'none' }}
                  title="ROI Calculator Preview"
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
              <h4 className="font-semibold text-neutral-900 mb-2">How to embed:</h4>
              <ol className="text-sm text-neutral-600 space-y-1 list-decimal list-inside">
                <li>Copy the embed code above</li>
                <li>Paste it into your website's HTML where you want the calculator to appear</li>
                <li>Adjust the width and height values as needed</li>
                <li>The calculator will work independently without requiring authentication</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
