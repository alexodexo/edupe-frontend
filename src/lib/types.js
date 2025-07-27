// src/lib/types.js
// Type definitions and constants for Edupe Digital - angepasst an Supabase Schema

export const USER_ROLES = {
  ADMIN: 'admin',
  HELPER: 'helper', 
  JUGENDAMT: 'jugendamt'
}

// Entspricht fall_status ENUM aus der Datenbank
export const CASE_STATUS = {
  OFFEN: 'offen',
  IN_BEARBEITUNG: 'in_bearbeitung', 
  ABGESCHLOSSEN: 'abgeschlossen',
  ABGELEHNT: 'abgelehnt',
  WARTEND: 'wartend',
  STORNIERT: 'storniert'
}

// Helper Availability Constants
export const HELPER_AVAILABILITY = {
  AVAILABLE: 'available',
  PARTIALLY_AVAILABLE: 'partially_available',
  UNAVAILABLE: 'unavailable'
}

// Service Typen basierend auf dem 'typ' Feld in leistungen
export const SERVICE_TYPES = {
  WITH_CLIENT_FACE_TO_FACE: 'mit_klient_persoenlich',
  WITH_CLIENT_REMOTE: 'mit_klient_remote',
  WITHOUT_CLIENT: 'ohne_klient',
  CONSULTATION: 'beratung',
  PREPARATION: 'vorbereitung',
  DOCUMENTATION: 'dokumentation'
}

// Service Status basierend auf freigegeben_flag
export const SERVICE_STATUS = {
  DRAFT: 'entwurf',
  SUBMITTED: 'eingereicht', 
  APPROVED: 'freigegeben',
  REJECTED: 'abgelehnt'
}

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'niedrig',
  MEDIUM: 'mittel',
  HIGH: 'hoch', 
  URGENT: 'dringend'
}

// Qualification Types
export const QUALIFICATION_TYPES = [
  'Familienhelfer',
  'Erziehungsbeistand',
  'Sozialpädagoge', 
  'Sozialarbeiter',
  'Jugendhelfer',
  'Familienpfleger',
  'Pflegehelfer',
  'Haushaltsführung',
  'Kinderbetreuung',
  'Schulbegleitung',
  'Therapiebegleitung',
  'Freizeitgestaltung',
  'Behördengänge',
  'Einkaufshilfe',
  'Fahrdienste',
  'Erste Hilfe',
  'Pädagogik',
  'Sonderpädagogik'
]

// Entspricht geschlecht_enum aus der Datenbank
export const GENDER_TYPES = {
  MALE: 'maennlich',
  FEMALE: 'weiblich',
  DIVERSE: 'divers'
}

// Document Types
export const DOCUMENT_TYPES = {
  CERTIFICATE: 'Führungszeugnis',
  ID_CARD: 'Personalausweis',
  PASSPORT: 'Reisepass',
  QUALIFICATION: 'Qualifikationsnachweis',
  MEDICAL_CERTIFICATE: 'Gesundheitszeugnis',
  WORK_PERMIT: 'Arbeitserlaubnis'
}

// Entspricht bericht_status ENUM aus der Datenbank
export const REPORT_STATUS = {
  DRAFT: 'entwurf',
  FINAL: 'final',
  SUBMITTED: 'uebermittelt'
}

// Database field mappings - Frontend zu Datenbank
export const DB_FIELD_MAPPINGS = {
  cases: {
    id: 'fall_id',
    caseNumber: 'aktenzeichen', 
    firstName: 'vorname',
    lastName: 'nachname',
    birthDate: 'geburtsdatum',
    school: 'schule',
    address: 'strasse',
    zipCode: 'plz',
    city: 'stadt',
    schoolOrKita: 'schule_oder_kita',
    firstContactDate: 'erstkontakt_datum',
    firstContactText: 'erstkontakt_text',
    status: 'status',
    createdAt: 'erstellt_am',
    updatedAt: 'aktualisiert_am',
    updatedBy: 'aktualisiert_von'
  },
  helpers: {
    id: 'helfer_id',
    firstName: 'vorname',
    lastName: 'nachname', 
    street: 'strasse',
    zipCode: 'plz',
    city: 'stadt',
    birthDate: 'geburtsdatum',
    birthPlace: 'geburtsort',
    birthCountry: 'geburtsland',
    gender: 'geschlecht',
    nationality: 'staatsangehoerigkeit',
    phone: 'telefon_nummer',
    alternativePhone: 'alternative_nummer',
    landlinePhone: 'festnetznummer',
    email: 'email',
    highestEducation: 'hoechster_abschluss',
    additionalQualifications: 'zusaetzliche_qualifikationen',
    languages: 'sprachen',
    religion: 'religion',
    specialties: 'besonderheiten',
    skills: 'faehigkeiten',
    iban: 'iban',
    taxNumber: 'steuernummer',
    certificateImage: 'bild_bescheinigung',
    taxId: 'steuer_id',
    otherClients: 'andere_auftraggeber',
    createdAt: 'erstellt_am',
    updatedAt: 'aktualisiert_am',
    updatedBy: 'aktualisiert_von'
  },
  services: {
    id: 'leistung_id',
    startTime: 'startzeit',
    endTime: 'endzeit',
    location: 'standort',
    note: 'notiz',
    createdAt: 'erstellt_am',
    approved: 'freigegeben_flag',
    approvedBy: 'freigegeben_von',
    approvedAt: 'freigegeben_am',
    type: 'typ',
    helperId: 'helfer_id',
    caseId: 'fall_id',
    createdBy: 'erstellt_von',
    updatedAt: 'aktualisiert_am',
    updatedBy: 'aktualisiert_von'
  },
  reports: {
    id: 'bericht_id',
    createdAt: 'erstellt_am',
    serviceCount: 'anzahl_leistungen',
    totalHours: 'gesamtstunden',
    status: 'status',
    visibleToJugendamt: 'sichtbar_fuer_jugendamt',
    caseId: 'fall_id',
    title: 'titel',
    content: 'inhalt',
    pdfUrl: 'pdf_url',
    createdBy: 'erstellt_von',
    updatedAt: 'aktualisiert_am',
    updatedBy: 'aktualisiert_von'
  },
  invoices: {
    id: 'rechnung_id',
    caseId: 'fall_id',
    invoiceNumber: 'rechnungsnummer',
    workHours: 'arbeitsstunden',
    invoiceDate: 'rechnungsdatum',
    serviceCount: 'leistungsanzahl',
    hourlyRate: 'stundensatz',
    totalAmount: 'gesamtbetrag',
    status: 'status',
    sentAt: 'gesendet_am',
    paidAt: 'bezahlt_am',
    note: 'notiz',
    createdAt: 'erstellt_am',
    updatedAt: 'aktualisiert_am',
    updatedBy: 'aktualisiert_von'
  },
  jugendamt: {
    id: 'ansprechpartner_id',
    jugendamt: 'jugendamt',
    name: 'name',
    email: 'mail',
    phone: 'telefon',
    createdAt: 'erstellt_am',
    updatedAt: 'aktualisiert_am',
    updatedBy: 'aktualisiert_von'
  },
  vacation: {
    id: 'urlaub_id',
    fromDate: 'von_datum',
    toDate: 'bis_datum',
    substitute: 'vertretung',
    helperId: 'helfer_id',
    approved: 'freigegeben',
    note: 'notiz',
    createdAt: 'erstellt_am',
    updatedAt: 'aktualisiert_am',
    updatedBy: 'aktualisiert_von'
  }
}

// Transform functions für Frontend/Backend Mapping
export const transformToFrontend = {
  case: (dbCase) => ({
    id: dbCase.fall_id,
    caseNumber: dbCase.aktenzeichen,
    title: `Betreuung ${dbCase.vorname} ${dbCase.nachname}`,
    client: {
      firstName: dbCase.vorname,
      lastName: dbCase.nachname,
      birthDate: dbCase.geburtsdatum,
      address: dbCase.strasse && dbCase.plz && dbCase.stadt 
        ? `${dbCase.strasse}, ${dbCase.plz} ${dbCase.stadt}`
        : 'Keine Adresse hinterlegt',
      school: dbCase.schule_oder_kita
    },
    status: dbCase.status,
    description: dbCase.erstkontakt_text,
    firstContact: {
      date: dbCase.erstkontakt_datum,
      text: dbCase.erstkontakt_text
    },
    createdAt: dbCase.erstellt_am,
    updatedAt: dbCase.aktualisiert_am
  }),

  helper: (dbHelper) => ({
    id: dbHelper.helfer_id,
    firstName: dbHelper.vorname,
    lastName: dbHelper.nachname,
    email: dbHelper.email,
    phone: dbHelper.telefon_nummer,
    address: {
      street: dbHelper.strasse,
      zipCode: dbHelper.plz,
      city: dbHelper.stadt
    },
    personalInfo: {
      birthDate: dbHelper.geburtsdatum,
      birthPlace: dbHelper.geburtsort,
      birthCountry: dbHelper.geburtsland,
      gender: dbHelper.geschlecht,
      nationality: dbHelper.staatsangehoerigkeit,
      religion: dbHelper.religion
    },
    qualifications: dbHelper.zusaetzliche_qualifikationen ? 
      dbHelper.zusaetzliche_qualifikationen.split(',').map(q => q.trim()) : [],
    languages: dbHelper.sprachen ? 
      dbHelper.sprachen.split(',').map(l => l.trim()) : [],
    banking: {
      iban: dbHelper.iban,
      taxNumber: dbHelper.steuernummer,
      taxId: dbHelper.steuer_id
    },
    otherClients: dbHelper.andere_auftraggeber,
    createdAt: dbHelper.erstellt_am,
    updatedAt: dbHelper.aktualisiert_am
  }),

  service: (dbService) => ({
    id: dbService.leistung_id,
    date: new Date(dbService.startzeit).toISOString().split('T')[0],
    startTime: new Date(dbService.startzeit).toTimeString().slice(0, 5),
    endTime: new Date(dbService.endzeit).toTimeString().slice(0, 5),
    duration: (new Date(dbService.endzeit) - new Date(dbService.startzeit)) / (1000 * 60 * 60),
    location: dbService.standort,
    description: dbService.notiz,
    type: dbService.typ,
    status: dbService.freigegeben_flag === true ? SERVICE_STATUS.APPROVED :
            dbService.freigegeben_flag === false && dbService.freigegeben_von ? SERVICE_STATUS.REJECTED :
            SERVICE_STATUS.SUBMITTED,
    helperId: dbService.helfer_id,
    caseId: dbService.fall_id,
    createdAt: dbService.erstellt_am,
    approvedAt: dbService.freigegeben_am,
    approvedBy: dbService.freigegeben_von
  }),

  report: (dbReport) => ({
    id: dbReport.bericht_id,
    title: dbReport.titel,
    content: dbReport.inhalt,
    status: dbReport.status,
    serviceCount: dbReport.anzahl_leistungen,
    totalHours: dbReport.gesamtstunden,
    visibleToJugendamt: dbReport.sichtbar_fuer_jugendamt,
    caseId: dbReport.fall_id,
    pdfUrl: dbReport.pdf_url,
    createdAt: dbReport.erstellt_am,
    createdBy: dbReport.erstellt_von
  }),

  invoice: (dbInvoice) => ({
    id: dbInvoice.rechnung_id,
    invoiceNumber: dbInvoice.rechnungsnummer,
    caseId: dbInvoice.fall_id,
    workHours: dbInvoice.arbeitsstunden,
    serviceCount: dbInvoice.leistungsanzahl,
    hourlyRate: dbInvoice.stundensatz,
    totalAmount: dbInvoice.gesamtbetrag,
    status: dbInvoice.status,
    invoiceDate: dbInvoice.rechnungsdatum,
    sentAt: dbInvoice.gesendet_am,
    paidAt: dbInvoice.bezahlt_am,
    note: dbInvoice.notiz,
    createdAt: dbInvoice.erstellt_am
  })
}

export const transformToDatabase = {
  case: (frontendCase) => ({
    aktenzeichen: frontendCase.caseNumber,
    vorname: frontendCase.client?.firstName || frontendCase.firstName,
    nachname: frontendCase.client?.lastName || frontendCase.lastName,
    geburtsdatum: frontendCase.client?.birthDate || frontendCase.birthDate,
    strasse: frontendCase.client?.street || frontendCase.street,
    plz: frontendCase.client?.zipCode || frontendCase.zipCode,
    stadt: frontendCase.client?.city || frontendCase.city,
    schule_oder_kita: frontendCase.client?.school || frontendCase.school,
    erstkontakt_datum: frontendCase.firstContact?.date,
    erstkontakt_text: frontendCase.firstContact?.text || frontendCase.description,
    status: frontendCase.status || CASE_STATUS.OFFEN
  }),

  helper: (frontendHelper) => ({
    vorname: frontendHelper.firstName,
    nachname: frontendHelper.lastName,
    email: frontendHelper.email,
    telefon_nummer: frontendHelper.phone,
    strasse: frontendHelper.address?.street || frontendHelper.street,
    plz: frontendHelper.address?.zipCode || frontendHelper.zipCode,
    stadt: frontendHelper.address?.city || frontendHelper.city,
    geburtsdatum: frontendHelper.personalInfo?.birthDate || frontendHelper.birthDate,
    geburtsort: frontendHelper.personalInfo?.birthPlace,
    geburtsland: frontendHelper.personalInfo?.birthCountry,
    geschlecht: frontendHelper.personalInfo?.gender || frontendHelper.gender,
    staatsangehoerigkeit: frontendHelper.personalInfo?.nationality,
    zusaetzliche_qualifikationen: Array.isArray(frontendHelper.qualifications) ? 
      frontendHelper.qualifications.join(', ') : frontendHelper.qualifications,
    sprachen: Array.isArray(frontendHelper.languages) ? 
      frontendHelper.languages.join(', ') : frontendHelper.languages,
    religion: frontendHelper.personalInfo?.religion,
    iban: frontendHelper.banking?.iban || frontendHelper.iban,
    steuernummer: frontendHelper.banking?.taxNumber || frontendHelper.taxNumber,
    steuer_id: frontendHelper.banking?.taxId,
    andere_auftraggeber: frontendHelper.otherClients || false
  }),

  service: (frontendService) => {
    const startDateTime = new Date(`${frontendService.date}T${frontendService.startTime}`)
    const endDateTime = new Date(`${frontendService.date}T${frontendService.endTime}`)
    
    return {
      startzeit: startDateTime.toISOString(),
      endzeit: endDateTime.toISOString(),
      standort: frontendService.location,
      notiz: frontendService.description,
      typ: frontendService.type,
      helfer_id: frontendService.helperId,
      fall_id: frontendService.caseId,
      freigegeben_flag: frontendService.status === SERVICE_STATUS.APPROVED
    }
  }
}

// Utility Functions
export function formatCurrency(amount) {
  if (typeof amount !== 'number') return '0,00 €'
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export function formatDateTime(dateString) {
  if (!dateString) return 'Unbekannt'
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch (error) {
    return 'Ungültiges Datum'
  }
}

export function formatDate(dateString) {
  if (!dateString) return 'Unbekannt'
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  } catch (error) {
    return 'Ungültiges Datum'
  }
}

export function formatTime(dateString) {
  if (!dateString) return 'Unbekannt'
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch (error) {
    return 'Ungültige Zeit'
  }
}

export function formatDuration(hours) {
  if (typeof hours !== 'number') return '0h'
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes}min`
  }
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function calculateAge(birthDate) {
  if (!birthDate) return null
  try {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  } catch (error) {
    return null
  }
}

export function getStatusColor(status) {
  switch (status) {
    case CASE_STATUS.OFFEN:
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case CASE_STATUS.IN_BEARBEITUNG:
      return 'bg-green-100 text-green-800 border-green-200'
    case CASE_STATUS.WARTEND:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case CASE_STATUS.ABGESCHLOSSEN:
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case CASE_STATUS.ABGELEHNT:
      return 'bg-red-100 text-red-800 border-red-200'
    case CASE_STATUS.STORNIERT:
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getAvailabilityColor(availability) {
  switch (availability) {
    case HELPER_AVAILABILITY.AVAILABLE:
      return 'bg-green-100 text-green-800 border-green-200'
    case HELPER_AVAILABILITY.PARTIALLY_AVAILABLE:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case HELPER_AVAILABILITY.UNAVAILABLE:
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getPriorityColor(priority) {
  switch (priority) {
    case PRIORITY_LEVELS.URGENT:
      return 'bg-red-100 text-red-800 border-red-200'
    case PRIORITY_LEVELS.HIGH:
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case PRIORITY_LEVELS.MEDIUM:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case PRIORITY_LEVELS.LOW:
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Validation Functions
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validatePhone(phone) {
  const re = /^[\+]?[\d\s\-\(\)]{7,}$/
  return re.test(phone)
}

export function validateIBAN(iban) {
  if (!iban) return false
  const cleanIban = iban.replace(/\s/g, '').toUpperCase()
  return cleanIban.length >= 15 && cleanIban.length <= 34 && /^[A-Z]{2}\d+$/.test(cleanIban)
}

export function validatePostalCode(postalCode) {
  const re = /^\d{5}$/
  return re.test(postalCode)
}

// Helper Functions for Forms
export function generateCaseNumber() {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `F-${year}-${random}`
}

export function generateHelperNumber() {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `H-${year}-${random}`
}

// Time utilities
export function addHours(date, hours) {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}

export function addMinutes(date, minutes) {
  const result = new Date(date)
  result.setMinutes(result.getMinutes() + minutes)
  return result
}

export function isBusinessDay(date) {
  const day = date.getDay()
  return day !== 0 && day !== 6 // Not Sunday (0) or Saturday (6)
}

export function getBusinessDays(startDate, endDate) {
  let count = 0
  const current = new Date(startDate)
  
  while (current <= endDate) {
    if (isBusinessDay(current)) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  
  return count
}

// Default hourly rates per qualification
export const DEFAULT_HOURLY_RATES = {
  'Familienhelfer': 25.50,
  'Erziehungsbeistand': 28.00,
  'Sozialpädagoge': 32.00,
  'Sozialarbeiter': 30.00,
  'Jugendhelfer': 26.00,
  'Familienpfleger': 24.00
}

// Status display mappings
export const STATUS_LABELS = {
  [CASE_STATUS.OFFEN]: 'Offen',
  [CASE_STATUS.IN_BEARBEITUNG]: 'In Bearbeitung',
  [CASE_STATUS.ABGESCHLOSSEN]: 'Abgeschlossen', 
  [CASE_STATUS.ABGELEHNT]: 'Abgelehnt',
  [CASE_STATUS.WARTEND]: 'Wartend',
  [CASE_STATUS.STORNIERT]: 'Storniert',
  
  [SERVICE_STATUS.DRAFT]: 'Entwurf',
  [SERVICE_STATUS.SUBMITTED]: 'Eingereicht',
  [SERVICE_STATUS.APPROVED]: 'Freigegeben',
  [SERVICE_STATUS.REJECTED]: 'Abgelehnt',
  
  [REPORT_STATUS.DRAFT]: 'Entwurf',
  [REPORT_STATUS.FINAL]: 'Final',
  [REPORT_STATUS.SUBMITTED]: 'Übermittelt'
}