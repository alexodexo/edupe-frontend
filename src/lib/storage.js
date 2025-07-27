// src/lib/storage.js
import { createClient } from '@supabase/supabase-js'

// Create a service client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Use service key for server-side operations to bypass RLS
const supabaseService = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null

// Use regular client for client-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Storage bucket name for helper documents
const HELPER_DOCUMENTS_BUCKET = 'helper-documents'

// Initialize storage bucket if it doesn't exist
export const initializeStorage = async () => {
  try {
    if (!supabaseService) {
      console.warn('Service key not available, skipping storage initialization')
      return
    }
    
    const { data: buckets } = await supabaseService.storage.listBuckets()
    const bucketExists = buckets.some(bucket => bucket.name === HELPER_DOCUMENTS_BUCKET)
    
    if (!bucketExists) {
      console.log('Storage bucket does not exist, but it should be created via SQL. Please check your Supabase dashboard.')
      return
    }
    
    console.log('Storage bucket initialized successfully')
  } catch (error) {
    console.error('Error checking storage bucket:', error)
    // Don't throw error as bucket might be created via SQL
  }
}

// Upload a document for a helper
export const uploadHelperDocument = async (helperId, file, metadata = {}) => {
  try {
    if (!supabaseService) {
      throw new Error('Service key nicht verfügbar. Bitte fügen Sie SUPABASE_SERVICE_ROLE_KEY zu Ihrer .env.local Datei hinzu.')
    }
    
    // Validate file
    if (!file || !file.originalname) {
      throw new Error('Keine Datei ausgewählt')
    }

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `${helperId}/${timestamp}-${file.originalname}`

    // Upload file to storage
    const { data, error } = await supabaseService.storage
      .from(HELPER_DOCUMENTS_BUCKET)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
        metadata: {
          helperId,
          originalName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedBy: metadata.uploadedBy || 'unknown',
          uploadedAt: new Date().toISOString(),
          isVisibleToHelper: metadata.isVisibleToHelper || false,
          documentType: metadata.documentType || 'other',
          name: metadata.name || '',
          ...metadata
        }
      })

    if (error) {
      console.error('Error uploading file:', error)
      throw error
    }

    // Get public URL (if needed for preview)
    const { data: urlData } = supabaseService.storage
      .from(HELPER_DOCUMENTS_BUCKET)
      .getPublicUrl(fileName)

    return {
      id: data.path,
      fileName: file.originalname,
      filePath: data.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      publicUrl: urlData.publicUrl,
      metadata: {
        helperId,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy: metadata.uploadedBy || 'unknown',
        uploadedAt: new Date().toISOString(),
        isVisibleToHelper: metadata.isVisibleToHelper || false,
        documentType: metadata.documentType || 'other',
        name: metadata.name || '',
        ...metadata
      }
    }
  } catch (error) {
    console.error('Error in uploadHelperDocument:', error)
    throw error
  }
}

// Get all documents for a helper
export const getHelperDocuments = async (helperId, userRole = 'admin') => {
  try {
    if (!supabaseService) {
      throw new Error('Service key nicht verfügbar. Bitte fügen Sie SUPABASE_SERVICE_ROLE_KEY zu Ihrer .env.local Datei hinzu.')
    }
    
    console.log('Listing files for helper:', helperId)
    
    // Use storage API to list files
    const { data: files, error } = await supabaseService.storage
      .from(HELPER_DOCUMENTS_BUCKET)
      .list(helperId, {
        limit: 100,
        offset: 0
      })

    if (error) {
      console.error('Error querying storage objects:', error)
      throw error
    }

    console.log('Raw files from database:', files)

    // Filter documents based on user role and visibility settings
    const filteredFiles = files.filter(file => {
      // For now, show all documents to admins and authenticated users
      return true
    })

    console.log('Filtered files:', filteredFiles.length)

    // Get public URLs for filtered files
    const documentsWithUrls = await Promise.all(
      filteredFiles.map(async (file) => {
        const { data: urlData } = supabaseService.storage
          .from(HELPER_DOCUMENTS_BUCKET)
          .getPublicUrl(file.name)

        return {
          id: file.id,
          name: file.name,
          path: `${helperId}/${file.name}`,
          size: file.metadata?.size || 0,
          mimeType: file.metadata?.mimetype || 'application/octet-stream',
          publicUrl: urlData.publicUrl,
          createdAt: file.created_at,
          updatedAt: file.updated_at,
          metadata: file.metadata || {},
          isVisibleToHelper: true,
          documentType: 'other',
          description: '',
          uploadedBy: 'unknown'
        }
      })
    )

    console.log('Final documents:', documentsWithUrls)
    return documentsWithUrls
  } catch (error) {
    console.error('Error in getHelperDocuments:', error)
    throw error
  }
}

// Download a document
export const downloadHelperDocument = async (filePath) => {
  try {
    if (!supabaseService) {
      throw new Error('Service key nicht verfügbar. Bitte fügen Sie SUPABASE_SERVICE_ROLE_KEY zu Ihrer .env.local Datei hinzu.')
    }
    
    const { data, error } = await supabaseService.storage
      .from(HELPER_DOCUMENTS_BUCKET)
      .download(filePath)

    if (error) {
      console.error('Error downloading file:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in downloadHelperDocument:', error)
    throw error
  }
}

// Delete a document
export const deleteHelperDocument = async (filePath) => {
  try {
    if (!supabaseService) {
      throw new Error('Service key nicht verfügbar. Bitte fügen Sie SUPABASE_SERVICE_ROLE_KEY zu Ihrer .env.local Datei hinzu.')
    }
    
    const { error } = await supabaseService.storage
      .from(HELPER_DOCUMENTS_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('Error deleting file:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Error in deleteHelperDocument:', error)
    throw error
  }
}

// Update document metadata (e.g., visibility settings)
export const updateDocumentMetadata = async (filePath, metadata) => {
  try {
    // Note: Supabase Storage doesn't support direct metadata updates
    // This would require re-uploading the file with new metadata
    // For now, we'll store metadata in a separate table or handle it differently
    
    console.warn('Metadata updates require file re-upload in Supabase Storage')
    return false
  } catch (error) {
    console.error('Error in updateDocumentMetadata:', error)
    throw error
  }
}

// Get document preview URL (for images and PDFs)
export const getDocumentPreviewUrl = async (filePath) => {
  try {
    if (!supabaseService) {
      throw new Error('Service key nicht verfügbar. Bitte fügen Sie SUPABASE_SERVICE_ROLE_KEY zu Ihrer .env.local Datei hinzu.')
    }
    
    const { data } = supabaseService.storage
      .from(HELPER_DOCUMENTS_BUCKET)
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error('Error in getDocumentPreviewUrl:', error)
    throw error
  }
}

// Validate file type and size
export const validateFile = (file, maxSize = 52428800) => { // 50MB default
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  // Handle both browser File objects and multer file objects
  const fileType = file.type || file.mimetype
  const fileSize = file.size

  if (!allowedTypes.includes(fileType)) {
    throw new Error('Dateityp nicht unterstützt. Erlaubt sind: PDF, JPG, PNG, GIF, DOC, DOCX')
  }

  if (fileSize > maxSize) {
    throw new Error(`Datei zu groß. Maximale Größe: ${Math.round(maxSize / 1024 / 1024)}MB`)
  }

  return true
} 