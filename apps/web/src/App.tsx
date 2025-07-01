import { Routes, Route } from 'react-router-dom'
import ChatPage from './pages/ChatPage'
import TasksPage from './pages/TasksPage'
import CategoryPage from './pages/CategoryPage'
import CategoriesPage from './pages/CategoriesPage'
import SearchPage from './pages/SearchPage'
import SettingsPage from './pages/SettingsPage'
import AppLayout from './components/AppLayout'

function App() {
  return (
    <div className="max-w-md mx-auto">
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout>
              <ChatPage />
            </AppLayout>
          }
        />
        <Route
          path="/tasks"
          element={
            <AppLayout>
              <TasksPage />
            </AppLayout>
          }
        />
        <Route
          path="/categories"
          element={
            <AppLayout>
              <CategoriesPage />
            </AppLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          }
        />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/c/:category" element={<CategoryPage />} />
      </Routes>
    </div>
  )
}

export default App
