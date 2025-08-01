// src/pages/api/dashboard/index.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      return await getDashboardStats(req, res)
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

async function getDashboardStats(req, res) {
  try {
    console.log('Dashboard API called with query:', req.query)
    const { timeRange = 'week' } = req.query
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    console.log('Fetching dashboard stats for timeRange:', timeRange, 'startDate:', startDate.toISOString())

    // Parallel queries for better performance
    let helpersStats, casesStats, servicesStats, recentActivities
    
    try {
      console.log('Fetching helpers stats...')
      helpersStats = await getHelpersStats()
      console.log('Helpers stats:', helpersStats)
    } catch (error) {
      console.error('Error fetching helpers stats:', error)
      throw error
    }
    
    try {
      console.log('Fetching cases stats...')
      casesStats = await getCasesStats(startDate)
      console.log('Cases stats:', casesStats)
    } catch (error) {
      console.error('Error fetching cases stats:', error)
      throw error
    }
    
    try {
      console.log('Fetching services stats...')
      servicesStats = await getServicesStats(startDate)
      console.log('Services stats:', servicesStats)
    } catch (error) {
      console.error('Error fetching services stats:', error)
      throw error
    }
    
    try {
      console.log('Fetching recent activities...')
      recentActivities = await getRecentActivities()
      console.log('Recent activities count:', recentActivities?.length || 0)
    } catch (error) {
      console.error('Error fetching recent activities:', error)
      throw error
    }

    const stats = {
      helpers: helpersStats,
      cases: casesStats,
      services: servicesStats,
      recentActivities,
      timeRange,
      generatedAt: new Date().toISOString()
    }

    console.log('Dashboard stats successfully generated')
    res.status(200).json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    console.error('Error details:', error?.message, error?.stack)
    res.status(500).json({ 
      error: 'Error fetching dashboard statistics',
      details: error?.message,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    })
  }
}

async function getHelpersStats() {
  // Get all helpers with their vacation data to calculate availability
  const { data: helpers, error: helpersError } = await supabase
    .from('helfer')
    .select(`
      helfer_id, 
      vorname, 
      nachname, 
      erstellt_am,
      urlaube!urlaube_helfer_id_fkey!left(
        urlaub_id,
        von_datum,
        bis_datum,
        freigegeben
      )
    `)

  if (helpersError) throw helpersError

  // Calculate availability based on vacation data
  const today = new Date().toISOString().split('T')[0]
  let availableHelpers = 0
  let complianceIssues = 0

  helpers.forEach(helper => {
    // Check if helper is currently on vacation
    const isOnVacation = helper.urlaube?.some(vacation => {
      if (!vacation.freigegeben) return false
      const start = vacation.von_datum
      const end = vacation.bis_datum
      return start <= today && today <= end
    })

    if (!isOnVacation) {
      availableHelpers++
    }

    // For now, assume no compliance issues (could be enhanced with document checks)
    // This could be calculated based on missing documents, expired certificates, etc.
  })

  return {
    total: helpers.length,
    available: availableHelpers,
    complianceIssues: 0 // This could be enhanced later
  }
}

async function getCasesStats(startDate) {
  // Get all cases
  const { data: cases, error: casesError } = await supabase
    .from('faelle')
    .select('fall_id, status, erstellt_am')

  if (casesError) throw casesError

  // Get new cases in time range
  const newCasesInPeriod = cases.filter(c => 
    new Date(c.erstellt_am) >= startDate
  ).length

  const activeCases = cases.filter(c => c.status === 'in_bearbeitung').length
  const completedCases = cases.filter(c => c.status === 'abgeschlossen').length

  return {
    total: cases.length,
    active: activeCases,
    completed: completedCases,
    newInPeriod: newCasesInPeriod
  }
}

async function getServicesStats(startDate) {
  // Get all services with calculations
  const { data: services, error: servicesError } = await supabase
    .from('leistungen')
    .select('leistung_id, startzeit, endzeit, freigegeben_flag, erstellt_am')
    .gte('erstellt_am', startDate.toISOString())

  if (servicesError) throw servicesError

  let totalHours = 0
  let totalCosts = 0
  let pending = 0
  let approved = 0

  services.forEach(service => {
    if (service.startzeit && service.endzeit) {
      const start = new Date(service.startzeit)
      const end = new Date(service.endzeit)
      const duration = (end - start) / (1000 * 60 * 60) // hours
      
      totalHours += duration
      totalCosts += duration * 25.50 // Default hourly rate
      
      if (service.freigegeben_flag) {
        approved++
      } else {
        pending++
      }
    }
  })

  return {
    totalServices: services.length,
    totalHours: Math.round(totalHours * 10) / 10,
    totalCosts,
    pending,
    approved
  }
}

async function getRecentActivities() {
  const activities = []

  try {
    // Recent cases (last 5)
    const { data: recentCases } = await supabase
      .from('faelle')
      .select('fall_id, aktenzeichen, vorname, nachname, erstellt_am')
      .order('erstellt_am', { ascending: false })
      .limit(5)

    if (recentCases) {
      recentCases.forEach(case_ => {
        activities.push({
          id: `case-${case_.fall_id}`,
          type: 'case_created',
          title: `Neuer Fall erstellt: ${case_.aktenzeichen}`,
          description: `${case_.vorname} ${case_.nachname}`,
          time: case_.erstellt_am,
          icon: 'case',
          color: 'blue'
        })
      })
    }

    // Recent services (last 10)
    const { data: recentServices } = await supabase
      .from('leistungen')
      .select(`
        leistung_id, 
        startzeit, 
        endzeit, 
        freigegeben_flag,
        erstellt_am,
        faelle!inner(aktenzeichen, vorname, nachname),
        helfer!inner(vorname, nachname)
      `)
      .order('erstellt_am', { ascending: false })
      .limit(10)

    if (recentServices) {
      recentServices.forEach(service => {
        const duration = service.startzeit && service.endzeit 
          ? Math.round(((new Date(service.endzeit) - new Date(service.startzeit)) / (1000 * 60 * 60)) * 10) / 10
          : 0

        activities.push({
          id: `service-${service.leistung_id}`,
          type: service.freigegeben_flag ? 'service_approved' : 'service_created',
          title: `${service.freigegeben_flag ? 'Service freigegeben' : 'Neue Leistung'}: ${duration}h`,
          description: `${service.helfer?.vorname} ${service.helfer?.nachname} • ${service.faelle?.aktenzeichen}`,
          time: service.erstellt_am,
          icon: 'service',
          color: service.freigegeben_flag ? 'green' : 'yellow'
        })
      })
    }

    // Recent helper activities
    const { data: recentHelpers } = await supabase
      .from('helfer')
      .select('helfer_id, vorname, nachname, erstellt_am')
      .order('erstellt_am', { ascending: false })
      .limit(5)

    if (recentHelpers) {
      recentHelpers.forEach(helper => {
        activities.push({
          id: `helper-${helper.helfer_id}`,
          type: 'helper_registered',
          title: `Neuer Helfer registriert: ${helper.vorname} ${helper.nachname}`,
          description: `Registriert am ${new Date(helper.erstellt_am).toLocaleDateString('de-DE')}`,
          time: helper.erstellt_am,
          icon: 'helper',
          color: 'blue'
        })
      })
    }

    // Sort all activities by time and return most recent
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 15)

  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return []
  }
}