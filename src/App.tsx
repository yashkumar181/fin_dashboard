import { BrowserRouter, Routes, Route } from "react-router-dom"
import AppLayout from "./components/layout/AppLayout"
import { ThemeProvider } from "./components/theme/ThemeProvider"
import Dashboard from "./pages/Dashboard" // This is the crucial import

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">{title}</h1>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="finance-tracker-theme">
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            {/* The index route now points to our real Dashboard component */}
            <Route index element={<Dashboard />} /> 
            <Route path="/accounts" element={<PlaceholderPage title="Accounts & Cards" />} />
            <Route path="/subscriptions" element={<PlaceholderPage title="Subscriptions" />} />
            <Route path="/budget" element={<PlaceholderPage title="Budgeting" />} />
            <Route path="/goals" element={<PlaceholderPage title="Financial Goals" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}