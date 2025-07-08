// pages/warmwater.js
import { useState } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import ModeSelector from '@/components/ModeSelector'
import TemperatureControl from '@/components/TemperatureControl'
import StatusCard from '@/components/StatusCard'
import { useTemperatureData, useWeatherData } from '@/hooks/useRealtimeData'
import {
  BeakerIcon,
  SunIcon,
  BoltIcon,
  PowerIcon,
  FireIcon,
  CurrencyEuroIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

const operationModes = [
  {
    id: 'normal',
    name: 'Normalbetrieb + PV-Strom',
    description: 'Temperaturbereich mit Überschuss',
    icon: BeakerIcon,
    details: 'Standard-Modus mit PV-Unterstützung',
  },
  {
    id: 'full',
    name: 'Vollständig EIN',
    description: 'Dauerhaft 10V bis 70°C',
    icon: PowerIcon,
    details: 'Maximale Heizleistung',
  },
  {
    id: 'pv-only',
    name: 'Nur PV-Strom',
    description: 'Ausschließlich Überschussstrom',
    icon: SunIcon,
    details: 'Umweltfreundlicher Betrieb',
  },
  {
    id: '3kw',
    name: '3KW Power',
    description: '20min wird die 3KW Heizung genutzt',
    icon: FireIcon,
    details: 'Schnellaufheizung',
  },
  {
    id: 'off',
    name: 'Vollständig AUS',
    description: 'Heizstab komplett aus',
    icon: PowerIcon,
    details: 'Keine Heizung aktiv',
  },
]

export default function Warmwater() {
  const { data: tempData, isLoading: tempLoading } = useTemperatureData()
  const { data: weatherData, isLoading: weatherLoading } = useWeatherData()
  
  const [selectedMode, setSelectedMode] = useState('normal')
  const [einschaltTemp, setEinschaltTemp] = useState(45)
  const [ausschaltTemp, setAusschaltTemp] = useState(53)
  const [sunshineEnabled, setSunshineEnabled] = useState(true)
  const [sunshineReduction, setSunshineReduction] = useState(3)
  const [sunshineThreshold, setSunshineThreshold] = useState(70)
  const [timeControlEnabled, setTimeControlEnabled] = useState(true)
  const [nightReduction, setNightReduction] = useState(5.5)
  
  // Months for sunshine control
  const months = ['März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober']
  const [activeMonths, setActiveMonths] = useState(months)
  
  // Time schedule (simplified for demo)
  const [schedule, setSchedule] = useState({
    Mo: { start: 22.5, end: 5.5 },
    Di: { start: 22.5, end: 5.5 },
    Mi: { start: 22.5, end: 5.5 },
    Do: { start: 22.5, end: 5.5 },
    Fr: { start: 22.5, end: 5.5 },
    Sa: { start: 23, end: 7 },
    So: { start: 23, end: 7 },
  })

  return (
    <>
      <Head>
        <title>Warmwasser - Heizungssteuerung</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warmwasser-Steuerung</h1>
          <p className="text-gray-600 mt-1">Optimierte Warmwasserbereitung mit PV-Integration</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusCard
            title="Warmwasser"
            value={tempData?.t1?.toFixed(1) || '--'}
            unit="°C"
            icon={BeakerIcon}
            color="primary"
            loading={tempLoading}
          />
          <StatusCard
            title="Wetter Forecast"
            value={`${weatherData?.todaySunshinePercentage || '--'}%`}
            unit="☀️"
            icon={SunIcon}
            color="success"
            loading={weatherLoading}
          />
          <StatusCard
            title="Kosten heute"
            value="€4.23"
            icon={CurrencyEuroIcon}
            color="warning"
          />
          <StatusCard
            title="Kosten 24h"
            value="€8.50"
            icon={CurrencyEuroIcon}
            color="error"
          />
        </div>

        {/* Operation Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Betriebsmodus wählen</h2>
          <ModeSelector
            modes={operationModes}
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
          />
        </motion.div>

        {/* Temperature Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Temperatur-Einstellungen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TemperatureControl
              label="Einschalttemperatur"
              value={einschaltTemp}
              onChange={setEinschaltTemp}
              min={30}
              max={55}
            />
            <TemperatureControl
              label="Ausschalttemperatur"
              value={ausschaltTemp}
              onChange={setAusschaltTemp}
              min={40}
              max={70}
            />
          </div>
        </motion.div>

        {/* Sunshine Control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sonnenabhängige Warmwassersteuerung</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sunshineEnabled}
                onChange={(e) => setSunshineEnabled(e.target.checked)}
                className="sr-only"
              />
              <div className={`switch ${sunshineEnabled ? 'switch-checked' : ''}`}>
                <span className={`switch-thumb ${sunshineEnabled ? 'switch-thumb-checked' : ''}`} />
              </div>
              <span className="text-sm text-gray-700">Aktiviert</span>
            </label>
          </div>

          {sunshineEnabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reduzierung um (°C)
                  </label>
                  <input
                    type="number"
                    value={sunshineReduction}
                    onChange={(e) => setSunshineReduction(Number(e.target.value))}
                    className="input"
                    min="0"
                    max="10"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ab Sonnenschein (%)
                  </label>
                  <input
                    type="number"
                    value={sunshineThreshold}
                    onChange={(e) => setSunshineThreshold(Number(e.target.value))}
                    className="input"
                    min="0"
                    max="100"
                    step="5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aktive Monate
                </label>
                <div className="flex flex-wrap gap-2">
                  {months.map((month) => (
                    <button
                      key={month}
                      onClick={() => {
                        setActiveMonths(prev =>
                          prev.includes(month)
                            ? prev.filter(m => m !== month)
                            : [...prev, month]
                        )
                      }}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        activeMonths.includes(month)
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Time Control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Zeitsteuerung</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={timeControlEnabled}
                onChange={(e) => setTimeControlEnabled(e.target.checked)}
                className="sr-only"
              />
              <div className={`switch ${timeControlEnabled ? 'switch-checked' : ''}`}>
                <span className={`switch-thumb ${timeControlEnabled ? 'switch-thumb-checked' : ''}`} />
              </div>
              <span className="text-sm text-gray-700">Aktiviert</span>
            </label>
          </div>

          {timeControlEnabled && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-4">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  Aktuelle Nachtabsenkung: {nightReduction}°C
                </p>
                <div className="space-y-2">
                  {Object.entries(schedule).map(([day, times]) => (
                    <div key={day} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{day}</span>
                      <span className="text-gray-600">
                        {times.start.toFixed(1).replace('.5', ':30')} - {times.end.toFixed(1).replace('.5', ':30')} Uhr
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Temperaturreduzierung während Nachtabsenkung:
                </label>
                <input
                  type="number"
                  value={nightReduction}
                  onChange={(e) => setNightReduction(Number(e.target.value))}
                  className="input w-20"
                  min="0"
                  max="10"
                  step="0.5"
                />
                <span className="text-sm text-gray-500">°C</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button className="btn-secondary">
            Zurücksetzen
          </button>
          <button className="btn-primary">
            Einstellungen speichern
          </button>
        </div>
      </div>
    </>
  )
}