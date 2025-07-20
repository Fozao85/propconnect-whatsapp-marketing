import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'

// Fetch all properties
export const useProperties = (filters = {}) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.type) params.append('type', filters.type)
      if (filters.transaction_type) params.append('transaction_type', filters.transaction_type)
      if (filters.city) params.append('city', filters.city)
      if (filters.min_price) params.append('min_price', filters.min_price)
      if (filters.max_price) params.append('max_price', filters.max_price)
      
      const response = await axios.get(`/api/properties?${params}`)
      return response.data.properties
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single property
export const useProperty = (propertyId) => {
  return useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const response = await axios.get(`/api/properties/${propertyId}`)
      return response.data.property
    },
    enabled: !!propertyId,
  })
}

// Create new property
export const useCreateProperty = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (propertyData) => {
      const response = await axios.post('/api/properties', propertyData)
      return response.data.property
    },
    onSuccess: (newProperty) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success(`Property "${newProperty.title}" created successfully!`)
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create property'
      toast.error(message)
    }
  })
}

// Update property
export const useUpdateProperty = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const response = await axios.put(`/api/properties/${id}`, updateData)
      return response.data.property
    },
    onSuccess: (updatedProperty) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['property', updatedProperty.id] })
      toast.success(`Property "${updatedProperty.title}" updated successfully!`)
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update property'
      toast.error(message)
    }
  })
}

// Delete property
export const useDeleteProperty = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (propertyId) => {
      await axios.delete(`/api/properties/${propertyId}`)
      return propertyId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property deleted successfully!')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete property'
      toast.error(message)
    }
  })
}

// Get property statistics
export const usePropertyStats = () => {
  return useQuery({
    queryKey: ['property-stats'],
    queryFn: async () => {
      const response = await axios.get('/api/properties/stats/overview')
      return response.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Send property to contact via WhatsApp
export const useSendPropertyToContact = () => {
  return useMutation({
    mutationFn: async ({ propertyId, contactId, message }) => {
      const response = await axios.post('/api/whatsapp/send-property', {
        propertyId,
        contactId,
        message
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Property sent to contact successfully!')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to send property'
      toast.error(message)
    }
  })
}
