// src/pages/api/services/bulk-approve.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { serviceIds, freigegeben_von, approved = true, reason = '' } = req.body

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({ error: 'serviceIds array is required' })
    }

    if (!freigegeben_von) {
      return res.status(400).json({ error: 'freigegeben_von is required' })
    }

    const updateData = {
      freigegeben_flag: approved,
      freigegeben_von,
      freigegeben_am: new Date().toISOString(),
      aktualisiert_am: new Date().toISOString(),
      aktualisiert_von: freigegeben_von
    }

    // If rejected and reason provided, append to notiz
    if (!approved && reason) {
      // We need to update each service individually to append the reason
      const { data: services } = await supabase
        .from('leistungen')
        .select('leistung_id, notiz')
        .in('leistung_id', serviceIds)

      for (const service of services) {
        const updatedNote = service.notiz ? 
          `${service.notiz}\n\n[ABGELEHNT: ${reason}]` : 
          `[ABGELEHNT: ${reason}]`

        await supabase
          .from('leistungen')
          .update({
            ...updateData,
            notiz: updatedNote
          })
          .eq('leistung_id', service.leistung_id)
      }

      const { data: updatedServices, error } = await supabase
        .from('leistungen')
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
        .in('leistung_id', serviceIds)

      if (error) throw error

      return res.status(200).json({ 
        success: true, 
        updatedCount: updatedServices.length,
        updatedServices: updatedServices 
      })
    } else {
      // Bulk update without individual note changes
      const { data, error } = await supabase
        .from('leistungen')
        .update(updateData)
        .in('leistung_id', serviceIds)
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

      if (error) throw error

      return res.status(200).json({ 
        success: true, 
        updatedCount: data.length,
        updatedServices: data 
      })
    }
  } catch (error) {
    console.error('Error bulk updating services:', error)
    res.status(500).json({ error: 'Error bulk updating services' })
  }
}