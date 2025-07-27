// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

import { AUTH_CONFIG } from './supabase-config'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: AUTH_CONFIG.session
})

// Database helper functions
export const getHelferProfile = async (userId) => {
  const { data, error } = await supabase
    .from('helfer')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export const getJugendamtProfile = async (userId) => {
  const { data, error } = await supabase
    .from('jugendamt_ansprechpartner')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

// Auth helpers
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Role detection based on user metadata or profile tables
export const getUserRole = async (user) => {
  if (!user) return null

  // Check if user is in helfer table
  const { data: helfer } = await supabase
    .from('helfer')
    .select('helfer_id')
    .eq('email', user.email)
    .single()

  if (helfer) return 'helper'

  // Check if user is in jugendamt_ansprechpartner table  
  const { data: jugendamt } = await supabase
    .from('jugendamt_ansprechpartner')
    .select('ansprechpartner_id')
    .eq('mail', user.email)
    .single()

  if (jugendamt) return 'jugendamt'

  // Default to admin if no specific role found
  return 'admin'
}

// RLS Helper functions for secure data access
export const getUserAccessibleFaelle = async (userId, userRole) => {
  let query = supabase.from('faelle').select(`
    *,
    helfer_fall!inner(
      helfer(*)
    ),
    jugendamt_ansprechpartner(*)
  `)

  // Apply role-based filtering
  if (userRole === 'helper') {
    query = query.eq('helfer_fall.helfer_id', userId)
  } else if (userRole === 'jugendamt') {
    // Jugendamt can only see their own cases
    const { data: jugendamtData } = await getJugendamtProfile(userId)
    if (jugendamtData) {
      query = query.eq('jugendamt', jugendamtData.jugendamt)
    }
  }
  // Admin can see all

  const { data, error } = await query
  if (error) throw error
  return data
}