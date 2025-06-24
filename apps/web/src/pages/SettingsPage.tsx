import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Palette, DollarSign, Info, MessageCircle, Grid } from 'lucide-react'

// Mock AI cost data - in real app this would come from your backend
const mockCostData = [
  { date: '2024-01-20', cost: 0.15, requests: 12 },
  { date: '2024-01-19', cost: 0.23, requests: 18 },
  { date: '2024-01-18', cost: 0.08, requests: 6 },
  { date: '2024-01-17', cost: 0.31, requests: 24 },
  { date: '2024-01-16', cost: 0.19, requests: 15 },
]

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

  const toggleCategory = (id: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === id ? { ...cat, enabled: !cat.enabled } : cat
      )
    )
  }

  const totalCost = mockCostData.reduce((sum, day) => sum + day.cost, 0)
  const totalRequests = mockCostData.reduce((sum, day) => sum + day.requests, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
      <div className="flex-1 p-4 pb-20">
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <Settings size={28} className="text-blue-500/60" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent mb-2">
              Settings
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Customize your experience
            </p>
          </div>

        {/* Categories Configuration */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
              <Palette size={20} className="text-blue-500/60" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">
                Categories
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enable or disable note categories
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-700/30 rounded-xl">
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
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                    category.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* AI Cost Tracking */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center">
              <DollarSign size={20} className="text-green-500/60" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">
                AI Usage & Costs
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track your AI categorization usage
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50/50 dark:bg-slate-700/30 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                ${totalCost.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Total Cost (5 days)
              </div>
            </div>
            <div className="bg-slate-50/50 dark:bg-slate-700/30 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {totalRequests}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Total Requests
              </div>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Daily Breakdown
            </h3>
            {mockCostData.map((day) => (
              <div key={day.date} className="flex items-center justify-between p-2 bg-slate-50/50 dark:bg-slate-700/30 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {new Date(day.date).toLocaleDateString([], { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {day.requests} requests
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    ${day.cost.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
              <Info size={20} className="text-purple-500/60" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">
                About
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-white/20 dark:border-slate-800/50 z-40">
        <div className="flex items-center justify-around p-3">
          <Link
            to="/"
            className="flex flex-col items-center gap-1 p-3 rounded-2xl min-w-max text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50"
          >
            <MessageCircle size={20} />
            <span className="text-xs font-medium">Chat</span>
          </Link>

          <Link
            to="/categories"
            className="flex flex-col items-center gap-1 p-3 rounded-2xl min-w-max text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50"
          >
            <Grid size={20} />
            <span className="text-xs font-medium">Notes</span>
          </Link>

          <Link
            to="/settings"
            className="flex flex-col items-center gap-1 p-3 rounded-2xl min-w-max bg-gradient-to-br from-blue-500 to-purple-600 text-white"
          >
            <Settings size={20} />
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}