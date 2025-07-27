// src/pages/api/helpers/index.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      return await getHelpers(req, res)
    case 'POST':
      return await createHelper(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

async function getHelpers(req, res) {
  try {
    const { userId, userRole } = req.query

    let query = supabase
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

    // If helper role, only return own profile
    if (userRole === 'helper' && userId) {
      query = query.eq('helfer_id', userId)
    }

    const { data: helpers, error } = await query.order('erstellt_am', { ascending: false })

    if (error) {
      throw error
    }

    // Transform data to match frontend expectations
    const transformedHelpers = helpers.map(helper => {
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
        const duration = (end - start) / (1000 * 60 * 60) // hours
        return sum + duration
      }, 0)

      const totalHours = services.reduce((sum, service) => {
        const start = new Date(service.startzeit)
        const end = new Date(service.endzeit)
        const duration = (end - start) / (1000 * 60 * 60) // hours
        return sum + duration
      }, 0)

      // Determine availability based on urlaube
      let availability = 'available'
      const today = new Date().toISOString().split('T')[0]
      const currentVacation = helper.urlaube?.find(urlaub =>
        urlaub.von_datum <= today && urlaub.bis_datum >= today && urlaub.freigegeben
      )

      if (currentVacation) {
        availability = 'unavailable'
      } else if (activeCases.length >= 3) { // Assuming max 3 cases per helper
        availability = 'partially_available'
      }

      return {
        id: helper.helfer_id,
        firstName: helper.vorname,
        lastName: helper.nachname,
        email: helper.email,
        phone: helper.telefon_nummer,
        address: {
          street: helper.strasse,
          zipCode: helper.plz,
          city: helper.stadt,
          latitude: null, // Could be geocoded
          longitude: null
        },
        qualifications: helper.zusaetzliche_qualifikationen ?
          helper.zusaetzliche_qualifikationen.split(',').map(q => q.trim()) :
          [],
        availability,
        rating: 4.8, // This could be calculated from feedback
        totalCases: helper.helfer_fall?.length || 0,
        activeCases: activeCases.length,
        totalHours: Math.round(totalHours * 10) / 10,
        thisMonthHours: Math.round(thisMonthHours * 10) / 10,
        thisMonthRevenue: thisMonthHours * 25.50, // Default rate
        hourlyRate: 25.50, // Could be stored in database
        bankDetails: {
          iban: helper.iban,
          bic: 'COBADEFFXXX' // Could be stored in database
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
        complianceStatus: 'valid' // Could be calculated from document dates
      }
    })

    res.status(200).json(transformedHelpers)
  } catch (error) {
    console.error('Error fetching helpers:', error)
    res.status(500).json({ error: 'Error fetching helpers' })
  }
}

async function createHelper(req, res) {
  try {
    // Map frontend field names to database field names
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

    console.log('Received data:', req.body) // Debug log

    // Prepare data for database (German field names)
    const helperData = {
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
      andere_auftraggeber: false
    }

    console.log('Transformed data for DB:', helperData) // Debug log

    // Validate required fields
    if (!helperData.vorname) {
      return res.status(400).json({ error: 'Vorname ist erforderlich' })
    }
    if (!helperData.nachname) {
      return res.status(400).json({ error: 'Nachname ist erforderlich' })
    }
    if (!helperData.email) {
      return res.status(400).json({ error: 'E-Mail ist erforderlich' })
    }

    const { data: newHelper, error } = await supabase
      .from('helfer')
      .insert(helperData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Transform response back to frontend format
    const transformedHelper = {
      id: newHelper.helfer_id,
      firstName: newHelper.vorname,
      lastName: newHelper.nachname,
      email: newHelper.email,
      phone: newHelper.telefon_nummer,
      address: {
        street: newHelper.strasse,
        zipCode: newHelper.plz,
        city: newHelper.stadt
      },
      qualifications: newHelper.zusaetzliche_qualifikationen 
        ? newHelper.zusaetzliche_qualifikationen.split(',').map(q => q.trim()) 
        : [],
      bankDetails: {
        iban: newHelper.iban,
        bic: bic
      },
      createdAt: newHelper.erstellt_am
    }

    res.status(201).json(transformedHelper)
  } catch (error) {
    console.error('Error creating helper:', error)
    res.status(500).json({ 
      error: 'Error creating helper',
      details: error.message,
      code: error.code 
    })
  }
}