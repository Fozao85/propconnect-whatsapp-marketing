import React, { useState } from 'react'
import { 
  Bell, 
  Users, 
  Home, 
  MessageSquare, 
  Calendar,
  Check,
  CheckCheck,
  Filter,
  Search
} from 'lucide-react'
import { useRecentActivities } from '../hooks/useDashboard'
import LoadingSpinner from '../components/UI/LoadingSpinner'

const Notifications = () => {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { data: activities = [], isLoading } = useRecentActivities()

  // Extended notifications with more details
  const notifications = [
    {
      id: 1,
      type: 'contact',
      title: 'New contact registered',
      description: 'Jean Mballa is looking for properties in Akwa',
      fullMessage: 'Jean Mballa has registered as a new contact. He is interested in buying a 3-bedroom apartment in Akwa, Douala with a budget of 50-80 million XAF. His contact information: +237670337798, jean.mballa@gmail.com. Stage: Qualified.',
      time: '2 minutes ago',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      read: false
    },
    {
      id: 2,
      type: 'property',
      title: 'Property inquiry received',
      description: 'Marie Nguema asked about the villa in Bastos',
      fullMessage: 'Marie Nguema has inquired about the luxury villa in Bastos. She is interested in renting the 5-bedroom villa with swimming pool and garden. Her budget is 600-800k XAF per month. Contact: +237671234567, marie.nguema@yahoo.com. Follow up recommended.',
      time: '1 hour ago',
      icon: Home,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      read: false
    },
    {
      id: 3,
      type: 'message',
      title: 'WhatsApp message received',
      description: 'Paul Etame sent a message about commercial property',
      fullMessage: 'Paul Etame has sent a WhatsApp message regarding the commercial building in Bonanjo. He wants to schedule a viewing for next week and has questions about the rental terms. Message: "Bonjour, je voudrais visiter l\'immeuble commercial à Bonanjo. Quand puis-je passer?" Contact: +237680123456.',
      time: '3 hours ago',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      read: true
    },
    {
      id: 4,
      type: 'appointment',
      title: 'Viewing scheduled',
      description: 'Grace Fouda scheduled a property viewing',
      fullMessage: 'Grace Fouda has scheduled a viewing for the villa in Bonapriso tomorrow at 2:00 PM. She is very interested in purchasing and has already secured financing. This is a hot lead. Property: Luxury Villa in Bonapriso - 60M XAF. Contact: +237690987654, grace.fouda@gmail.com.',
      time: '5 hours ago',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      read: true
    },
    {
      id: 5,
      type: 'contact',
      title: 'Contact stage updated',
      description: 'Samuel Biya moved to negotiating stage',
      fullMessage: 'Samuel Biya has been moved to the negotiating stage. He is interested in renting the 2-bedroom apartment in Melen for 200-250k XAF per month. He has viewed the property and is ready to discuss terms. Next step: Prepare rental agreement. Contact: +237655443322.',
      time: '1 day ago',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      read: true
    },
    {
      id: 6,
      type: 'property',
      title: 'New property added',
      description: 'Luxury apartment in Akwa has been listed',
      fullMessage: 'A new luxury apartment has been added to the listings. Property details: 3-bedroom apartment with ocean view in Akwa, Douala. Price: 75M XAF. Features: Furnished, parking, security, 120m². This property matches the criteria for several contacts including Jean Mballa. Consider sending property details to matching contacts.',
      time: '2 days ago',
      icon: Home,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      read: true
    }
  ]

  const [selectedNotification, setSelectedNotification] = useState(null)
  const [notificationStates, setNotificationStates] = useState(
    notifications.reduce((acc, notification) => {
      acc[notification.id] = { read: notification.read }
      return acc
    }, {})
  )

  const filteredNotifications = notifications.filter(notification => {
    const currentRead = notificationStates[notification.id]?.read ?? notification.read
    const matchesFilter = filter === 'all' ||
                         (filter === 'unread' && !currentRead) ||
                         (filter === 'read' && currentRead) ||
                         notification.type === filter

    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.description.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const markAsRead = (notificationId) => {
    setNotificationStates(prev => ({
      ...prev,
      [notificationId]: { read: true }
    }))
    // In a real app, this would make an API call
    console.log('Marking notification as read:', notificationId)
  }

  const markAllAsRead = () => {
    const newStates = {}
    notifications.forEach(notification => {
      newStates[notification.id] = { read: true }
    })
    setNotificationStates(newStates)
    // In a real app, this would make an API call
    console.log('Marking all notifications as read')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading notifications..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your real estate activities</p>
        </div>
        <button
          onClick={markAllAsRead}
          className="btn btn-outline btn-md flex items-center space-x-2"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-0 focus:border-primary-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-0 focus:border-primary-500 focus:outline-none ml-2"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="contact">Contacts</option>
            <option value="property">Properties</option>
            <option value="message">Messages</option>
            <option value="appointment">Appointments</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => {
            const isRead = notificationStates[notification.id]?.read ?? notification.read
            return (
              <div
                key={notification.id}
                className={`card cursor-pointer transition-all hover:shadow-md ${
                  !isRead ? 'border-l-4 border-l-primary-500 bg-primary-50' : ''
                }`}
                onClick={() => setSelectedNotification(notification)}
              >
                <div className="card-content py-6">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full ${notification.bgColor} flex items-center justify-center`}>
                      <notification.icon className={`w-6 h-6 ${notification.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${!isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{notification.time}</span>
                          {!isRead && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                      <p className="text-xs text-gray-500 mt-2">Click to read full details</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' ? 'You have no notifications at the moment.' : `No ${filter} notifications found.`}
            </p>
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSelectedNotification(null)} />
            
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${selectedNotification.bgColor} flex items-center justify-center`}>
                    <selectedNotification.icon className={`w-6 h-6 ${selectedNotification.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{selectedNotification.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{selectedNotification.time}</p>
                    <div className="mt-4">
                      <p className="text-gray-700 leading-relaxed">{selectedNotification.fullMessage}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="btn btn-ghost btn-md"
                  >
                    Close
                  </button>
                  
                  {!(notificationStates[selectedNotification.id]?.read ?? selectedNotification.read) && (
                    <button
                      onClick={() => {
                        markAsRead(selectedNotification.id)
                        setSelectedNotification(null)
                      }}
                      className="btn btn-primary btn-md flex items-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark as Read</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notifications
