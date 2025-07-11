import { useState, useEffect } from 'react'
import {
  Palette,
  DollarSign,
  Info,
  Smartphone,
} from 'lucide-react'
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch'

interface CostData {
  totalCost: number
  totalRequests: number
  dailyBreakdown: Array<{
    date: string
    cost: number
    requests: number
  }>
}

const defaultCategories = [
  { id: 'task', name: 'Tasks', emoji: '✅', enabled: true },
  { id: 'idea', name: 'Ideas', emoji: '💡', enabled: true },
  { id: 'journal', name: 'Journal', emoji: '📖', enabled: true },
  { id: 'meeting', name: 'Meetings', emoji: '👥', enabled: true },
  { id: 'reading', name: 'Reading', emoji: '📚', enabled: true },
  { id: 'misc', name: 'Misc', emoji: '📝', enabled: true },
]

export default function SettingsPage() {
  const [categories, setCategories] = useState(defaultCategories)
  const [costData, setCostData] = useState<CostData>({
    totalCost: 0,
    totalRequests: 0,
    dailyBreakdown: []
  })
  const [isLoadingCosts, setIsLoadingCosts] = useState(true)
  const { authenticatedFetch } = useAuthenticatedFetch()

  useEffect(() => {
    async function fetchCostData() {
      try {
        const response = await authenticatedFetch('/api/llm-costs')
        if (response.ok) {
          const data: CostData = await response.json()
          setCostData(data)
        } else {
          console.error('Failed to fetch cost data')
        }
      } catch (error) {
        console.error('Error fetching cost data:', error)
      } finally {
        setIsLoadingCosts(false)
      }
    }

    fetchCostData()
  }, [authenticatedFetch])

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, enabled: !cat.enabled } : cat
      )
    )
  }

  const daysCount = Math.max(costData.dailyBreakdown.length, 1)

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-4">
          {/* Categories Configuration */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <Palette size={20} className="text-slate-600 dark:text-slate-400" />
              <div>
                <h2 className="font-medium text-slate-800 dark:text-slate-200">
                  Categories
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Enable or disable note categories
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{category.emoji}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {category.name}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={`w-12 h-6 rounded-full border-2 flex items-center transition-colors ${
                      category.enabled
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-slate-200 dark:bg-slate-600 border-slate-300 dark:border-slate-500'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        category.enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Cost Tracking */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign size={20} className="text-slate-600 dark:text-slate-400" />
              <div>
                <h2 className="font-medium text-slate-800 dark:text-slate-200">
                  AI Usage & Costs
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Track your AI categorization usage
                </p>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {isLoadingCosts ? '...' : `$${costData.totalCost.toFixed(4)}`}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Total Cost ({daysCount} day{daysCount === 1 ? '' : 's'})
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {isLoadingCosts ? '...' : costData.totalRequests}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Total Requests
                </div>
              </div>
            </div>

            {/* Daily Breakdown */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Daily Breakdown
              </h3>
              {isLoadingCosts ? (
                <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                  Loading cost data...
                </div>
              ) : costData.dailyBreakdown.length === 0 ? (
                <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                  No cost data available yet
                </div>
              ) : (
                costData.dailyBreakdown.map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg"
                  >
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {new Date(day.date).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {day.requests} request{day.requests === 1 ? '' : 's'}
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        ${day.cost.toFixed(4)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PWA Status */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone size={20} className="text-slate-600 dark:text-slate-400" />
              <div>
                <h2 className="font-medium text-slate-800 dark:text-slate-200">
                  App Installation
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Progressive Web App status
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Installable</span>
                <span className="text-green-600 dark:text-green-400">✓ Yes</span>
              </div>
              <div className="flex justify-between">
                <span>Installed</span>
                <span className={
                  typeof window !== 'undefined' && 
                  (window.matchMedia('(display-mode: standalone)').matches || 
                   'standalone' in window.navigator && (window.navigator as {standalone?: boolean}).standalone === true)
                    ? "text-green-600 dark:text-green-400" 
                    : "text-slate-500 dark:text-slate-400"
                }>
                  {typeof window !== 'undefined' && 
                   (window.matchMedia('(display-mode: standalone)').matches || 
                    'standalone' in window.navigator && (window.navigator as {standalone?: boolean}).standalone === true) ? "✓ Yes" : "✕ No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Offline Ready</span>
                <span className="text-green-600 dark:text-green-400">✓ Yes</span>
              </div>
            </div>
            
            {typeof window !== 'undefined' && 
             !(window.matchMedia('(display-mode: standalone)').matches || 
               'standalone' in window.navigator && (window.navigator as {standalone?: boolean}).standalone === true) && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  💡 Add ChatNotes to your home screen for the best experience! 
                  Look for the install prompt or use your browser's "Add to Home Screen" option.
                </p>
              </div>
            )}
          </div>

          {/* App Info */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <Info size={20} className="text-slate-600 dark:text-slate-400" />
              <div>
                <h2 className="font-medium text-slate-800 dark:text-slate-200">
                  About
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  App information
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Version</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Build</span>
                <span>2024.01.20</span>
              </div>
              <div className="flex justify-between">
                <span>AI Model</span>
                <span>GPT-4o</span>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}