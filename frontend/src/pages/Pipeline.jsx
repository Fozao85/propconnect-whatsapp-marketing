import React, { useState, useEffect } from 'react'
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { 
  Users, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Calendar, 
  CheckCircle,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Phone,
  Mail,
  DollarSign,
  Clock,
  User
} from 'lucide-react'
import { useContacts, useUpdateContact } from '../hooks/useContacts'
import { usePipelineStats } from '../hooks/usePipeline'
import LoadingSpinner from '../components/UI/LoadingSpinner'

const Pipeline = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('all')
  
  // Fetch contacts and pipeline data
  const { data: contacts = [], isLoading } = useContacts()
  const { data: stats = {} } = usePipelineStats()
  const { mutate: updateContact } = useUpdateContact()

  // Define pipeline stages
  const stages = [
    { 
      id: 'new', 
      name: 'New Leads', 
      color: 'bg-blue-500', 
      icon: Users,
      description: 'Fresh leads from various sources'
    },
    { 
      id: 'contacted', 
      name: 'Contacted', 
      color: 'bg-yellow-500', 
      icon: MessageSquare,
      description: 'Initial contact made'
    },
    { 
      id: 'qualified', 
      name: 'Qualified', 
      color: 'bg-purple-500', 
      icon: TrendingUp,
      description: 'Budget and needs confirmed'
    },
    { 
      id: 'viewing', 
      name: 'Viewing', 
      color: 'bg-orange-500', 
      icon: Eye,
      description: 'Property viewings scheduled/completed'
    },
    { 
      id: 'negotiating', 
      name: 'Negotiating', 
      color: 'bg-red-500', 
      icon: DollarSign,
      description: 'Price and terms negotiation'
    },
    { 
      id: 'closed', 
      name: 'Closed', 
      color: 'bg-green-500', 
      icon: CheckCircle,
      description: 'Deal completed successfully'
    }
  ]

  // Group contacts by stage
  const contactsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = contacts.filter(contact => 
      (contact.stage || 'new') === stage.id &&
      (searchTerm === '' || contact.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedAgent === 'all' || contact.assigned_agent === selectedAgent)
    )
    return acc
  }, {})

  // Handle stage change (temporary without drag-drop)
  const handleStageChange = (contact, newStage) => {
    updateContact({
      id: contact.id,
      stage: newStage,
      stage_updated_at: new Date().toISOString()
    })
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified'
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getContactValue = (contact) => {
    return contact.budget_max || contact.budget_min || 0
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading pipeline..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600">Manage your leads through the sales process</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Agents</option>
            <option value="agent1">Agent 1</option>
            <option value="agent2">Agent 2</option>
          </select>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stages.map((stage) => {
          const stageContacts = contactsByStage[stage.id] || []
          const stageValue = stageContacts.reduce((sum, contact) => sum + getContactValue(contact), 0)
          const Icon = stage.icon
          
          return (
            <div key={stage.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                <Icon className="w-4 h-4 text-gray-600" />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{stageContacts.length}</div>
                <div className="text-xs text-gray-500">{stage.name}</div>
                <div className="text-xs text-gray-400">
                  {formatCurrency(stageValue)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pipeline Board */}
      <div className="flex space-x-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageContacts = contactsByStage[stage.id] || []
            const Icon = stage.icon
            
            return (
              <div key={stage.id} className="flex-shrink-0 w-80">
                {/* Stage Header */}
                <div className="bg-white rounded-t-lg border border-gray-200 border-b-0 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                      <Icon className="w-4 h-4 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {stageContacts.length}
                      </span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{stage.description}</p>
                </div>

                {/* Stage Content */}
                <div className="bg-gray-50 border border-gray-200 border-t-0 rounded-b-lg p-2 min-h-[400px] space-y-2">
                  {stageContacts.map((contact, index) => (
                    <div
                      key={contact.id}
                      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                              {/* Contact Header */}
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-semibold text-white">
                                      {contact.name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                                    </span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-gray-900 text-sm truncate">
                                      {contact.name || 'Unknown'}
                                    </h4>
                                    <p className="text-xs text-gray-500 truncate">{contact.phone}</p>
                                  </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                                  <MoreVertical className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Contact Details */}
                              <div className="space-y-1 text-xs text-gray-600">
                                {contact.property_type && (
                                  <div className="flex items-center space-x-1">
                                    <span>🏠</span>
                                    <span className="truncate">{contact.property_type}</span>
                                  </div>
                                )}
                                {(contact.budget_min || contact.budget_max) && (
                                  <div className="flex items-center space-x-1">
                                    <DollarSign className="w-3 h-3" />
                                    <span className="truncate">
                                      {formatCurrency(contact.budget_max || contact.budget_min)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {new Date(contact.updated_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                      {/* Quick Actions */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-gray-400 hover:text-blue-600 rounded">
                            <Phone className="w-3 h-3" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-green-600 rounded">
                            <MessageSquare className="w-3 h-3" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-purple-600 rounded">
                            <User className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-xs text-gray-400">
                          {Math.floor(Math.random() * 30) + 1}d ago
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add New Contact Button */}
                  {stageContacts.length === 0 && (
                    <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center">
                        <Plus className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No contacts in this stage</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
    </div>
  )
}

export default Pipeline
