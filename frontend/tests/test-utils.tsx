import React from 'react'
import { render, RenderOptions } from '@testing-library/react'

const ThemeContext = React.createContext({
  isDark: false,
  toggleTheme: () => {}
})

const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeContext.Provider value={{
      isDark: false,
      toggleTheme: () => {}
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

jest.mock('../src/context/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    isDark: false,
    toggleTheme: jest.fn()
  })
}))

jest.mock('../src/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: { id: 1, name: 'Test User', email: 'test@example.com' },
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    isLoading: false,
    isAuthenticated: true
  })
}))

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MockThemeProvider>
      {children}
    </MockThemeProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render } 