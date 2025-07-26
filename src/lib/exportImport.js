// src/lib/exportImport.js
// Export/Import Utilities für Edupe Digital

import { formatCurrency, formatDateTime, formatDuration } from '@/lib/types'

// Export formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'xlsx',
  JSON: 'json',
  PDF: 'pdf'
}

// Export types
export const EXPORT_TYPES = {
  CASES: 'cases',
  HELPERS: 'helpers',
  SERVICES: 'services',
  REPORTS: 'reports',
  INVOICES: 'invoices',
  FULL_BACKUP: 'full_backup'
}

// CSV Export Class
class CSVExporter {
  constructor() {
    this.delimiter = ','
    this.lineBreak = '\n'
  }

  // Convert array of objects to CSV
  arrayToCSV(data, headers = null) {
    if (!data || data.length === 0) return ''

    // Auto-detect headers if not provided
    const csvHeaders = headers || Object.keys(data[0])
    
    // Escape CSV values
    const escapeCSVValue = (value) => {
      if (value === null || value === undefined) return ''
      
      const stringValue = String(value)
      
      // If value contains comma, quote, or newline, wrap in quotes and escape quotes
      if (stringValue.includes(this.delimiter) || 
          stringValue.includes('"') || 
          stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      
      return stringValue
    }

    // Build CSV content
    const csvContent = [
      // Headers
      csvHeaders.map(escapeCSVValue).join(this.delimiter),
      // Data rows
      ...data.map(row => 
        csvHeaders.map(header => escapeCSVValue(row[header])).join(this.delimiter)
      )
    ].join(this.lineBreak)

    return csvContent
  }

  // Download CSV file
  downloadCSV(data, filename, headers = null) {
    const csvContent = this.arrayToCSV(data, headers)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    this.downloadBlob(blob, `${filename}.csv`)
  }

  // Helper method to download blob
  downloadBlob(blob, filename) {
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }
}

// JSON Export Class
class JSONExporter {
  // Download JSON file
  downloadJSON(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.json`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  // Create backup data structure
  createBackup(cases, helpers, services, reports, invoices) {
    return {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        system: 'Edupe Digital'
      },
      data: {
        cases: cases || [],
        helpers: helpers || [],
        services: services || [],
        reports: reports || [],
        invoices: invoices || []
      }
    }
  }
}

// PDF Export Class (using browser print API)
class PDFExporter {
  // Generate PDF from HTML content
  async generatePDF(htmlContent, filename, options = {}) {
    const printWindow = window.open('', '_blank')
    
    const defaultStyles = `
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .header { text-align: center; margin-bottom: 30px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        @media print { body { margin: 0; } }
      </style>
    `

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          ${defaultStyles}
          ${options.customStyles || ''}
        </head>
        <body>
          <div class="header">
            <h1>${options.title || filename}</h1>
            <p>Erstellt am: ${formatDateTime(new Date().toISOString())}</p>
          </div>
          ${htmlContent}
          <div class="footer">
            <p>Generiert von Edupe Digital</p>
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  // Create report HTML
  createReportHTML(data, type) {
    switch (type) {
      case EXPORT_TYPES.CASES:
        return this.createCasesHTML(data)
      case EXPORT_TYPES.HELPERS:
        return this.createHelpersHTML(data)
      case EXPORT_TYPES.SERVICES:
        return this.createServicesHTML(data)
      default:
        return '<p>Unbekannter Report-Typ</p>'
    }
  }

  createCasesHTML(cases) {
    return `
      <table>
        <thead>
          <tr>
            <th>Fall-Nr.</th>
            <th>Titel</th>
            <th>Status</th>
            <th>Jugendamt</th>
            <th>Helfer</th>
            <th>Startdatum</th>
            <th>Stunden</th>
          </tr>
        </thead>
        <tbody>
          ${cases.map(case_ => `
            <tr>
              <td>${case_.caseNumber}</td>
              <td>${case_.title}</td>
              <td>${case_.status}</td>
              <td>${case_.jugendamt?.name || ''}</td>
              <td>${case_.assignedHelpersData?.map(h => `${h.firstName} ${h.lastName}`).join(', ') || ''}</td>
              <td>${new Date(case_.startDate).toLocaleDateString('de-DE')}</td>
              <td>${case_.usedHours || 0}h</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  }

  createHelpersHTML(helpers) {
    return `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>E-Mail</th>
            <th>Telefon</th>
            <th>Qualifikationen</th>
            <th>Verfügbarkeit</th>
            <th>Bewertung</th>
            <th>Aktive Fälle</th>
          </tr>
        </thead>
        <tbody>
          ${helpers.map(helper => `
            <tr>
              <td>${helper.firstName} ${helper.lastName}</td>
              <td>${helper.email}</td>
              <td>${helper.phone}</td>
              <td>${helper.qualifications?.join(', ') || ''}</td>
              <td>${helper.availability}</td>
              <td>${helper.rating}</td>
              <td>${helper.activeCases || 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  }

  createServicesHTML(services) {
    return `
      <table>
        <thead>
          <tr>
            <th>Datum</th>
            <th>Helfer</th>
            <th>Fall</th>
            <th>Dauer</th>
            <th>Typ</th>
            <th>Status</th>
            <th>Kosten</th>
          </tr>
        </thead>
        <tbody>
          ${services.map(service => `
            <tr>
              <td>${new Date(service.date).toLocaleDateString('de-DE')}</td>
              <td>${service.helper?.firstName} ${service.helper?.lastName}</td>
              <td>${service.case?.caseNumber}</td>
              <td>${formatDuration(service.duration)}</td>
              <td>${service.type}</td>
              <td>${service.status}</td>
              <td>${formatCurrency(service.costs)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  }
}

// Import Class
class DataImporter {
  constructor() {
    this.supportedFormats = ['.csv', '.json', '.xlsx']
  }

  // Parse CSV file
  parseCSV(csvText, delimiter = ',') {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length === 0) return []

    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''))
    const data = []

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i], delimiter)
      if (values.length === headers.length) {
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index]
        })
        data.push(row)
      }
    }

    return data
  }

  // Parse CSV line handling quotes and commas
  parseCSVLine(line, delimiter = ',') {
    const result = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  // Parse JSON file
  parseJSON(jsonText) {
    try {
      return JSON.parse(jsonText)
    } catch (error) {
      throw new Error('Ungültiges JSON-Format')
    }
  }

  // Read file content
  async readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        resolve(e.target.result)
      }
      
      reader.onerror = () => {
        reject(new Error('Fehler beim Lesen der Datei'))
      }
      
      reader.readAsText(file)
    })
  }

  // Validate import data
  validateData(data, type) {
    const errors = []
    
    if (!Array.isArray(data)) {
      errors.push('Daten müssen als Array vorliegen')
      return { isValid: false, errors }
    }

    if (data.length === 0) {
      errors.push('Keine Daten zum Importieren gefunden')
      return { isValid: false, errors }
    }

    // Type-specific validation
    switch (type) {
      case EXPORT_TYPES.HELPERS:
        return this.validateHelpers(data)
      case EXPORT_TYPES.CASES:
        return this.validateCases(data)
      case EXPORT_TYPES.SERVICES:
        return this.validateServices(data)
      default:
        return { isValid: true, errors: [] }
    }
  }

  validateHelpers(helpers) {
    const errors = []
    const requiredFields = ['firstName', 'lastName', 'email']

    helpers.forEach((helper, index) => {
      requiredFields.forEach(field => {
        if (!helper[field]) {
          errors.push(`Zeile ${index + 1}: ${field} ist erforderlich`)
        }
      })

      // Email validation
      if (helper.email && !this.isValidEmail(helper.email)) {
        errors.push(`Zeile ${index + 1}: Ungültige E-Mail-Adresse`)
      }
    })

    return { isValid: errors.length === 0, errors }
  }

  validateCases(cases) {
    const errors = []
    const requiredFields = ['title', 'jugendamt']

    cases.forEach((case_, index) => {
      requiredFields.forEach(field => {
        if (!case_[field]) {
          errors.push(`Zeile ${index + 1}: ${field} ist erforderlich`)
        }
      })
    })

    return { isValid: errors.length === 0, errors }
  }

  validateServices(services) {
    const errors = []
    const requiredFields = ['date', 'duration', 'helperId', 'caseId']

    services.forEach((service, index) => {
      requiredFields.forEach(field => {
        if (!service[field]) {
          errors.push(`Zeile ${index + 1}: ${field} ist erforderlich`)
        }
      })

      // Date validation
      if (service.date && !this.isValidDate(service.date)) {
        errors.push(`Zeile ${index + 1}: Ungültiges Datum`)
      }

      // Duration validation
      if (service.duration && (isNaN(service.duration) || service.duration <= 0)) {
        errors.push(`Zeile ${index + 1}: Ungültige Dauer`)
      }
    })

    return { isValid: errors.length === 0, errors }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  isValidDate(dateString) {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date)
  }
}

// Main Export/Import Manager
export class ExportImportManager {
  constructor() {
    this.csvExporter = new CSVExporter()
    this.jsonExporter = new JSONExporter()
    this.pdfExporter = new PDFExporter()
    this.importer = new DataImporter()
  }

  // Export data in specified format
  async exportData(data, type, format, filename = null) {
    const defaultFilename = filename || `${type}_${new Date().toISOString().split('T')[0]}`

    switch (format) {
      case EXPORT_FORMATS.CSV:
        return this.exportToCSV(data, type, defaultFilename)
      case EXPORT_FORMATS.JSON:
        return this.exportToJSON(data, type, defaultFilename)
      case EXPORT_FORMATS.PDF:
        return this.exportToPDF(data, type, defaultFilename)
      default:
        throw new Error('Nicht unterstütztes Export-Format')
    }
  }

  exportToCSV(data, type, filename) {
    const headers = this.getCSVHeaders(type)
    const formattedData = this.formatDataForCSV(data, type)
    this.csvExporter.downloadCSV(formattedData, filename, headers)
  }

  exportToJSON(data, type, filename) {
    const exportData = {
      type,
      exportDate: new Date().toISOString(),
      data: data
    }
    this.jsonExporter.downloadJSON(exportData, filename)
  }

  async exportToPDF(data, type, filename) {
    const htmlContent = this.pdfExporter.createReportHTML(data, type)
    await this.pdfExporter.generatePDF(htmlContent, filename, {
      title: this.getPDFTitle(type)
    })
  }

  // Get CSV headers for different data types
  getCSVHeaders(type) {
    switch (type) {
      case EXPORT_TYPES.CASES:
        return [
          'caseNumber', 'title', 'status', 'priority', 'jugendamt', 
          'startDate', 'plannedHours', 'usedHours', 'assignedHelpers'
        ]
      case EXPORT_TYPES.HELPERS:
        return [
          'firstName', 'lastName', 'email', 'phone', 'address', 
          'qualifications', 'availability', 'hourlyRate', 'rating'
        ]
      case EXPORT_TYPES.SERVICES:
        return [
          'date', 'startTime', 'endTime', 'duration', 'type', 'location',
          'description', 'status', 'costs', 'helperName', 'caseNumber'
        ]
      default:
        return []
    }
  }

  // Format data for CSV export
  formatDataForCSV(data, type) {
    switch (type) {
      case EXPORT_TYPES.CASES:
        return data.map(case_ => ({
          caseNumber: case_.caseNumber,
          title: case_.title,
          status: case_.status,
          priority: case_.priority,
          jugendamt: case_.jugendamt?.name || '',
          startDate: case_.startDate,
          plannedHours: case_.plannedHours,
          usedHours: case_.usedHours,
          assignedHelpers: case_.assignedHelpersData?.map(h => `${h.firstName} ${h.lastName}`).join('; ') || ''
        }))
      
      case EXPORT_TYPES.HELPERS:
        return data.map(helper => ({
          firstName: helper.firstName,
          lastName: helper.lastName,
          email: helper.email,
          phone: helper.phone,
          address: `${helper.address?.street}, ${helper.address?.zipCode} ${helper.address?.city}`,
          qualifications: helper.qualifications?.join('; ') || '',
          availability: helper.availability,
          hourlyRate: helper.hourlyRate,
          rating: helper.rating
        }))
      
      case EXPORT_TYPES.SERVICES:
        return data.map(service => ({
          date: service.date,
          startTime: service.startTime,
          endTime: service.endTime,
          duration: service.duration,
          type: service.type,
          location: service.location,
          description: service.description,
          status: service.status,
          costs: service.costs,
          helperName: `${service.helper?.firstName} ${service.helper?.lastName}`,
          caseNumber: service.case?.caseNumber
        }))
      
      default:
        return data
    }
  }

  getPDFTitle(type) {
    switch (type) {
      case EXPORT_TYPES.CASES:
        return 'Fälle-Report'
      case EXPORT_TYPES.HELPERS:
        return 'Helfer-Report'
      case EXPORT_TYPES.SERVICES:
        return 'Leistungen-Report'
      default:
        return 'Daten-Export'
    }
  }

  // Import data from file
  async importData(file, type) {
    try {
      const fileExtension = file.name.toLowerCase().split('.').pop()
      const content = await this.importer.readFile(file)
      
      let data
      switch (fileExtension) {
        case 'csv':
          data = this.importer.parseCSV(content)
          break
        case 'json':
          const jsonData = this.importer.parseJSON(content)
          data = jsonData.data || jsonData
          break
        default:
          throw new Error('Nicht unterstütztes Dateiformat')
      }

      // Validate data
      const validation = this.importer.validateData(data, type)
      if (!validation.isValid) {
        throw new Error(`Validierungsfehler:\n${validation.errors.join('\n')}`)
      }

      return {
        success: true,
        data: data,
        count: data.length
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Create full system backup
  createFullBackup(allData) {
    const backup = this.jsonExporter.createBackup(
      allData.cases,
      allData.helpers, 
      allData.services,
      allData.reports,
      allData.invoices
    )
    
    const filename = `edupe_backup_${new Date().toISOString().split('T')[0]}`
    this.jsonExporter.downloadJSON(backup, filename)
  }
}

// Create singleton instance
export const exportImportManager = new ExportImportManager()

// Convenience functions
export const exportToPDF = (data, type, filename) => 
  exportImportManager.exportToPDF(data, type, filename)

export const exportToCSV = (data, type, filename) => 
  exportImportManager.exportToCSV(data, type, filename)

export const exportToJSON = (data, type, filename) => 
  exportImportManager.exportToJSON(data, type, filename)

export const importFromFile = (file, type) => 
  exportImportManager.importData(file, type)

export const createBackup = (allData) => 
  exportImportManager.createFullBackup(allData)

// Export format options for UI
export const exportFormatOptions = [
  { value: EXPORT_FORMATS.CSV, label: 'CSV (Excel)', icon: '📊' },
  { value: EXPORT_FORMATS.JSON, label: 'JSON (Backup)', icon: '💾' },
  { value: EXPORT_FORMATS.PDF, label: 'PDF (Report)', icon: '📄' }
]

// Export type options for UI  
export const exportTypeOptions = [
  { value: EXPORT_TYPES.CASES, label: 'Fälle' },
  { value: EXPORT_TYPES.HELPERS, label: 'Helfer' },
  { value: EXPORT_TYPES.SERVICES, label: 'Leistungen' },
  { value: EXPORT_TYPES.REPORTS, label: 'Berichte' },
  { value: EXPORT_TYPES.INVOICES, label: 'Rechnungen' },
  { value: EXPORT_TYPES.FULL_BACKUP, label: 'Vollständiges Backup' }
]