import { Link, Outlet, useLocation } from "react-router-dom"
import { LayoutDashboard, CreditCard, RefreshCw, Target, Settings, PieChart, Search } from "lucide-react"
import { ThemeToggle } from "../theme/ThemeToggle"
import { CommandMenu } from "./CommandMenu"

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Accounts", path: "/accounts", icon: CreditCard },
  { name: "Subscriptions", path: "/subscriptions", icon: RefreshCw },
  { name: "Budget", path: "/budget", icon: PieChart },
  { name: "Goals", path: "/goals", icon: Target },
  { name: "Settings", path: "/settings", icon: Settings },
]

export default function AppLayout() {
  const location = useLocation()

  return (
    <div className="flex h-screen w-full bg-neutral-50 dark:bg-neutral-950">
      <CommandMenu />
      
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
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                  >
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
        <header className="h-16 flex items-center justify-between md:justify-end px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 md:bg-transparent md:border-none">
          <span className="md:hidden text-lg font-bold text-neutral-900 dark:text-white">Finance Tracker</span>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
              className="hidden md:flex items-center gap-2 text-sm text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Search...</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-900 px-1.5 font-mono text-[10px] font-medium text-neutral-600 dark:text-neutral-400">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
            <button 
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
              className="md:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
            >
              <Search className="h-5 w-5" />
            </button>
            <ThemeToggle />
          </div>
        </header>
        
        <div className="flex-1">
          <Outlet />
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 z-50">
        <ul className="flex justify-around items-center h-16">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <li key={item.name} className="flex-1">
                <Link
                  to={item.path}
                  className={`flex flex-col items-center justify-center h-full space-y-1 ${
                    isActive ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}