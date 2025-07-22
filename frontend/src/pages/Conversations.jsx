import React, { useState, useEffect } from 'react'
import {
  MessageSquare,
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Home,
  Image,
  FileText,
  Plus,
  Filter,
  Upload
} from 'lucide-react'
import toast from 'react-hot-toast'
import useSocket from '../hooks/useSocket'
import { useConversations, useConversationMessages, useSendMessage, useMarkAsRead } from '../hooks/useConversations'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import PropertySelectorModal from '../components/Modals/PropertySelectorModal'
import ConversationsDebug from '../components/Debug/ConversationsDebug'

const Conversations = () => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [typingUsers, setTypingUsers] = useState({})

  // Real-time socket connection
  const socket = useSocket(1) // Demo user ID

  // Fetch conversations and messages (with cache busting)
  const { data: conversations = [], isLoading: conversationsLoading, error: conversationsError, refetch: refetchConversations } = useConversations()
  const { data: messagesData, isLoading: messagesLoading } = useConversationMessages(selectedConversation)
  const { mutate: sendMessage, isPending: sendingMessage } = useSendMessage()
  const { mutate: markAsRead } = useMarkAsRead()

  // Debug logging
  console.log('🔍 Conversations Debug:', {
    conversations,
    conversationsLoading,
    conversationsError,
    conversationsCount: conversations.length
  })

  // Real-time message handling
  useEffect(() => {
    if (socket.socket) {
      // Listen for new messages
      socket.onNewMessage((data) => {
        console.log('📥 New real-time message:', data)

        // Update conversations list if needed
        if (data.conversationId && !conversations.find(c => c.id === data.conversationId)) {
          fetchConversations()
        }

        // Update current conversation messages if viewing this conversation
        if (selectedConversation && selectedConversation.id === data.conversationId) {
          setMessages(prev => [...prev, data.message])
        }

        // Show toast notification
        toast.success(`New message from ${data.customer?.name || 'Unknown'}`)
      })

      // Listen for message status updates
      socket.socket.on('message-status-update', (data) => {
        console.log('📊 Message status update:', data)

        // Update message status in current conversation
        setMessages(prev => prev.map(msg =>
          msg.message_id === data.messageId
            ? { ...msg, whatsapp_status: data.status }
            : msg
        ))
      })

      // Listen for typing indicators
      socket.onUserTyping((data) => {
        if (data.conversationId === selectedConversation?.id) {
          setTypingUsers(prev => ({
            ...prev,
            [data.userId]: data.isTyping
          }))

          // Clear typing after 3 seconds
          if (data.isTyping) {
            setTimeout(() => {
              setTypingUsers(prev => ({
                ...prev,
                [data.userId]: false
              }))
            }, 3000)
          }
        }
      })
    }

    return () => {
      if (socket.socket) {
        socket.removeListener('new-message')
        socket.removeListener('message-status-update')
        socket.removeListener('user-typing')
      }
    }
  }, [socket.socket, selectedConversation, conversations])

  // Auto-select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0].id)
    }
  }, [conversations, selectedConversation])

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      markAsRead(selectedConversation)
    }
  }, [selectedConversation, markAsRead])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the menu buttons themselves
      if (event.target.closest('[data-menu-button]')) {
        return
      }
      setShowAttachmentMenu(false)
      setShowMoreMenu(false)
    }

    if (showAttachmentMenu || showMoreMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showAttachmentMenu, showMoreMenu])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim() && selectedConversation) {
      sendMessage({
        contactId: selectedConversation,
        message: newMessage.trim()
      }, {
        onSuccess: () => {
          setNewMessage('')
        }
      })
    }
  }

  const handleCall = () => {
    if (!selectedConversation) return
    const conversation = conversations.find(c => c.id === selectedConversation)
    toast.success(`Calling ${conversation?.contact?.name}...`)
  }

  const handleVideoCall = () => {
    if (!selectedConversation) return
    const conversation = conversations.find(c => c.id === selectedConversation)
    toast.success(`Starting video call with ${conversation?.contact?.name}...`)
  }

  const handleAttachment = (type) => {
    setShowAttachmentMenu(false)
    switch(type) {
      case 'image':
        handleFileUpload('image/*')
        break
      case 'file':
        handleFileUpload('application/pdf,.doc,.docx,.txt,.xlsx,.pptx')
        break
      case 'property':
        setShowPropertyModal(true)
        break
      default:
        break
    }
  }

  const handleFileUpload = (acceptTypes) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = acceptTypes
    input.onchange = (e) => {
      const files = Array.from(e.target.files)
      if (files.length > 0) {
        toast.success(`Selected ${files.length} file(s) for upload`)
        // In a real app, you would upload the files here and send them via WhatsApp
        console.log('Files selected:', files)
      }
    }
    input.click()
  }

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation =>
    conversation.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedConversationData = conversations.find(conv => conv.id === selectedConversation)
  const messages = messagesData || []

  if (conversationsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading conversations..." />
      </div>
    )
  }

  if (conversationsError) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
          <p className="mt-1 text-sm text-gray-600">
            WhatsApp conversations with your leads and customers
          </p>
        </div>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <MessageSquare className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-lg font-medium">Failed to load conversations</h3>
            <p className="text-sm text-gray-600 mt-1">
              Error: {conversationsError.message}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Debug Component - Remove this after testing */}
      <ConversationsDebug />

      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
        <p className="mt-1 text-sm text-gray-600">
          WhatsApp conversations with your leads and customers
        </p>
      </div>

      {/* Chat interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations list */}
        <div className="card lg:col-span-1">
          <div className="card-header border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 border-0 focus:ring-0"
              />
            </div>
          </div>
          
          <div className="card-content p-0">
            <div className="divide-y divide-gray-200">
              {filteredConversations.length > 0 ? filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedConversation === conversation.id ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600">
                        <span className="text-sm font-medium text-white">
                          {conversation.contact.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        conversation.contact.status === 'online' ? 'bg-green-500' :
                        conversation.contact.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.contact.name}
                        </p>
                        <p className="text-xs text-gray-500">{conversation.timestamp}</p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unread > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary-600 rounded-full">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )) : (
                <div className="p-8 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {searchTerm ? 'No matching conversations' : 'No conversations'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm
                      ? `No conversations found matching "${searchTerm}"`
                      : 'Start messaging your contacts to see conversations here.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="card lg:col-span-2 flex flex-col">
          {selectedConversationData ? (
            <>
              {/* Chat header */}
              <div className="card-header border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600">
                      <span className="text-sm font-medium text-white">
                        {selectedConversationData.contact.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {selectedConversationData.contact.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selectedConversationData.contact.phone} • {selectedConversationData.contact.status}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowPropertyModal(true)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Send Property"
                    >
                      <Home className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCall}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Voice Call"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleVideoCall}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Video Call"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button
                        data-menu-button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowMoreMenu(!showMoreMenu)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        title="More Options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {showMoreMenu && (
                        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white py-2 shadow-lg ring-1 ring-gray-900/5">
                          <button
                            onClick={() => {
                              setShowMoreMenu(false)
                              toast.success('Contact info feature coming soon!')
                            }}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Contact Info
                          </button>
                          <button
                            onClick={() => {
                              setShowMoreMenu(false)
                              toast.success('Clear chat feature coming soon!')
                            }}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Clear Chat
                          </button>
                          <button
                            onClick={() => {
                              setShowMoreMenu(false)
                              toast.success('Block contact feature coming soon!')
                            }}
                            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          >
                            Block Contact
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="md" text="Loading messages..." />
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'agent'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${
                            message.sender === 'agent' ? 'text-primary-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp}
                          </p>
                          {message.sender === 'agent' && message.status && (
                            <div className="ml-2">
                              {message.status === 'delivered' ? (
                                <CheckCheck className="w-3 h-3 text-primary-200" />
                              ) : (
                                <Check className="w-3 h-3 text-primary-200" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No messages yet</p>
                    <p className="text-xs text-gray-400">Send a message to start the conversation</p>
                  </div>
                )}
              </div>

              {/* Message input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <div className="relative">
                    <button
                      type="button"
                      data-menu-button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowAttachmentMenu(!showAttachmentMenu)
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Add Files"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    {showAttachmentMenu && (
                      <div className="absolute bottom-full left-0 z-10 mb-2 w-48 origin-bottom-left rounded-lg bg-white py-2 shadow-lg ring-1 ring-gray-900/5">
                        <button
                          onClick={() => handleAttachment('image')}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Image className="mr-3 h-4 w-4" />
                          Image
                        </button>
                        <button
                          onClick={() => handleAttachment('file')}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FileText className="mr-3 h-4 w-4" />
                          Document
                        </button>
                        <button
                          onClick={() => handleAttachment('property')}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Home className="mr-3 h-4 w-4" />
                          Property
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="input pr-10"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={sendingMessage || !newMessage.trim()}
                    className="btn btn-primary btn-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a conversation from the list to start messaging.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Property Selector Modal */}
        <PropertySelectorModal
          isOpen={showPropertyModal}
          onClose={() => setShowPropertyModal(false)}
          contactId={selectedConversation}
          contactName={selectedConversationData?.contact.name}
        />
      </div>


    </div>
  )
}

export default Conversations
