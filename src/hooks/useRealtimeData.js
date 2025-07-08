// hooks/useRealtimeData.js
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export function useEM3Data() {
  const { data, error, isLoading } = useSWR('/api/em3/latest', fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds
  })

  return {
    data,
    isLoading,
    isError: error,
  }
}

export function useTemperatureData() {
  const { data, error, isLoading } = useSWR('/api/temperature/latest', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  return {
    data,
    isLoading,
    isError: error,
  }
}

export function useWeatherData() {
  const { data, error, isLoading } = useSWR('/api/weather/latest', fetcher, {
    refreshInterval: 3600000, // Refresh every hour
  })

  return {
    data,
    isLoading,
    isError: error,
  }
}