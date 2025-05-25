import { useState } from 'react'

interface ExpenseFormProps {
  onSuccess: () => void
}

export default function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!amount) newErrors.amount = 'Amount is required'
    else if (parseFloat(amount) <= 0) newErrors.amount = 'Amount must be greater than zero'
    else if (parseFloat(amount) < 0) newErrors.amount = 'Amount must be positive'
    
    if (!description) newErrors.description = 'Description is required'
    if (!category) newErrors.category = 'Category is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/expenses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description,
          category,
          date
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        setErrors({ submit: error.detail || 'Validation error' })
        return
      }
      
      setAmount('')
      setDescription('')
      setCategory('')
      setDate('')
      setErrors({})
      onSuccess()
      
    } catch (error) {
      setErrors({ submit: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium">
          Amount
        </label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="">Select category</option>
          <option value="food">Food</option>
          <option value="transport">Transport</option>
          <option value="entertainment">Entertainment</option>
        </select>
        {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  )
} 