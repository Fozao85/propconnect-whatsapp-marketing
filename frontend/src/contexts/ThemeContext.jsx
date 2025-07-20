import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('propconnect-theme')
    if (savedTheme) return savedTheme
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    
    return 'light'
  })

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('propconnect-theme', theme)
    
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setLightTheme = () => setTheme('light')
  const setDarkTheme = () => setTheme('dark')
  const setSystemTheme = () => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    setTheme(systemTheme)
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      setLightTheme,
      setDarkTheme,
      setSystemTheme,
      isDark: theme === 'dark'
    }}>
      {children}
    </ThemeContext.Provider>
  )
}
