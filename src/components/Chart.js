// components/Chart.js
import { useEffect, useRef } from 'react'

export function TemperatureChart({ data, loading }) {
  if (loading || !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="text-gray-500 text-sm mt-2">Lade Temperaturdaten...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">📊</span>
        </div>
        <p className="text-blue-600 font-medium">Temperatur-Chart</p>
        <p className="text-blue-500 text-sm mt-1">
          {data?.labels?.length || 0} Datenpunkte verfügbar
        </p>
        <div className="mt-3 text-xs text-blue-400">
          <p>Warmwasser: {data?.warmwater?.length || 0} Werte</p>
          <p>Vorlauf: {data?.vorlauf?.length || 0} Werte</p>
          <p>Rücklauf: {data?.ruecklauf?.length || 0} Werte</p>
        </div>
      </div>
    </div>
  )
}

export function PowerChart({ data, loading, type = 'line' }) {
  if (loading || !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="text-gray-500 text-sm mt-2">Lade Verbrauchsdaten...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">⚡</span>
        </div>
        <p className="text-green-600 font-medium">Stromverbrauch-Chart</p>
        <p className="text-green-500 text-sm mt-1">
          {data?.labels?.length || 0} Datenpunkte verfügbar
        </p>
        <div className="mt-3 text-xs text-green-400">
          <p>Typ: {type}</p>
          <p>Werte: {data?.values?.length || 0}</p>
        </div>
      </div>
    </div>
  )
}

export function CostChart({ data, loading }) {
  if (loading || !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="text-gray-500 text-sm mt-2">Lade Kostendaten...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">💰</span>
        </div>
        <p className="text-orange-600 font-medium">Kosten-Chart</p>
        <p className="text-orange-500 text-sm mt-1">
          {data?.labels?.length || 0} Datenpunkte verfügbar
        </p>
        <div className="mt-3 text-xs text-orange-400">
          <p>Warmwasser: {data?.warmwater?.length || 0} Werte</p>
          <p>Heizung: {data?.heating?.length || 0} Werte</p>
        </div>
      </div>
    </div>
  )
}