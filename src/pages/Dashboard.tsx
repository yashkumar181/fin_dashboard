// src/pages/Dashboard.tsx
import { useUser } from "@clerk/clerk-react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowDownRight, Wallet, Target, CreditCard, Receipt, TrendingUp, ChevronRight, Zap } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { useAppStore } from "@/store/useAppStore"

// --- Mock Data that hasn't been moved to the store yet ---
const netWorthHistory = [
  { month: "Sep", value: 1850000 },
  { month: "Oct", value: 1920000 },
  { month: "Nov", value: 1890000 },
  { month: "Dec", value: 2050000 },
  { month: "Jan", value: 2150000 },
  { month: "Feb", value: 2260000 },
]

const upcomingBills = [
  { id: 1, name: "Spotify Premium", amount: 119, dueDate: "Tomorrow", status: "pending" },
  { id: 2, name: "Electricity (BESCOM)", amount: 1450, dueDate: "In 3 days", status: "pending" },
  { id: 3, name: "Gym Membership", amount: 2500, dueDate: "In 5 days", status: "pending" },
]

export default function Dashboard() {
  const { user } = useUser()

  // Pulling our dynamic data and actions from the Zustand Store
  const { 
    currentNetWorth, 
    monthlyBudget, 
    monthlySpent, 
    transactions, 
    openTransactionSheet 
  } = useAppStore()

  // Dynamic calculations based on store state
  const previousNetWorth = netWorthHistory[netWorthHistory.length - 2].value
  const netWorthGrowth = ((currentNetWorth - previousNetWorth) / previousNetWorth) * 100
  const spendingProgress = (monthlySpent / monthlyBudget) * 100

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 rounded-lg shadow-xl">
          <p className="text-sm font-medium text-neutral-500 mb-1">{label}</p>
          <p className="text-lg font-bold text-neutral-900 dark:text-white">
            ₹{payload[0].value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto overflow-x-hidden">
      
      {/* --- HEADER: Welcome & Quick Action --- */}
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

      {/* --- TOP ROW: The Hero Metrics --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Net Worth (Highlighted & Dynamic) */}
        <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-100 dark:to-neutral-300 text-white dark:text-neutral-900 border-none shadow-lg relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="h-24 w-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-medium opacity-80 mb-1">Total Net Worth</p>
            <h2 className="text-4xl font-bold tracking-tight mb-4">₹{currentNetWorth.toLocaleString()}</h2>
            <div className={`flex items-center text-sm font-medium bg-white/20 dark:bg-black/10 w-fit px-2.5 py-1 rounded-full backdrop-blur-sm ${netWorthGrowth >= 0 ? 'text-green-400 dark:text-green-600' : 'text-red-400 dark:text-red-600'}`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {netWorthGrowth >= 0 ? '+' : ''}{netWorthGrowth.toFixed(1)}% from last month
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Monthly Spending (Dynamic) */}
        <Card>
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-medium text-neutral-500">Monthly Spending</p>
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-500" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">₹{monthlySpent.toLocaleString()}</h2>
              <p className="text-sm text-neutral-500">of ₹{monthlyBudget.toLocaleString()} budget</p>
            </div>
            <div className="mt-4">
              <Progress 
                value={Math.min(spendingProgress, 100)} 
                className={`h-2 ${spendingProgress > 90 ? '[&>div]:bg-red-500' : '[&>div]:bg-neutral-900 dark:[&>div]:bg-white'}`} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Active Debt / Cards (Static for now) */}
        <Card>
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-medium text-neutral-500">Active Debt</p>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <CreditCard className="h-4 w-4 text-orange-600 dark:text-orange-500" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">₹12,450</h2>
              <p className="text-sm text-neutral-500">Due in 14 days</p>
            </div>
            <div className="mt-4 flex items-center text-sm text-orange-600 dark:text-orange-500 font-medium">
              <span>HDFC Millennia Card</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- MIDDLE ROW: Main Chart & Top Goal --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 6-Month Wealth Trend */}
        <Card className="lg:col-span-2 min-w-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Wealth Growth</CardTitle>
              <CardDescription>Your net worth over the last 6 months</CardDescription>
            </div>
            <Link to="/investments" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center">
              Analyze <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netWorthHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#525252" strokeOpacity={0.15} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fill="#3b82f6" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Goal Widget */}
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

      {/* --- BOTTOM ROW: Recent Activity & Upcoming Bills --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Transactions List (Dynamic) */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
            <Link to="/accounts" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
              View All
            </Link>
          </CardHeader>
          <CardContent className="space-y-6">
            {transactions.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-4">No recent transactions.</p>
            ) : (
              transactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-lg shadow-sm">
                      {tx.icon}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white leading-none mb-1.5">{tx.name}</p>
                      <p className="text-xs text-neutral-500">{tx.date} • {tx.category}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${tx.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-neutral-900 dark:text-white'}`}>
                    {tx.type === 'income' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Subscriptions List (Static for now) */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Receipt className="h-5 w-5 text-neutral-500" /> Upcoming Bills
            </CardTitle>
            <Link to="/subscriptions" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
              Manage
            </Link>
          </CardHeader>
          <CardContent className="space-y-6">
            {upcomingBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20">
                <div className="flex flex-col">
                  <span className="font-medium text-neutral-900 dark:text-white">{bill.name}</span>
                  <span className="text-xs font-medium text-red-500 mt-1">Due {bill.dueDate}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-neutral-900 dark:text-white">₹{bill.amount.toLocaleString()}</span>
                  <Button size="sm" variant="secondary" className="h-8">Pay Now</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}