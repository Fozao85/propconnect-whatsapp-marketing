import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
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
  Loader2
} from 'lucide-react'
import { useContacts, useDeleteContact, useSendMessage } from '../hooks/useContacts'
import AddContactModal from '../components/Modals/AddContactModal'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import CustomerProfile from '../components/Customer/CustomerProfile'
import { useUpdateCustomer } from '../hooks/useCustomer'

const Contacts = () => {
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCustomerProfile, setShowCustomerProfile] = useState(false)

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
  const { mutate: updateCustomer } = useUpdateCustomer()

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
    setSelectedCustomer(contact)
    setShowCustomerProfile(true)
  }

  const handleCloseCustomerProfile = () => {
    setShowCustomerProfile(false)
    setSelectedCustomer(null)
  }

  const handleUpdateCustomer = (updatedCustomer) => {
    updateCustomer(updatedCustomer)
  }

  const formatBudget = (min, max) => {
    if (!min && !max) return 'Not specified'
    if (!min) return `Up to ${(max / 1000000).toFixed(1)}M XAF`
    if (!max) return `From ${(min / 1000000).toFixed(1)}M XAF`
    return `${(min / 1000000).toFixed(1)}M - ${(max / 1000000).toFixed(1)}M XAF`
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="card cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleViewCustomer(contact)}
          >
            <div className="card-content">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600">
                    <span className="text-sm font-medium text-white">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{contact.name}</h3>
                    <p className="text-xs text-gray-500">{contact.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <span className={`badge ${stageColors[contact.stage] || 'bg-gray-100 text-gray-800'}`}>
                    {contact.stage || 'new'}
                  </span>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{contact.phone}</span>
                </div>

                {contact.email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{contact.email}</span>
                  </div>
                )}

                {contact.property_type && (
                  <div className="text-sm text-gray-600">
                    <strong>Interest:</strong> {contact.property_type}
                    {contact.preferred_location && ` in ${contact.preferred_location}`}
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <strong>Budget:</strong> {formatBudget(contact.budget_min, contact.budget_max)}
                </div>

                <div className="text-xs text-gray-500">
                  Last contact: {formatDate(contact.last_contact_at)}
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSendWhatsApp(contact)
                  }}
                  disabled={isSendingMessage}
                  className="btn btn-outline btn-sm flex items-center space-x-1"
                >
                  {isSendingMessage ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <MessageSquare className="w-3 h-3" />
                  )}
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="btn btn-ghost btn-sm"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteContact(contact.id, contact.name)
                  }}
                  className="btn btn-ghost btn-sm text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
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

      {/* Customer Profile Modal */}
      {showCustomerProfile && selectedCustomer && (
        <CustomerProfile
          customer={selectedCustomer}
          onClose={handleCloseCustomerProfile}
          onUpdate={handleUpdateCustomer}
        />
      )}
    </div>
  )
}

export default Contacts
