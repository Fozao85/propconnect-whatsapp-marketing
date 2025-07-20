import React from 'react'
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

const SimpleDashboard = () => {
  const navigate = useNavigate()

  const stats = [
    {
      name: 'Total Contacts',
      value: '2,847',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Properties',
      value: '156',
      change: '+8%',
      changeType: 'positive',
      icon: Home,
      color: 'bg-green-500'
    },
    {
      name: 'Messages Sent',
      value: '1,234',
      change: '+23%',
      changeType: 'positive',
      icon: MessageSquare,
      color: 'bg-purple-500'
    },
    {
      name: 'Revenue',
      value: 'XAF 45M',
      change: '+15%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-yellow-500'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'message',
      title: 'New message from Jean Mballa',
      description: 'Interested in the villa in Bastos',
      time: '2 minutes ago',
      icon: MessageSquare
    },
    {
      id: 2,
      type: 'contact',
      title: 'New contact registered',
      description: 'Marie Nguema looking for apartments',
      time: '1 hour ago',
      icon: Users
    },
    {
      id: 3,
      type: 'property',
      title: 'Property inquiry',
      description: 'Paul Etame asked about pricing',
      time: '3 hours ago',
      icon: Home
    },
    {
      id: 4,
      type: 'call',
      title: 'Scheduled viewing',
      description: 'Appointment with Sarah Kom',
      time: '5 hours ago',
      icon: Calendar
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your properties.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/contacts')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
          <button
            onClick={() => navigate('/campaigns')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            <button
              onClick={() => navigate('/notifications')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <activity.icon className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
                <div className="flex-shrink-0">
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate('/conversations')}
          className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
              <p className="text-sm text-gray-500">Manage WhatsApp conversations</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/properties')}
          className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Properties</h3>
              <p className="text-sm text-gray-500">Manage property listings</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/analytics')}
          className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-500">View performance metrics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleDashboard
