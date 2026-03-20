// src/pages/Investments.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, RefreshCw, DollarSign, PieChart as PieChartIcon, ArrowUpRight } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts"

// --- Mock Data ---
const performanceHistory = [
  { date: "Jan", value: 450000 },
  { date: "Feb", value: 480000 },
  { date: "Mar", value: 460000 },
  { date: "Apr", value: 510000 },
  { date: "May", value: 540000 },
  { date: "Jun", value: 590000 },
]

const assetAllocation = [
  { name: "Indian Equities", value: 55, color: "#3b82f6" }, // Blue
  { name: "US Stocks", value: 20, color: "#8b5cf6" },      // Purple
  { name: "Crypto", value: 15, color: "#f59e0b" },         // Amber
  { name: "Bonds/FD", value: 10, color: "#10b981" },       // Emerald
]

const holdings = [
  { id: 1, symbol: "RELIANCE", name: "Reliance Industries", shares: 50, avgPrice: 2450, currentPrice: 2950, type: "Equity" },
  { id: 2, symbol: "BTC", name: "Bitcoin", shares: 0.15, avgPrice: 3500000, currentPrice: 5600000, type: "Crypto" },
  { id: 3, symbol: "NIFTYBEES", name: "Nifty 50 ETF", shares: 400, avgPrice: 210, currentPrice: 245, type: "ETF" },
  { id: 4, symbol: "AAPL", name: "Apple Inc.", shares: 15, avgPrice: 13500, currentPrice: 14200, type: "US Equity" },
]

export default function Investments() {
  const totalValue = performanceHistory[performanceHistory.length - 1].value
  const totalInvested = 480000 // Mock invested amount
  const totalProfit = totalValue - totalInvested
  const profitPercentage = (totalProfit / totalInvested) * 100

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Portfolio</h1>
          <p className="text-neutral-500">Track your wealth generation and asset performance.</p>
        </div>
        <Button variant="outline" className="gap-2 bg-white dark:bg-neutral-900">
          <RefreshCw className="h-4 w-4" /> Sync Brokers
        </Button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-neutral-900 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-neutral-500">Total Portfolio Value</p>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">₹{totalValue.toLocaleString()}</h2>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-neutral-900 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-neutral-500">Total Returns</p>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-green-600 dark:text-green-500 mt-2">
              +₹{totalProfit.toLocaleString()}
            </h2>
            <p className="text-sm text-green-600/80 font-medium mt-1">+{profitPercentage.toFixed(2)}% All time</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-900 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-neutral-500">1D Change</p>
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-red-600 dark:text-red-500 mt-2">
              -₹2,450
            </h2>
            <p className="text-sm text-red-600/80 font-medium mt-1">-0.41% Today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Performance History</CardTitle>
            <CardDescription>Your portfolio value over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceHistory} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#525252" strokeOpacity={0.15} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Allocation Donut Chart */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5"/> Allocation</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-3 mt-4">
              {assetAllocation.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-neutral-600 dark:text-neutral-300">{item.name}</span>
                  </div>
                  <span className="font-medium text-neutral-900 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings List */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg">Asset</th>
                  <th className="px-4 py-3 font-medium text-right">Holdings</th>
                  <th className="px-4 py-3 font-medium text-right">Current Price</th>
                  <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Unrealized P&L</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((asset) => {
                  const invested = asset.shares * asset.avgPrice;
                  const current = asset.shares * asset.currentPrice;
                  const profit = current - invested;
                  const profitPercent = (profit / invested) * 100;
                  const isPositive = profit >= 0;

                  return (
                    <tr key={asset.id} className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-900 dark:text-white">
                            {asset.symbol.substring(0, 1)}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900 dark:text-white">{asset.symbol}</p>
                            <p className="text-xs text-neutral-500">{asset.name} • {asset.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-neutral-900 dark:text-white">
                        {asset.shares}
                        <p className="text-xs text-neutral-500 font-normal">Avg ₹{asset.avgPrice}</p>
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-neutral-900 dark:text-white">
                        ₹{asset.currentPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className={`inline-flex items-center gap-1 font-semibold ${isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                          {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          ₹{Math.abs(profit).toLocaleString()}
                        </div>
                        <p className={`text-xs ${isPositive ? 'text-green-600/80' : 'text-red-600/80'}`}>
                          {isPositive ? '+' : ''}{profitPercent.toFixed(2)}%
                        </p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}