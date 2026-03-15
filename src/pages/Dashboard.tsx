import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, TrendingUp, IndianRupee, CreditCard } from "lucide-react"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts"

// Dummy data for Income vs Expenses 
const cashFlowData = [
  { month: "Sep", income: 82000, expenses: 58000 },
  { month: "Oct", income: 85000, expenses: 62000 },
  { month: "Nov", income: 85000, expenses: 59000 },
  { month: "Dec", income: 92000, expenses: 71000 },
  { month: "Jan", income: 90000, expenses: 65000 },
  { month: "Feb", income: 90000, expenses: 60000 },
]

// Dummy data for Expense Breakdown (Donut) 
const expenseData = [
  { name: "Housing", value: 22000 },
  { name: "Food & Dining", value: 14000 },
  { name: "Transport", value: 8000 },
  { name: "Subscriptions", value: 4500 },
  { name: "Shopping", value: 11500 },
]

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"]

export default function Dashboard() {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Analytics Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <Wallet className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹12,45,000</div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">+2.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cash Flow</CardTitle>
            <TrendingUp className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">+₹45,231</div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Income minus expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discretionary Surplus</CardTitle>
            <IndianRupee className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹34,660</div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">After committed bills</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
            <CreditCard className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-500">₹2,14,000</div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Credit cards & EMIs</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Income vs Expenses Bar Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Income vs. Expenses</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" strokeOpacity={0.2} />
<XAxis
  dataKey="month"
  stroke="#888888"
  tick={{ fill: "#888888", fontSize: 12 }}
  tickLine={false}
  axisLine={false}
/>

<YAxis
  stroke="#888888"
  tick={{ fill: "#888888", fontSize: 12 }}
  tickLine={false}
  axisLine={false}
  tickFormatter={(value: number) => `₹${value / 1000}k`}
/>
                  <RechartsTooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown Donut Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value) => `₹${value}`}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}