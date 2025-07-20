import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  Users,
  Home,
  MessageSquare,
  Calendar,
  DollarSign,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Eye,
  Phone
} from 'lucide-react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { useDashboardStats, useChartData } from '../hooks/useDashboard'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import RevenueChart from '../components/Analytics/RevenueChart'
import ConversionFunnel from '../components/Analytics/ConversionFunnel'

const Analytics = () => {
  const { data: statsData, isLoading: statsLoading } = useDashboardStats()
  const { data: messageChartData } = useChartData('messages')
  const { data: propertyTypeData } = useChartData('property-types')
  const { data: leadSourceData } = useChartData('lead-sources')

  const [activeTab, setActiveTab] = useState('overview')
  const [performanceData, setPerformanceData] = useState(null)

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  }

  // Fetch performance data
  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/analytics/performance')
        const data = await response.json()
        setPerformanceData(data)
      } catch (error) {
        console.error('Failed to fetch performance data:', error)
      }
    }

    fetchPerformanceData()
    const interval = setInterval(fetchPerformanceData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'funnel', label: 'Conversion', icon: Target },
    { id: 'performance', label: 'Performance', icon: Activity }
  ]

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600">Detailed insights into your real estate business performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-content py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Contacts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statsData?.totalContacts?.value || '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Active Properties</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statsData?.activeProperties?.value || '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Messages Sent</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statsData?.messagesSent?.value || '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-orange-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Conversion Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statsData?.conversionRate?.value || '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Message Activity Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Message Activity</h3>
            <p className="card-description">WhatsApp messages sent and received over time</p>
          </div>
          <div className="card-content">
            {messageChartData ? (
              <Line data={messageChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="md" text="Loading chart..." />
              </div>
            )}
          </div>
        </div>

        {/* Lead Sources Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Lead Sources</h3>
            <p className="card-description">Where your leads are coming from</p>
          </div>
          <div className="card-content">
            {leadSourceData ? (
              <Bar data={leadSourceData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="md" text="Loading chart..." />
              </div>
            )}
          </div>
        </div>

        {/* Property Types Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Property Types</h3>
            <p className="card-description">Distribution of property listings</p>
          </div>
          <div className="card-content">
            {propertyTypeData ? (
              <Doughnut data={propertyTypeData} options={doughnutOptions} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="md" text="Loading chart..." />
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Performance Metrics</h3>
            <p className="card-description">Key business performance indicators</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Response Rate</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">85%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Avg. Response Time</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">12 min</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Avg. Property Value</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">65M XAF</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Active Conversations</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">12</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Stages Breakdown */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Contact Pipeline</h3>
          <p className="card-description">Breakdown of contacts by stage in your sales pipeline</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {statsData?.stageBreakdown && Object.entries(statsData.stageBreakdown).map(([stage, count]) => (
              <div key={stage} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-500 capitalize">{stage.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Export Reports</h3>
          <p className="card-description">Download detailed reports for further analysis</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button className="btn btn-outline btn-md">
              Export Contacts Report
            </button>
            <button className="btn btn-outline btn-md">
              Export Properties Report
            </button>
            <button className="btn btn-outline btn-md">
              Export Conversations Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
