// src/components/DocumentList.js
import { useState, useEffect } from 'react'
import { 
  DocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export default function DocumentList({ 
  helperId, 
  userRole = 'admin',
  compactView = false,
  maxItems = null,
  onDocumentDeleted,
  onDocumentError 
}) {
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDocuments()
  }, [helperId, userRole])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/helpers/${helperId}/documents`, {
        headers: {
          'x-user-role': userRole
        }
      })

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Dokumente')
      }

      const data = await response.json()
      setDocuments(data)
    } catch (error) {
      console.error('Error loading documents:', error)
      setError(error.message)
      onDocumentError?.(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (filePath) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Dokument löschen möchten?')) {
      return
    }

    try {
      const response = await fetch(`/api/helpers/${helperId}/documents`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filePath })
      })

      if (!response.ok) {
        throw new Error('Fehler beim Löschen des Dokuments')
      }

      // Remove from local state
      setDocuments(prev => prev.filter(doc => doc.path !== filePath))
      onDocumentDeleted?.(filePath)
    } catch (error) {
      console.error('Error deleting document:', error)
      onDocumentError?.(error.message)
    }
  }

  const handleDownload = async (documentItem) => {
    try {
      const response = await fetch(`/api/helpers/${helperId}/documents/download?filePath=${encodeURIComponent(documentItem.path)}`)
      
      if (!response.ok) {
        throw new Error('Fehler beim Herunterladen')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = documentItem.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading document:', error)
      onDocumentError?.(error.message)
    }
  }

  const getDocumentTypeIcon = (documentType) => {
    switch (documentType) {
      case 'fuehrungszeugnis':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'qualifikation':
        return <DocumentIcon className="w-5 h-5 text-blue-600" />
      case 'vertrag':
        return <DocumentIcon className="w-5 h-5 text-purple-600" />
      case 'rechnung':
        return <DocumentIcon className="w-5 h-5 text-yellow-600" />
      case 'identifikation':
        return <DocumentIcon className="w-5 h-5 text-red-600" />
      default:
        return <DocumentIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getDocumentTypeLabel = (documentType) => {
    switch (documentType) {
      case 'fuehrungszeugnis':
        return 'Führungszeugnis'
      case 'qualifikation':
        return 'Qualifikationsnachweis'
      case 'vertrag':
        return 'Vertrag'
      case 'rechnung':
        return 'Rechnung'
      case 'identifikation':
        return 'Ausweisdokument'
      default:
        return 'Sonstiges'
    }
  }

  const getValidityStatus = (document) => {
    if (!document.metadata?.validUntil) return null
    
    const validUntil = new Date(document.metadata.validUntil)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    if (validUntil < today) {
      return { status: 'expired', icon: <XMarkIcon className="w-4 h-4 text-red-600" />, label: 'Abgelaufen' }
    } else if (validUntil <= thirtyDaysFromNow) {
      return { status: 'expiring', icon: <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />, label: 'Läuft bald ab' }
    } else {
      return { status: 'valid', icon: <CheckCircleIcon className="w-4 h-4 text-green-600" />, label: 'Gültig' }
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Fehler beim Laden der Dokumente: {error}</p>
        <button 
          onClick={loadDocuments}
          className="btn-secondary mt-4"
        >
          Erneut versuchen
        </button>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className={`text-center ${compactView ? 'py-4' : 'py-8'}`}>
        <DocumentIcon className={`mx-auto ${compactView ? 'h-8 w-8' : 'h-12 w-12'} text-gray-400 mb-4`} />
        <p className="text-gray-600">Keine Dokumente vorhanden</p>
      </div>
    )
  }

  // Limit documents if maxItems is specified
  const displayDocuments = maxItems ? documents.slice(0, maxItems) : documents

  return (
    <div className={compactView ? 'space-y-2' : 'space-y-4'}>
      {displayDocuments.map((document) => {
        const validityStatus = getValidityStatus(document)
        
        return (
          <div 
            key={document.id} 
            className={`${compactView ? 'p-3' : 'p-4'} rounded-lg border-2 ${
              validityStatus?.status === 'expired' 
                ? 'border-red-200 bg-red-50' 
                : validityStatus?.status === 'expiring'
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getDocumentTypeIcon(document.documentType)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium text-gray-900 truncate ${compactView ? 'text-sm' : ''}`}>
                      {document.metadata?.name || document.name.replace(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-/, '')}
                    </h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {getDocumentTypeLabel(document.documentType)}
                    </span>
                  </div>
                  
                  {!compactView && (
                    <div className="text-xs text-gray-500 mb-2">
                      Dateiname: {document.name}
                    </div>
                  )}
                  
                  <div className={`flex items-center gap-4 ${compactView ? 'text-xs' : 'text-sm'} text-gray-600 mb-2`}>
                    <span>{formatFileSize(document.size)}</span>
                    <span>Hochgeladen: {formatDate(document.createdAt)}</span>
                    {!compactView && document.metadata?.uploadedBy && (
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-4 h-4" />
                        {document.metadata.uploadedBy}
                      </span>
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-4 ${compactView ? 'text-xs' : 'text-sm'}`}>
                    {validityStatus && (
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {compactView ? 'Bis:' : 'Gültig bis:'} {formatDate(document.metadata.validUntil)}
                        {validityStatus.icon}
                        <span className={`
                          ${validityStatus.status === 'expired' ? 'text-red-600' : 
                            validityStatus.status === 'expiring' ? 'text-yellow-600' : 
                            'text-green-600'}
                        `}>
                          {validityStatus.label}
                        </span>
                      </span>
                    )}
                    
                    {!compactView && (
                      <span className="flex items-center gap-1">
                        {document.isVisibleToHelper ? (
                          <EyeIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                        )}
                        {document.isVisibleToHelper ? 'Sichtbar für Helfer' : 'Nur für Admins'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleDownload(document)}
                  className={`${compactView ? 'p-1' : 'p-2'} text-gray-400 hover:text-gray-600 transition-colors`}
                  title="Herunterladen"
                >
                  <ArrowDownTrayIcon className={`${compactView ? 'w-4 h-4' : 'w-5 h-5'}`} />
                </button>
                
                {userRole === 'admin' && (
                  <button
                    onClick={() => handleDelete(document.path)}
                    className={`${compactView ? 'p-1' : 'p-2'} text-red-400 hover:text-red-600 transition-colors`}
                    title="Löschen"
                  >
                    <TrashIcon className={`${compactView ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
      
      {maxItems && documents.length > maxItems && (
        <div className="pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            ... und {documents.length - maxItems} weitere Dokumente
          </p>
        </div>
      )}
    </div>
  )
} 