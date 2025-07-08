// pages/index.js
import Head from 'next/head'
import React from 'react'
import { motion } from 'framer-motion'
import StatusCard from '@/components/StatusCard'
import { useEM3Data, useTemperatureData, useWeatherData } from '@/hooks/useRealtimeData'
import {
  BeakerIcon,
  FireIcon,
  SunIcon,
  BoltIcon,
  CurrencyEuroIcon,
  CloudIcon,
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const { data: em3Data, isLoading: em3Loading } = useEM3Data()
  const { data: tempData, isLoading: tempLoading } = useTemperatureData()
  const { data: weatherData, isLoading: weatherLoading } = useWeatherData()

  // Calculate daily costs (example calculation)
  const calculateDailyCost = () => {
    if (!em3Data) return '0.00'
    const kWh = (em3Data.total_power || 0) / 1000 * 24 // Rough estimate
    const cost = kWh * 0.25 // 0.25€ per kWh
    return cost.toFixed(2)
  }

  // Status data for overview table
  const statusItems = [
    {
      category: 'Warmwasser-Betrieb',
      items: [
        {
          name: 'Warmwasser Nachtabsenkung',
          status: 'active',
          function: 'von 22:30 Uhr bis 05:30 Uhr',
          details: 'nächste Änderung: 22:30 Uhr',
        },
        {
          name: 'Warmwasser Überschuss-Strom',
          status: 'active',
          function: 'PV Anlage produzierter Überschuss Strom',
          details: `aktiv, wird aktuell mit ${em3Data?.total_power || 0} Watt genutzt`,
        },
        {
          name: 'Warmwasser Sonnen Forecast',
          status: weatherData?.todaySunshinePercentage > 70 ? 'active' : 'warning',
          function: 'Temperaturreduzierung von -3°C aktiv',
          details: `${weatherData?.todaySunshinePercentage || 0}% Sonnenschein erwartet`,
        },
      ],
    },
    {
      category: 'Heizungs-Betrieb',
      items: [
        {
          name: 'Heizung',
          status: 'warning',
          function: 'aktuelle Nutzung: 0 Watt',
          details: 'bis heute pro Tag 3,88 kWh - 0,95 € verbraucht',
        },
        {
          name: 'Heizung Nachtabsenkung',
          status: 'active',
          function: 'von 21:30 Uhr bis 06:00 Uhr',
          details: 'nächste Änderung: 21:30 Uhr',
        },
        {
          name: 'Heizung Wetter Forecast',
          status: 'active',
          function: 'Temperaturreduzierung Vorlauf von -5°C aktiv',
          details: `aktiv, ${weatherData?.todaySunshinePercentage || 0}% Sonnenschein bei ${weatherData?.current?.temperature || 0}°C erwartet`,
        },
      ],
    },
  ]

  return (
    <>
      <Head>
        <title>Dashboard - Heizungssteuerung</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Übersicht aller Systeme</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatusCard
            title="Warmwasser"
            value={tempData?.t1?.toFixed(1) || '--'}
            unit="°C"
            icon={BeakerIcon}
            color="primary"
            loading={tempLoading}
          />
          <StatusCard
            title="Vorlauf Heizung"
            value={tempData?.t2?.toFixed(1) || '--'}
            unit="°C"
            icon={FireIcon}
            color="warning"
            loading={tempLoading}
          />
          <StatusCard
            title="Wetter"
            value={`${weatherData?.todaySunshinePercentage || '--'}%`}
            unit="☀️"
            icon={SunIcon}
            color="success"
            loading={weatherLoading}
          />
          <StatusCard
            title="Außentemperatur"
            value={weatherData?.current?.temperature?.toFixed(1) || '--'}
            unit="°C"
            icon={CloudIcon}
            color="primary"
            loading={weatherLoading}
          />
          <StatusCard
            title="Heutige Kosten"
            value={`€${calculateDailyCost()}`}
            icon={CurrencyEuroIcon}
            color="error"
            loading={em3Loading}
          />
        </div>

        {/* Current Power Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Aktueller Stromverbrauch</h2>
            <BoltIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          {em3Loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4">
                <p className="text-sm text-primary-600 mb-1">Gesamt</p>
                <p className="text-2xl font-bold text-primary-700">
                  {em3Data?.total_power?.toFixed(0) || 0} W
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Phase A</p>
                <p className="text-xl font-semibold text-gray-700">
                  {em3Data?.a_power?.toFixed(0) || 0} W
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Phase B</p>
                <p className="text-xl font-semibold text-gray-700">
                  {em3Data?.b_power?.toFixed(0) || 0} W
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Phase C</p>
                <p className="text-xl font-semibold text-gray-700">
                  {em3Data?.c_power?.toFixed(0) || 0} W
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Status Overview Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card overflow-hidden"
        >
          <div className="px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600">
            <h2 className="text-lg font-semibold text-white">Übersicht der Funktionen</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Betrieb
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funktion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statusItems.map((category) => (
                  <React.Fragment key={category.category}>
                    <tr className="bg-gray-50">
                      <td colSpan="4" className="px-6 py-2 text-sm font-medium text-gray-700">
                        {category.category}
                      </td>
                    </tr>
                    {category.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`status-dot ${
                              item.status === 'active'
                                ? 'status-active'
                                : item.status === 'warning'
                                ? 'status-warning'
                                : 'status-inactive'
                            }`}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.function}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.details}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </>
  )
}