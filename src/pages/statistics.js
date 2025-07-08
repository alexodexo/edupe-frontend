// pages/statistics.js
import { useState } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline'

const timeRanges = [
  { value: '10h', label: 'Letzte 10 Stunden' },
  { value: '24h', label: 'Letzte 24 Stunden' },
  { value: '7d', label: 'Letzte 7 Tage' },
  { value: '30d', label: 'Letzte 30 Tage' },
  { value: '365d', label: 'Letzte 365 Tage' },
]

export default function Statistics() {
  const [selectedRange, setSelectedRange] = useState('24h')

  const costAnalysis = [
    { period: 'Letzte 24h', costPerDegree: '€0.12', totalWarmwater: '€2.45', totalHeating: '€4.23' },
    { period: 'Letzte 7 Tage', costPerDegree: '€0.11', totalWarmwater: '€15.30', totalHeating: '€28.90' },
    { period: 'Letzte 30 Tage', costPerDegree: '€0.13', totalWarmwater: '€68.20', totalHeating: '€125.47' },
  ]

  return (
    <>
      <Head>
        <title>Statistiken - Heizungssteuerung</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistiken</h1>
          <p className="text-gray-600 mt-1">Detaillierte Analyse und Auswertungen</p>
        </div>

        {/* Time Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Zeitraum auswählen</h2>
            <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedRange(range.value)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedRange === range.value
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Power Consumption Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Stromverbrauch & Kosten</h2>
            <ChartBarIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-6">
            {/* Warmwater Chart Placeholder */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Warmwasser</h3>
              <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <ChartBarIcon className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                  <p className="text-blue-600 font-medium">Stromverbrauch & Kosten Warmwasser</p>
                  <p className="text-blue-500 text-sm mt-1">Chart wird geladen...</p>
                </div>
              </div>
            </div>

            {/* Heating Chart Placeholder */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Heizung</h3>
              <div className="h-64 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <ChartBarIcon className="w-12 h-12 text-orange-400 mx-auto mb-2" />
                  <p className="text-orange-600 font-medium">Stromverbrauch & Kosten Heizung</p>
                  <p className="text-orange-500 text-sm mt-1">Chart wird geladen...</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Temperature History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Temperaturverläufe</h2>
          
          <div className="h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <DocumentChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Verlauf aller drei Temperatursensoren</p>
              <p className="text-gray-500 text-sm mt-1">Warmwasser • Vorlauf • Rücklauf</p>
            </div>
          </div>
        </motion.div>

        {/* Cost Analysis Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card overflow-hidden"
        >
          <div className="px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600">
            <h2 className="text-lg font-semibold text-white">Kostenanalyse</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zeitraum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kosten pro 1°C
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gesamt Warmwasser
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gesamt Heizung
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {costAnalysis.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{row.period}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.costPerDegree}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.totalWarmwater}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.totalHeating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Export Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Export-Funktionen</h2>
            <ArrowDownTrayIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Datenexport</h3>
              <p className="text-sm text-gray-600 mb-4">Exportieren Sie alle erfassten Daten:</p>
              <div className="flex gap-3">
                <button className="btn-primary">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Als CSV exportieren
                </button>
                <button className="btn-secondary">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Als PDF exportieren
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Monatliche Zusammenfassung</h3>
              <p className="text-sm text-gray-600 mb-2">Automatischer Export enthält:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Durchschnittswerte aller Temperaturfühler</li>
                <li>Kumulierte Stromkosten</li>
                <li>Verbrauchsstatistiken</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}