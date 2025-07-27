// src/pages/api/ansprechpartner/[id].js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      return await getAnsprechpartner(req, res)
    case 'PUT':
      return await updateAnsprechpartner(req, res)
    case 'DELETE':
      return await deleteAnsprechpartner(req, res)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

async function getAnsprechpartner(req, res) {
  try {
    const { id } = req.query

    const { data: ansprechpartner, error } = await supabase
      .from('jugendamt_ansprechpartner')
      .select(`
        *,
        jugendamt_fall!left(
          fall_id,
          faelle(
            fall_id,
            aktenzeichen,
            status,
            vorname,
            nachname,
            erstellt_am,
            aktualisiert_am
          )
        )
      `)
      .eq('ansprechpartner_id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Ansprechpartner nicht gefunden' })
      }
      throw error
    }

    // Get assigned cases
    const assignedCases = ansprechpartner.jugendamt_fall?.filter(jf => jf.faelle).map(jf => jf.faelle) || []

    // Transform response for frontend
    const transformedAnsprechpartner = {
      id: ansprechpartner.ansprechpartner_id,
      jugendamt: ansprechpartner.jugendamt,
      name: ansprechpartner.name,
      email: ansprechpartner.mail,
      phone: ansprechpartner.telefon,
      assignedCases: assignedCases,
      activeCases: assignedCases.filter(c => c.status === 'in_bearbeitung').length,
      totalCases: assignedCases.length,
      createdAt: ansprechpartner.erstellt_am,
      updatedAt: ansprechpartner.aktualisiert_am
    }

    res.status(200).json(transformedAnsprechpartner)
  } catch (error) {
    console.error('Error fetching ansprechpartner:', error)
    res.status(500).json({ 
      error: 'Error fetching ansprechpartner',
      details: error.message 
    })
  }
}

async function updateAnsprechpartner(req, res) {
  try {
    const { id } = req.query
    const {
      jugendamt,
      name,
      email,
      telefon,
      assignedFaelle = []
    } = req.body

    console.log('Updating ansprechpartner:', id, req.body)

    // Prepare data for database
    const updateData = {
      jugendamt: jugendamt?.trim(),
      name: name?.trim(),
      mail: email?.trim(),
      telefon: telefon?.trim() || null,
      aktualisiert_am: new Date().toISOString()
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    console.log('Update data for DB:', updateData)

    // Validate required fields
    if (updateData.jugendamt && !updateData.jugendamt) {
      return res.status(400).json({ error: 'Jugendamt ist erforderlich' })
    }
    if (updateData.name && !updateData.name) {
      return res.status(400).json({ error: 'Name ist erforderlich' })
    }
    if (updateData.mail && !updateData.mail) {
      return res.status(400).json({ error: 'E-Mail ist erforderlich' })
    }

    // Check for email uniqueness if email is being updated
    if (updateData.mail) {
      const { data: existingUser } = await supabase
        .from('jugendamt_ansprechpartner')
        .select('ansprechpartner_id')
        .eq('mail', updateData.mail)
        .neq('ansprechpartner_id', id)
        .single()

      if (existingUser) {
        return res.status(400).json({ error: 'E-Mail-Adresse wird bereits verwendet' })
      }
    }

    const { data: updatedAnsprechpartner, error } = await supabase
      .from('jugendamt_ansprechpartner')
      .update(updateData)
      .eq('ansprechpartner_id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Ansprechpartner nicht gefunden' })
      }
      throw error
    }

    // Update case assignments if provided
    if (assignedFaelle !== undefined) {
      // First, remove all existing assignments
      await supabase
        .from('jugendamt_fall')
        .delete()
        .eq('ansprechpartner_id', id)

      // Then add new assignments
      if (assignedFaelle.length > 0) {
        const fallAssignments = assignedFaelle.map(fallId => ({
          fall_id: fallId,
          ansprechpartner_id: id
        }))

        const { error: assignmentError } = await supabase
          .from('jugendamt_fall')
          .insert(fallAssignments)

        if (assignmentError) {
          console.error('Error updating case assignments:', assignmentError)
        }
      }
    }

    // Transform response back to frontend format
    const transformedAnsprechpartner = {
      id: updatedAnsprechpartner.ansprechpartner_id,
      jugendamt: updatedAnsprechpartner.jugendamt,
      name: updatedAnsprechpartner.name,
      email: updatedAnsprechpartner.mail,
      phone: updatedAnsprechpartner.telefon,
      assignedCases: [],
      activeCases: 0,
      totalCases: assignedFaelle.length,
      createdAt: updatedAnsprechpartner.erstellt_am,
      updatedAt: updatedAnsprechpartner.aktualisiert_am
    }

    res.status(200).json(transformedAnsprechpartner)
  } catch (error) {
    console.error('Error updating ansprechpartner:', error)
    res.status(500).json({ 
      error: 'Error updating ansprechpartner',
      details: error.message,
      code: error.code 
    })
  }
}

async function deleteAnsprechpartner(req, res) {
  try {
    const { id } = req.query

    // First, remove all case assignments
    await supabase
      .from('jugendamt_fall')
      .delete()
      .eq('ansprechpartner_id', id)

    // Then delete the ansprechpartner
    const { error } = await supabase
      .from('jugendamt_ansprechpartner')
      .delete()
      .eq('ansprechpartner_id', id)

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Ansprechpartner nicht gefunden' })
      }
      throw error
    }

    res.status(200).json({ message: 'Ansprechpartner erfolgreich gelöscht' })
  } catch (error) {
    console.error('Error deleting ansprechpartner:', error)
    res.status(500).json({ 
      error: 'Error deleting ansprechpartner',
      details: error.message 
    })
  }
} 