import React, { useState, useEffect } from 'react'
import { 
  X, 
  Users, 
  MessageSquare, 
  Calendar, 
  Target,
  Send,
  Eye,
  Filter,
  Plus,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'

const CampaignBuilder = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1)
  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    message_template: '',
    target_audience: {
      stage: '',
      location: '',
      budget_min: '',
      budget_max: ''
    },
    schedule_type: 'immediate',
    scheduled_at: ''
  })
  const [templates, setTemplates] = useState([])
  const [audiencePreview, setAudiencePreview] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/campaign-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const previewAudience = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/campaigns/preview-audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_audience: campaignData.target_audience })
      })
      
      if (response.ok) {
        const data = await response.json()
        setAudiencePreview(data)
      }
    } catch (error) {
      console.error('Error previewing audience:', error)
    }
  }

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setCampaignData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setCampaignData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const createCampaign = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      })

      if (response.ok) {
        toast.success('Campaign created successfully!')
        onSuccess()
      } else {
        toast.error('Failed to create campaign')
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      toast.error('Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              value={campaignData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., New Property Launch - Douala"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={campaignData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of your campaign goals..."
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Audience</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Stage
            </label>
            <select
              value={campaignData.target_audience.stage}
              onChange={(e) => handleInputChange('target_audience.stage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Stages</option>
              <option value="new">New Leads</option>
              <option value="qualified">Qualified</option>
              <option value="interested">Interested</option>
              <option value="viewing">Viewing Scheduled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={campaignData.target_audience.location}
              onChange={(e) => handleInputChange('target_audience.location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Douala, Yaoundé"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Budget (XAF)
            </label>
            <input
              type="number"
              value={campaignData.target_audience.budget_min}
              onChange={(e) => handleInputChange('target_audience.budget_min', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 20000000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Budget (XAF)
            </label>
            <input
              type="number"
              value={campaignData.target_audience.budget_max}
              onChange={(e) => handleInputChange('target_audience.budget_max', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 100000000"
            />
          </div>
        </div>

        <button
          onClick={previewAudience}
          className="mt-4 flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <Eye className="w-4 h-4" />
          <span>Preview Audience ({audiencePreview.length} contacts)</span>
        </button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Template</h3>
        
        {templates.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Template
            </label>
            <select
              onChange={(e) => {
                const template = templates.find(t => t.id === parseInt(e.target.value))
                if (template) {
                  handleInputChange('message_template', template.content)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a template...</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.category})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Content
          </label>
          <textarea
            value={campaignData.message_template}
            onChange={(e) => handleInputChange('message_template', e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Write your message here... Use {name}, {location}, {budget} for personalization"
          />
          <p className="text-xs text-gray-500 mt-1">
            Available variables: {'{name}'}, {'{location}'}, {'{budget}'}
          </p>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule & Review</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="immediate"
                  checked={campaignData.schedule_type === 'immediate'}
                  onChange={(e) => handleInputChange('schedule_type', e.target.value)}
                  className="mr-2"
                />
                Send immediately
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="scheduled"
                  checked={campaignData.schedule_type === 'scheduled'}
                  onChange={(e) => handleInputChange('schedule_type', e.target.value)}
                  className="mr-2"
                />
                Schedule for later
              </label>
            </div>
          </div>

          {campaignData.schedule_type === 'scheduled' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Date & Time
              </label>
              <input
                type="datetime-local"
                value={campaignData.scheduled_at}
                onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Campaign Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Campaign Summary</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Name:</strong> {campaignData.name}</p>
              <p><strong>Target Audience:</strong> {audiencePreview.length} contacts</p>
              <p><strong>Schedule:</strong> {campaignData.schedule_type === 'immediate' ? 'Send immediately' : 'Scheduled'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Campaign</h2>
            <p className="text-sm text-gray-500">Step {step} of 4</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNum <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    stepNum < step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Previous
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={createCampaign}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Creating...' : 'Create Campaign'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignBuilder
