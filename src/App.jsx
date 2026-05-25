import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Landing   from '@/pages/Landing'
import AR        from '@/pages/AR'
import Dashboard from '@/pages/admin/Dashboard'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/"       element={<Landing />}   />
          <Route path="/ar"     element={<AR />}        />
          <Route path="/admin"  element={<Dashboard />} />
          <Route path="*"       element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
