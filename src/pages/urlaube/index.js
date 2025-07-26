// src/pages/api/urlaube/index.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      return await getVacations(req, res)
    case 'POST':
      return await createVacation(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

async function getVacations(req, res) {
  try {
    const { userId, userRole, helperId, status, year } = req.query

    let query = supabase
      .from('urlaube')
      .select(`
        *,
        helfer!urlaube_helfer_id_fkey(
          helfer_id,
          vorname,
          nachname,
          email
        ),
        vertretung_helfer:helfer!urlaube_vertretung_fkey(
          helfer_id,
          vorname,
          nachname,
          email
        )
      `)

    // Apply role-based filtering
    if (userRole === 'helper' && userId) {
      query = query.eq('helfer_id', userId)
    }

    // Additional filters
    if (helperId) {
      query = query.eq('helfer_id', helperId)
    }

    if (status === 'approved') {
      query = query.eq('freigegeben', true)
    } else if (status === 'pending') {
      query = query.eq('freigegeben', false)
    }

    if (year) {
      query = query.gte('von_datum', `${year}-01-01`).lte('bis_datum', `${year}-12-31`)
    }

    const { data: vacations, error } = await query.order('von_datum', { ascending: false })

    if (error) {
      throw error
    }

    // Transform data to match frontend expectations
    const transformedVacations = vacations.map(vacation => {
      const fromDate = new Date(vacation.von_datum)
      const toDate = new Date(vacation.bis_datum)
      const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1

      return {
        id: vacation.urlaub_id,
        helper: {
          id: vacation.helfer.helfer_id,
          firstName: vacation.helfer.vorname,
          lastName: vacation.helfer.nachname,
          email: vacation.helfer.email
        },
        substitute: vacation.vertretung_helfer ? {
          id: vacation.vertretung_helfer.helfer_id,
          firstName: vacation.vertretung_helfer.vorname,
          lastName: vacation.vertretung_helfer.nachname,
          email: vacation.vertretung_helfer.email
        } : null,
        fromDate: vacation.von_datum,
        toDate: vacation.bis_datum,
        days: days,
        approved: vacation.freigegeben,
        note: vacation.notiz,
        createdAt: vacation.erstellt_am,
        updatedAt: vacation.aktualisiert_am
      }
    })

    res.status(200).json(transformedVacations)
  } catch (error) {
    console.error('Error fetching vacations:', error)
    res.status(500).json({ error: 'Error fetching vacations' })
  }
}

async function createVacation(req, res) {
  try {
    const {
      helfer_id,
      von_datum,
      bis_datum,
      vertretung,
      notiz,
      erstellt_von
    } = req.body

    // Validate dates
    const fromDate = new Date(von_datum)
    const toDate = new Date(bis_datum)
    
    if (fromDate >= toDate) {
      return res.status(400).json({ error: 'End date must be after start date' })
    }

    if (fromDate < new Date()) {
      return res.status(400).json({ error: 'Vacation cannot start in the past' })
    }

    // Check for overlapping vacations
    const { data: overlapping } = await supabase
      .from('urlaube')
      .select('urlaub_id')
      .eq('helfer_id', helfer_id)
      .or(`von_datum.lte.${bis_datum},bis_datum.gte.${von_datum}`)

    if (overlapping && overlapping.length > 0) {
      return res.status(400).json({ error: 'Vacation period overlaps with existing vacation' })
    }

    const { data: newVacation, error } = await supabase
      .from('urlaube')
      .insert({
        helfer_id,
        von_datum,
        bis_datum,
        vertretung,
        notiz,
        freigegeben: false, // Always starts as not approved
        erstellt_von
      })
      .select(`
        *,
        helfer!urlaube_helfer_id_fkey(
          helfer_id,
          vorname,
          nachname,
          email
        ),
        vertretung_helfer:helfer!urlaube_vertretung_fkey(
          helfer_id,
          vorname,
          nachname,
          email
        )
      `)
      .single()

    if (error) throw error

    // Transform response
    const days = Math.ceil((new Date(newVacation.bis_datum) - new Date(newVacation.von_datum)) / (1000 * 60 * 60 * 24)) + 1

    const transformedVacation = {
      id: newVacation.urlaub_id,
      helper: {
        id: newVacation.helfer.helfer_id,
        firstName: newVacation.helfer.vorname,
        lastName: newVacation.helfer.nachname,
        email: newVacation.helfer.email
      },
      substitute: newVacation.vertretung_helfer ? {
        id: newVacation.vertretung_helfer.helfer_id,
        firstName: newVacation.vertretung_helfer.vorname,
        lastName: newVacation.vertretung_helfer.nachname,
        email: newVacation.vertretung_helfer.email
      } : null,
      fromDate: newVacation.von_datum,
      toDate: newVacation.bis_datum,
      days: days,
      approved: newVacation.freigegeben,
      note: newVacation.notiz,
      createdAt: newVacation.erstellt_am
    }

    res.status(201).json(transformedVacation)
  } catch (error) {
    console.error('Error creating vacation:', error)
    res.status(500).json({ error: 'Error creating vacation' })
  }
}