import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'

// Fetch all contacts
export const useContacts = (filters = {}) => {
  return useQuery({
    queryKey: ['contacts', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.stage) params.append('stage', filters.stage)
      
      const response = await axios.get(`/api/contacts?${params}`)
      return response.data.contacts
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create new contact
export const useCreateContact = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (contactData) => {
      const response = await axios.post('/api/contacts', contactData)
      return response.data.contact
    },
    onSuccess: (newContact) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success(`Contact ${newContact.name} created successfully!`)
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create contact'
      toast.error(message)
    }
  })
}

// Update contact
export const useUpdateContact = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const response = await axios.put(`/api/contacts/${id}`, updateData)
      return response.data.contact
    },
    onSuccess: (updatedContact) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success(`Contact ${updatedContact.name} updated successfully!`)
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update contact'
      toast.error(message)
    }
  })
}

// Delete contact
export const useDeleteContact = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (contactId) => {
      await axios.delete(`/api/contacts/${contactId}`)
      return contactId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Contact deleted successfully!')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete contact'
      toast.error(message)
    }
  })
}

// Send WhatsApp message to contact
export const useSendMessage = () => {
  return useMutation({
    mutationFn: async ({ contactId, message, messageType = 'text' }) => {
      const response = await axios.post('/api/whatsapp/send-message', {
        contactId,
        message,
        messageType
      })
      return response.data
    },
    onSuccess: (data) => {
      toast.success('Message sent successfully!')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to send message'
      toast.error(message)
    }
  })
}
