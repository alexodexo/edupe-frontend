// pages/api/statistics/[range].js
import { supabase } from '@/lib/supabase'
import { subHours, subDays } from 'date-fns'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { range } = req.query

  try {
    let fromDate = new Date()
    
    // Calculate the date range based on the parameter
    switch (range) {
      case '10h':
        fromDate = subHours(new Date(), 10)
        break
      case '24h':
        fromDate = subHours(new Date(), 24)
        break
      case '7d':
        fromDate = subDays(new Date(), 7)
        break
      case '30d':
        fromDate = subDays(new Date(), 30)
        break
      case '365d':
        fromDate = subDays(new Date(), 365)
        break
      default:
        fromDate = subHours(new Date(), 24)
    }

    // Fetch temperature data
    const { data: temperatureData, error: tempError } = await supabase
      .from('temperatureSensors')
      .select('*')
      .gte('created_at', fromDate.toISOString())
      .order('created_at', { ascending: true })

    if (tempError) throw tempError

    // Fetch power data
    const { data: powerData, error: powerError } = await supabase
      .from('em3Data')
      .select('*')
      .gte('created_at', fromDate.toISOString())
      .order('created_at', { ascending: true })

    if (powerError) throw powerError

    // Process data for charts
    const processedData = {
      temperature: {
        labels: temperatureData.map(d => new Date(d.created_at).toLocaleTimeString('de-DE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })),
        warmwater: temperatureData.map(d => d.t1),
        vorlauf: temperatureData.map(d => d.t2),
        ruecklauf: temperatureData.map(d => d.t3),
      },
      power: {
        labels: powerData.map(d => new Date(d.created_at).toLocaleTimeString('de-DE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })),
        values: powerData.map(d => d.total_power),
        phases: {
          a: powerData.map(d => d.a_power),
          b: powerData.map(d => d.b_power),
          c: powerData.map(d => d.c_power),
        }
      },
      costs: calculateCosts(powerData),
    }

    res.status(200).json(processedData)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
}

function calculateCosts(powerData) {
  const pricePerKWh = 0.25 // This should come from settings in production
  
  // Group by day for cost calculation
  const dailyCosts = {}
  
  powerData.forEach(entry => {
    const date = new Date(entry.created_at).toLocaleDateString('de-DE')
    if (!dailyCosts[date]) {
      dailyCosts[date] = { warmwater: 0, heating: 0 }
    }
    
    // Simple allocation: 40% warmwater, 60% heating (this should be more sophisticated)
    const totalKWh = (entry.total_power / 1000) * (5 / 3600) // 5 second intervals
    dailyCosts[date].warmwater += totalKWh * 0.4 * pricePerKWh
    dailyCosts[date].heating += totalKWh * 0.6 * pricePerKWh
  })

  return {
    labels: Object.keys(dailyCosts),
    warmwater: Object.values(dailyCosts).map(d => d.warmwater.toFixed(2)),
    heating: Object.values(dailyCosts).map(d => d.heating.toFixed(2)),
  }
}