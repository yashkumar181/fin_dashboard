import { BrowserRouter, Routes, Route } from "react-router-dom"
import AppLayout from "./components/layout/AppLayout"
import { ThemeProvider } from "./components/theme/ThemeProvider"
import Dashboard from "./pages/Dashboard"
import Accounts from "./pages/Accounts"
import Subscriptions from "./pages/Subscriptions"
import Budget from "./pages/Budget"
import Goals from "./pages/Goals"
import Settings from "./pages/Settings"

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="finance-tracker-theme">
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} /> 
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/goals" element={<Goals />} />
            
            {/* The final route is connected! */}
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}