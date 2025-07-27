// src/pages/api/ansprechpartner/index.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      return await getAnsprechpartner(req, res)
    case 'POST':
      return await createAnsprechpartner(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

async function getAnsprechpartner(req, res) {
  try {
    const { userId, userRole } = req.query

    let query = supabase
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
            nachname
          )
        )
      `)

    // If jugendamt role, only return own profile
    if (userRole === 'jugendamt' && userId) {
      query = query.eq('ansprechpartner_id', userId)
    }

    const { data: ansprechpartner, error } = await query.order('erstellt_am', { ascending: false })

    if (error) {
      throw error
    }

    // Transform data for frontend
    const transformedAnsprechpartner = ansprechpartner.map(person => {
      // Get assigned cases
      const assignedCases = person.jugendamt_fall?.filter(jf => jf.faelle).map(jf => jf.faelle) || []
      
      return {
        id: person.ansprechpartner_id,
        jugendamt: person.jugendamt,
        name: person.name,
        email: person.mail,
        phone: person.telefon,
        assignedCases: assignedCases,
        activeCases: assignedCases.filter(c => c.status === 'in_bearbeitung').length,
        totalCases: assignedCases.length,
        createdAt: person.erstellt_am,
        updatedAt: person.aktualisiert_am
      }
    })

    res.status(200).json(transformedAnsprechpartner)
  } catch (error) {
    console.error('Error fetching ansprechpartner:', error)
    res.status(500).json({ 
      error: 'Error fetching ansprechpartner',
      details: error.message 
    })
  }
}

async function createAnsprechpartner(req, res) {
  try {
    const {
      jugendamt,
      name,
      email,
      telefon,
      createUser = false,
      assignedFaelle = []
    } = req.body

    console.log('Received data:', req.body)

    // Validate required fields
    if (!jugendamt?.trim()) {
      return res.status(400).json({ error: 'Jugendamt ist erforderlich' })
    }
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Name ist erforderlich' })
    }
    if (!email?.trim()) {
      return res.status(400).json({ error: 'E-Mail ist erforderlich' })
    }

    // Check for email uniqueness
    const { data: existingUser } = await supabase
      .from('jugendamt_ansprechpartner')
      .select('ansprechpartner_id')
      .eq('mail', email.trim())
      .single()

    if (existingUser) {
      return res.status(400).json({ error: 'E-Mail-Adresse wird bereits verwendet' })
    }

    // Prepare data for database
    const ansprechpartnerData = {
      jugendamt: jugendamt.trim(),
      name: name.trim(),
      mail: email.trim(),
      telefon: telefon?.trim() || null
    }

    console.log('Creating ansprechpartner with data:', ansprechpartnerData)

    const { data: newAnsprechpartner, error } = await supabase
      .from('jugendamt_ansprechpartner')
      .insert(ansprechpartnerData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Create user account if requested
    let userCreated = false
    if (createUser) {
      try {
        const inviteResponse = await fetch('/api/auth/invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            role: 'jugendamt',
            userData: {
              first_name: name.split(' ')[0] || name,
              last_name: name.split(' ').slice(1).join(' ') || '',
              jugendamt: jugendamt.trim()
            }
          })
        })

        if (inviteResponse.ok) {
          userCreated = true
          console.log('User account created and invitation sent')
        } else {
          console.error('Failed to create user account')
        }
      } catch (userError) {
        console.error('Error creating user:', userError)
        // Continue without failing the ansprechpartner creation
      }
    }

    // Assign cases if provided
    if (assignedFaelle && assignedFaelle.length > 0) {
      const fallAssignments = assignedFaelle.map(fallId => ({
        fall_id: fallId,
        ansprechpartner_id: newAnsprechpartner.ansprechpartner_id
      }))

      const { error: assignmentError } = await supabase
        .from('jugendamt_fall')
        .insert(fallAssignments)

      if (assignmentError) {
        console.error('Error assigning cases:', assignmentError)
        // Continue without failing the ansprechpartner creation
      }
    }

    // Transform response back to frontend format
    const transformedAnsprechpartner = {
      id: newAnsprechpartner.ansprechpartner_id,
      jugendamt: newAnsprechpartner.jugendamt,
      name: newAnsprechpartner.name,
      email: newAnsprechpartner.mail,
      phone: newAnsprechpartner.telefon,
      assignedCases: [],
      activeCases: 0,
      totalCases: assignedFaelle.length,
      createdAt: newAnsprechpartner.erstellt_am,
      userCreated
    }

    res.status(201).json(transformedAnsprechpartner)
  } catch (error) {
    console.error('Error creating ansprechpartner:', error)
    res.status(500).json({ 
      error: 'Error creating ansprechpartner',
      details: error.message,
      code: error.code 
    })
  }
} 