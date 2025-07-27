// src/lib/searchUtils.js

// Fuzzy search algorithm für bessere Suchergebnisse
export function fuzzyMatch(query, text, threshold = 0.3) {
  if (!query || !text) return { score: 0, matches: [] }
  
  const lowerQuery = query.toLowerCase()
  const lowerText = text.toLowerCase()
  
  // Exakte Übereinstimmung
  if (lowerText.includes(lowerQuery)) {
    return { 
      score: 1.0, 
      matches: [{ start: lowerText.indexOf(lowerQuery), end: lowerText.indexOf(lowerQuery) + lowerQuery.length }]
    }
  }
  
  // Fuzzy matching mit Levenshtein-ähnlichem Ansatz
  const queryWords = lowerQuery.split(' ')
  let totalScore = 0
  const matches = []
  
  queryWords.forEach(queryWord => {
    const words = lowerText.split(' ')
    let bestWordScore = 0
    let bestMatch = null
    
    words.forEach((word, index) => {
      const score = calculateWordSimilarity(queryWord, word)
      if (score > bestWordScore && score > threshold) {
        bestWordScore = score
        bestMatch = { word, index, score }
      }
    })
    
    if (bestMatch) {
      totalScore += bestWordScore
      matches.push(bestMatch)
    }
  })
  
  return { 
    score: totalScore / queryWords.length, 
    matches 
  }
}

// Berechne Wort-Ähnlichkeit
function calculateWordSimilarity(word1, word2) {
  if (word1 === word2) return 1.0
  if (word2.startsWith(word1)) return 0.9
  if (word2.includes(word1)) return 0.7
  
  // Levenshtein Distance Ratio
  const distance = levenshteinDistance(word1, word2)
  const maxLength = Math.max(word1.length, word2.length)
  return 1 - (distance / maxLength)
}

// Levenshtein Distance Berechnung
function levenshteinDistance(str1, str2) {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

// Erweiterte Relevanz-Berechnung
export function calculateAdvancedRelevance(query, searchableText, metadata = {}) {
  let score = 0
  const lowerQuery = query.toLowerCase()
  const lowerText = searchableText.toLowerCase()
  
  // Basis-Score aus Fuzzy-Match
  const fuzzyResult = fuzzyMatch(query, searchableText)
  score += fuzzyResult.score * 100
  
  // Bonus für Position (Anfang wichtiger)
  if (lowerText.startsWith(lowerQuery)) {
    score += 50
  }
  
  // Bonus für vollständige Wörter
  const queryWords = lowerQuery.split(' ')
  queryWords.forEach(word => {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    if (regex.test(lowerText)) {
      score += 25
    }
  })
  
  // Metadata-basierte Boni
  if (metadata.isRecent) score += 10
  if (metadata.isImportant) score += 15
  if (metadata.matchesUserRole) score += 20
  
  return Math.round(score)
}

// Suchvorschläge generieren
export function generateSearchSuggestions(query, recentSearches = [], popularSearches = []) {
  const suggestions = []
  const lowerQuery = query.toLowerCase()
  
  // Auto-complete basiert auf recent searches
  recentSearches.forEach(search => {
    if (search.query.toLowerCase().startsWith(lowerQuery) && search.query !== query) {
      suggestions.push({
        type: 'recent',
        text: search.query,
        icon: 'clock',
        action: () => search.query
      })
    }
  })
  
  // Typo-Korrekturen
  const corrections = getTypoCorrections(query)
  corrections.forEach(correction => {
    suggestions.push({
      type: 'correction',
      text: `Meintest du "${correction}"?`,
      icon: 'sparkles',
      action: () => correction
    })
  })
  
  // Template-basierte Vorschläge
  const templates = getSearchTemplates(query)
  templates.forEach(template => {
    suggestions.push({
      type: 'template',
      text: template.text,
      icon: template.icon,
      action: () => template.query
    })
  })
  
  return suggestions.slice(0, 5) // Max 5 Vorschläge
}

// Häufige Typo-Korrekturen
function getTypoCorrections(query) {
  const corrections = []
  const commonTypos = {
    'fälle': ['falle', 'faelle', 'fäle'],
    'helfer': ['helfr', 'helffer'],
    'berichte': ['bericht', 'berichtte'],
    'rechnung': ['recnung', 'rechnug'],
    // Weitere häufige Tippfehler...
  }
  
  Object.entries(commonTypos).forEach(([correct, typos]) => {
    if (typos.includes(query.toLowerCase())) {
      corrections.push(correct)
    }
  })
  
  return corrections
}

// Such-Templates
function getSearchTemplates(query) {
  const templates = [
    {
      text: `Alle Fälle mit "${query}"`,
      query: `${query}`,
      icon: 'clipboard'
    },
    {
      text: `Helfer namens "${query}"`,
      query: `helfer:${query}`,
      icon: 'users'
    },
    {
      text: `Berichte über "${query}"`,
      query: `bericht:${query}`,
      icon: 'document'
    }
  ]
  
  return templates.filter(template => 
    !template.query.toLowerCase().includes('helfer:') || query.length > 2
  )
}

// Search Analytics
export class SearchAnalytics {
  constructor() {
    this.storageKey = 'edupe-search-analytics'
  }
  
  // Suche protokollieren
  logSearch(query, category, resultCount, selectedResult = null) {
    const analytics = this.getAnalytics()
    const timestamp = new Date().toISOString()
    
    analytics.searches.push({
      query,
      category,
      resultCount,
      selectedResult,
      timestamp
    })
    
    // Nur letzte 100 Suchen behalten
    if (analytics.searches.length > 100) {
      analytics.searches = analytics.searches.slice(-100)
    }
    
    // Update popular searches
    this.updatePopularSearches(analytics, query)
    
    localStorage.setItem(this.storageKey, JSON.stringify(analytics))
  }
  
  // Populäre Suchen aktualisieren
  updatePopularSearches(analytics, query) {
    const existing = analytics.popularSearches.find(p => p.query === query)
    if (existing) {
      existing.count++
      existing.lastUsed = new Date().toISOString()
    } else {
      analytics.popularSearches.push({
        query,
        count: 1,
        lastUsed: new Date().toISOString()
      })
    }
    
    // Nach Häufigkeit sortieren und auf 20 begrenzen
    analytics.popularSearches = analytics.popularSearches
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
  }
  
  // Analytics abrufen
  getAnalytics() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.error('Error loading search analytics:', e)
    }
    
    return {
      searches: [],
      popularSearches: [],
      preferences: {}
    }
  }
  
  // Beliebte Suchbegriffe
  getPopularSearches(limit = 5) {
    const analytics = this.getAnalytics()
    return analytics.popularSearches.slice(0, limit)
  }
  
  // Such-Statistiken
  getSearchStats() {
    const analytics = this.getAnalytics()
    const today = new Date().toDateString()
    
    return {
      totalSearches: analytics.searches.length,
      todaySearches: analytics.searches.filter(s => 
        new Date(s.timestamp).toDateString() === today
      ).length,
      mostSearchedCategory: this.getMostSearchedCategory(analytics.searches),
      averageResultCount: this.getAverageResultCount(analytics.searches)
    }
  }
  
  getMostSearchedCategory(searches) {
    const categories = {}
    searches.forEach(search => {
      categories[search.category] = (categories[search.category] || 0) + 1
    })
    
    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'all'
  }
  
  getAverageResultCount(searches) {
    if (searches.length === 0) return 0
    const total = searches.reduce((sum, search) => sum + search.resultCount, 0)
    return Math.round(total / searches.length)
  }
}

// Export singleton instance
export const searchAnalytics = new SearchAnalytics()

// Keyboard shortcut utilities
export const searchShortcuts = {
  // Globale Shortcuts
  global: {
    'cmd+k': 'Open search',
    'ctrl+k': 'Open search (Windows/Linux)',
    '/': 'Focus search'
  },
  
  // In-Search Shortcuts
  inSearch: {
    'escape': 'Close search',
    'arrow_up': 'Navigate up',
    'arrow_down': 'Navigate down', 
    'enter': 'Select result',
    '1-9': 'Select category',
    'tab': 'Next category'
  },
  
  // Quick actions
  quickActions: {
    'cmd+n': 'New case',
    'cmd+h': 'New helper',
    'cmd+r': 'View reports',
    'cmd+b': 'View billing'
  }
}

// Highlight matched text
export function highlightMatches(text, query, className = 'bg-yellow-200 text-yellow-900') {
  if (!query || !text) return text
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, `<mark class="${className}">$1</mark>`)
}

// Format search result for display
export function formatSearchResult(result, query) {
  return {
    ...result,
    formattedTitle: highlightMatches(result.title, query),
    formattedSubtitle: highlightMatches(result.subtitle, query),
    relevanceScore: calculateAdvancedRelevance(query, `${result.title} ${result.subtitle}`, {
      isRecent: result.isRecent,
      isImportant: result.isImportant,
      matchesUserRole: result.matchesUserRole
    })
  }
} 