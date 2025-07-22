import React from 'react'
import { useConversations } from '../../hooks/useConversations'

const ConversationsDebug = () => {
  const { data: conversations = [], isLoading, error } = useConversations()

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">🔍 Conversations Debug</h3>
      
      <div className="space-y-2">
        <div>
          <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
        </div>
        
        <div>
          <strong>Error:</strong> {error ? error.message : 'None'}
        </div>
        
        <div>
          <strong>Conversations Count:</strong> {conversations.length}
        </div>
        
        <div>
          <strong>Raw Data:</strong>
          <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(conversations, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default ConversationsDebug
