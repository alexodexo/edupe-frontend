// src/pages/api/helpers/[id]/documents/download.js
import { downloadHelperDocument } from '@/lib/storage'

// Configure Next.js API route to handle large files
export const config = {
  api: {
    responseLimit: false,
  },
}

export default async function handler(req, res) {
  const { method } = req
  const { id, filePath } = req.query

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${method} Not Allowed`)
  }

  try {
    if (!filePath) {
      return res.status(400).json({ error: 'Dateipfad erforderlich' })
    }

    // Verify the file belongs to this helper
    if (!filePath.startsWith(`${id}/`)) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Herunterladen dieser Datei' })
    }

    const fileBlob = await downloadHelperDocument(filePath)

    // Convert blob to array buffer and then to buffer
    const arrayBuffer = await fileBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get the original filename and determine content type
    const filename = filePath.split('/').pop()
    const extension = filename.split('.').pop().toLowerCase()
    
    // Set appropriate content type based on file extension
    let contentType = 'application/octet-stream'
    switch (extension) {
      case 'pdf':
        contentType = 'application/pdf'
        break
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'doc':
        contentType = 'application/msword'
        break
      case 'docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
    res.setHeader('Content-Length', buffer.length)
    res.setHeader('Cache-Control', 'no-cache')
    
    // Send file data as buffer
    res.status(200).send(buffer)
  } catch (error) {
    console.error('Error downloading document:', error)
    res.status(500).json({ error: 'Error downloading document' })
  }
} 