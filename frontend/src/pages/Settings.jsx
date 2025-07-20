import React, { useState } from 'react'
import {
  Bell,
  Shield,
  Globe,
  Save,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Database,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import toast from 'react-hot-toast'

const Settings = () => {
  const [settings, setSettings] = useState({
    // Notification Settings
    notifications: {
      email: true,
      whatsapp: true,
      browser: true,
      marketing: false,
      sound: true,
      desktop: true
    },

    // Privacy Settings
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: true,
      dataCollection: true,
      analytics: true
    },

    // Appearance Settings
    appearance: {
      theme: 'light',
      language: 'en',
      timezone: 'WAT',
      dateFormat: 'DD/MM/YYYY',
      currency: 'XAF'
    },

    // Security Settings
    security: {
      twoFactor: false,
      sessionTimeout: '30',
      passwordExpiry: '90',
      loginNotifications: true
    },

    // Data Settings
    data: {
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: '365',
      exportFormat: 'json'
    }
  })

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }))
  }

  const handleSave = () => {
    // In a real app, this would make an API call
    toast.success('Settings saved successfully!')
  }

  const handleReset = () => {
    // Reset to default settings
    toast.success('Settings reset to defaults!')
  }

  const handleExportData = () => {
    // Export user data
    toast.success('Data export started! You will receive an email when ready.')
  }

  const handleImportData = () => {
    // Import user data
    toast.success('Data import started!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your application settings and preferences</p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            className="btn btn-ghost btn-md flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary btn-md flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Bell className="w-5 h-5 inline mr-2" />
              Notifications
            </h3>
          </div>
          <div className="card-content space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {key === 'whatsapp' ? 'WhatsApp' : key} Notifications
                  </p>
                  <p className="text-xs text-gray-500">
                    {key === 'email' && 'Receive notifications via email'}
                    {key === 'whatsapp' && 'Receive notifications via WhatsApp'}
                    {key === 'browser' && 'Show browser notifications'}
                    {key === 'marketing' && 'Receive marketing updates'}
                    {key === 'sound' && 'Play notification sounds'}
                    {key === 'desktop' && 'Show desktop notifications'}
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('notifications', key, !value)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Shield className="w-5 h-5 inline mr-2" />
              Privacy
            </h3>
          </div>
          <div className="card-content space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Visibility
              </label>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                className="input"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="contacts">Contacts Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
