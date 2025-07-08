// pages/api/temperature/latest.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get the latest temperature data
    const { data, error } = await supabase
      .from('temperatureSensors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error

    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching temperature data:', error)
    res.status(500).json({ error: 'Failed to fetch temperature data' })
  }
}