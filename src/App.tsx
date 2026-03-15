import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import AppLayout from "./components/layout/AppLayout"
import { ThemeProvider } from "./components/theme/ThemeProvider"
import Dashboard from "./pages/Dashboard"
import Accounts from "./pages/Accounts"
import Subscriptions from "./pages/Subscriptions"
import Budget from "./pages/Budget"
import Goals from "./pages/Goals"
import Settings from "./pages/Settings"
import { PageTransition } from "./components/layout/PageTransition"

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<AppLayout />}>
          <Route index element={<PageTransition><Dashboard /></PageTransition>} /> 
          <Route path="/accounts" element={<PageTransition><Accounts /></PageTransition>} />
          <Route path="/subscriptions" element={<PageTransition><Subscriptions /></PageTransition>} />
          <Route path="/budget" element={<PageTransition><Budget /></PageTransition>} />
          <Route path="/goals" element={<PageTransition><Goals /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="finance-tracker-theme">
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </ThemeProvider>
  )
}