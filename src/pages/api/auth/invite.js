// src/pages/api/auth/invite.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, role, userData } = req.body

    // Validate input
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' })
    }

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers()
    const userExists = existingUser.users.some(user => user.email === email)

    if (userExists) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Generate a secure temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 
                       Math.random().toString(36).toUpperCase().slice(-4) + 
                       Math.random().toString(10).slice(-2) + 
                       '!'

    // Create user with email confirmation required
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: false, // Require email confirmation
      user_metadata: {
        role,
        ...userData
      }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return res.status(500).json({ error: 'Failed to create user' })
    }

    // Send invitation email
    const { error: inviteError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
    })

    if (inviteError) {
      console.error('Error sending invitation:', inviteError)
      // Don't fail the whole request if email fails
    }

    // Create profile in appropriate table based on role
    if (role === 'helper') {
      const { error: profileError } = await supabase
        .from('helfer')
        .insert({
          email,
          vorname: userData?.first_name || '',
          nachname: userData?.last_name || '',
          erstellt_am: new Date().toISOString()
        })

      if (profileError) {
        console.error('Error creating helper profile:', profileError)
      }
    } else if (role === 'jugendamt') {
      const { error: profileError } = await supabase
        .from('jugendamt_ansprechpartner')
        .insert({
          mail: email,
          name: `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim(),
          erstellt_am: new Date().toISOString()
        })

      if (profileError) {
        console.error('Error creating jugendamt profile:', profileError)
      }
    }

    res.status(201).json({ 
      message: 'User invited successfully',
      user: {
        id: user.user.id,
        email: user.user.email,
        role
      }
    })

  } catch (error) {
    console.error('Error in invite API:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
} 