// src/pages/api/cases/index.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      return await getCases(req, res)
    case 'POST':
      return await createCase(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

async function getCases(req, res) {
  try {
    const { userId, userRole } = req.query

    let query = supabase
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

    // Apply role-based filtering
    if (userRole === 'helper' && userId) {
      query = query.eq('helfer_fall.helfer_id', userId)
    } else if (userRole === 'jugendamt' && userId) {
      // Get jugendamt name for this user
      const { data: jugendamtUser } = await supabase
        .from('jugendamt_ansprechpartner')
        .select('jugendamt')
        .eq('ansprechpartner_id', userId)
        .single()
      
      if (jugendamtUser) {
        query = query.eq('schule_oder_kita', jugendamtUser.jugendamt)
      }
    }

    const { data: cases, error } = await query.order('erstellt_am', { ascending: false })

    if (error) {
      throw error
    }

    // Transform data to match frontend expectations
    const transformedCases = cases.map(case_ => {
      // Calculate statistics
      const services = case_.leistungen || []
      const approvedServices = services.filter(s => s.freigegeben_flag)
      const usedHours = approvedServices.reduce((sum, service) => {
        const start = new Date(service.startzeit)
        const end = new Date(service.endzeit)
        const duration = (end - start) / (1000 * 60 * 60) // hours
        return sum + duration
      }, 0)

      const assignedHelpers = case_.helfer_fall?.map(hf => hf.helfer) || []

      return {
        id: case_.fall_id,
        caseNumber: case_.aktenzeichen,
        title: `Betreuung ${case_.vorname} ${case_.nachname}`,
        description: case_.erstkontakt_text || '',
        status: case_.status,
        priority: 'medium', // Could be derived from case data
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
        updatedAt: case_.aktualisiert_am
      }
    })

    res.status(200).json(transformedCases)
  } catch (error) {
    console.error('Error fetching cases:', error)
    res.status(500).json({ error: 'Error fetching cases' })
  }
}

async function createCase(req, res) {
  try {
    const {
      vorname,
      nachname,
      geburtsdatum,
      strasse,
      plz,
      stadt,
      schule_oder_kita,
      erstkontakt_text,
      helfer_id
    } = req.body

    // Generate aktenzeichen
    const year = new Date().getFullYear()
    const { count } = await supabase
      .from('faelle')
      .select('*', { count: 'exact', head: true })
      .gte('erstellt_am', `${year}-01-01`)

    const aktenzeichen = `F-${year}-${String((count || 0) + 1).padStart(3, '0')}`

    // Create case
    const { data: newCase, error: caseError } = await supabase
      .from('faelle')
      .insert({
        aktenzeichen,
        vorname,
        nachname,
        geburtsdatum,
        strasse,
        plz,
        stadt,
        schule_oder_kita,
        erstkontakt_text,
        erstkontakt_datum: new Date().toISOString().split('T')[0],
        status: 'offen'
      })
      .select()
      .single()

    if (caseError) throw caseError

    // Assign helper if provided
    if (helfer_id && newCase) {
      const { error: assignError } = await supabase
        .from('helfer_fall')
        .insert({
          helfer_id,
          fall_id: newCase.fall_id,
          aktiv: true
        })

      if (assignError) {
        console.error('Error assigning helper:', assignError)
        // Don't fail the whole request if helper assignment fails
      }
    }

    res.status(201).json(newCase)
  } catch (error) {
    console.error('Error creating case:', error)
    res.status(500).json({ error: 'Error creating case' })
  }
}