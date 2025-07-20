import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const useSocket = (userId) => {
  const socketRef = useRef(null)

  useEffect(() => {
    // Connect to Socket.IO server
    socketRef.current = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    })

    const socket = socketRef.current

    // Join user room for notifications
    if (userId) {
      socket.emit('join-user-room', userId)
    }

    // Connection events
    socket.on('connect', () => {
      console.log('🔌 Connected to server')
    })

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from server')
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
    }
  }, [userId])

  // Join conversation room
  const joinConversation = (conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('join-conversation', conversationId)
    }
  }

  // Send real-time message
  const sendMessage = (conversationId, message) => {
    if (socketRef.current) {
      socketRef.current.emit('send-message', {
        conversationId,
        message,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Send typing indicator
  const sendTyping = (conversationId, isTyping) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', {
        conversationId,
        userId,
        isTyping
      })
    }
  }

  // Listen for new messages
  const onNewMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('new-message', callback)
    }
  }

  // Listen for typing indicators
  const onUserTyping = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('user-typing', callback)
    }
  }

  // Remove listeners
  const removeListener = (event) => {
    if (socketRef.current) {
      socketRef.current.off(event)
    }
  }

  return {
    socket: socketRef.current,
    joinConversation,
    sendMessage,
    sendTyping,
    onNewMessage,
    onUserTyping,
    removeListener
  }
}

export default useSocket
