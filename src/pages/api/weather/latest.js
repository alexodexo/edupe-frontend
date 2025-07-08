// pages/api/weather/latest.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get current weather and forecast
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('weather')
      .select('*')
      .gte('timestamp_utc', now)
      .order('timestamp_utc', { ascending: true })
      .limit(24) // Next 24 hours

    if (error) throw error

    // Get current conditions (closest to now)
    const current = data[0] || null

    // Calculate sunshine percentage for today
    const todayData = data.filter(d => {
      const date = new Date(d.timestamp_utc)
      return date.getDate() === new Date().getDate()
    })

    const avgSunshine = todayData.length > 0
      ? Math.round(todayData.reduce((acc, d) => acc + (d.sunshine || 0), 0) / todayData.length)
      : 0

    res.status(200).json({
      current,
      forecast: data,
      todaySunshinePercentage: avgSunshine
    })
  } catch (error) {
    console.error('Error fetching weather data:', error)
    res.status(500).json({ error: 'Failed to fetch weather data' })
  }
}