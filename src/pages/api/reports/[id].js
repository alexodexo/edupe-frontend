// src/pages/api/reports/[id].js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { method } = req
  const { id } = req.query

  switch (method) {
    case 'GET':
      return await getReport(req, res, id)
    case 'PUT':
      return await updateReport(req, res, id)
    case 'DELETE':
      return await deleteReport(req, res, id)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

async function getReport(req, res, reportId) {
  try {
    const { userId, userRole } = req.query

    let query = supabase
      .from('berichte')
      .select(`
        *,
        faelle!inner(
          fall_id,
          aktenzeichen,
          vorname,
          nachname,
          schule_oder_kita
        ),
        helfer!berichte_erstellt_von_fkey(
          helfer_id,
          vorname,
          nachname,
          email
        )
      `)
      .eq('bericht_id', reportId)
      .single()

    // Apply role-based filtering
    if (userRole === 'helper' && userId) {
      query = query.eq('erstellt_von', userId)
    } else if (userRole === 'jugendamt' && userId) {
      // Get jugendamt name for this user
      const { data: jugendamtUser } = await supabase
        .from('jugendamt_ansprechpartner')
        .select('jugendamt')
        .eq('ansprechpartner_id', userId)
        .single()
      
      if (jugendamtUser) {
        query = query.eq('faelle.schule_oder_kita', jugendamtUser.jugendamt)
        // Jugendamt can only see reports marked as visible
        query = query.eq('sichtbar_fuer_jugendamt', true)
      }
    }

    const { data: report, error } = await query

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Report not found' })
      }
      throw error
    }

    if (!report) {
      return res.status(404).json({ error: 'Report not found' })
    }

    // Transform data to match frontend expectations
    const transformedReport = {
      id: report.bericht_id,
      title: report.titel,
      content: report.inhalt,
      status: report.status,
      serviceCount: report.anzahl_leistungen,
      totalHours: report.gesamtstunden,
      visibleToJugendamt: report.sichtbar_fuer_jugendamt,
      case: {
        id: report.faelle.fall_id,
        caseNumber: report.faelle.aktenzeichen,
        title: `${report.faelle.vorname} ${report.faelle.nachname}`,
        school: report.faelle.schule_oder_kita
      },
      author: report.helfer ? {
        id: report.helfer.helfer_id,
        firstName: report.helfer.vorname,
        lastName: report.helfer.nachname,
        email: report.helfer.email
      } : null,
      pdfUrl: report.pdf_url,
      createdAt: report.erstellt_am,
      updatedAt: report.aktualisiert_am,
      // Calculate estimated reading time (200 words per minute)
      estimatedReadingTime: report.inhalt ? Math.ceil(report.inhalt.split(' ').length / 200) : 0,
      wordCount: report.inhalt ? report.inhalt.split(' ').length : 0
    }

    res.status(200).json(transformedReport)
  } catch (error) {
    console.error('Error fetching report:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function updateReport(req, res, reportId) {
  try {
    const updates = req.body

    // Transform frontend data to database format
    const dbUpdates = {}
    if (updates.title) dbUpdates.titel = updates.title
    if (updates.content !== undefined) dbUpdates.inhalt = updates.content
    if (updates.status) dbUpdates.status = updates.status
    if (updates.visibleToJugendamt !== undefined) dbUpdates.sichtbar_fuer_jugendamt = updates.visibleToJugendamt
    if (updates.serviceCount !== undefined) dbUpdates.anzahl_leistungen = updates.serviceCount
    if (updates.totalHours !== undefined) dbUpdates.gesamtstunden = updates.totalHours

    dbUpdates.aktualisiert_am = new Date().toISOString()

    const { data, error } = await supabase
      .from('berichte')
      .update(dbUpdates)
      .eq('bericht_id', reportId)
      .select()
      .single()

    if (error) {
      console.error('Error updating report:', error)
      throw error
    }

    res.status(200).json({ 
      id: data.bericht_id,
      message: 'Report updated successfully' 
    })
  } catch (error) {
    console.error('Error updating report:', error)
    if (error.code === 'PGRST116') {
      res.status(404).json({ error: 'Report not found' })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

async function deleteReport(req, res, reportId) {
  try {
    const { error } = await supabase
      .from('berichte')
      .delete()
      .eq('bericht_id', reportId)

    if (error) {
      console.error('Error deleting report:', error)
      throw error
    }

    res.status(200).json({ message: 'Report deleted successfully' })
  } catch (error) {
    console.error('Error deleting report:', error)
    if (error.code === 'PGRST116') {
      res.status(404).json({ error: 'Report not found' })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
