import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'

// Get single customer with detailed information
export const useCustomer = (customerId) => {
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      const response = await axios.get(`/api/contacts/${customerId}`)
      return response.data.contact
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get customer activity timeline
export const useCustomerActivity = (customerId) => {
  return useQuery({
    queryKey: ['customer-activity', customerId],
    queryFn: async () => {
      const response = await axios.get(`/api/contacts/${customerId}/activity`)
      return response.data.activities
    },
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Get customer property interests and viewing history
export const useCustomerProperties = (customerId) => {
  return useQuery({
    queryKey: ['customer-properties', customerId],
    queryFn: async () => {
      const response = await axios.get(`/api/contacts/${customerId}/properties`)
      return response.data
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get customer conversation history
export const useCustomerConversations = (customerId) => {
  return useQuery({
    queryKey: ['customer-conversations', customerId],
    queryFn: async () => {
      const response = await axios.get(`/api/conversations/${customerId}/messages`)
      return response.data.messages
    },
    enabled: !!customerId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Get customer statistics
export const useCustomerStats = (customerId) => {
  return useQuery({
    queryKey: ['customer-stats', customerId],
    queryFn: async () => {
      const response = await axios.get(`/api/contacts/${customerId}/stats`)
      return response.data.stats
    },
    enabled: !!customerId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Update customer information
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const response = await axios.put(`/api/contacts/${id}`, updateData)
      return response.data.contact
    },
    onSuccess: (updatedCustomer) => {
      // Update all related queries
      queryClient.invalidateQueries({ queryKey: ['customer', updatedCustomer.id] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['customer-activity', updatedCustomer.id] })
      
      toast.success(`Customer ${updatedCustomer.name} updated successfully!`)
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update customer'
      toast.error(message)
    }
  })
}

// Update customer stage
export const useUpdateCustomerStage = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ customerId, stage, notes }) => {
      const response = await axios.put(`/api/contacts/${customerId}/stage`, {
        stage,
        notes
      })
      return response.data.contact
    },
    onSuccess: (updatedCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['customer', updatedCustomer.id] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['customer-activity', updatedCustomer.id] })
      
      toast.success(`Customer stage updated to ${updatedCustomer.stage}`)
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update customer stage'
      toast.error(message)
    }
  })
}

// Add customer note/activity
export const useAddCustomerNote = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ customerId, note, type = 'note' }) => {
      const response = await axios.post(`/api/contacts/${customerId}/notes`, {
        note,
        type
      })
      return response.data.note
    },
    onSuccess: (newNote, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-activity', variables.customerId] })
      toast.success('Note added successfully!')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to add note'
      toast.error(message)
    }
  })
}

// Mark customer as favorite
export const useToggleCustomerFavorite = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ customerId, isFavorite }) => {
      const response = await axios.put(`/api/contacts/${customerId}/favorite`, {
        is_favorite: isFavorite
      })
      return response.data.contact
    },
    onSuccess: (updatedCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['customer', updatedCustomer.id] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      
      const action = updatedCustomer.is_favorite ? 'added to' : 'removed from'
      toast.success(`Customer ${action} favorites`)
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update favorite status'
      toast.error(message)
    }
  })
}

// Send property to customer
export const useSendPropertyToCustomer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ customerId, propertyId, message }) => {
      const response = await axios.post('/api/whatsapp/send-property', {
        contactId: customerId,
        propertyId,
        message
      })
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-activity', variables.customerId] })
      queryClient.invalidateQueries({ queryKey: ['customer-conversations', variables.customerId] })
      toast.success('Property sent to customer successfully!')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to send property'
      toast.error(message)
    }
  })
}

// Schedule appointment with customer
export const useScheduleAppointment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ customerId, propertyId, appointmentData }) => {
      const response = await axios.post(`/api/contacts/${customerId}/appointments`, {
        property_id: propertyId,
        ...appointmentData
      })
      return response.data.appointment
    },
    onSuccess: (appointment, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-activity', variables.customerId] })
      toast.success('Appointment scheduled successfully!')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to schedule appointment'
      toast.error(message)
    }
  })
}

// Get customer lead score
export const useCustomerLeadScore = (customerId) => {
  return useQuery({
    queryKey: ['customer-lead-score', customerId],
    queryFn: async () => {
      const response = await axios.get(`/api/contacts/${customerId}/lead-score`)
      return response.data.score
    },
    enabled: !!customerId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Get similar customers (for recommendations)
export const useSimilarCustomers = (customerId) => {
  return useQuery({
    queryKey: ['similar-customers', customerId],
    queryFn: async () => {
      const response = await axios.get(`/api/contacts/${customerId}/similar`)
      return response.data.customers
    },
    enabled: !!customerId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Export customer data
export const useExportCustomerData = () => {
  return useMutation({
    mutationFn: async ({ customerId, format = 'pdf' }) => {
      const response = await axios.get(`/api/contacts/${customerId}/export`, {
        params: { format },
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `customer-${customerId}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return response.data
    },
    onSuccess: () => {
      toast.success('Customer data exported successfully!')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to export customer data'
      toast.error(message)
    }
  })
}
