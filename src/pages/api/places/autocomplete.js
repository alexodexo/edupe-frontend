// src/pages/api/places/autocomplete.js - Server-side Google Places API (New)
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { input, sessionToken } = req.query

  if (!input) {
    return res.status(400).json({ error: 'Input is required' })
  }

  try {
    // Use server-side API key (secure)
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      throw new Error('Google Maps API key not configured')
    }

    // New Places API (New) - POST request with JSON payload
    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify({
        input: input,
        sessionToken: sessionToken,
        languageCode: 'de',
        regionCode: 'DE',
        includedPrimaryTypes: ['street_address', 'route', 'subpremise', 'premise'],
        includeQueryPredictions: false
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Google Places API error:', data)
      throw new Error(data.error?.message || 'Google Places API error')
    }

    // Debug: Log the raw response
    console.log('Google Places API (New) response:', {
      suggestions_count: data.suggestions?.length || 0,
      raw_suggestions: data.suggestions?.slice(0, 2) // Log first 2 for debugging
    })

    // Transform new API response to match frontend expectations
    const predictions = data.suggestions?.map(suggestion => ({
      place_id: suggestion.placePrediction?.placeId,
      description: suggestion.placePrediction?.text?.text,
      structured_formatting: {
        main_text: suggestion.placePrediction?.structuredFormat?.mainText?.text,
        secondary_text: suggestion.placePrediction?.structuredFormat?.secondaryText?.text
      }
    })) || []

    console.log('Processed predictions:', predictions.length)

    res.status(200).json({ predictions })
  } catch (error) {
    console.error('Places autocomplete error:', error)
    res.status(500).json({ error: 'Failed to fetch place predictions' })
  }
}