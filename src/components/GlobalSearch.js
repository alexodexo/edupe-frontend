// src/components/GlobalSearch.js
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/auth'
import { searchAnalytics, calculateAdvancedRelevance } from '@/lib/searchUtils'
import {
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  PlusIcon,
  CommandLineIcon,
  ChevronRightIcon,
  ClockIcon,
  HashtagIcon,
  UserCircleIcon,
  XMarkIcon,
  ArrowRightIcon,
  FireIcon,
  BookmarkIcon,
  StarIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

// Icon mapping
const iconMap = {
  ClipboardDocumentListIcon,
  UsersIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  ClockIcon,
  UserCircleIcon
}

// Status-Badges
const StatusBadge = ({ status, type }) => {
  const getStatusConfig = () => {
    switch (type) {
      case 'case':
        switch (status) {
          case 'offen': return { color: 'bg-blue-100 text-blue-800', text: 'Offen' }
          case 'in_bearbeitung': return { color: 'bg-yellow-100 text-yellow-800', text: 'In Bearbeitung' }
          case 'abgeschlossen': return { color: 'bg-green-100 text-green-800', text: 'Abgeschlossen' }
          case 'abgelehnt': return { color: 'bg-red-100 text-red-800', text: 'Abgelehnt' }
          default: return { color: 'bg-gray-100 text-gray-800', text: status }
        }
      case 'report':
        switch (status) {
          case 'entwurf': return { color: 'bg-gray-100 text-gray-800', text: 'Entwurf' }
          case 'final': return { color: 'bg-blue-100 text-blue-800', text: 'Final' }
          case 'uebermittelt': return { color: 'bg-green-100 text-green-800', text: 'Übermittelt' }
          default: return { color: 'bg-gray-100 text-gray-800', text: status }
        }
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status }
    }
  }

  if (!status) return null

  const config = getStatusConfig()
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  )
}

// Text highlighting function
const highlightText = (text, query) => {
  if (!query || !text) return text
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
        {part}
      </mark>
    ) : part
  )
}

// Get search categories based on user role
const getSearchCategories = (userRole) => {
  const categories = []

  categories.push({
    id: 'all',
    name: 'Alles',
    icon: SparklesIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  })

  if (['admin', 'helper', 'jugendamt'].includes(userRole)) {
    categories.push({
      id: 'cases',
      name: 'Fälle',
      icon: ClipboardDocumentListIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      placeholder: 'Fälle suchen (Name, Aktenzeichen, Schule...)...'
    })
  }

  if (userRole === 'admin') {
    categories.push({
      id: 'helpers',
      name: 'Helfer',
      icon: UsersIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      placeholder: 'Helfer suchen (Name, Email, Stadt...)...'
    })
  }

  if (['admin', 'jugendamt'].includes(userRole)) {
    categories.push({
      id: 'reports',
      name: 'Berichte',
      icon: DocumentTextIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      placeholder: 'Berichte suchen (Titel, Inhalt...)...'
    })
  }

  if (['admin', 'jugendamt'].includes(userRole)) {
    categories.push({
      id: 'billing',
      name: 'Abrechnungen',
      icon: CurrencyEuroIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      placeholder: 'Abrechnungen suchen (Rechnungsnummer...)...'
    })
  }

  if (userRole === 'helper') {
    categories.push({
      id: 'services',
      name: 'Services',
      icon: ClockIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      placeholder: 'Services suchen (Standort, Notiz...)...'
    })
  }

  categories.push({
    id: 'contacts',
    name: 'Ansprechpersonen',
    icon: UserCircleIcon,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    placeholder: 'Ansprechpersonen suchen (Name, Jugendamt...)...'
  })

  return categories
}

// Quick actions based on user role
const getQuickActions = (userRole) => {
  const actions = []

  if (userRole === 'admin') {
    actions.push(
      { name: 'Neuen Fall erstellen', href: '/cases/new', icon: PlusIcon, shortcut: 'N', description: 'Neuen Fall anlegen' },
      { name: 'Helfer hinzufügen', href: '/helpers/new', icon: UsersIcon, shortcut: 'H', description: 'Neuen Helfer registrieren' },
      { name: 'Alle Fälle anzeigen', href: '/cases', icon: ClipboardDocumentListIcon, shortcut: 'F', description: 'Fallübersicht öffnen' },
      { name: 'Einstellungen', href: '/settings', icon: CommandLineIcon, shortcut: 'S', description: 'Systemeinstellungen' }
    )
  } else if (userRole === 'helper') {
    actions.push(
      { name: 'Meine Fälle', href: '/cases', icon: ClipboardDocumentListIcon, shortcut: 'F', description: 'Zugewiesene Fälle anzeigen' },
      { name: 'Service erfassen', href: '/services/new', icon: ClockIcon, shortcut: 'S', description: 'Neue Leistung dokumentieren' },
      { name: 'Mein Profil', href: '/profile', icon: UserCircleIcon, shortcut: 'P', description: 'Profil bearbeiten' }
    )
  } else if (userRole === 'jugendamt') {
    actions.push(
      { name: 'Unsere Fälle', href: '/cases', icon: ClipboardDocumentListIcon, shortcut: 'F', description: 'Alle Fälle anzeigen' },
      { name: 'Berichte einsehen', href: '/reports', icon: DocumentTextIcon, shortcut: 'B', description: 'Berichte und Dokumentation' },
      { name: 'Abrechnungen', href: '/billing', icon: CurrencyEuroIcon, shortcut: 'A', description: 'Rechnungen und Freigaben' }
    )
  }

  return actions
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeCategory, setActiveCategory] = useState('all')
  const [recentSearches, setRecentSearches] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  
  const router = useRouter()
  const { userRole } = useAuth()
  const inputRef = useRef(null)
  const abortControllerRef = useRef(null)

  const categories = getSearchCategories(userRole)
  const quickActions = getQuickActions(userRole)

  // Helper functions for relevance scoring
  const isRecentResult = (result) => {
    if (!result.erstellt_am && !result.created_at) return false
    const resultDate = new Date(result.erstellt_am || result.created_at)
    const daysDiff = (new Date() - resultDate) / (1000 * 60 * 60 * 24)
    return daysDiff <= 7 // Recent if within last 7 days
  }

  const isImportantResult = (result) => {
    // Logic to determine if result is important
    return result.status === 'in_bearbeitung' || 
           result.status === 'offen' ||
           result.priority === 'high' ||
           result.type === 'case'
  }

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('edupe-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading recent searches:', e)
      }
    }
  }, [])

  // Save recent searches
  const saveRecentSearch = useCallback((searchQuery, result) => {
    const newSearch = {
      id: Date.now(),
      query: searchQuery,
      result: result,
      timestamp: new Date().toISOString()
    }
    
    setRecentSearches(prev => {
      const filtered = prev.filter(item => 
        item.query !== searchQuery || item.result?.id !== result?.id
      )
      const updated = [newSearch, ...filtered].slice(0, 5) // Keep last 5
      localStorage.setItem('edupe-recent-searches', JSON.stringify(updated))
      return updated
    })
  }, [])

  // Real search function with API integration
  const searchData = useCallback(async (searchQuery, category = 'all') => {
    // Bei "all" Kategorie nur suchen wenn Query vorhanden
    if (category === 'all' && (!searchQuery || searchQuery.trim().length < 2)) {
      setResults([])
      setTotalCount(0)
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setLoading(true)
    
    try {
      const response = await fetch(
        `/api/search/global?q=${encodeURIComponent(searchQuery || '')}&category=${category}&limit=5`,
        { signal: abortControllerRef.current.signal }
      )
      
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const data = await response.json()
      
      // Erweiterte Relevanz-Berechnung für bessere Ergebnisse
      const enhancedResults = (data.results || []).map(result => ({
        ...result,
        relevanceScore: calculateAdvancedRelevance(searchQuery, `${result.title} ${result.subtitle}`, {
          isRecent: isRecentResult(result),
          isImportant: isImportantResult(result),
          matchesUserRole: true
        })
      })).sort((a, b) => b.relevanceScore - a.relevanceScore)
      
      setResults(enhancedResults)
      setTotalCount(data.totalCount || 0)
      
      // Log search for analytics
      searchAnalytics.logSearch(searchQuery, category, data.totalCount || 0)
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error)
        setResults([])
        setTotalCount(0)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search and category-based initial loading
  useEffect(() => {
    if (!isOpen) return // Nicht suchen wenn Modal geschlossen ist
    
    const timer = setTimeout(() => {
      if (query.trim()) {
        searchData(query, activeCategory)
      } else if (activeCategory !== 'all') {
        // Bei anderen Kategorien erste Treffer laden
        searchData('', activeCategory)
      } else {
        setResults([])
        setTotalCount(0)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, activeCategory, searchData, isOpen])

  // Keyboard shortcuts and navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }

      if (!isOpen) return

      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
        setResults([])
        setSelectedIndex(0)
      }

      // Arrow navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const showingQuickActions = !query && activeCategory === 'all' && quickActions.length > 0
        const showingRecent = !query && activeCategory === 'all' && recentSearches.length > 0
        
        let totalItems = 0
        if (showingQuickActions) totalItems += quickActions.length
        if (showingRecent) totalItems += recentSearches.length
        if (query || activeCategory !== 'all') totalItems = results.length

        if (totalItems === 0) return

        if (e.key === 'ArrowDown') {
          setSelectedIndex(prev => (prev + 1) % totalItems)
        } else {
          setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems)
        }
      }

      // Enter to select
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSelect(selectedIndex)
      }

      // Quick shortcut for categories
      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1
        if (categories[index]) {
          setActiveCategory(categories[index].id)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, quickActions, recentSearches, selectedIndex, query, categories])

  const handleSelect = useCallback((index) => {
    const showingQuickActions = !query && activeCategory === 'all' && quickActions.length > 0
    const showingRecent = !query && activeCategory === 'all' && recentSearches.length > 0
    
    let item = null
    
    if (showingQuickActions && index < quickActions.length) {
      item = quickActions[index]
    } else if (showingRecent && !showingQuickActions && index < recentSearches.length) {
      item = recentSearches[index].result
    } else if (showingRecent && showingQuickActions && index >= quickActions.length) {
      const recentIndex = index - quickActions.length
      item = recentSearches[recentIndex]?.result
    } else if (results[index]) {
      item = results[index]
      if (query) {
        saveRecentSearch(query, item) // Save to recent searches only when there's a query
      }
    }
    
    if (item?.href) {
      // Log analytics for selected result
      if (results.length > 0 && results[index]) {
        searchAnalytics.logSearch(query || '', activeCategory, totalCount, item)
      }
      
      setIsOpen(false)
      setQuery('')
      setResults([])
      setSelectedIndex(0)
      router.push(item.href)
    }
  }, [query, activeCategory, quickActions, recentSearches, results, totalCount, router, saveRecentSearch])

  const handleOpen = () => {
    setIsOpen(true)
    setSelectedIndex(0)
    setTimeout(() => {
      inputRef.current?.focus()
      // Beim Öffnen: wenn aktive Kategorie nicht "all" ist, Daten laden
      if (activeCategory !== 'all') {
        console.log('Opening with category:', activeCategory)
        searchData('', activeCategory)
      }
    }, 100)
  }

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId)
    setSelectedIndex(0)
    setQuery('') // Query zurücksetzen
    
    console.log('Category changed to:', categoryId)
    
    // Bei Kategoriewechsel sofort laden wenn nicht "all"
    setTimeout(() => {
      if (categoryId !== 'all') {
        console.log('Loading data for category:', categoryId)
        searchData('', categoryId)
      } else {
        setResults([])
        setTotalCount(0)
      }
    }, 50)
  }

  const getCurrentPlaceholder = () => {
    if (activeCategory === 'all') return 'Alles durchsuchen...'
    const category = categories.find(cat => cat.id === activeCategory)
    return category?.placeholder || 'Suchen...'
  }

  return (
    <>
      {/* Search trigger */}
      <div className="relative flex-1 max-w-lg">
        <button
          onClick={handleOpen}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-500 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 group"
        >
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-500" />
          <span className="flex-1">Alles durchsuchen...</span>
          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 bg-white px-2 py-1 rounded border">
            <CommandLineIcon className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Search modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/10 z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setIsOpen(false)}>
            <div className="flex min-h-full items-start justify-start p-4 pt-16 lg:pl-80">
              <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200" onClick={(e) => e.stopPropagation()}>
                
                {/* Search input */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                  <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={getCurrentPlaceholder()}
                    className="flex-1 text-lg text-gray-900 placeholder-gray-400 bg-transparent outline-none"
                  />
                  {query && (
                    <button
                      onClick={() => {
                        setQuery('')
                        setResults([])
                        inputRef.current?.focus()
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                  {loading && (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                {/* Categories */}
                <div className="flex gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100 overflow-x-auto">
                  {categories.map((category, index) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                        activeCategory === category.id 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <category.icon className="w-4 h-4" />
                      {category.name}
                      <span className="text-xs opacity-70">{index + 1}</span>
                    </button>
                  ))}
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto">
                  {/* Quick Actions - nur bei "Alles" Kategorie anzeigen */}
                  {!query && activeCategory === 'all' && quickActions.length > 0 && (
                    <div className="p-3">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3 flex items-center gap-2">
                        <FireIcon className="w-4 h-4" />
                        Schnellaktionen
                      </h3>
                      {quickActions.map((action, index) => (
                        <button
                          key={action.name}
                          onClick={() => handleSelect(index)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                            selectedIndex === index ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedIndex === index ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <action.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{action.name}</div>
                            <div className="text-sm text-gray-500">{action.description}</div>
                          </div>
                          <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            {action.shortcut}
                          </div>
                          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Recent Searches - nur bei "Alles" Kategorie anzeigen */}
                  {!query && activeCategory === 'all' && recentSearches.length > 0 && (
                    <div className="p-3 border-t border-gray-100">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3 flex items-center gap-2">
                        <ClockIcon className="w-4 h-4" />
                        Zuletzt gesucht
                      </h3>
                      {recentSearches.map((search, index) => {
                        const adjustedIndex = quickActions.length + index
                        const IconComponent = iconMap[search.result.icon] || HashtagIcon
                        return (
                          <button
                            key={search.id}
                            onClick={() => handleSelect(adjustedIndex)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                              selectedIndex === adjustedIndex ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              selectedIndex === adjustedIndex ? search.result.bgColor : 'bg-gray-100'
                            }`}>
                              <IconComponent className={`w-5 h-5 ${
                                selectedIndex === adjustedIndex ? search.result.color : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium">{search.result.title}</div>
                              <div className="text-sm text-gray-500">
                                &quot;{search.query}&quot; • {new Date(search.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Loading */}
                  {loading && query && (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="ml-3 text-gray-600">Suche läuft...</span>
                    </div>
                  )}

                  {/* No results */}
                  {query && !loading && results.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <MagnifyingGlassIcon className="w-12 h-12 mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Keine Ergebnisse für &quot;{query}&quot;</p>
                      <p className="text-sm">Versuche andere Suchbegriffe oder wähle eine andere Kategorie</p>
                    </div>
                  )}

                  {/* No results for category without query */}
                  {!query && activeCategory !== 'all' && !loading && results.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <MagnifyingGlassIcon className="w-12 h-12 mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Keine Einträge in dieser Kategorie</p>
                      <p className="text-sm">Es sind noch keine Daten vorhanden</p>
                    </div>
                  )}

                  {/* Search Results */}
                  {results.length > 0 && (
                    <div className="p-3">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3 flex items-center gap-2 justify-between">
                        <span className="flex items-center gap-2">
                          <MagnifyingGlassIcon className="w-4 h-4" />
                          {query ? 'Suchergebnisse' : 'Neueste Einträge'}
                        </span>
                        <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                          {totalCount} {query ? 'gefunden' : 'Einträge'}
                        </span>
                      </h3>
                      {results.map((result, index) => {
                        const IconComponent = iconMap[result.icon] || HashtagIcon
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleSelect(index)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                              selectedIndex === index ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              selectedIndex === index ? result.bgColor : 'bg-gray-100'
                            }`}>
                              <IconComponent className={`w-5 h-5 ${
                                selectedIndex === index ? result.color : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium">
                                {highlightText(result.title, query)}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                {highlightText(result.subtitle, query)}
                                {result.status && (
                                  <StatusBadge status={result.status} type={result.type} />
                                )}
                              </div>
                            </div>
                            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <span className="bg-white border rounded px-1.5 py-0.5">↑↓</span>
                      navigieren
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="bg-white border rounded px-1.5 py-0.5">↵</span>
                      auswählen
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="bg-white border rounded px-1.5 py-0.5">1-{categories.length}</span>
                      Kategorie
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="bg-white border rounded px-1.5 py-0.5">esc</span>
                      schließen
                    </span>
                  </div>
                  <div className="text-gray-400">
                    Powered by Edupe Digital
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
} 