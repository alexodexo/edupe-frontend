// src/pages/api/places/details.js - Server-side Google Places Details API (New)
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { place_id, sessionToken } = req.query

  if (!place_id) {
    return res.status(400).json({ error: 'Place ID is required' })
  }

  try {
    // Use server-side API key (secure)
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      throw new Error('Google Maps API key not configured')
    }

    // New Places API (New) - GET request with place ID in URL
    const response = await fetch(`https://places.googleapis.com/v1/places/${place_id}`, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,location'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Google Places Details API error:', data)
      throw new Error(data.error?.message || 'Google Places API error')
    }

    // Transform new API response to match frontend expectations
    res.status(200).json({
      formatted_address: data.formattedAddress,
      place_id: data.id,
      name: data.displayName?.text,
      location: data.location ? {
        lat: data.location.latitude,
        lng: data.location.longitude
      } : null
    })
  } catch (error) {
    console.error('Places details error:', error)
    res.status(500).json({ error: 'Failed to fetch place details' })
  }
}