import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const socketRef = useRef(null)

  useEffect(() => {
    // Connect to Socket.IO server for notifications
    socketRef.current = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    })

    const socket = socketRef.current

    // Join user notification room
    if (userId) {
      socket.emit('join-user-room', userId)
    }

    // Listen for new notifications
    socket.on('new-notification', (notification) => {
      console.log('🔔 New notification:', notification)
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev].slice(0, 50)) // Keep last 50
      setUnreadCount(prev => prev + 1)
      
      // Show toast notification
      showNotificationToast(notification)
    })

    // Listen for campaign updates
    socket.on('campaign-update', (data) => {
      console.log('📊 Campaign update:', data)
      
      const notification = {
        id: Date.now(),
        type: 'campaign_update',
        title: 'Campaign Update',
        message: `Campaign "${data.campaignName}" ${data.status}`,
        timestamp: new Date().toISOString(),
        data: data
      }
      
      setNotifications(prev => [notification, ...prev].slice(0, 50))
      setUnreadCount(prev => prev + 1)
      
      showNotificationToast(notification)
    })

    // Listen for system alerts
    socket.on('system-alert', (alert) => {
      console.log('⚠️ System alert:', alert)
      
      const notification = {
        id: Date.now(),
        type: 'system_alert',
        title: 'System Alert',
        message: alert.message,
        timestamp: new Date().toISOString(),
        priority: alert.priority || 'normal'
      }
      
      setNotifications(prev => [notification, ...prev].slice(0, 50))
      setUnreadCount(prev => prev + 1)
      
      showNotificationToast(notification, alert.priority)
    })

    // Connection events
    socket.on('connect', () => {
      console.log('🔌 Connected to notification service')
    })

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from notification service')
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
    }
  }, [userId])

  // Show toast notification based on type and priority
  const showNotificationToast = (notification, priority = 'normal') => {
    const options = {
      duration: priority === 'high' ? 6000 : 4000,
      position: 'top-right'
    }

    switch (notification.type) {
      case 'new_message':
        toast.success(notification.message, {
          ...options,
          icon: '💬'
        })
        break
      
      case 'campaign_update':
        toast.info(notification.message, {
          ...options,
          icon: '📊'
        })
        break
      
      case 'system_alert':
        if (priority === 'high') {
          toast.error(notification.message, {
            ...options,
            icon: '⚠️'
          })
        } else {
          toast(notification.message, {
            ...options,
            icon: 'ℹ️'
          })
        }
        break
      
      case 'property_update':
        toast.success(notification.message, {
          ...options,
          icon: '🏠'
        })
        break
      
      default:
        toast(notification.message, options)
    }
  }

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
    setUnreadCount(0)
  }

  // Clear all notifications
  const clearAll = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  // Send custom notification (for testing)
  const sendTestNotification = (type = 'test') => {
    if (socketRef.current) {
      socketRef.current.emit('test-notification', {
        type,
        message: 'This is a test notification',
        timestamp: new Date().toISOString()
      })
    }
  }

  // Get notifications by type
  const getNotificationsByType = (type) => {
    return notifications.filter(notif => notif.type === type)
  }

  // Get recent notifications (last 24 hours)
  const getRecentNotifications = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    return notifications.filter(notif => 
      new Date(notif.timestamp) > yesterday
    )
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    sendTestNotification,
    getNotificationsByType,
    getRecentNotifications,
    isConnected: socketRef.current?.connected || false
  }
}

export default useNotifications
