import React, { useState } from 'react'
import { Menu, Bell, Search, User, LogOut, Settings } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'
import useNotifications from '../../hooks/useNotifications'
import clsx from 'clsx'

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Real-time notifications
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    getRecentNotifications
  } = useNotifications(user?.id || 1)

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Navigate to contacts page with search term
      navigate(`/contacts?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Logo/Brand - Centered */}
        <div className="flex-1 flex items-center">
          <h2 className="text-lg font-semibold text-gray-900">PropConnect</h2>
        </div>
        
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 relative flex items-center"
              onClick={() => {
                setShowNotifications(!showNotifications)
                if (unreadCount > 0) {
                  markAllAsRead() // Mark all as read when opened
                }
              }}
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 z-10 mt-2.5 w-80 origin-top-right rounded-lg bg-white py-2 shadow-lg ring-1 ring-gray-900/5">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {getRecentNotifications().length > 0 ? (
                    getRecentNotifications().slice(0, 5).map((notification, index) => (
                      <div
                        key={notification.id || index}
                        className={clsx(
                          "px-4 py-3 hover:bg-gray-50 cursor-pointer",
                          !notification.read && "bg-blue-50"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-500">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-gray-500">No recent notifications</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 px-4 py-2">
                  <button
                    onClick={() => {
                      navigate('/notifications')
                      setShowNotifications(false)
                    }}
                    className="text-xs text-primary-600 hover:text-primary-500"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="-m-1.5 flex items-center p-1.5"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600">
                <span className="text-sm font-medium text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-gray-900">
                  {user?.firstName} {user?.lastName}
                </span>
              </span>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-lg bg-white py-2 shadow-lg ring-1 ring-gray-900/5">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                
                <button
                  className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    navigate('/profile')
                    setShowUserMenu(false)
                  }}
                >
                  <User className="mr-3 h-4 w-4" />
                  Profile
                </button>

                <button
                  className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    navigate('/settings')
                    setShowUserMenu(false)
                  }}
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Settings
                </button>
                
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
