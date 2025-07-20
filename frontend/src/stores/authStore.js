import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
import toast from 'react-hot-toast'

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:3000'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (email, password) => {
        set({ isLoading: true })

        try {
          console.log('🔐 Demo login with:', { email, password: '***' })

          // Demo login - simulate API response
          await new Promise(resolve => setTimeout(resolve, 1000))

          if (email && password) {
            const user = {
              id: 1,
              firstName: 'Demo',
              lastName: 'User',
              email: email,
              role: 'admin'
            }
            const token = 'demo-jwt-token-' + Date.now()

            console.log('✅ Demo login successful:', { user, token })

            // Set axios default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false
            })

            toast.success(`Welcome back, ${user.firstName}!`)
            return { success: true }
          } else {
            throw new Error('Email and password are required')
          }
          
        } catch (error) {
          console.error('❌ Login error:', error)
          console.error('📋 Error response:', error.response?.data)
          console.error('📋 Error status:', error.response?.status)

          const message = error.response?.data?.message || 'Login failed'
          toast.error(message)

          set({ isLoading: false })
          return { success: false, error: message }
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        
        try {
          const response = await axios.post('/api/auth/register', userData)
          const { user, token } = response.data
          
          // Set axios default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })

          toast.success(`Welcome to PropConnect, ${user.firstName}!`)
          return { success: true }
          
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed'
          toast.error(message)
          
          set({ isLoading: false })
          return { success: false, error: message }
        }
      },

      logout: () => {
        // Remove authorization header
        delete axios.defaults.headers.common['Authorization']
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })

        toast.success('Logged out successfully')
      },

      // Initialize auth state (simplified for demo)
      initializeAuth: async () => {
        const { token, user } = get()

        if (!token || !user) {
          set({
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          })
          return
        }

        // For demo purposes, if we have a token and user, consider them valid
        // In production, you'd verify with the server
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })

        } catch (error) {
          // Clear auth state on any error
          delete axios.defaults.headers.common['Authorization']

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      },

      // Update user profile
      updateProfile: async (userData) => {
        try {
          const response = await axios.put('/api/auth/profile', userData)
          const updatedUser = response.data.user
          
          set({ user: updatedUser })
          toast.success('Profile updated successfully')
          
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Profile update failed'
          toast.error(message)
          
          return { success: false, error: message }
        }
      }
    }),
    {
      name: 'propconnect-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Initialize auth on app start
const initAuth = async () => {
  const store = useAuthStore.getState()
  await store.initializeAuth()

  // Auto-login for demo if not authenticated
  if (!store.isAuthenticated) {
    console.log('🔄 Auto-logging in demo user...')
    await store.login('demo@propconnect.com', 'demo123')
  }
}

// Initialize auth
initAuth().catch(console.error)

export { useAuthStore }
