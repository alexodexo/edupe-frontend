// src/pages/api/urlaube/[id].js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { method } = req
  const { id } = req.query

  switch (method) {
    case 'GET':
      return await getVacation(req, res, id)
    case 'PUT':
      return await updateVacation(req, res, id)
    case 'DELETE':
      return await deleteVacation(req, res, id)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

async function getVacation(req, res, vacationId) {
  try {
    const { data: vacation, error } = await supabase
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
      .eq('urlaub_id', vacationId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Urlaub nicht gefunden' })
      }
      throw error
    }

    // Transform data
    const fromDate = new Date(vacation.von_datum)
    const toDate = new Date(vacation.bis_datum)
    const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1

    const transformedVacation = {
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

    res.status(200).json(transformedVacation)
  } catch (error) {
    console.error('Error fetching vacation:', error)
    res.status(500).json({ error: 'Error fetching vacation' })
  }
}

async function updateVacation(req, res, vacationId) {
  try {
    const {
      von_datum,
      bis_datum,
      vertretung,
      notiz
    } = req.body

    // Validate dates
    if (von_datum && bis_datum) {
      const fromDate = new Date(von_datum)
      const toDate = new Date(bis_datum)
      
      if (fromDate >= toDate) {
        return res.status(400).json({ error: 'End date must be after start date' })
      }
    }

    // Check for overlapping vacations (excluding current vacation)
    if (von_datum && bis_datum) {
      const { data: vacation } = await supabase
        .from('urlaube')
        .select('helfer_id')
        .eq('urlaub_id', vacationId)
        .single()

      if (vacation) {
        const { data: overlapping } = await supabase
          .from('urlaube')
          .select('urlaub_id')
          .eq('helfer_id', vacation.helfer_id)
          .neq('urlaub_id', vacationId)
          .or(`von_datum.lte.${bis_datum},bis_datum.gte.${von_datum}`)

        if (overlapping && overlapping.length > 0) {
          return res.status(400).json({ error: 'Vacation period overlaps with existing vacation' })
        }
      }
    }

    const updateData = {
      aktualisiert_am: new Date().toISOString()
    }

    if (von_datum) updateData.von_datum = von_datum
    if (bis_datum) updateData.bis_datum = bis_datum
    if (vertretung !== undefined) updateData.vertretung = vertretung || null
    if (notiz !== undefined) updateData.notiz = notiz

    const { data: updatedVacation, error } = await supabase
      .from('urlaube')
      .update(updateData)
      .eq('urlaub_id', vacationId)
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
    const fromDate = new Date(updatedVacation.von_datum)
    const toDate = new Date(updatedVacation.bis_datum)
    const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1

    const transformedVacation = {
      id: updatedVacation.urlaub_id,
      helper: {
        id: updatedVacation.helfer.helfer_id,
        firstName: updatedVacation.helfer.vorname,
        lastName: updatedVacation.helfer.nachname,
        email: updatedVacation.helfer.email
      },
      substitute: updatedVacation.vertretung_helfer ? {
        id: updatedVacation.vertretung_helfer.helfer_id,
        firstName: updatedVacation.vertretung_helfer.vorname,
        lastName: updatedVacation.vertretung_helfer.nachname,
        email: updatedVacation.vertretung_helfer.email
      } : null,
      fromDate: updatedVacation.von_datum,
      toDate: updatedVacation.bis_datum,
      days: days,
      approved: updatedVacation.freigegeben,
      note: updatedVacation.notiz,
      createdAt: updatedVacation.erstellt_am,
      updatedAt: updatedVacation.aktualisiert_am
    }

    res.status(200).json(transformedVacation)
  } catch (error) {
    console.error('Error updating vacation:', error)
    res.status(500).json({ error: 'Error updating vacation' })
  }
}

async function deleteVacation(req, res, vacationId) {
  try {
    const { error } = await supabase
      .from('urlaube')
      .delete()
      .eq('urlaub_id', vacationId)

    if (error) throw error

    res.status(204).end()
  } catch (error) {
    console.error('Error deleting vacation:', error)
    res.status(500).json({ error: 'Error deleting vacation' })
  }
} 