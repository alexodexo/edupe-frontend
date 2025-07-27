// src/pages/api/cases/[id].js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { method } = req
  const { id } = req.query

  switch (method) {
    case 'GET':
      return await getCase(req, res)
    case 'PUT':
      return await updateCase(req, res)
    case 'DELETE':
      return await deleteCase(req, res)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

async function getCase(req, res) {
  try {
    const { id } = req.query

    const { data: case_, error } = await supabase
      .from('faelle')
      .select(`
        *,
        helfer_fall!left(
          helfer(
            helfer_id,
            vorname,
            nachname,
            email,
            telefon_nummer
          )
        ),
        leistungen(
          leistung_id,
          startzeit,
          endzeit,
          typ,
          notiz,
          freigegeben_flag
        )
      `)
      .eq('fall_id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Fall nicht gefunden' })
      }
      throw error
    }

    // Transform data to match frontend expectations (same as in index.js)
    const services = case_.leistungen || []
    const approvedServices = services.filter(s => s.freigegeben_flag)
    const usedHours = approvedServices.reduce((sum, service) => {
      const start = new Date(service.startzeit)
      const end = new Date(service.endzeit)
      const duration = (end - start) / (1000 * 60 * 60) // hours
      return sum + duration
    }, 0)

    const assignedHelpers = case_.helfer_fall?.map(hf => hf.helfer) || []

    const transformedCase = {
      id: case_.fall_id,
      caseNumber: case_.aktenzeichen,
      title: `Betreuung ${case_.vorname} ${case_.nachname}`,
      description: case_.erstkontakt_text || '',
      status: case_.status,
      priority: 'medium', // Could be derived from case data or stored separately
      client: {
        firstName: case_.vorname,
        lastName: case_.nachname,
        birthDate: case_.geburtsdatum,
        address: `${case_.strasse}, ${case_.plz} ${case_.stadt}`,
        school: case_.schule_oder_kita
      },
      assignedHelpers: assignedHelpers.map(h => h.helfer_id),
      assignedHelpersData: assignedHelpers,
      services: services,
      usedHours: Math.round(usedHours * 10) / 10,
      plannedHours: 200, // This could be a field in the database
      totalCosts: usedHours * 25.50, // Default rate, could be from helfer table
      lastActivity: case_.aktualisiert_am || case_.erstellt_am,
      createdAt: case_.erstellt_am,
      updatedAt: case_.aktualisiert_am,
      // Additional fields for editing
      rawData: {
        vorname: case_.vorname,
        nachname: case_.nachname,
        geburtsdatum: case_.geburtsdatum,
        strasse: case_.strasse,
        plz: case_.plz,
        stadt: case_.stadt,
        schule_oder_kita: case_.schule_oder_kita,
        erstkontakt_text: case_.erstkontakt_text,
        status: case_.status
      }
    }

    res.status(200).json(transformedCase)
  } catch (error) {
    console.error('Error fetching case:', error)
    res.status(500).json({ error: 'Error fetching case' })
  }
}

async function updateCase(req, res) {
  try {
    const { id } = req.query
    const {
      vorname,
      nachname,
      geburtsdatum,
      strasse,
      plz,
      stadt,
      schule_oder_kita,
      erstkontakt_text,
      status,
      priority,
      planned_hours,
      helfer_id
    } = req.body

    console.log('Updating case:', id, req.body)

    // Prepare data for database
    const updateData = {
      vorname: vorname?.trim(),
      nachname: nachname?.trim(),
      geburtsdatum: geburtsdatum || null,
      strasse: strasse?.trim(),
      plz: plz?.trim(),
      stadt: stadt?.trim(),
      schule_oder_kita: schule_oder_kita?.trim(),
      erstkontakt_text: erstkontakt_text?.trim(),
      status: status || 'offen',
      aktualisiert_am: new Date().toISOString()
    }

    // Remove undefined/null values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    console.log('Update data for DB:', updateData)

    // Validate required fields
    if (!updateData.vorname) {
      return res.status(400).json({ error: 'Vorname ist erforderlich' })
    }
    if (!updateData.nachname) {
      return res.status(400).json({ error: 'Nachname ist erforderlich' })
    }

    const { data: updatedCase, error } = await supabase
      .from('faelle')
      .update(updateData)
      .eq('fall_id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Fall nicht gefunden' })
      }
      throw error
    }

    // Handle helper assignment change
    if (helfer_id !== undefined) {
      // First, deactivate all current helper assignments
      await supabase
        .from('helfer_fall')
        .update({ aktiv: false })
        .eq('fall_id', id)

      // If a new helper is assigned, create/activate the assignment
      if (helfer_id) {
        const { error: assignError } = await supabase
          .from('helfer_fall')
          .upsert({
            helfer_id,
            fall_id: id,
            aktiv: true,
            aktualisiert_am: new Date().toISOString()
          }, {
            onConflict: 'helfer_id,fall_id'
          })

        if (assignError) {
          console.error('Error updating helper assignment:', assignError)
          // Don't fail the whole request if helper assignment fails
        }
      }
    }

    // Transform response back to frontend format
    const transformedCase = {
      id: updatedCase.fall_id,
      caseNumber: updatedCase.aktenzeichen,
      title: `Betreuung ${updatedCase.vorname} ${updatedCase.nachname}`,
      description: updatedCase.erstkontakt_text || '',
      status: updatedCase.status,
      client: {
        firstName: updatedCase.vorname,
        lastName: updatedCase.nachname,
        birthDate: updatedCase.geburtsdatum,
        address: `${updatedCase.strasse}, ${updatedCase.plz} ${updatedCase.stadt}`,
        school: updatedCase.schule_oder_kita
      },
      updatedAt: updatedCase.aktualisiert_am
    }

    res.status(200).json(transformedCase)
  } catch (error) {
    console.error('Error updating case:', error)
    res.status(500).json({ 
      error: 'Error updating case',
      details: error.message,
      code: error.code 
    })
  }
}

async function deleteCase(req, res) {
  try {
    const { id } = req.query

    // First delete related records
    await supabase
      .from('helfer_fall')
      .delete()
      .eq('fall_id', id)

    await supabase
      .from('leistungen')
      .delete()
      .eq('fall_id', id)

    await supabase
      .from('berichte')
      .delete()
      .eq('fall_id', id)

    // Then delete the case
    const { error } = await supabase
      .from('faelle')
      .delete()
      .eq('fall_id', id)

    if (error) {
      throw error
    }

    res.status(204).end()
  } catch (error) {
    console.error('Error deleting case:', error)
    res.status(500).json({ error: 'Error deleting case' })
  }
}