// src/components/DocumentUpload.js
import { useState, useRef } from 'react'
import { 
  CloudArrowUpIcon, 
  XMarkIcon, 
  DocumentIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

export default function DocumentUpload({ 
  helperId, 
  onUploadSuccess, 
  onUploadError,
  userRole = 'admin'
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [metadata, setMetadata] = useState({
    documentType: 'other',
    name: '',
    isVisibleToHelper: false,
    validUntil: ''
  })
  
  const fileInputRef = useRef(null)
  const formRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (file) => {
    // Validate file
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      alert('Dateityp nicht unterstützt. Erlaubt sind: PDF, JPG, PNG, GIF, DOC, DOCX')
      return
    }

    if (file.size > 52428800) { // 50MB
      alert('Datei zu groß. Maximale Größe: 50MB')
      return
    }

    if (file.size === 0) {
      alert('Datei ist leer')
      return
    }

    setSelectedFile(file)
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    
    // Validate required fields
    if (!metadata.name.trim()) {
      alert('Bitte geben Sie einen Namen für das Dokument ein')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('document', selectedFile)
      formData.append('documentType', metadata.documentType)
      formData.append('name', metadata.name)
      formData.append('isVisibleToHelper', metadata.isVisibleToHelper.toString())
      formData.append('validUntil', metadata.validUntil)
      formData.append('uploadedBy', userRole)

      const response = await fetch(`/api/helpers/${helperId}/documents`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        let errorMessage = 'Upload fehlgeschlagen'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.details || errorMessage
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      
      // Reset form
      setSelectedFile(null)
      setMetadata({
        documentType: 'other',
        name: '',
        isVisibleToHelper: false,
        validUntil: ''
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      onUploadSuccess?.(result.document)
    } catch (error) {
      console.error('Upload error:', error)
      onUploadError?.(error.message)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
          onChange={handleFileInput}
        />
        
        {!selectedFile ? (
          <div className="space-y-4">
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                Datei hier ablegen oder klicken zum Auswählen
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PDF, JPG, PNG, GIF, DOC, DOCX bis 50MB
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
              disabled={isUploading}
            >
              Datei auswählen
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <DocumentIcon className="h-8 w-8 text-blue-500" />
              <div className="text-left">
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-1 text-gray-400 hover:text-gray-600"
                disabled={isUploading}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Metadata Form */}
      {selectedFile && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900">Dokument-Einstellungen</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dokumententyp
              </label>
              <select
                value={metadata.documentType}
                onChange={(e) => setMetadata(prev => ({ ...prev, documentType: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUploading}
              >
                <option value="other">Sonstiges</option>
                <option value="fuehrungszeugnis">Führungszeugnis</option>
                <option value="qualifikation">Qualifikationsnachweis</option>
                <option value="vertrag">Vertrag</option>
                <option value="rechnung">Rechnung</option>
                <option value="identifikation">Ausweisdokument</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gültig bis (optional)
              </label>
              <input
                type="date"
                value={metadata.validUntil}
                onChange={(e) => setMetadata(prev => ({ ...prev, validUntil: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUploading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={metadata.name}
              onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Name des Dokuments..."
              disabled={isUploading}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isVisibleToHelper"
              checked={metadata.isVisibleToHelper}
              onChange={(e) => setMetadata(prev => ({ ...prev, isVisibleToHelper: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={isUploading}
            />
            <label htmlFor="isVisibleToHelper" className="text-sm text-gray-700 flex items-center gap-2">
              {metadata.isVisibleToHelper ? (
                <EyeIcon className="h-4 w-4 text-green-600" />
              ) : (
                <EyeSlashIcon className="h-4 w-4 text-gray-400" />
              )}
              Helfer kann dieses Dokument sehen
            </label>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="btn-primary flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Wird hochgeladen...
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="h-5 w-5" />
                Dokument hochladen
              </>
            )}
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  )
} 