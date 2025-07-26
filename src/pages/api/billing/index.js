// src/pages/api/billing/index.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      return await getInvoices(req, res)
    case 'POST':
      return await createInvoice(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

async function getInvoices(req, res) {
  try {
    const { userId, userRole, status, period } = req.query

    let query = supabase
      .from('ausgangsrechnung')
      .select(`
        *,
        faelle!inner(
          fall_id,
          aktenzeichen,
          vorname,
          nachname,
          schule_oder_kita
        )
      `)

    // Apply role-based filtering
    if (userRole === 'jugendamt' && userId) {
      // Get jugendamt name for this user
      const { data: jugendamtUser } = await supabase
        .from('jugendamt_ansprechpartner')
        .select('jugendamt')
        .eq('ansprechpartner_id', userId)
        .single()
      
      if (jugendamtUser) {
        query = query.eq('faelle.schule_oder_kita', jugendamtUser.jugendamt)
      }
    }

    // Additional filters
    if (status) {
      query = query.eq('status', status)
    }

    if (period) {
      // Filter by invoice date period (e.g., "2024-03" for March 2024)
      const startOfPeriod = `${period}-01`
      const endOfPeriod = `${period}-31`
      query = query.gte('rechnungsdatum', startOfPeriod).lte('rechnungsdatum', endOfPeriod)
    }

    const { data: invoices, error } = await query.order('rechnungsdatum', { ascending: false })

    if (error) {
      throw error
    }

    // Transform data to match frontend expectations
    const transformedInvoices = invoices.map(invoice => {
      // Determine status based on payment dates
      let invoiceStatus = 'pending'
      if (invoice.bezahlt_am) {
        invoiceStatus = 'paid'
      } else if (invoice.rechnungsdatum) {
        const dueDate = new Date(invoice.rechnungsdatum)
        dueDate.setDate(dueDate.getDate() + 14) // 14 days payment term
        if (new Date() > dueDate) {
          invoiceStatus = 'overdue'
        }
      }

      return {
        id: invoice.rechnung_id,
        invoiceNumber: invoice.rechnungsnummer,
        case: {
          id: invoice.faelle.fall_id,
          caseNumber: invoice.faelle.aktenzeichen,
          title: `${invoice.faelle.vorname} ${invoice.faelle.nachname}`,
          jugendamt: invoice.faelle.schule_oder_kita
        },
        period: invoice.rechnungsdatum ? invoice.rechnungsdatum.substring(0, 7) : null, // YYYY-MM
        periodLabel: invoice.rechnungsdatum ? 
          new Intl.DateTimeFormat('de-DE', { year: 'numeric', month: 'long' })
            .format(new Date(invoice.rechnungsdatum)) : null,
        workHours: invoice.arbeitsstunden,
        serviceCount: invoice.leistungsanzahl,
        hourlyRate: invoice.stundensatz,
        totalAmount: invoice.gesamtbetrag,
        status: invoiceStatus,
        invoiceDate: invoice.rechnungsdatum,
        sentAt: invoice.gesendet_am,
        paidAt: invoice.bezahlt_am,
        dueDate: invoice.rechnungsdatum ? 
          new Date(new Date(invoice.rechnungsdatum).getTime() + 14 * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0] : null,
        note: invoice.notiz,
        createdAt: invoice.erstellt_am,
        updatedAt: invoice.aktualisiert_am
      }
    })

    res.status(200).json(transformedInvoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    res.status(500).json({ error: 'Error fetching invoices' })
  }
}

async function createInvoice(req, res) {
  try {
    const {
      fall_id,
      arbeitsstunden,
      leistungsanzahl,
      stundensatz,
      rechnungsdatum,
      notiz,
      erstellt_von
    } = req.body

    // Generate invoice number
    const year = new Date(rechnungsdatum || new Date()).getFullYear()
    const { count } = await supabase
      .from('ausgangsrechnung')
      .select('*', { count: 'exact', head: true })
      .gte('erstellt_am', `${year}-01-01`)

    const rechnungsnummer = `R-${year}-${String((count || 0) + 1).padStart(4, '0')}`

    // Calculate total amount
    const gesamtbetrag = arbeitsstunden * stundensatz

    const { data: newInvoice, error } = await supabase
      .from('ausgangsrechnung')
      .insert({
        fall_id,
        rechnungsnummer,
        arbeitsstunden,
        leistungsanzahl,
        stundensatz,
        gesamtbetrag,
        rechnungsdatum: rechnungsdatum || new Date().toISOString().split('T')[0],
        status: 'erstellt',
        notiz,
        erstellt_von
      })
      .select(`
        *,
        faelle!inner(
          fall_id,
          aktenzeichen,
          vorname,
          nachname,
          schule_oder_kita
        )
      `)
      .single()

    if (error) throw error

    // Transform response
    const transformedInvoice = {
      id: newInvoice.rechnung_id,
      invoiceNumber: newInvoice.rechnungsnummer,
      case: {
        id: newInvoice.faelle.fall_id,
        caseNumber: newInvoice.faelle.aktenzeichen,
        title: `${newInvoice.faelle.vorname} ${newInvoice.faelle.nachname}`,
        jugendamt: newInvoice.faelle.schule_oder_kita
      },
      workHours: newInvoice.arbeitsstunden,
      serviceCount: newInvoice.leistungsanzahl,
      hourlyRate: newInvoice.stundensatz,
      totalAmount: newInvoice.gesamtbetrag,
      status: 'pending',
      invoiceDate: newInvoice.rechnungsdatum,
      note: newInvoice.notiz,
      createdAt: newInvoice.erstellt_am
    }

    res.status(201).json(transformedInvoice)
  } catch (error) {
    console.error('Error creating invoice:', error)
    res.status(500).json({ error: 'Error creating invoice' })
  }
}