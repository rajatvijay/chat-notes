import { Routes, Route } from 'react-router-dom'
import ChatPage from './pages/ChatPage'
import TasksPage from './pages/TasksPage'
import ReadingListPage from './pages/ReadingListPage'
import CategoryPage from './pages/CategoryPage'
import CategoriesPage from './pages/CategoriesPage'
import SearchPage from './pages/SearchPage'
import SettingsPage from './pages/SettingsPage'
import SignInPage from './pages/SignInPage'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <div className="max-w-md mx-auto">
        <Routes>
          <Route path="/signin" element={<SignInPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ChatPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TasksPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reading"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ReadingListPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CategoriesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/search" 
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/c/:category" 
            element={
              <ProtectedRoute>
                <CategoryPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
