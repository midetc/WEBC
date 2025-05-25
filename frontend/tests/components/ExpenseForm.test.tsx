import { render, screen, fireEvent } from '../test-utils'
import ExpenseForm from '@/components/ExpenseForm'

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('ExpenseForm', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
  })

  it('renders all form fields', () => {
    render(<ExpenseForm onSuccess={() => {}} />)
    
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add expense/i })).toBeInTheDocument()
  })

  it('shows validation errors', () => {
    render(<ExpenseForm onSuccess={() => {}} />)
    
    fireEvent.click(screen.getByRole('button', { name: /add expense/i }))
    
    expect(screen.getByText(/amount is required/i)).toBeInTheDocument()
    expect(screen.getByText(/description is required/i)).toBeInTheDocument()
    expect(screen.getByText(/category is required/i)).toBeInTheDocument()
  })

  it('validates amount zero', () => {
    render(<ExpenseForm onSuccess={() => {}} />)
    
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: /add expense/i }))
    
    expect(screen.getByText(/amount must be greater than zero/i)).toBeInTheDocument()
  })

  it('validates negative amount', () => {
    render(<ExpenseForm onSuccess={() => {}} />)
    
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '-10' } })
    fireEvent.click(screen.getByRole('button', { name: /add expense/i }))
    
    expect(screen.getByText(/amount must be greater than zero/i)).toBeInTheDocument()
  })








}) 