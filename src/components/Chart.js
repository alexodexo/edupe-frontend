// components/Chart.js
import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export function TemperatureChart({ data, loading }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function(value) {
            return value + '°C'
          },
        },
      },
    },
  }

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

  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        label: 'Warmwasser',
        data: data.warmwater || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Vorlauf',
        data: data.vorlauf || [],
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Rücklauf',
        data: data.ruecklauf || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  return <Line options={options} data={chartData} />
}

export function PowerChart({ data, loading, type = 'line' }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return context.parsed.y + ' W'
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function(value) {
            return value + ' W'
          },
        },
      },
    },
  }

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

  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        label: 'Stromverbrauch',
        data: data.values || [],
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: type === 'bar' ? 'rgba(14, 165, 233, 0.8)' : 'rgba(14, 165, 233, 0.1)',
        tension: 0.4,
        fill: type === 'line',
      },
    ],
  }

  return type === 'bar' ? (
    <Bar options={options} data={chartData} />
  ) : (
    <Line options={options} data={chartData} />
  )
}

export function CostChart({ data, loading }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': €' + context.parsed.y.toFixed(2)
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function(value) {
            return '€' + value
          },
        },
      },
    },
  }

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

  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        label: 'Warmwasser',
        data: data.warmwater || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        stack: 'stack0',
      },
      {
        label: 'Heizung',
        data: data.heating || [],
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.8)',
        stack: 'stack0',
      },
    ],
  }

  return <Bar options={options} data={chartData} />
}