// src/pages/api/urlaube/[id]/approve.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { method } = req
  const { id } = req.query

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${method} Not Allowed`)
    return
  }

  try {
    // Update vacation to approved
    const { data: updatedVacation, error } = await supabase
      .from('urlaube')
      .update({
        freigegeben: true,
        aktualisiert_am: new Date().toISOString()
      })
      .eq('urlaub_id', id)
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

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Urlaub nicht gefunden' })
      }
      throw error
    }

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
    console.error('Error approving vacation:', error)
    res.status(500).json({ error: 'Error approving vacation' })
  }
} 