// src/pages/api/reports/index.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      return await getReports(req, res)
    case 'POST':
      return await createReport(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

async function getReports(req, res) {
  try {
    const { userId, userRole, caseId, status } = req.query

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

    // Additional filters
    if (caseId) {
      query = query.eq('fall_id', caseId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: reports, error } = await query.order('erstellt_am', { ascending: false })

    if (error) {
      throw error
    }

    // Transform data to match frontend expectations
    const transformedReports = reports.map(report => ({
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
    }))

    res.status(200).json(transformedReports)
  } catch (error) {
    console.error('Error fetching reports:', error)
    res.status(500).json({ error: 'Error fetching reports' })
  }
}

async function createReport(req, res) {
  try {
    const {
      titel,
      inhalt,
      fall_id,
      status = 'entwurf',
      sichtbar_fuer_jugendamt = false,
      erstellt_von,
      anzahl_leistungen,
      gesamtstunden
    } = req.body

    const { data: newReport, error } = await supabase
      .from('berichte')
      .insert({
        titel,
        inhalt,
        fall_id,
        status,
        sichtbar_fuer_jugendamt,
        erstellt_von,
        anzahl_leistungen,
        gesamtstunden
      })
      .select(`
        *,
        faelle!inner(
          fall_id,
          aktenzeichen,
          vorname,
          nachname
        ),
        helfer!berichte_erstellt_von_fkey(
          helfer_id,
          vorname,
          nachname,
          email
        )
      `)
      .single()

    if (error) throw error

    // Transform response
    const transformedReport = {
      id: newReport.bericht_id,
      title: newReport.titel,
      content: newReport.inhalt,
      status: newReport.status,
      serviceCount: newReport.anzahl_leistungen,
      totalHours: newReport.gesamtstunden,
      visibleToJugendamt: newReport.sichtbar_fuer_jugendamt,
      case: {
        id: newReport.faelle.fall_id,
        caseNumber: newReport.faelle.aktenzeichen,
        title: `${newReport.faelle.vorname} ${newReport.faelle.nachname}`
      },
      author: newReport.helfer ? {
        id: newReport.helfer.helfer_id,
        firstName: newReport.helfer.vorname,
        lastName: newReport.helfer.nachname
      } : null,
      createdAt: newReport.erstellt_am
    }

    res.status(201).json(transformedReport)
  } catch (error) {
    console.error('Error creating report:', error)
    res.status(500).json({ error: 'Error creating report' })
  }
}