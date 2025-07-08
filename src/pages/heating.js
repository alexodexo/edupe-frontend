// pages/heating.js
import { useState } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import StatusCard from '@/components/StatusCard'
import ModeSelector from '@/components/ModeSelector'
import { useTemperatureData, useWeatherData } from '@/hooks/useRealtimeData'
import {
  FireIcon,
  PowerIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CloudIcon,
  CurrencyEuroIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'

const heatingModes = [
  {
    id: 'on',
    name: 'Vollständig EIN',
    description: 'Normalbetrieb',
    icon: FireIcon,
    details: 'Heizung läuft nach Bedarf',
  },
  {
    id: 'off',
    name: 'Vollständig AUS',
    description: 'Heizung aus',
    icon: PowerIcon,
    details: 'Keine Heizung aktiv',
  },
]

export default function Heating() {
  const { data: tempData, isLoading: tempLoading } = useTemperatureData()
  const { data: weatherData, isLoading: weatherLoading } = useWeatherData()
  
  const [selectedMode, setSelectedMode] = useState('on')
  const [manualReading, setManualReading] = useState({
    date: new Date().toISOString().split('T')[0],
    consumption: '',
  })

  const temperatureStatus = {
    vorlauf: {
      value: tempData?.t2 || 0,
      status: tempData?.t2 > 50 ? 'normal' : 'low',
    },
    ruecklauf: {
      value: tempData?.t3 || 0,
      status: tempData?.t3 > 40 ? 'normal' : 'low',
    },
    outside: {
      value: weatherData?.current?.temperature || 0,
      status: weatherData?.current?.temperature < 0 ? 'frost' : 'normal',
    },
  }

  const costData = {
    today: '4.23',
    week: '28.90',
    month: '125.47',
    year: '1,456.82',
  }

  return (
    <>
      <Head>
        <title>Heizung - Heizungssteuerung</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Heizungs-Steuerung</h1>
          <p className="text-gray-600 mt-1">Kontrolle und Überwachung der Heizungsanlage</p>
        </div>

        {/* Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Betriebsmodus</h2>
          <ModeSelector
            modes={heatingModes}
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
          />
        </motion.div>

        {/* Temperature Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Aktuelle Temperaturen</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vorlauf */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <ArrowUpIcon className="w-6 h-6 text-orange-600" />
                <span className={`status-dot ${temperatureStatus.vorlauf.status === 'normal' ? 'status-active' : 'status-warning'}`} />
              </div>
              <p className="text-sm text-orange-600 mb-1">Vorlauf Temperatur</p>
              <p className="text-3xl font-bold text-orange-700">
                {temperatureStatus.vorlauf.value.toFixed(1)}°C
              </p>
              <p className="text-xs text-orange-600 mt-2">
                Status: {temperatureStatus.vorlauf.status === 'normal' ? 'Normal' : 'Niedrig'}
              </p>
            </div>

            {/* Rücklauf */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <ArrowDownIcon className="w-6 h-6 text-blue-600" />
                <span className={`status-dot ${temperatureStatus.ruecklauf.status === 'normal' ? 'status-active' : 'status-warning'}`} />
              </div>
              <p className="text-sm text-blue-600 mb-1">Rücklauf Temperatur</p>
              <p className="text-3xl font-bold text-blue-700">
                {temperatureStatus.ruecklauf.value.toFixed(1)}°C
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Status: {temperatureStatus.ruecklauf.status === 'normal' ? 'Normal' : 'Niedrig'}
              </p>
            </div>

            {/* Außentemperatur */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <CloudIcon className="w-6 h-6 text-gray-600" />
                <span className={`status-dot ${temperatureStatus.outside.status === 'frost' ? 'status-warning' : 'status-active'}`} />
              </div>
              <p className="text-sm text-gray-600 mb-1">Außentemperatur</p>
              <p className="text-3xl font-bold text-gray-700">
                {temperatureStatus.outside.value.toFixed(1)}°C
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Status: {temperatureStatus.outside.status === 'frost' ? '❄️ Frost' : 'Normal'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Cost Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Heizungskosten</h2>
            <CurrencyEuroIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">€{costData.today}</p>
              <p className="text-sm text-gray-600 mt-1">Heute</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">€{costData.week}</p>
              <p className="text-sm text-gray-600 mt-1">Diese Woche</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">€{costData.month}</p>
              <p className="text-sm text-gray-600 mt-1">Dieser Monat</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">€{costData.year}</p>
              <p className="text-sm text-gray-600 mt-1">Dieses Jahr</p>
            </div>
          </div>
        </motion.div>

        {/* Manual Reading Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Manuelle Verbrauchseingabe</h2>
            <CalendarIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datum der Ablesung
              </label>
              <input
                type="date"
                value={manualReading.date}
                onChange={(e) => setManualReading({ ...manualReading, date: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stromverbrauch (kWh)
              </label>
              <input
                type="number"
                placeholder="z.B. 1250.5"
                value={manualReading.consumption}
                onChange={(e) => setManualReading({ ...manualReading, consumption: e.target.value })}
                className="input"
                step="0.1"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <button className="btn-primary">
              Verbrauch speichern
            </button>
          </div>
        </motion.div>
      </div>
    </>
  )
}