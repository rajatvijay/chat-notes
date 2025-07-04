import { Loader } from 'lucide-react'

interface AuthLoaderProps {
  message?: string
  showLogo?: boolean
}

export default function AuthLoader({ message = 'Loading...', showLogo = false }: AuthLoaderProps) {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6">
        {showLogo && (
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
            <img 
              src="/logo-optimized.png" 
              alt="ChatNotes" 
              className="w-12 h-12 object-contain" 
            />
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <Loader className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            {message}
          </span>
        </div>
        
        {showLogo && (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-1">
              ChatNotes
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Initializing your workspace...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}