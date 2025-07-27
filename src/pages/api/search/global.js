// src/pages/api/search/global.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { q: query, category = 'all', limit = 10 } = req.query

  if (!query || query.trim().length < 2) {
    return res.json({ results: [], totalCount: 0 })
  }

  try {
    const searchTerm = query.trim()
    const results = []

    // Suche in Fällen
    if (category === 'all' || category === 'cases') {
      const { data: cases, error: casesError } = await supabase
        .from('faelle')
        .select(`
          fall_id,
          aktenzeichen,
          vorname,
          nachname, 
          status,
          schule,
          stadt,
          erstellt_am
        `)
        .or(`vorname.ilike.%${searchTerm}%,nachname.ilike.%${searchTerm}%,aktenzeichen.ilike.%${searchTerm}%,schule.ilike.%${searchTerm}%,stadt.ilike.%${searchTerm}%`)
        .order('erstellt_am', { ascending: false })
        .limit(limit)

      if (!casesError && cases) {
        cases.forEach(caseItem => {
          results.push({
            id: `case-${caseItem.fall_id}`,
            type: 'case',
            title: `${caseItem.vorname} ${caseItem.nachname}`,
            subtitle: caseItem.aktenzeichen ? `${caseItem.aktenzeichen} • ${caseItem.schule || caseItem.stadt || 'Kein Ort'}` : (caseItem.schule || caseItem.stadt || 'Kein Ort'),
            href: `/cases/${caseItem.fall_id}`,
            icon: 'ClipboardDocumentListIcon',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            status: caseItem.status,
            category: 'cases',
            score: calculateRelevanceScore(searchTerm, [caseItem.vorname, caseItem.nachname, caseItem.aktenzeichen, caseItem.schule].join(' '))
          })
        })
      }
    }

    // Suche in Helfern
    if (category === 'all' || category === 'helpers') {
      const { data: helpers, error: helpersError } = await supabase
        .from('helfer')
        .select(`
          helfer_id,
          vorname,
          nachname,
          email,
          telefon_nummer,
          stadt,
          hoechster_abschluss,
          sprachen,
          erstellt_am
        `)
        .or(`vorname.ilike.%${searchTerm}%,nachname.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,stadt.ilike.%${searchTerm}%,hoechster_abschluss.ilike.%${searchTerm}%`)
        .order('erstellt_am', { ascending: false })
        .limit(limit)

      if (!helpersError && helpers) {
        helpers.forEach(helper => {
          results.push({
            id: `helper-${helper.helfer_id}`,
            type: 'helper',
            title: `${helper.vorname} ${helper.nachname}`,
            subtitle: `${helper.hoechster_abschluss || 'Helfer'} • ${helper.stadt || 'Kein Ort'}`,
            href: `/helpers/${helper.helfer_id}`,
            icon: 'UsersIcon', 
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            email: helper.email,
            category: 'helpers',
            score: calculateRelevanceScore(searchTerm, [helper.vorname, helper.nachname, helper.email, helper.stadt].join(' '))
          })
        })
      }
    }

    // Suche in Berichten
    if (category === 'all' || category === 'reports') {
      const { data: reports, error: reportsError } = await supabase
        .from('berichte')
        .select(`
          bericht_id,
          titel,
          inhalt,
          status,
          erstellt_am,
          gesamtstunden,
          faelle!inner(vorname, nachname, aktenzeichen)
        `)
        .or(`titel.ilike.%${searchTerm}%,inhalt.ilike.%${searchTerm}%`)
        .order('erstellt_am', { ascending: false })
        .limit(limit)

      if (!reportsError && reports) {
        reports.forEach(report => {
          results.push({
            id: `report-${report.bericht_id}`,
            type: 'report',
            title: report.titel || 'Unbenannter Bericht',
            subtitle: `${report.faelle.vorname} ${report.faelle.nachname} • ${report.gesamtstunden || 0}h`,
            href: `/reports/${report.bericht_id}`,
            icon: 'DocumentTextIcon',
            color: 'text-purple-600', 
            bgColor: 'bg-purple-50',
            status: report.status,
            category: 'reports',
            score: calculateRelevanceScore(searchTerm, [report.titel, report.inhalt].join(' '))
          })
        })
      }
    }

    // Suche in Abrechnungen
    if (category === 'all' || category === 'billing') {
      const { data: billings, error: billingsError } = await supabase
        .from('ausgangsrechnung')
        .select(`
          rechnung_id,
          rechnungsnummer,
          gesamtbetrag,
          status,
          rechnungsdatum,
          faelle!inner(vorname, nachname, aktenzeichen)
        `)
        .or(`rechnungsnummer.ilike.%${searchTerm}%`)
        .order('rechnungsdatum', { ascending: false })
        .limit(limit)

      if (!billingsError && billings) {
        billings.forEach(billing => {
          results.push({
            id: `billing-${billing.rechnung_id}`,
            type: 'billing',
            title: billing.rechnungsnummer,
            subtitle: `${billing.faelle.vorname} ${billing.faelle.nachname} • €${billing.gesamtbetrag || 0}`,
            href: `/billing/${billing.rechnung_id}`,
            icon: 'CurrencyEuroIcon',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50', 
            status: billing.status,
            category: 'billing',
            score: calculateRelevanceScore(searchTerm, billing.rechnungsnummer)
          })
        })
      }
    }

    // Suche in Leistungen/Services
    if (category === 'all' || category === 'services') {
      const { data: services, error: servicesError } = await supabase
        .from('leistungen')
        .select(`
          leistung_id,
          startzeit,  
          endzeit,
          standort,
          notiz,
          typ,
          freigegeben_flag,  
          faelle!inner(vorname, nachname),
          helfer!inner(vorname, nachname)
        `)
        .or(`standort.ilike.%${searchTerm}%,notiz.ilike.%${searchTerm}%,typ.ilike.%${searchTerm}%`)
        .order('startzeit', { ascending: false })
        .limit(limit)

      if (!servicesError && services) {
        services.forEach(service => {
          const duration = service.endzeit && service.startzeit 
            ? Math.round((new Date(service.endzeit) - new Date(service.startzeit)) / (1000 * 60 * 60 * 100)) / 10 
            : 0
          
          results.push({
            id: `service-${service.leistung_id}`,
            type: 'service',
            title: `${service.typ || 'Service'} - ${service.faelle.vorname} ${service.faelle.nachname}`,
            subtitle: `${service.helfer.vorname} ${service.helfer.nachname} • ${duration}h • ${service.standort || 'Kein Ort'}`,
            href: `/services/${service.leistung_id}`,
            icon: 'ClockIcon',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            approved: service.freigegeben_flag,
            category: 'services',
            score: calculateRelevanceScore(searchTerm, [service.standort, service.notiz, service.typ].join(' '))
          })
        })
      }
    }

    // Suche in Jugendamt Ansprechpartnern
    if (category === 'all' || category === 'contacts') {
      const { data: contacts, error: contactsError } = await supabase
        .from('jugendamt_ansprechpartner')
        .select(`
          ansprechpartner_id,
          jugendamt,
          name,
          mail,
          telefon,
          erstellt_am
        `)
        .or(`name.ilike.%${searchTerm}%,jugendamt.ilike.%${searchTerm}%,mail.ilike.%${searchTerm}%`)
        .order('erstellt_am', { ascending: false })
        .limit(limit)

      if (!contactsError && contacts) {
        contacts.forEach(contact => {
          results.push({
            id: `contact-${contact.ansprechpartner_id}`,
            type: 'contact',
            title: contact.name,
            subtitle: `${contact.jugendamt} • ${contact.mail || contact.telefon || 'Kein Kontakt'}`,
            href: `/contacts/${contact.ansprechpartner_id}`,
            icon: 'UserCircleIcon',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            category: 'contacts', 
            score: calculateRelevanceScore(searchTerm, [contact.name, contact.jugendamt, contact.mail].join(' '))
          })
        })
      }
    }

    // Sortiere Ergebnisse nach Relevanz
    results.sort((a, b) => b.score - a.score)

    // Limitiere Gesamtergebnisse
    const limitedResults = results.slice(0, parseInt(limit))

    res.json({
      results: limitedResults,
      totalCount: results.length,
      query: searchTerm,
      category
    })

  } catch (error) {
    console.error('Global search error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Einfache Relevanz-Berechnung
function calculateRelevanceScore(searchTerm, text) {
  if (!text) return 0
  
  const lowerSearchTerm = searchTerm.toLowerCase()
  const lowerText = text.toLowerCase()
  
  let score = 0
  
  // Exakte Übereinstimmung am Anfang = höchste Punkte
  if (lowerText.startsWith(lowerSearchTerm)) {
    score += 100
  }
  
  // Exakte Übereinstimmung irgendwo = hohe Punkte
  if (lowerText.includes(lowerSearchTerm)) {
    score += 50
  }
  
  // Wort-Übereinstimmungen
  const searchWords = lowerSearchTerm.split(' ')
  const textWords = lowerText.split(' ')
  
  searchWords.forEach(searchWord => {
    textWords.forEach(textWord => {
      if (textWord.includes(searchWord)) {
        score += 10
      }
      if (textWord.startsWith(searchWord)) {
        score += 20
      }
    })
  })
  
  return score
} 