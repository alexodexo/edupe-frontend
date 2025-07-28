// src/pages/api/ansprechpartner/verify.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, jugendamt, telefon } = req.body

    if (!email || !jugendamt) {
      return res.status(400).json({ error: 'E-Mail und Jugendamt sind erforderlich' })
    }

    // Check if user exists in auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      return res.status(500).json({ error: 'Fehler beim Abrufen der Benutzerdaten' })
    }

    const user = authUsers.users.find(u => u.email === email)
    if (!user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' })
    }

    if (user.user_metadata?.role !== 'jugendamt') {
      return res.status(400).json({ error: 'Benutzer ist kein Jugendamt' })
    }

    // Check if user is already verified
    const { data: existingProfile } = await supabase
      .from('jugendamt_ansprechpartner')
      .select('ansprechpartner_id')
      .eq('mail', email)
      .single()

    if (existingProfile) {
      return res.status(400).json({ error: 'Benutzer ist bereits verifiziert' })
    }

    // Create new jugendamt_ansprechpartner entry
    const { data: newAnsprechpartner, error: createError } = await supabase
      .from('jugendamt_ansprechpartner')
      .insert({
        jugendamt: jugendamt,
        name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim(),
        mail: email,
        telefon: telefon || null
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating jugendamt profile:', createError)
      return res.status(500).json({ error: 'Fehler beim Erstellen des Jugendamt-Profils' })
    }

    // Transform response
    const transformedAnsprechpartner = {
      id: newAnsprechpartner.ansprechpartner_id,
      jugendamt: newAnsprechpartner.jugendamt,
      name: newAnsprechpartner.name,
      email: newAnsprechpartner.mail,
      phone: newAnsprechpartner.telefon,
      assignedCases: [],
      activeCases: 0,
      totalCases: 0,
      createdAt: newAnsprechpartner.erstellt_am
    }

    res.status(200).json({
      message: 'Jugendamt erfolgreich verifiziert',
      ansprechpartner: transformedAnsprechpartner
    })

  } catch (error) {
    console.error('Error in verify Jugendamt:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
} 