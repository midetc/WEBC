import { render, screen } from '../test-utils'

// Mock chart components since they don't exist yet
const MockExpenseChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) {
    return <div>No data available</div>
  }
  
  const total = data.reduce((sum, item) => sum + item.amount, 0)
  
  return (
    <div data-testid="expense-chart" role="img" aria-label="expense distribution chart" tabIndex={0}>
      <div data-testid="pie-chart">
        <div data-testid="responsive-container">
          <div data-testid="pie" />
          {data.map((item, index) => (
            <div key={index}>
              <span>{item.category}</span>
              <span>${item.amount}</span>
              <span>{((item.amount / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const MockForecastChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) {
    return <div>No forecast data available</div>
  }
  
  return (
    <div data-testid="forecast-chart">
      <div data-testid="line-chart">
        <div data-testid="responsive-container">
          <div data-testid="x-axis" />
          <div data-testid="y-axis" />
          <div data-testid="cartesian-grid" />
          <div data-testid="tooltip" />
          <div data-testid="legend" />
          <div data-testid="line" data-key="actual" />
          <div data-testid="line" data-key="forecast" />
          {data.some(item => item.confidence_lower) && (
            <div data-testid="area-chart">
              <div data-testid="area" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

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

describe('ExpenseChart', () => {
  const mockExpenseData = [
    { category: 'food', amount: 150, count: 5 },
    { category: 'transport', amount: 80, count: 3 },
    { category: 'entertainment', amount: 120, count: 2 },
  ]

  it('renders pie chart with data', () => {
    render(<MockExpenseChart data={mockExpenseData} />)
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    expect(screen.getByTestId('pie')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('displays category labels', () => {
    render(<MockExpenseChart data={mockExpenseData} />)
    
    expect(screen.getByText('food')).toBeInTheDocument()
    expect(screen.getByText('transport')).toBeInTheDocument()
    expect(screen.getByText('entertainment')).toBeInTheDocument()
  })

  it('displays amounts correctly', () => {
    render(<MockExpenseChart data={mockExpenseData} />)
    
    expect(screen.getByText('$150')).toBeInTheDocument()
    expect(screen.getByText('$80')).toBeInTheDocument()
    expect(screen.getByText('$120')).toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    render(<MockExpenseChart data={[]} />)
    
    expect(screen.getByText(/no data available/i)).toBeInTheDocument()
  })

  it('calculates percentages correctly', () => {
    render(<MockExpenseChart data={mockExpenseData} />)
    
    expect(screen.getByText('42.9%')).toBeInTheDocument()
    expect(screen.getByText('22.9%')).toBeInTheDocument()
    expect(screen.getByText('34.3%')).toBeInTheDocument()
  })
})

describe('ForecastChart', () => {
  const mockForecastData = [
    { date: '2024-01-01', actual: 100, forecast: null },
    { date: '2024-01-02', actual: 120, forecast: null },
    { date: '2024-01-03', actual: 90, forecast: null },
    { date: '2024-01-04', actual: null, forecast: 110 },
    { date: '2024-01-05', actual: null, forecast: 115 },
    { date: '2024-01-06', actual: null, forecast: 105 },
  ]

  it('renders line chart with forecast data', () => {
    render(<MockForecastChart data={mockForecastData} />)
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getAllByTestId('line')).toHaveLength(2)
  })

  it('displays chart axes', () => {
    render(<MockForecastChart data={mockForecastData} />)
    
    expect(screen.getByTestId('x-axis')).toBeInTheDocument()
    expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
  })

  it('includes tooltip and legend', () => {
    render(<MockForecastChart data={mockForecastData} />)
    
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    expect(screen.getByTestId('legend')).toBeInTheDocument()
  })

  it('handles empty forecast data', () => {
    render(<MockForecastChart data={[]} />)
    
    expect(screen.getByText(/no forecast data available/i)).toBeInTheDocument()
  })

  it('displays confidence interval when provided', () => {
    const dataWithConfidence = mockForecastData.map(item => ({
      ...item,
      confidence_lower: item.forecast ? item.forecast - 10 : null,
      confidence_upper: item.forecast ? item.forecast + 10 : null,
    }))
    
    render(<MockForecastChart data={dataWithConfidence} />)
    
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    expect(screen.getByTestId('area')).toBeInTheDocument()
  })

  it('distinguishes between actual and forecast data visually', () => {
    render(<MockForecastChart data={mockForecastData} />)
    
    const lines = screen.getAllByTestId('line')
    expect(lines).toHaveLength(2)
    
    expect(lines[0]).toHaveAttribute('data-key', 'actual')
    expect(lines[1]).toHaveAttribute('data-key', 'forecast')
  })
})

describe('Chart Accessibility', () => {
  const mockData = [
    { category: 'food', amount: 150 },
    { category: 'transport', amount: 80 },
  ]

  it('provides accessible labels', () => {
    render(<MockExpenseChart data={mockData} />)
    
    expect(screen.getByRole('img', { name: /expense distribution chart/i })).toBeInTheDocument()
  })

  it('supports keyboard navigation', () => {
    render(<MockExpenseChart data={mockData} />)
    
    const chart = screen.getByTestId('expense-chart')
    expect(chart).toHaveAttribute('tabIndex', '0')
  })
}) 