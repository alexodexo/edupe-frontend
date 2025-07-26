// src/pages/api/services/[id]/approve.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { method } = req
  const { id } = req.query

  if (method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH'])
    return res.status(405).end(`Method ${method} Not Allowed`)
  }

  try {
    const { approved, freigegeben_von, reason } = req.body

    // Update service approval status
    const updateData = {
      freigegeben_flag: approved,
      freigegeben_von,
      freigegeben_am: new Date().toISOString(),
      aktualisiert_am: new Date().toISOString(),
      aktualisiert_von: freigegeben_von
    }

    // If rejected, we could store the reason in a separate field or in notiz
    if (!approved && reason) {
      // For now, we'll append the rejection reason to the existing notiz
      const { data: currentService } = await supabase
        .from('leistungen')
        .select('notiz')
        .eq('leistung_id', id)
        .single()

      if (currentService) {
        updateData.notiz = `${currentService.notiz}\n\n[ABGELEHNT: ${reason}]`
      }
    }

    const { data, error } = await supabase
      .from('leistungen')
      .update(updateData)
      .eq('leistung_id', id)
      .select(`
        *,
        helfer(
          helfer_id,
          vorname,
          nachname,
          email
        ),
        faelle(
          fall_id,
          aktenzeichen,
          vorname,
          nachname
        )
      `)
      .single()

    if (error) throw error

    res.status(200).json(data)
  } catch (error) {
    console.error('Error updating service approval:', error)
    res.status(500).json({ error: 'Error updating service approval' })
  }
}

// src/pages/api/services/bulk-approve.js
export async function bulkApproveHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { serviceIds, freigegeben_von, approved = true } = req.body

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({ error: 'serviceIds array is required' })
    }

    const updateData = {
      freigegeben_flag: approved,
      freigegeben_von,
      freigegeben_am: new Date().toISOString(),
      aktualisiert_am: new Date().toISOString(),
      aktualisiert_von: freigegeben_von
    }

    const { data, error } = await supabase
      .from('leistungen')
      .update(updateData)
      .in('leistung_id', serviceIds)
      .select()

    if (error) throw error

    res.status(200).json({ 
      success: true, 
      updatedCount: data.length,
      updatedServices: data 
    })
  } catch (error) {
    console.error('Error bulk updating services:', error)
    res.status(500).json({ error: 'Error bulk updating services' })
  }
}