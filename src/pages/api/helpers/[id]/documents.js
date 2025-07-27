// src/pages/api/helpers/[id]/documents.js
import { supabase } from '@/lib/supabase'
import { 
  uploadHelperDocument, 
  getHelperDocuments, 
  deleteHelperDocument,
  validateFile 
} from '@/lib/storage'
import multer from 'multer'
import { promisify } from 'util'

// Configure Next.js API route to handle large files
export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
    responseLimit: false,
  },
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 52428800, // 50MB
    fieldSize: 52428800, // 50MB for field size
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Dateityp nicht unterstützt'), false)
    }
  }
})

const uploadMiddleware = promisify(upload.single('document'))

export default async function handler(req, res) {
  const { method } = req
  const { id } = req.query

  switch (method) {
    case 'GET':
      return await getDocuments(req, res)
    case 'POST':
      return await uploadDocument(req, res)
    case 'DELETE':
      return await deleteDocument(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

async function getDocuments(req, res) {
  try {
    const { id } = req.query
    const userRole = req.headers['x-user-role'] || 'admin'

    console.log('Fetching documents for helper:', id, 'with user role:', userRole)

    const documents = await getHelperDocuments(id, userRole)

    console.log('Found documents:', documents.length)

    res.status(200).json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    res.status(500).json({ error: 'Error fetching documents', details: error.message })
  }
}

async function uploadDocument(req, res) {
  try {
    const { id } = req.query
    
    // Check if helper exists
    const { data: helper, error: helperError } = await supabase
      .from('helfer')
      .select('helfer_id')
      .eq('helfer_id', id)
      .single()

    if (helperError || !helper) {
      return res.status(404).json({ error: 'Helfer nicht gefunden' })
    }

    // Handle file upload with multer
    try {
      await uploadMiddleware(req, res)
    } catch (uploadError) {
      console.error('Multer upload error:', uploadError)
      return res.status(400).json({ 
        error: uploadError.message || 'Fehler beim Hochladen der Datei',
        details: uploadError.code === 'LIMIT_FILE_SIZE' ? 'Datei zu groß (max. 50MB)' : uploadError.message
      })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Keine Datei hochgeladen' })
    }

    const metadata = {
      uploadedBy: req.body.uploadedBy || 'admin',
      isVisibleToHelper: req.body.isVisibleToHelper === 'true',
      documentType: req.body.documentType || 'other',
      name: req.body.name || '',
      validUntil: req.body.validUntil || null
    }

    // Upload document
    const uploadedDocument = await uploadHelperDocument(id, req.file, metadata)

    res.status(201).json({
      message: 'Dokument erfolgreich hochgeladen',
      document: uploadedDocument
    })
  } catch (error) {
    console.error('Error uploading document:', error)
    res.status(500).json({ 
      error: 'Error uploading document',
      details: error.message 
    })
  }
}

async function deleteDocument(req, res) {
  try {
    const { id } = req.query
    const { filePath } = req.body

    if (!filePath) {
      return res.status(400).json({ error: 'Dateipfad erforderlich' })
    }

    // Verify the file belongs to this helper
    if (!filePath.startsWith(`${id}/`)) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Löschen dieser Datei' })
    }

    await deleteHelperDocument(filePath)

    res.status(200).json({ message: 'Dokument erfolgreich gelöscht' })
  } catch (error) {
    console.error('Error deleting document:', error)
    res.status(500).json({ error: 'Error deleting document' })
  }
} 