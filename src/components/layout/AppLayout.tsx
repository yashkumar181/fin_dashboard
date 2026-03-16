import { Link, Outlet, useLocation } from "react-router-dom"
import { LayoutDashboard, CreditCard, RefreshCw, Target, Settings, PieChart, Menu, Search, Moon, Sun, TrendingUp } from "lucide-react"
import { CommandMenu } from "./CommandMenu"
import { TransactionSheet } from "./TransactionSheet"
import { UserNav } from "./UserNav"
import { Button } from "@/components/ui/button"
import { useTheme } from "../theme/ThemeProvider"

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Accounts", path: "/accounts", icon: CreditCard },
  { name: "Investments", path: "/investments", icon: TrendingUp },
  { name: "Subscriptions", path: "/subscriptions", icon: RefreshCw },
  { name: "Budget", path: "/budget", icon: PieChart },
  { name: "Goals", path: "/goals", icon: Target },
  { name: "Settings", path: "/settings", icon: Settings },
]

export default function AppLayout() {
  const location = useLocation()
  const { setTheme, theme } = useTheme()

  const openSearch = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
  }

  return (
    <div className="flex h-screen w-full bg-neutral-50 dark:bg-neutral-950">
      <CommandMenu />
      <TransactionSheet />
      
      {/* PC Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200 dark:border-neutral-800">
          <span className="text-xl font-bold text-neutral-900 dark:text-white">Finance Tracker</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <li key={item.name}>
                  <Link to={item.path} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium" : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white"}`}>
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto pb-16 md:pb-0 flex flex-col">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
          {/* Mobile: Hamburger Menu */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={openSearch}>
            <Menu className="h-6 w-6" />
          </Button>

          <span className="md:hidden text-lg font-bold text-neutral-900 dark:text-white absolute left-1/2 -translate-x-1/2">Finance Tracker</span>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            {/* PC: Search Bar */}
            <button onClick={openSearch} className="hidden md:flex items-center gap-2 text-sm text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
              <Search className="h-4 w-4" />
              <span>Search...</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-900 px-1.5 font-mono text-[10px] font-medium text-neutral-600 dark:text-neutral-400">⌘K</kbd>
            </button>
            
            {/* Theme Toggle Button (Now visible on Mobile & PC) */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-neutral-600 dark:text-neutral-400 shrink-0"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Profile Nav */}
            <UserNav />
          </div>
        </header>
        
        <div className="flex-1">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 z-50 px-1">
        <ul className="flex justify-between items-center h-16">
          {navItems.slice(0, 6).map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <li key={item.name} className="flex-1 min-w-0">
                <Link to={item.path} className={`flex flex-col items-center justify-center h-full space-y-1 ${isActive ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400"}`}>
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="text-[9px] sm:text-[10px] font-medium truncate w-full text-center px-0.5">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}