// src/pages/api/auth/update-password.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ error: 'Password is required' })
    }

    // Get the current user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Update the user's password
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password: password
    })

    if (error) {
      console.error('Error updating password:', error)
      return res.status(500).json({ error: error.message })
    }

    res.status(200).json({ 
      message: 'Password updated successfully',
      user: {
        id: data.user.id,
        email: data.user.email
      }
    })

  } catch (error) {
    console.error('Error in update-password API:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
} 