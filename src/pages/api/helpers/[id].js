// src/pages/api/helpers/[id].js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { method } = req
  const { id } = req.query

  switch (method) {
    case 'GET':
      return await getHelper(req, res)
    case 'PUT':
      return await updateHelper(req, res)
    case 'DELETE':
      return await deleteHelper(req, res)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

async function getHelper(req, res) {
  try {
    const { id } = req.query

    const { data: helper, error } = await supabase
      .from('helfer')
      .select(`
        *,
        helfer_fall!left(
          fall_id,
          aktiv,
          faelle(
            fall_id,
            aktenzeichen,
            status,
            vorname,
            nachname
          )
        ),
        leistungen!left(
          leistung_id,
          startzeit,
          endzeit,
          freigegeben_flag,
          erstellt_am
        ),
        urlaube!urlaube_helfer_id_fkey!left(
          urlaub_id,
          von_datum,
          bis_datum,
          freigegeben
        )
      `)
      .eq('helfer_id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Helfer nicht gefunden' })
      }
      throw error
    }

    // Transform data to match frontend expectations (same as in index.js)
    const activeCases = helper.helfer_fall?.filter(hf =>
      hf.aktiv && hf.faelle?.status === 'in_bearbeitung'
    ) || []

    const services = helper.leistungen || []
    const thisMonth = new Date()
    const thisMonthServices = services.filter(service => {
      const serviceDate = new Date(service.startzeit)
      return serviceDate.getMonth() === thisMonth.getMonth() &&
        serviceDate.getFullYear() === thisMonth.getFullYear()
    })

    const thisMonthHours = thisMonthServices.reduce((sum, service) => {
      const start = new Date(service.startzeit)
      const end = new Date(service.endzeit)
      const duration = (end - start) / (1000 * 60 * 60)
      return sum + duration
    }, 0)

    const totalHours = services.reduce((sum, service) => {
      const start = new Date(service.startzeit)
      const end = new Date(service.endzeit)
      const duration = (end - start) / (1000 * 60 * 60)
      return sum + duration
    }, 0)

    let availability = 'available'
    const today = new Date().toISOString().split('T')[0]
    const currentVacation = helper.urlaube?.find(urlaub =>
      urlaub.von_datum <= today && urlaub.bis_datum >= today && urlaub.freigegeben
    )

    if (currentVacation) {
      availability = 'unavailable'
    } else if (activeCases.length >= 3) {
      availability = 'partially_available'
    }

    const transformedHelper = {
      id: helper.helfer_id,
      firstName: helper.vorname,
      lastName: helper.nachname,
      email: helper.email,
      phone: helper.telefon_nummer,
      address: {
        street: helper.strasse,
        zipCode: helper.plz,
        city: helper.stadt
      },
      qualifications: helper.zusaetzliche_qualifikationen ?
        helper.zusaetzliche_qualifikationen.split(',').map(q => q.trim()) :
        [],
      availability,
      rating: 4.8,
      totalCases: helper.helfer_fall?.length || 0,
      activeCases: activeCases.length,
      totalHours: Math.round(totalHours * 10) / 10,
      thisMonthHours: Math.round(thisMonthHours * 10) / 10,
      thisMonthRevenue: thisMonthHours * 25.50,
      hourlyRate: 25.50,
      bankDetails: {
        iban: helper.iban,
        bic: 'COBADEFFXXX'
      },
      documents: [
        {
          type: 'Führungszeugnis',
          validUntil: '2024-12-31',
          verified: !!helper.bild_bescheinigung
        }
      ],
      lastActivity: new Date(),
      createdAt: helper.erstellt_am,
      updatedAt: helper.aktualisiert_am,
      complianceStatus: 'valid',
      // Additional fields for editing
      birthDate: helper.geburtsdatum,
      gender: helper.geschlecht,
      languages: helper.sprachen,
      taxNumber: helper.steuernummer
    }

    res.status(200).json(transformedHelper)
  } catch (error) {
    console.error('Error fetching helper:', error)
    res.status(500).json({ error: 'Error fetching helper' })
  }
}

async function updateHelper(req, res) {
  try {
    const { id } = req.query
    const {
      firstName,
      lastName,
      email,
      phone,
      street,
      zipCode,
      city,
      birthDate,
      gender,
      qualifications,
      languages,
      iban,
      bic,
      taxNumber,
      hourlyRate,
      availability
    } = req.body

    console.log('Updating helper:', id, req.body)

    // Prepare data for database (German field names)
    const updateData = {
      vorname: firstName?.trim(),
      nachname: lastName?.trim(),
      email: email?.trim(),
      telefon_nummer: phone?.trim(),
      strasse: street?.trim(),
      plz: zipCode?.trim(),
      stadt: city?.trim(),
      geburtsdatum: birthDate || null,
      geschlecht: gender || null,
      zusaetzliche_qualifikationen: Array.isArray(qualifications) && qualifications.length > 0 
        ? qualifications.filter(q => q.trim()).join(', ') 
        : null,
      sprachen: languages?.trim() || null,
      iban: iban?.trim() || null,
      steuernummer: taxNumber?.trim() || null,
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
    if (!updateData.email) {
      return res.status(400).json({ error: 'E-Mail ist erforderlich' })
    }

    const { data: updatedHelper, error } = await supabase
      .from('helfer')
      .update(updateData)
      .eq('helfer_id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Helfer nicht gefunden' })
      }
      throw error
    }

    // Transform response back to frontend format
    const transformedHelper = {
      id: updatedHelper.helfer_id,
      firstName: updatedHelper.vorname,
      lastName: updatedHelper.nachname,
      email: updatedHelper.email,
      phone: updatedHelper.telefon_nummer,
      address: {
        street: updatedHelper.strasse,
        zipCode: updatedHelper.plz,
        city: updatedHelper.stadt
      },
      qualifications: updatedHelper.zusaetzliche_qualifikationen 
        ? updatedHelper.zusaetzliche_qualifikationen.split(',').map(q => q.trim()) 
        : [],
      bankDetails: {
        iban: updatedHelper.iban,
        bic: bic
      },
      birthDate: updatedHelper.geburtsdatum,
      gender: updatedHelper.geschlecht,
      languages: updatedHelper.sprachen,
      taxNumber: updatedHelper.steuernummer,
      updatedAt: updatedHelper.aktualisiert_am
    }

    res.status(200).json(transformedHelper)
  } catch (error) {
    console.error('Error updating helper:', error)
    res.status(500).json({ 
      error: 'Error updating helper',
      details: error.message,
      code: error.code 
    })
  }
}

async function deleteHelper(req, res) {
  try {
    const { id } = req.query

    const { error } = await supabase
      .from('helfer')
      .delete()
      .eq('helfer_id', id)

    if (error) {
      throw error
    }

    res.status(204).end()
  } catch (error) {
    console.error('Error deleting helper:', error)
    res.status(500).json({ error: 'Error deleting helper' })
  }
}