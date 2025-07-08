// pages/system.js
import { useState } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { useTemperatureData, useWeatherData } from '@/hooks/useRealtimeData'
import {
  Cog6ToothIcon,
  CurrencyEuroIcon,
  MapPinIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CloudIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'

export default function System() {
  const { data: tempData } = useTemperatureData()
  const { data: weatherData } = useWeatherData()

  const [calibration, setCalibration] = useState({
    sensor1: 0.0,
    sensor2: -0.5,
    sensor3: 0.2,
  })

  const [strompreis, setStrompreis] = useState(0.25)
  const [location, setLocation] = useState({
    latitude: 50.1109,
    longitude: 8.6821,
  })

  const [weatherControl, setWeatherControl] = useState({
    enabled: true,
    sunReduction: 3,
    sunThreshold: 70,
    coldIncrease: 2,
    coldThreshold: -5,
    extremeColdIncrease: 5,
    extremeColdThreshold: -15,
  })

  const [dataRetention, setDataRetention] = useState('2')

  const sensorStatus = [
    { name: 'Warmwasser', type: 'Temperaturfühler 1', value: tempData?.t1, calibration: calibration.sensor1 },
    { name: 'Vorlauf Heizung', type: 'Temperaturfühler 2', value: tempData?.t2, calibration: calibration.sensor2 },
    { name: 'Rücklauf Heizung', type: 'Temperaturfühler 3', value: tempData?.t3, calibration: calibration.sensor3 },
  ]

  const forecast = [
    { day: 'Heute', icon: '☀️', temp: weatherData?.current?.temperature || 0, sunshine: weatherData?.todaySunshinePercentage || 0 },
    { day: 'Morgen', icon: '⛅', temp: 1, sunshine: 45 },
    { day: 'Übermorgen', icon: '🌧️', temp: 3, sunshine: 10 },
    { day: 'Donnerstag', icon: '❄️', temp: -5, sunshine: 20 },
  ]

  return (
    <>
      <Head>
        <title>System - Heizungssteuerung</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Systemeinstellungen</h1>
          <p className="text-gray-600 mt-1">Konfiguration und Verwaltung</p>
        </div>

        {/* Temperature Sensor Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Temperaturfühler Konfiguration</h2>
            <WrenchScrewdriverIcon className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sensorStatus.map((sensor, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-1">{sensor.type}</h3>
                <p className="text-sm text-gray-600 mb-3">"{sensor.name}"</p>
                
                <div className="temp-display mb-3">
                  {sensor.value?.toFixed(1) || '--'}°C
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Kalibrierung (Offset °C)</label>
                  <input
                    type="number"
                    value={sensor.calibration}
                    onChange={(e) => {
                      const newCalibration = { ...calibration }
                      newCalibration[`sensor${index + 1}`] = Number(e.target.value)
                      setCalibration(newCalibration)
                    }}
                    className="input text-sm"
                    step="0.1"
                  />
                </div>
                
                <div className="mt-3 flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-success" />
                  <span className="text-xs text-gray-600">Online</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Electricity Price */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Strompreis Konfiguration</h2>
            <CurrencyEuroIcon className="w-5 h-5 text-gray-400" />
          </div>

          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aktueller Strompreis (€/kWh)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={strompreis}
                onChange={(e) => setStrompreis(Number(e.target.value))}
                className="input"
                step="0.01"
              />
              <span className="text-gray-500">€/kWh</span>
            </div>
            
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Info:</strong> Dieser Wert wird für alle Kostenberechnungen verwendet.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Weather Forecast Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Wetter-Forecast Konfiguration</h2>
            <CloudIcon className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Standort</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Latitude</label>
                  <input
                    type="number"
                    value={location.latitude}
                    onChange={(e) => setLocation({ ...location, latitude: Number(e.target.value) })}
                    className="input"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Longitude</label>
                  <input
                    type="number"
                    value={location.longitude}
                    onChange={(e) => setLocation({ ...location, longitude: Number(e.target.value) })}
                    className="input"
                    step="0.0001"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">7-Tage Wettervorhersage</h3>
              <div className="space-y-2">
                {forecast.map((day, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{day.day}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{day.icon}</span>
                      <span className="text-sm text-gray-600">{day.temp}°C</span>
                      <span className="text-sm text-gray-500">{day.sunshine}% ☀️</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Weather-based Control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Wetterbasierte Steuerung</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={weatherControl.enabled}
                onChange={(e) => setWeatherControl({ ...weatherControl, enabled: e.target.checked })}
                className="sr-only"
              />
              <div className={`switch ${weatherControl.enabled ? 'switch-checked' : ''}`}>
                <span className={`switch-thumb ${weatherControl.enabled ? 'switch-thumb-checked' : ''}`} />
              </div>
              <span className="text-sm text-gray-700">Aktiviert</span>
            </label>
          </div>

          {weatherControl.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Temperaturreduzierung bei Sonnenschein</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Reduzierung um (°C)</label>
                    <input
                      type="number"
                      value={weatherControl.sunReduction}
                      onChange={(e) => setWeatherControl({ ...weatherControl, sunReduction: Number(e.target.value) })}
                      className="input"
                      min="0"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Ab Sonnenschein (%)</label>
                    <input
                      type="number"
                      value={weatherControl.sunThreshold}
                      onChange={(e) => setWeatherControl({ ...weatherControl, sunThreshold: Number(e.target.value) })}
                      className="input"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Temperaturerhöhung bei Kälte</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Erhöhung um (°C)</label>
                    <input
                      type="number"
                      value={weatherControl.coldIncrease}
                      onChange={(e) => setWeatherControl({ ...weatherControl, coldIncrease: Number(e.target.value) })}
                      className="input"
                      min="0"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Ab Außentemperatur (°C)</label>
                    <input
                      type="number"
                      value={weatherControl.coldThreshold}
                      onChange={(e) => setWeatherControl({ ...weatherControl, coldThreshold: Number(e.target.value) })}
                      className="input"
                      min="-30"
                      max="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Datenmanagement</h2>
            <TrashIcon className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Automatische Löschung</h3>
              <label className="block text-sm text-gray-600 mb-2">
                Daten automatisch löschen nach:
              </label>
              <select
                value={dataRetention}
                onChange={(e) => setDataRetention(e.target.value)}
                className="input"
              >
                <option value="1">1 Jahr</option>
                <option value="2">2 Jahre</option>
                <option value="3">3 Jahre</option>
                <option value="5">5 Jahre</option>
                <option value="0">Niemals automatisch löschen</option>
              </select>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Manuelle Löschung</h3>
              <div className="p-3 bg-red-50 rounded-lg mb-3">
                <p className="text-sm text-red-700 flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Achtung:</strong> Diese Aktion kann nicht rückgängig gemacht werden!</span>
                </p>
              </div>
              <button className="btn bg-red-500 text-white hover:bg-red-600">
                <TrashIcon className="w-4 h-4" />
                Alle Daten jetzt löschen
              </button>
            </div>
          </div>
        </motion.div>

        {/* System Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-end gap-4"
        >
          <button className="btn-secondary">
            <ArrowPathIcon className="w-4 h-4" />
            Auf Werkseinstellungen zurücksetzen
          </button>
          <button className="btn-primary">
            <Cog6ToothIcon className="w-4 h-4" />
            Einstellungen speichern
          </button>
        </motion.div>
      </div>
    </>
  )
}