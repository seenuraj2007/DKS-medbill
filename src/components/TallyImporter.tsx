'use client'

import { useState, useCallback, useEffect } from 'react'
import { Upload, FileSpreadsheet, AlertCircle, Check, X, Download, Eye, Loader2 } from 'lucide-react'

// Translation strings (hardcoded for now)
const t = (key: string, params?: Record<string, any>) => {
  const strings: Record<string, string> = {
    'tally.title': 'Import from Tally',
    'tally.description': 'Import your data from Tally in seconds',
    'tally.instructions': 'Instructions',
    'tally.step1': 'Go to Tally: Gateway > Display > List of Accounts > Stock Items',
    'tally.step2': 'Click Export and choose XML or CSV format',
    'tally.step3': 'Upload the exported file here',
    'tally.uploadFile': 'Upload File',
    'tally.selectFile': 'Select file or drag here',
    'tally.supportedFormats': 'Supported formats: .xml, .csv',
    'tally.selectLocation': 'Select Location (for stock)',
    'tally.preview': 'Preview',
    'tally.import': 'Import',
    'tally.dryRun': 'Preview only (don\'t save)',
    'tally.importing': 'Importing...',
    'tally.importSuccess': 'Import successful! {count} products imported.',
    'tally.importPreview': 'Import Preview',
    'tally.productsFound': 'Products Found',
    'tally.validationErrors': 'Validation Errors',
    'tally.closePreview': 'Close Preview',
    'tally.sampleFile': 'Download Sample File',
    'importSuccess': 'Import successful! {count} products imported.',
  }
  let text = strings[key] || key
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v))
    })
  }
  return text
}

interface TallyProduct {
  name: string
  sku: string
  unitCost: number
  sellingPrice: number
  gstRate: number
  hsnCode?: string
  openingStock: number
  category?: string
}

interface ImportResult {
  success: boolean
  totalProducts?: number
  imported: number
  created: number
  updated: number
  products: TallyProduct[]
  parseErrors: string[]
  validationErrors: string[]
  importErrors: string[]
}

interface Location {
  id: string
  name: string
}

export function TallyImporter() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<ImportResult | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [dryRun, setDryRun] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/import/tally')
      if (response.ok) {
        const data = await response.json()
        setLocations(data.locations)
        if (data.locations.length > 0) {
          setSelectedLocation(data.locations[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.name.endsWith('.xml') || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile)
      setMessage(null)
    } else {
      setMessage({ type: 'error', text: 'Please upload an XML or CSV file' })
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setMessage(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsUploading(true)
    setMessage(null)
    setPreview(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('locationId', selectedLocation)
      formData.append('dryRun', dryRun.toString())

      const response = await fetch('/api/import/tally', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        if (dryRun) {
          setPreview(data)
          setMessage({ 
            type: 'success', 
            text: `Found ${data.totalProducts} products. Review and click Import to save.` 
          })
        } else {
          setResult(data)
          setMessage({ 
            type: 'success', 
            text: t('importSuccess', { count: data.imported }) 
          })
          setFile(null)
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Import failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import file' })
    } finally {
      setIsUploading(false)
    }
  }

  const downloadSample = () => {
    const sampleData = `Name,SKU,Unit Cost,Selling Price,GST Rate,HSN Code,Opening Stock,Category
Product A,SKU001,100,120,18,1234,50,Electronics
Product B,SKU002,200,250,12,5678,30,Accessories
Product C,SKU003,50,65,5,9012,100,Groceries`
    
    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tally_import_sample.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{t('title')}</h3>
            <p className="text-gray-400 mt-1">{t('description')}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">{t('instructions')}</h4>
          <ol className="space-y-2 text-sm text-gray-400 list-decimal list-inside">
            <li>{t('step1')}</li>
            <li>{t('step2')}</li>
            <li>{t('step3')}</li>
          </ol>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* File Upload */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging 
              ? 'border-violet-500 bg-violet-500/10' 
              : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-white font-medium mb-2">{t('selectFile')}</p>
          <p className="text-sm text-gray-400 mb-4">{t('supportedFormats')}</p>
          <input
            type="file"
            accept=".xml,.csv"
            onChange={handleFileSelect}
            className="hidden"
            id="tally-file"
          />
          <label
            htmlFor="tally-file"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all cursor-pointer"
          >
            {t('uploadFile')}
          </label>
          {file && (
            <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
              <Check className="w-4 h-4" />
              <span className="text-sm">{file.name}</span>
              <button
                onClick={() => setFile(null)}
                className="ml-2 text-gray-400 hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Location Selection */}
        {locations.length > 0 && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('selectLocation')}
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Options */}
        <div className="mt-6 flex items-center gap-3">
          <input
            type="checkbox"
            id="dry-run"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-violet-500 focus:ring-violet-500"
          />
          <label htmlFor="dry-run" className="text-gray-300">
            {t('dryRun')}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={handleImport}
            disabled={!file || isUploading}
            className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-lg font-medium hover:from-violet-600 hover:to-fuchsia-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('importing')}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {dryRun ? t('preview') : t('import')}
              </>
            )}
          </button>

          <button
            onClick={downloadSample}
            className="px-6 py-2.5 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t('sampleFile')}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {preview && preview.products.length > 0 && (
        <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">{t('importPreview')}</h4>
            <button
              onClick={() => setPreview(null)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-white">{preview.totalProducts}</p>
              <p className="text-sm text-gray-400">{t('productsFound')}</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-400">{preview.validationErrors.length}</p>
              <p className="text-sm text-gray-400">{t('validationErrors')}</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-400">{preview.parseErrors.length}</p>
              <p className="text-sm text-gray-400">Parse Errors</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-900/50 text-gray-400 text-sm">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Name</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Unit Cost</th>
                  <th className="px-4 py-3">Selling Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3 rounded-tr-lg">GST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {preview.products.map((product, index) => (
                  <tr key={index} className="text-gray-300">
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3">{product.sku}</td>
                    <td className="px-4 py-3">₹{product.unitCost}</td>
                    <td className="px-4 py-3">₹{product.sellingPrice}</td>
                    <td className="px-4 py-3">{product.openingStock}</td>
                    <td className="px-4 py-3">{product.gstRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(preview.totalProducts || preview.products.length) > 10 && (
            <p className="text-center text-gray-400 mt-4">
              Showing first 10 of {preview.totalProducts || preview.products.length} products
            </p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setDryRun(false)
                handleImport()
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              {t('import')}
            </button>
            <button
              onClick={() => setPreview(null)}
              className="px-6 py-2.5 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-all"
            >
              {t('closePreview')}
            </button>
          </div>
        </div>
      )}

      {/* Import Result */}
      {result && (
        <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Check className="w-6 h-6 text-green-400" />
            <h4 className="text-lg font-semibold text-white">Import Successful!</h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-white">{result.imported}</p>
              <p className="text-sm text-gray-400">Total Imported</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-400">{result.created}</p>
              <p className="text-sm text-gray-400">New Products</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-400">{result.updated}</p>
              <p className="text-sm text-gray-400">Updated</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
