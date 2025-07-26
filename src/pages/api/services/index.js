// src/pages/api/services/index.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      return await getServices(req, res)
    case 'POST':
      return await createService(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

async function getServices(req, res) {
  try {
    const { userId, userRole, status, helfer_id, fall_id } = req.query

    let query = supabase
      .from('leistungen')
      .select(`
        *,
        helfer(
          helfer_id,
          vorname,
          nachname,
          email
        ),
        faelle(
          fall_id,
          aktenzeichen,
          vorname,
          nachname,
          schule_oder_kita
        )
      `)

    // Apply role-based filtering
    if (userRole === 'helper' && userId) {
      query = query.eq('helfer_id', userId)
    } else if (userRole === 'jugendamt' && userId) {
      // Get jugendamt name for this user
      const { data: jugendamtUser } = await supabase
        .from('jugendamt_ansprechpartner')
        .select('jugendamt')
        .eq('ansprechpartner_id', userId)
        .single()
      
      if (jugendamtUser) {
        query = query.eq('faelle.schule_oder_kita', jugendamtUser.jugendamt)
      }
    }

    // Apply additional filters
    if (status) {
      const dbStatus = status === 'submitted' ? false : status === 'approved' ? true : null
      if (dbStatus !== null) {
        query = query.eq('freigegeben_flag', dbStatus)
      }
    }

    if (helfer_id) {
      query = query.eq('helfer_id', helfer_id)
    }

    if (fall_id) {
      query = query.eq('fall_id', fall_id)
    }

    const { data: services, error } = await query.order('startzeit', { ascending: false })

    if (error) {
      throw error
    }

    // Transform data to match frontend expectations
    const transformedServices = services.map(service => {
      const start = new Date(service.startzeit)
      const end = new Date(service.endzeit)
      const duration = (end - start) / (1000 * 60 * 60) // hours
      const costs = duration * 25.50 // Default hourly rate

      // Determine status
      let status = 'draft'
      if (service.freigegeben_flag === true) {
        status = 'approved'
      } else if (service.freigegeben_flag === false && service.freigegeben_von) {
        status = 'rejected'
      } else if (service.freigegeben_flag === false) {
        status = 'submitted'
      }

      // Parse activities from description or notiz
      const activities = service.notiz ? 
        service.notiz.split('\n').filter(line => line.trim().length > 0) : 
        []

      return {
        id: service.leistung_id,
        caseId: service.fall_id,
        helperId: service.helfer_id,
        date: service.startzeit.split('T')[0],
        startTime: start.toTimeString().slice(0, 5),
        endTime: end.toTimeString().slice(0, 5),
        duration: Math.round(duration * 100) / 100,
        type: service.typ || 'with_client_face_to_face',
        location: service.standort || '',
        coordinates: null, // Could be geocoded from standort
        description: service.notiz || '',
        activities: activities.slice(0, 3), // First 3 lines as activities
        achievements: '', // Could be parsed from notiz
        nextSteps: '', // Could be parsed from notiz
        status,
        costs: Math.round(costs * 100) / 100,
        travelTime: null, // Could be calculated
        helper: service.helfer,
        case: service.faelle,
        isPendingApproval: status === 'submitted',
        isApproved: status === 'approved',
        isRejected: status === 'rejected',
        createdAt: service.erstellt_am,
        updatedAt: service.aktualisiert_am
      }
    })

    res.status(200).json(transformedServices)
  } catch (error) {
    console.error('Error fetching services:', error)
    res.status(500).json({ error: 'Error fetching services' })
  }
}

async function createService(req, res) {
  try {
    const {
      fall_id,
      helfer_id,
      date,
      startTime,
      endTime,
      typ,
      standort,
      notiz,
      erstellt_von
    } = req.body

    // Combine date and time
    const startzeit = new Date(`${date}T${startTime}:00`)
    const endzeit = new Date(`${date}T${endTime}:00`)

    const { data: newService, error } = await supabase
      .from('leistungen')
      .insert({
        fall_id,
        helfer_id,
        startzeit: startzeit.toISOString(),
        endzeit: endzeit.toISOString(),
        typ: typ || 'with_client_face_to_face',
        standort,
        notiz,
        freigegeben_flag: false, // Always starts as not approved
        erstellt_von
      })
      .select(`
        *,
        helfer(
          helfer_id,
          vorname,
          nachname,
          email
        ),
        faelle(
          fall_id,
          aktenzeichen,
          vorname,
          nachname
        )
      `)
      .single()

    if (error) throw error

    res.status(201).json(newService)
  } catch (error) {
    console.error('Error creating service:', error)
    res.status(500).json({ error: 'Error creating service' })
  }
}