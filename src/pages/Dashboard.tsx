// src/pages/Dashboard.tsx
import { useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ArrowDownRight, Wallet, Target, CreditCard, Receipt,
  TrendingUp, ChevronRight, Zap, AlertCircle
} from "lucide-react"
import {
  Area, AreaChart, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid
} from "recharts"
import { useAppStore } from "@/store/useAppStore"
import { useApi } from "@/lib/api"

// ── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800 ${className}`} />
  )
}

export default function Dashboard() {
  const { user } = useUser()
  const api = useApi()

  const {
    dashboard,
    dashboardLoading,
    dashboardError,
    setDashboard,
    setDashboardLoading,
    setDashboardError,
    openTransactionSheet,
  } = useAppStore()

  useEffect(() => {
    if (dashboard) return // already loaded
    setDashboardLoading(true)
    api
      .getDashboard()
      .then((data) => {
        setDashboard(data)
        setDashboardError(null)
      })
      .catch((err) => setDashboardError(err.message))
      .finally(() => setDashboardLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Custom chart tooltip ─────────────────────────────────────────────────
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 rounded-lg shadow-xl">
          <p className="text-sm font-medium text-neutral-500 mb-1">{label}</p>
          <p className="text-xs text-green-600">Income ₹{payload[0]?.value?.toLocaleString()}</p>
          <p className="text-xs text-red-500">Expenses ₹{payload[1]?.value?.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (dashboardError) {
    return (
      <div className="p-10 flex flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Could not load dashboard
        </h2>
        <p className="text-neutral-500 max-w-sm">{dashboardError}</p>
        <Button onClick={() => { setDashboardError(null); setDashboardLoading(true); api.getDashboard().then(setDashboard).catch((e) => setDashboardError(e.message)).finally(() => setDashboardLoading(false)) }}>
          Retry
        </Button>
      </div>
    )
  }

  const d = dashboard
  const spendingProgress = d ? (d.monthlySpent / (d.monthlyBudget || 1)) * 100 : 0

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto overflow-x-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Welcome back, {user?.firstName || "there"} 👋
          </h1>
          <p className="text-neutral-500 mt-2">Here is your financial summary for this month.</p>
        </div>
        <Button
          onClick={openTransactionSheet}
          className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 shadow-lg transition-all active:scale-95"
        >
          <Zap className="mr-2 h-4 w-4 text-yellow-400 dark:text-yellow-600 fill-current" />
          Quick Transfer
        </Button>
      </div>

      {/* ── Top metric cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Net Worth */}
        <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-100 dark:to-neutral-300 text-white dark:text-neutral-900 border-none shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="h-24 w-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-medium opacity-80 mb-1">Total Net Worth</p>
            {dashboardLoading ? (
              <Skeleton className="h-10 w-40 mb-4 bg-white/20" />
            ) : (
              <h2 className="text-4xl font-bold tracking-tight mb-4">
                ₹{d?.netWorth?.toLocaleString() ?? "—"}
              </h2>
            )}
            <div className="flex items-center text-sm font-medium bg-white/20 dark:bg-black/10 w-fit px-2.5 py-1 rounded-full">
              <TrendingUp className="h-4 w-4 mr-1" />
              {d ? `₹${d.bankBalance.toLocaleString()} liquid` : "—"}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Spending */}
        <Card>
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-medium text-neutral-500">Monthly Spending</p>
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-500" />
                </div>
              </div>
              {dashboardLoading ? (
                <Skeleton className="h-9 w-36 mb-1" />
              ) : (
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
                  ₹{d?.monthlySpent?.toLocaleString() ?? "—"}
                </h2>
              )}
              <p className="text-sm text-neutral-500">
                of ₹{d?.monthlyBudget?.toLocaleString() ?? "—"} budget
              </p>
            </div>
            <div className="mt-4">
              <Progress
                value={Math.min(spendingProgress, 100)}
                className={`h-2 ${spendingProgress > 90 ? "[&>div]:bg-red-500" : "[&>div]:bg-neutral-900 dark:[&>div]:bg-white"}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Debt */}
        <Card>
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-medium text-neutral-500">Active Debt</p>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <CreditCard className="h-4 w-4 text-orange-600 dark:text-orange-500" />
                </div>
              </div>
              {dashboardLoading ? (
                <Skeleton className="h-9 w-32 mb-1" />
              ) : (
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
                  ₹{d?.creditDebt?.toLocaleString() ?? "0"}
                </h2>
              )}
              <p className="text-sm text-neutral-500">
                {d?.primaryCard ? d.primaryCard.name : "No credit cards"}
              </p>
            </div>
            {d?.primaryCard && (
              <div className="mt-4 flex items-center text-sm text-orange-600 dark:text-orange-500 font-medium">
                ₹{d.primaryCard.outstanding.toLocaleString()} outstanding
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Chart + Goal ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Wealth chart */}
        <Card className="lg:col-span-2 min-w-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Income vs Expenses</CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </div>
            <Link to="/accounts" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center">
              Details <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-[250px] w-full mt-4" />
            ) : (
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={d?.wealthHistory ?? []}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#525252" strokeOpacity={0.15} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fill="#22c55e" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority Goal (static — Goals page is not yet DB-backed) */}
        <Card className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" /> Priority Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center gap-6">
            <div className="text-center space-y-2">
              <div className="bg-neutral-100 dark:bg-neutral-800 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
                🏡
              </div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Dream House Fund</h3>
              <p className="text-sm text-neutral-500">₹3,00,000 / ₹10,00,000</p>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium mb-2 text-neutral-600 dark:text-neutral-400">
                <span>30% Completed</span>
                <span>₹7L remaining</span>
              </div>
              <Progress value={30} className="h-3 [&>div]:bg-purple-600 dark:[&>div]:bg-purple-500" />
            </div>
            <Button variant="outline" className="w-full mt-auto" asChild>
              <Link to="/goals">Fund Goal</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Transactions + Upcoming Bills ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Transactions */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
            <Link to="/accounts" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
              View All
            </Link>
          </CardHeader>
          <CardContent className="space-y-6">
            {dashboardLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            ) : !d?.transactions.length ? (
              <p className="text-sm text-neutral-500 text-center py-4">No transactions yet.</p>
            ) : (
              d.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-lg shadow-sm">
                      {tx.icon}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white leading-none mb-1.5">{tx.name}</p>
                      <p className="text-xs text-neutral-500">
                        {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} • {tx.category}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold ${tx.type === "income" ? "text-green-600 dark:text-green-500" : "text-neutral-900 dark:text-white"}`}>
                    {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Bills */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Receipt className="h-5 w-5 text-neutral-500" /> Upcoming Bills
            </CardTitle>
            <Link to="/subscriptions" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
              Manage
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))
            ) : !d?.upcomingBills.length ? (
              <p className="text-sm text-neutral-500 text-center py-4">No upcoming bills.</p>
            ) : (
              d.upcomingBills.map((bill, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20">
                  <div className="flex flex-col">
                    <span className="font-medium text-neutral-900 dark:text-white">{bill.name}</span>
                    <span className={`text-xs font-medium mt-1 ${bill.daysUntil <= 1 ? "text-red-500" : "text-neutral-500"}`}>
                      Due {bill.dueDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-neutral-900 dark:text-white">₹{bill.amount.toLocaleString()}</span>
                    <Button size="sm" variant="secondary" className="h-8">Pay Now</Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
