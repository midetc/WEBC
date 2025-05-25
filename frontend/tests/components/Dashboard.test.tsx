import { render, screen, waitFor } from '../test-utils'
import userEvent from '@testing-library/user-event'
import Dashboard from '@/pages/index'

const mockFetch = jest.fn()
global.fetch = mockFetch

jest.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
}))

describe('Dashboard', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('renders main dashboard elements', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Spendio')).toBeInTheDocument()
    expect(screen.getByText('🤖 ШІ Аналітика витрат')).toBeInTheDocument()
    expect(screen.getByText('Готовий до аналізу!')).toBeInTheDocument()
  })







  it('shows theme toggle button', () => {
    render(<Dashboard />)
    
    const themeButtons = screen.getAllByText('🌙')
    expect(themeButtons.length).toBeGreaterThan(0)
  })
})

describe('Dashboard Interactions', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })



  it('allows navigation to add expense page', () => {
    render(<Dashboard />)
    
    const addExpenseLinks = screen.getAllByText('Додати витрату')
    const addExpenseLink = addExpenseLinks[0].closest('a')
    expect(addExpenseLink).toHaveAttribute('href', '/add-expense')
  })

  it('allows navigation to categories page', () => {
    render(<Dashboard />)
    
    const categoriesLinks = screen.getAllByText('Категорії')
    const categoriesLink = categoriesLinks[0].closest('a')
    expect(categoriesLink).toHaveAttribute('href', '/categories')
  })

  it('allows navigation to profile page', () => {
    render(<Dashboard />)
    
    const profileLinks = screen.getAllByText('Кабінет')
    const profileLink = profileLinks[0].closest('a')
    expect(profileLink).toHaveAttribute('href', '/profile')
  })
})



describe('Dashboard Content', () => {
  it('displays welcome message', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Готовий до аналізу!')).toBeInTheDocument()
    expect(screen.getByText(/Щоб побачити ШІ-аналітику в дії/)).toBeInTheDocument()
  })


}) 