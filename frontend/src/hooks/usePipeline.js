import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'

// Get pipeline statistics
export const usePipelineStats = () => {
  return useQuery({
    queryKey: ['pipeline-stats'],
    queryFn: async () => {
      const response = await axios.get('/api/pipeline/stats')
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get pipeline conversion rates
export const usePipelineConversion = () => {
  return useQuery({
    queryKey: ['pipeline-conversion'],
    queryFn: async () => {
      const response = await axios.get('/api/pipeline/conversion')
      return response.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Move contact to different stage
export const useMoveContact = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ contactId, fromStage, toStage, notes }) => {
      const response = await axios.put(`/api/contacts/${contactId}/stage`, {
        stage: toStage,
        previous_stage: fromStage,
        notes,
        stage_updated_at: new Date().toISOString()
      })
      return response.data
    },
    onSuccess: (data, variables) => {
      // Update all related queries
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['pipeline-stats'] })
      queryClient.invalidateQueries({ queryKey: ['pipeline-conversion'] })
      queryClient.invalidateQueries({ queryKey: ['customer', variables.contactId] })
      
      // Add activity log
      queryClient.invalidateQueries({ queryKey: ['customer-activity', variables.contactId] })
      
      toast.success(`Contact moved to ${variables.toStage} stage`)
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to move contact'
      toast.error(message)
    }
  })
}

// Bulk move contacts
export const useBulkMoveContacts = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ contactIds, toStage, notes }) => {
      const response = await axios.put('/api/contacts/bulk-stage-update', {
        contact_ids: contactIds,
        stage: toStage,
        notes,
        stage_updated_at: new Date().toISOString()
      })
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['pipeline-stats'] })
      queryClient.invalidateQueries({ queryKey: ['pipeline-conversion'] })
      
      toast.success(`${variables.contactIds.length} contacts moved to ${variables.toStage} stage`)
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to move contacts'
      toast.error(message)
    }
  })
}

// Get stage history for a contact
export const useStageHistory = (contactId) => {
  return useQuery({
    queryKey: ['stage-history', contactId],
    queryFn: async () => {
      const response = await axios.get(`/api/contacts/${contactId}/stage-history`)
      return response.data.history
    },
    enabled: !!contactId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get pipeline performance metrics
export const usePipelineMetrics = (dateRange = '30d') => {
  return useQuery({
    queryKey: ['pipeline-metrics', dateRange],
    queryFn: async () => {
      const response = await axios.get('/api/pipeline/metrics', {
        params: { range: dateRange }
      })
      return response.data
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Get stage velocity (average time in each stage)
export const useStageVelocity = () => {
  return useQuery({
    queryKey: ['stage-velocity'],
    queryFn: async () => {
      const response = await axios.get('/api/pipeline/velocity')
      return response.data
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Create pipeline automation rule
export const useCreateAutomationRule = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (ruleData) => {
      const response = await axios.post('/api/pipeline/automation-rules', ruleData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] })
      toast.success('Automation rule created successfully!')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create automation rule'
      toast.error(message)
    }
  })
}

// Get automation rules
export const useAutomationRules = () => {
  return useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const response = await axios.get('/api/pipeline/automation-rules')
      return response.data.rules
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Trigger manual automation
export const useTriggerAutomation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ contactId, automationType, parameters }) => {
      const response = await axios.post('/api/pipeline/trigger-automation', {
        contact_id: contactId,
        automation_type: automationType,
        parameters
      })
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-activity', variables.contactId] })
      toast.success('Automation triggered successfully!')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to trigger automation'
      toast.error(message)
    }
  })
}

// Get pipeline bottlenecks
export const usePipelineBottlenecks = () => {
  return useQuery({
    queryKey: ['pipeline-bottlenecks'],
    queryFn: async () => {
      const response = await axios.get('/api/pipeline/bottlenecks')
      return response.data
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Export pipeline data
export const useExportPipeline = () => {
  return useMutation({
    mutationFn: async ({ format = 'csv', dateRange, stages }) => {
      const response = await axios.get('/api/pipeline/export', {
        params: { format, date_range: dateRange, stages: stages?.join(',') },
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `pipeline-export.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return response.data
    },
    onSuccess: () => {
      toast.success('Pipeline data exported successfully!')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to export pipeline data'
      toast.error(message)
    }
  })
}

// Get agent performance in pipeline
export const useAgentPipelinePerformance = (agentId) => {
  return useQuery({
    queryKey: ['agent-pipeline-performance', agentId],
    queryFn: async () => {
      const response = await axios.get(`/api/agents/${agentId}/pipeline-performance`)
      return response.data
    },
    enabled: !!agentId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Assign contact to agent
export const useAssignContact = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ contactId, agentId, notes }) => {
      const response = await axios.put(`/api/contacts/${contactId}/assign`, {
        agent_id: agentId,
        notes
      })
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['customer', variables.contactId] })
      queryClient.invalidateQueries({ queryKey: ['pipeline-stats'] })
      
      toast.success('Contact assigned successfully!')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to assign contact'
      toast.error(message)
    }
  })
}
