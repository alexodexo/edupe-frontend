// src/pages/cases/[id]/service/new.js
import { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import ServiceBooking from '@/components/ServiceBooking'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useCase, useHelpers, useServices, useCreateService } from '@/hooks/useData'
import { useNotifications } from '@/lib/notifications'
import {
  ArrowLeftIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export default function NewService() {
  const router = useRouter()
  const { id } = router.query
  const { hasPermission } = useAuth()
  const { case: caseData, isLoading, error } = useCase(id)
  const { helpers } = useHelpers()
  const { services } = useServices()
  const createService = useCreateService()
  const { success, error: showError } = useNotifications()

  // Get services for this case
  const caseServices = useMemo(() => {
    if (!caseData || !services) return []
    return services.filter(service => service.caseId === caseData.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [caseData, services])

  // Get last service for travel time validation
  const lastService = useMemo(() => {
    if (caseServices.length === 0) return null
    return caseServices[0] // Most recent service
  }, [caseServices])

  // Get assigned helper
  const assignedHelper = useMemo(() => {
    if (!caseData || !helpers) return null
    return helpers.find(helper => 
      caseData.assignedHelpers && caseData.assignedHelpers.includes(helper.id)
    )
  }, [caseData, helpers])

  const handleServiceSave = async (serviceData) => {
    try {
      await createService(serviceData)
      success('Leistung wurde erfolgreich gebucht')
      router.push(`/cases/${id}`)
    } catch (error) {
      showError('Fehler beim Buchen der Leistung')
    }
  }

  const handleCancel = () => {
    router.push(`/cases/${id}`)
  }

  if (isLoading) return <LoadingPage />
  if (error) return <div>Fehler beim Laden des Falls</div>
  if (!caseData) return <div>Fall nicht gefunden</div>
  if (!assignedHelper) return <div>Kein Helfer zugewiesen</div>

  return (
    <Layout>
      <Head>
        <title>Neue Leistung buchen - {caseData.title}</title>
      </Head>

      <div className="space-y-6">
        {/* Header mit Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link 
            href={`/cases/${caseData.id}`} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Zurück zu {caseData.title}</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <ClockIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white mb-1">
                  Neue Leistung buchen
                </h1>
                <p className="text-orange-100">Leistung für {caseData.client?.firstName} {caseData.client?.lastName} erfassen</p>
              </div>
            </div>
          </div>
        </div>

        {/* Case & Helper Info */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-blue-600" />
            Fall-Informationen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{caseData.client?.firstName} {caseData.client?.lastName}</p>
                <p className="text-sm text-gray-600">{caseData.client?.school}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{assignedHelper.vorname} {assignedHelper.nachname}</p>
                <p className="text-sm text-gray-600">Zugewiesener Helfer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Booking Form */}
        <div className="card p-6">
          <ServiceBooking
            caseData={caseData}
            helper={assignedHelper}
            lastService={lastService}
            onSave={handleServiceSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </Layout>
  )
} 