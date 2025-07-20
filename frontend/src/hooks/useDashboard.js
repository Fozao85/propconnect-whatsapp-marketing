import { useState, useEffect } from 'react'

// Mock data for dashboard
const mockStats = {
  totalContacts: {
    value: '2,847',
    change: '+12%',
    changeType: 'positive'
  },
  activeProperties: {
    value: '156',
    change: '+8%',
    changeType: 'positive'
  },
  messagesSent: {
    value: '1,234',
    change: '+23%',
    changeType: 'positive'
  },
  revenue: {
    value: 'XAF 45M',
    change: '+15%',
    changeType: 'positive'
  },
  conversionRate: {
    value: '78.5%',
    change: '+5.2%',
    changeType: 'positive'
  }
}

// Get dashboard statistics
export const useDashboardStats = () => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        setData(mockStats)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { data, isLoading, error }
}

const mockActivities = [
  {
    id: 1,
    type: 'message',
    title: 'New message from Jean Mballa',
    description: 'Interested in the villa in Bastos',
    time: '2 minutes ago',
    user: 'Jean Mballa'
  },
  {
    id: 2,
    type: 'contact',
    title: 'New contact registered',
    description: 'Marie Nguema looking for apartments',
    time: '1 hour ago',
    user: 'Marie Nguema'
  },
  {
    id: 3,
    type: 'property',
    title: 'Property inquiry',
    description: 'Paul Etame asked about pricing',
    time: '3 hours ago',
    user: 'Paul Etame'
  },
  {
    id: 4,
    type: 'call',
    title: 'Scheduled viewing',
    description: 'Appointment with Sarah Kom',
    time: '5 hours ago',
    user: 'Sarah Kom'
  }
]

// Get recent activities
export const useRecentActivities = () => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 300))
        setData(mockActivities)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [])

  return { data, isLoading, error }
}

const mockChartData = {
  messages: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Messages Sent',
      data: [65, 59, 80, 81, 56, 55, 40],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  },
  'property-types': {
    labels: ['Apartments', 'Houses', 'Villas', 'Commercial'],
    datasets: [{
      data: [45, 30, 15, 10],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ]
    }]
  },
  'lead-sources': {
    labels: ['WhatsApp', 'Website', 'Referral', 'Social Media'],
    datasets: [{
      data: [40, 25, 20, 15],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(245, 158, 11, 0.8)'
      ]
    }]
  }
}

// Get chart data for analytics
export const useChartData = (chartType) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 400))
        setData(mockChartData[chartType] || null)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChartData()
  }, [chartType])

  return { data, isLoading, error }
}
