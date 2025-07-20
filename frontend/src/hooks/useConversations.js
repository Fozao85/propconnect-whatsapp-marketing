import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'

// Fetch all conversations
export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await axios.get('/api/conversations')
      return response.data.conversations
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

// Fetch messages for a specific conversation
export const useConversationMessages = (contactId) => {
  return useQuery({
    queryKey: ['conversation-messages', contactId],
    queryFn: async () => {
      const response = await axios.get(`/api/conversations/${contactId}/messages`)
      return response.data.messages
    },
    enabled: !!contactId,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

// Send message to contact
export const useSendMessage = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ contactId, message, messageType = 'text' }) => {
      const response = await axios.post('/api/whatsapp/send-message', {
        contactId,
        message,
        messageType
      })
      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch conversations and messages
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', variables.contactId] })
      toast.success('Message sent successfully!')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to send message'
      toast.error(message)
    }
  })
}

// Send property to contact
export const useSendProperty = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ contactId, propertyId, message }) => {
      const response = await axios.post('/api/whatsapp/send-property', {
        contactId,
        propertyId,
        message
      })
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', variables.contactId] })
      toast.success('Property sent successfully!')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to send property'
      toast.error(message)
    }
  })
}

// Mark messages as read
export const useMarkAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (contactId) => {
      const response = await axios.put(`/api/conversations/${contactId}/mark-read`)
      return response.data
    },
    onSuccess: (data, contactId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', contactId] })
    },
    onError: (error) => {
      console.error('Failed to mark messages as read:', error)
    }
  })
}
