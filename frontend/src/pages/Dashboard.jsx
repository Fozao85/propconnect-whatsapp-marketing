import React, { useState } from 'react'
import {
  Users,
  Home,
  MessageSquare,
  TrendingUp,
  Phone,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js'
import { useDashboardStats, useRecentActivities, useChartData } from '../hooks/useDashboard'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import AddContactModal from '../components/Modals/AddContactModal'
import AddPropertyModal from '../components/Modals/AddPropertyModal'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
)

const Dashboard = () => {
  const navigate = useNavigate()
  const [showAddContactModal, setShowAddContactModal] = useState(false)
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/contacts?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  // Fetch real data from API
  const { data: statsData, isLoading: statsLoading } = useDashboardStats()
  const { data: activities, isLoading: activitiesLoading } = useRecentActivities()
  const { data: messageChartData } = useChartData('messages')
  const { data: propertyTypeData } = useChartData('property-types')
  const { data: leadSourceData } = useChartData('lead-sources')

  // Show loading spinner while data is loading
  if (statsLoading || activitiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Transform API data to component format
  const stats = statsData ? [
    {
      name: 'Total Contacts',
      value: statsData.totalContacts.value,
      change: statsData.totalContacts.change,
      changeType: statsData.totalContacts.changeType,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Properties',
      value: statsData.activeProperties.value,
      change: statsData.activeProperties.change,
      changeType: statsData.activeProperties.changeType,
      icon: Home,
      color: 'bg-green-500'
    },
    {
      name: 'Messages Sent',
      value: statsData.messagesSent.value,
      change: statsData.messagesSent.change,
      changeType: statsData.messagesSent.changeType,
      icon: MessageSquare,
      color: 'bg-purple-500'
    },
    {
      name: 'Conversion Rate',
      value: statsData.conversionRate.value,
      change: statsData.conversionRate.change,
      changeType: statsData.conversionRate.changeType,
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ] : []

  // Map icon names to components
  const iconMap = {
    Users,
    Home,
    MessageSquare,
    Calendar,
    Phone
  }

  // Transform activities to include icon components
  const recentActivities = (activities || []).map(activity => ({
    ...activity,
    icon: iconMap[activity.icon] || MessageSquare
  }))

  // Default chart data while loading
  const defaultMessageChartData = {
    labels: ['Loading...'],
    datasets: [
      {
        label: 'Messages Sent',
        data: [0],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      }
    ]
  }

  const defaultPropertyTypeData = {
    labels: ['Loading...'],
    datasets: [
      {
        data: [1],
        backgroundColor: ['#E5E7EB'],
        borderWidth: 0,
      }
    ]
  }

  const defaultLeadSourceData = {
    labels: ['Loading...'],
    datasets: [
      {
        label: 'Leads',
        data: [0],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
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

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back! Here's what's happening with your real estate marketing.
        </p>
      </div>





      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Property Types Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Property Types</h3>
            <p className="card-description">Distribution of property listings</p>
          </div>
          <div className="card-content">
            <Doughnut data={propertyTypeData || defaultPropertyTypeData} options={doughnutOptions} />
          </div>
        </div>

        {/* Lead Sources Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Lead Sources</h3>
            <p className="card-description">Where your leads are coming from</p>
          </div>
          <div className="card-content">
            <Bar data={leadSourceData || defaultLeadSourceData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
            <p className="card-description">Latest updates and interactions</p>
          </div>
          <div className="card-content">
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" text="Loading activities..." />
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center`}>
                      <activity.icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
          <p className="card-description">Common tasks and shortcuts</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => navigate('/conversations')}
              className="btn btn-outline btn-md flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Broadcast</span>
            </button>
            <button
              onClick={() => setShowAddPropertyModal(true)}
              className="btn btn-outline btn-md flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Add Property</span>
            </button>
            <button
              onClick={() => setShowAddContactModal(true)}
              className="btn btn-outline btn-md flex items-center justify-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="btn btn-outline btn-md flex items-center justify-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>View Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddContactModal
        isOpen={showAddContactModal}
        onClose={() => setShowAddContactModal(false)}
      />

      <AddPropertyModal
        isOpen={showAddPropertyModal}
        onClose={() => setShowAddPropertyModal(false)}
      />
    </div>
  )
}

export default Dashboard
