// src/lib/types.js
// Central type definitions and constants for Edupe Digital

export const USER_ROLES = {
  ADMIN: 'admin',
  HELPER: 'helper', 
  JUGENDAMT: 'jugendamt'
}

export const CASE_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

export const SERVICE_TYPES = {
  WITH_CLIENT_FACE_TO_FACE: 'with_client_face_to_face',
  WITH_CLIENT_REMOTE: 'with_client_remote',
  WITHOUT_CLIENT: 'without_client'
}

export const SERVICE_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

export const HELPER_AVAILABILITY = {
  AVAILABLE: 'available',
  PARTIALLY_AVAILABLE: 'partially_available',
  UNAVAILABLE: 'unavailable'
}

export const QUALIFICATION_TYPES = [
  'Familienhelfer',
  'Erziehungsbeistand', 
  'Sozialpädagoge',
  'Sozialarbeiter',
  'Jugendhelfer',
  'Familienpfleger'
]

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  URGENT: 'urgent'
}

// Dummy data structures
export const DUMMY_HELPERS = [
  {
    id: 'helper_001',
    firstName: 'Anna',
    lastName: 'Schmidt',
    email: 'anna.schmidt@edupe.de',
    phone: '+49 151 12345678',
    address: {
      street: 'Musterstraße 123',
      zipCode: '60314',
      city: 'Frankfurt am Main',
      latitude: 50.1109,
      longitude: 8.6821
    },
    qualifications: ['Familienhelfer', 'Erziehungsbeistand'],
    availability: HELPER_AVAILABILITY.AVAILABLE,
    rating: 4.9,
    totalCases: 45,
    totalHours: 680,
    hourlyRate: 25.50,
    bankDetails: {
      iban: 'DE89 3704 0044 0532 0130 00',
      bic: 'COBADEFFXXX'
    },
    documents: [
      { type: 'Führungszeugnis', validUntil: '2024-12-31', verified: true },
      { type: 'Qualifikationsnachweis', validUntil: '2026-06-30', verified: true }
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-04-01T14:22:00Z'
  },
  {
    id: 'helper_002', 
    firstName: 'Michael',
    lastName: 'Weber',
    email: 'michael.weber@edupe.de',
    phone: '+49 160 87654321',
    address: {
      street: 'Hauptstraße 45',
      zipCode: '63065',
      city: 'Offenbach',
      latitude: 50.0955,
      longitude: 8.7761
    },
    qualifications: ['Sozialpädagoge', 'Familienhelfer'],
    availability: HELPER_AVAILABILITY.PARTIALLY_AVAILABLE,
    rating: 4.8,
    totalCases: 38,
    totalHours: 520,
    hourlyRate: 28.00,
    bankDetails: {
      iban: 'DE89 5005 0201 0200 6900 01',
      bic: 'HELADEF1822'
    },
    documents: [
      { type: 'Führungszeugnis', validUntil: '2024-09-15', verified: true },
      { type: 'Qualifikationsnachweis', validUntil: '2025-12-31', verified: true }
    ],
    createdAt: '2024-02-01T09:15:00Z',
    updatedAt: '2024-03-28T16:45:00Z'
  }
]

export const DUMMY_CASES = [
  {
    id: 'case_001',
    caseNumber: 'F-2024-001',
    title: 'Familienbetreuung Familie Meyer',
    description: 'Unterstützung bei der Erziehung und Betreuung von zwei Kindern (8 und 12 Jahre). Schwerpunkt auf Hausaufgabenbetreuung und Konfliktlösung.',
    jugendamt: {
      id: 'ja_frankfurt',
      name: 'Jugendamt Frankfurt',
      contactPerson: 'Frau Dr. Müller',
      email: 'mueller@jugendamt-frankfurt.de',
      phone: '+49 69 212-12345'
    },
    client: {
      firstName: 'Familie',
      lastName: 'Meyer', 
      address: 'Berger Straße 234, 60385 Frankfurt',
      children: [
        { name: 'Lisa', age: 8, school: 'Grundschule Am Berg' },
        { name: 'Tom', age: 12, school: 'IGS Frankfurt-Ost' }
      ]
    },
    assignedHelpers: ['helper_001'],
    status: CASE_STATUS.ACTIVE,
    priority: PRIORITY_LEVELS.MEDIUM,
    startDate: '2024-01-15',
    endDate: null,
    plannedHours: 200,
    usedHours: 156.5,
    hourlyRate: 25.50,
    totalServices: 42,
    lastActivity: '2024-04-01T14:30:00Z',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-04-01T14:30:00Z'
  },
  {
    id: 'case_002',
    caseNumber: 'F-2024-002', 
    title: 'Erziehungsbeistand Tim Schmidt',
    description: 'Einzelbetreuung eines 16-jährigen Jugendlichen mit Schwierigkeiten in der Schule und im sozialen Umfeld.',
    jugendamt: {
      id: 'ja_offenbach',
      name: 'Jugendamt Offenbach',
      contactPerson: 'Herr Weber',
      email: 'weber@jugendamt-offenbach.de', 
      phone: '+49 69 8065-1234'
    },
    client: {
      firstName: 'Tim',
      lastName: 'Schmidt',
      address: 'Wilhelmstraße 12, 63065 Offenbach',
      children: [
        { name: 'Tim', age: 16, school: 'Gesamtschule Offenbach' }
      ]
    },
    assignedHelpers: ['helper_002'],
    status: CASE_STATUS.ACTIVE,
    priority: PRIORITY_LEVELS.HIGH,
    startDate: '2024-02-01',
    endDate: null,
    plannedHours: 150,
    usedHours: 89.0,
    hourlyRate: 28.00,
    totalServices: 28,
    lastActivity: '2024-03-31T16:15:00Z',
    createdAt: '2024-02-01T09:15:00Z',
    updatedAt: '2024-03-31T16:15:00Z'
  }
]

export const DUMMY_SERVICES = [
  {
    id: 'service_001',
    caseId: 'case_001',
    helperId: 'helper_001',
    date: '2024-04-01',
    startTime: '14:00',
    endTime: '17:30',
    duration: 3.5,
    type: SERVICE_TYPES.WITH_CLIENT_FACE_TO_FACE,
    location: 'Berger Straße 234, 60385 Frankfurt',
    coordinates: { lat: 50.1235, lng: 8.7123 },
    description: 'Hausaufgabenbetreuung mit Lisa und Tom. Mathematik-Aufgaben erklärt und bei den Deutsch-Hausaufgaben geholfen. Tom hatte heute bessere Konzentration.',
    activities: [
      'Hausaufgabenbetreuung Mathematik (1.5h)',
      'Deutsch-Übungen (1h)', 
      'Gespräch über Schulalltag (1h)'
    ],
    achievements: 'Tom konnte alle Mathe-Aufgaben selbstständig lösen',
    nextSteps: 'Nächste Woche Fokus auf Vorbereitung für Klassenarbeit',
    status: SERVICE_STATUS.APPROVED,
    costs: 89.25, // 3.5 * 25.50
    travelTime: 25, // minutes
    createdAt: '2024-04-01T18:00:00Z',
    updatedAt: '2024-04-01T18:00:00Z'
  },
  {
    id: 'service_002',
    caseId: 'case_001', 
    helperId: 'helper_001',
    date: '2024-03-29',
    startTime: '09:00',
    endTime: '10:30',
    duration: 1.5,
    type: SERVICE_TYPES.WITH_CLIENT_REMOTE,
    location: 'Telefon/Video-Call',
    description: 'Telefonisches Beratungsgespräch mit der Mutter über den Fortschritt der Kinder und Planung der nächsten Termine.',
    activities: [
      'Rücksprache über Hausaufgaben-Situation',
      'Terminplanung für kommende Woche',
      'Besprechung Elterngespräch in der Schule'
    ],
    status: SERVICE_STATUS.APPROVED,
    costs: 38.25, // 1.5 * 25.50
    createdAt: '2024-03-29T10:45:00Z',
    updatedAt: '2024-03-29T10:45:00Z'
  },
  {
    id: 'service_003',
    caseId: 'case_002',
    helperId: 'helper_002', 
    date: '2024-03-31',
    startTime: '16:00',
    endTime: '18:00',
    duration: 2.0,
    type: SERVICE_TYPES.WITH_CLIENT_FACE_TO_FACE,
    location: 'Wilhelmstraße 12, 63065 Offenbach',
    coordinates: { lat: 50.0955, lng: 8.7761 },
    description: 'Einzelgespräch mit Tim über seine schulischen Probleme und Entwicklung von Lösungsstrategien.',
    activities: [
      'Gespräch über aktuelle Schulsituation',
      'Erarbeitung von Lernstrategien',
      'Zielsetzung für nächste Woche'
    ],
    achievements: 'Tim zeigt mehr Motivation für Schularbeiten',
    nextSteps: 'Gemeinsam Tagesplan erstellen',
    status: SERVICE_STATUS.SUBMITTED,
    costs: 56.00, // 2.0 * 28.00
    travelTime: 30,
    createdAt: '2024-03-31T18:30:00Z',
    updatedAt: '2024-03-31T18:30:00Z'
  }
]

// Utility functions
export const formatDuration = (hours) => {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit'
  }).format(new Date(dateString))
}

export const formatDateTime = (dateString) => {
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}