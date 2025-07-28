// src/pages/api/ansprechpartner/reject.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'E-Mail ist erforderlich' })
    }

    // Get user data from auth
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

    // Delete the auth user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return res.status(500).json({ error: 'Fehler beim Löschen des Benutzers' })
    }

    res.status(200).json({
      message: 'Unverifiziertes Jugendamt erfolgreich abgelehnt und gelöscht'
    })

  } catch (error) {
    console.error('Error in reject Jugendamt:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
} 