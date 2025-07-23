import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  Home,
  DollarSign,
  Clock
} from 'lucide-react'
import { useContacts, useDeleteContact, useSendMessage } from '../hooks/useContacts'
import AddContactModal from '../components/Modals/AddContactModal'
import LoadingSpinner from '../components/UI/LoadingSpinner'

const Contacts = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // Handle URL search parameters
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    if (urlSearch) {
      setSearchTerm(urlSearch)
    }
  }, [searchParams])

  // Fetch contacts from API
  const { data: contacts = [], isLoading, error } = useContacts({
    search: searchTerm,
    stage: selectedFilter === 'all' ? undefined : selectedFilter
  })

  const { mutate: deleteContact } = useDeleteContact()
  const { mutate: sendMessage, isPending: isSendingMessage } = useSendMessage()

  const stageColors = {
    new: 'bg-blue-100 text-blue-800',
    qualified: 'bg-green-100 text-green-800',
    viewing: 'bg-yellow-100 text-yellow-800',
    negotiating: 'bg-orange-100 text-orange-800',
    closed: 'bg-gray-100 text-gray-800'
  }

  const handleDeleteContact = (contactId, contactName) => {
    if (window.confirm(`Are you sure you want to delete ${contactName}?`)) {
      deleteContact(contactId)
    }
  }

  const handleSendWhatsApp = (contact) => {
    const message = `Hello ${contact.name}! I hope you're doing well. I have some exciting property options that might interest you. Would you like to see them?`

    sendMessage({
      contactId: contact.id,
      message,
      messageType: 'text'
    })
  }

  const handleViewCustomer = (contact) => {
    navigate(`/customer/${contact.id}`)
  }

  const formatBudget = (min, max) => {
    if (!min && !max) return 'Not specified'
    if (!min) return `Up to ${(max / 1000000).toFixed(1)}M XAF`
    if (!max) return `From ${(min / 1000000).toFixed(1)}M XAF`
    return `${(min / 1000000).toFixed(1)}-${(max / 1000000).toFixed(1)}M XAF`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading contacts..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <Users className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading contacts</h3>
        <p className="text-gray-600">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your real estate leads and customers
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-md flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            className="input w-auto"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">All Stages</option>
            <option value="new">New</option>
            <option value="qualified">Qualified</option>
            <option value="viewing">Viewing</option>
            <option value="negotiating">Negotiating</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Contacts grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300 overflow-hidden"
            onClick={() => handleViewCustomer(contact)}
          >
            <div className="p-4 sm:p-6">
              {/* Header with avatar and actions */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm flex-shrink-0">
                    <span className="text-xs sm:text-sm font-semibold text-white">
                      {contact.name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{contact.name || 'Unknown'}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{contact.email || 'No email'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${stageColors[contact.stage] || 'bg-gray-100 text-gray-800'}`}>
                    {contact.stage || 'new'}
                  </span>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 flex-shrink-0"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 sm:space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{contact.phone}</span>
                </div>

                {contact.property_type && (
                  <div className="flex items-start space-x-2 text-xs sm:text-sm text-gray-600">
                    <Home className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-gray-700 truncate block">{contact.property_type}</span>
                      {contact.preferred_location && (
                        <span className="text-gray-500 text-xs truncate block">in {contact.preferred_location}</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate text-xs sm:text-sm">{formatBudget(contact.budget_min, contact.budget_max)}</span>
                </div>

                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">Last: {formatDate(contact.last_contact_at)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSendWhatsApp(contact)
                  }}
                  disabled={isSendingMessage}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {isSendingMessage ? (
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  <span className="hidden sm:inline">WhatsApp</span>
                  <span className="sm:hidden">Chat</span>
                </button>

                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit contact"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteContact(contact.id, contact.name)
                    }}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete contact"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {contacts.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first contact.'
            }
          </p>
          {!searchTerm && selectedFilter === 'all' && (
            <div className="mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary btn-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  )
}

export default Contacts
