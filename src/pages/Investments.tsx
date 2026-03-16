import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, PieChart, Landmark, Shield, Coins, Plus, LineChart, Briefcase, Search } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

// --- Hard Data ---
const initialInvestments = [
  { id: 1, name: "Reliance Industries", ticker: "RELIANCE", type: "stock", invested: 150000, current: 185000, quantity: 60 },
  { id: 2, name: "Tata Consultancy Services", ticker: "TCS", type: "stock", invested: 100000, current: 125000, quantity: 30 },
  { id: 3, name: "Apple Inc.", ticker: "AAPL", type: "stock", invested: 80000, current: 110000, quantity: 6 },
  { id: 4, name: "Parag Parikh Flexi Cap", ticker: "PPFAS", type: "mutual_fund", invested: 300000, current: 410000, quantity: 5500.2 },
  { id: 5, name: "UTI Nifty 50 Index", ticker: "UTINIFTY", type: "mutual_fund", invested: 250000, current: 310000, quantity: 1200 },
  { id: 6, name: "Quant Small Cap Fund", ticker: "QUANTSMALL", type: "mutual_fund", invested: 100000, current: 165000, quantity: 800 },
  { id: 7, name: "Sovereign Gold Bond 2028", ticker: "SGB2028", type: "bond", invested: 100000, current: 125000, quantity: 20 },
  { id: 8, name: "Employee Provident Fund", ticker: "EPF", type: "bond", invested: 450000, current: 520000, quantity: 1 },
  { id: 9, name: "Physical Gold (24K)", ticker: "GOLD", type: "metal", invested: 150000, current: 185000, quantity: 25 },
  { id: 10, name: "LIC Jeevan Anand", ticker: "LIC", type: "insurance", invested: 120000, current: 125000, quantity: 1 },
]

const performanceHistory = [
  { month: "Jan", value: 1650000 },
  { month: "Feb", value: 1720000 },
  { month: "Mar", value: 1680000 }, 
  { month: "Apr", value: 1850000 },
  { month: "May", value: 1950000 },
  { month: "Jun", value: 2100000 },
  { month: "Jul", value: 2260000 }, 
]

export default function Investments() {
  const [investments, setInvestments] = useState(initialInvestments)
  const [isAddOpen, setIsAddOpen] = useState(false)
  
  // Custom Filter & Search State
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  
  const [newAsset, setNewAsset] = useState({ name: "", ticker: "", type: "stock", invested: "", current: "", quantity: "" })

  const totalInvested = investments.reduce((sum, inv) => sum + inv.invested, 0)
  const totalCurrent = investments.reduce((sum, inv) => sum + inv.current, 0)
  const totalProfit = totalCurrent - totalInvested
  const totalProfitPercentage = (totalProfit / totalInvested) * 100

  const allocation = investments.reduce((acc: Record<string, number>, inv) => {
    acc[inv.type] = (acc[inv.type] || 0) + inv.current
    return acc
  }, {})

  // Smart Add Modal Opener
  const handleOpenAddModal = (defaultType = "stock") => {
    setNewAsset({ ...newAsset, type: defaultType === "all" ? "stock" : defaultType })
    setIsAddOpen(true)
  }

  const handleAddAsset = () => {
    if (!newAsset.name || !newAsset.invested || !newAsset.current) return
    const asset = {
      id: Date.now(),
      name: newAsset.name,
      ticker: newAsset.ticker || newAsset.name.substring(0, 3).toUpperCase(),
      type: newAsset.type,
      invested: Number(newAsset.invested),
      current: Number(newAsset.current),
      quantity: Number(newAsset.quantity || 1)
    }
    setInvestments([asset, ...investments])
    setIsAddOpen(false)
    setNewAsset({ name: "", ticker: "", type: "stock", invested: "", current: "", quantity: "" })
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'stock': return <LineChart className="h-4 w-4" />
      case 'mutual_fund': return <PieChart className="h-4 w-4" />
      case 'bond': return <Landmark className="h-4 w-4" />
      case 'metal': return <Coins className="h-4 w-4" />
      case 'insurance': return <Shield className="h-4 w-4" />
      default: return <Briefcase className="h-4 w-4" />
    }
  }

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

  // Double Filter: Tab Category + Search Query
  const filteredInvestments = investments.filter(inv => {
    const matchesCategory = activeFilter === "all" || inv.type === activeFilter
    const matchesSearch = inv.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Portfolio</h1>
          <p className="text-neutral-500 mt-2">Track your wealth, asset allocation, and market returns.</p>
        </div>
        
        <Button onClick={() => handleOpenAddModal("all")} className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 hidden sm:flex">
          <Plus className="mr-2 h-4 w-4" /> Add Asset
        </Button>

        {/* Global Add Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Record Investment</DialogTitle>
              <DialogDescription>Manually log a new stock, mutual fund, or asset.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
              <div className="space-y-2">
                <Label>Asset Name</Label>
                <Input placeholder="e.g. Reliance, HDFC AMC" value={newAsset.name} onChange={(e) => setNewAsset({...newAsset, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Asset Type</Label>
                  <Select onValueChange={(val) => setNewAsset({...newAsset, type: val})} value={newAsset.type}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock">Stock / Equity</SelectItem>
                      <SelectItem value="mutual_fund">Mutual Fund / ETF</SelectItem>
                      <SelectItem value="bond">Bonds / FD</SelectItem>
                      <SelectItem value="metal">Gold / Silver</SelectItem>
                      <SelectItem value="insurance">Insurance (ULIP/Endow)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ticker / Symbol</Label>
                  <Input placeholder="RELIANCE" value={newAsset.ticker} onChange={(e) => setNewAsset({...newAsset, ticker: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Invested (₹)</Label>
                  <Input type="number" placeholder="50000" value={newAsset.invested} onChange={(e) => setNewAsset({...newAsset, invested: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Current Value (₹)</Label>
                  <Input type="number" placeholder="55000" value={newAsset.current} onChange={(e) => setNewAsset({...newAsset, current: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Units / Quantity</Label>
                <Input type="number" placeholder="10" value={newAsset.quantity} onChange={(e) => setNewAsset({...newAsset, quantity: e.target.value})} />
              </div>
            </div>
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <Button onClick={handleAddAsset} className="w-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold">Save Asset</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* METRICS & CHARTS (Hidden for brevity, same as previous step) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
          <CardContent className="p-6">
            <p className="text-sm font-medium opacity-80 mb-1">Total Net Worth</p>
            <p className="text-4xl font-bold tracking-tight">₹{totalCurrent.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-neutral-500 mb-1">Total Invested</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">₹{totalInvested.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-neutral-500 mb-1">Unrealized P&L</p>
            <div className="flex items-end gap-2">
              <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                {totalProfit >= 0 ? '+' : ''}₹{totalProfit.toLocaleString()}
              </p>
              <Badge variant="outline" className={`mb-1 ${totalProfit >= 0 ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900'}`}>
                {totalProfit >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {totalProfitPercentage.toFixed(2)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 min-w-0">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Performance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#525252" strokeOpacity={0.2} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 flex flex-col min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <PieChart className="h-5 w-5" /> Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="h-4 flex rounded-full overflow-hidden w-full bg-neutral-100 dark:bg-neutral-800 mb-6">
              {Object.entries(allocation).map(([type, value], index) => {
                const width = `${(value / totalCurrent) * 100}%`
                const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-amber-500', 'bg-emerald-500']
                return <div key={type} style={{ width }} className={`${colors[index % colors.length]} transition-all duration-500`} title={`${type}: ₹${value.toLocaleString()}`} />
              })}
            </div>
            <div className="space-y-4">
              {Object.entries(allocation).sort((a,b) => b[1] - a[1]).map(([type, value], index) => {
                const percentage = ((value / totalCurrent) * 100).toFixed(1)
                const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-amber-500', 'bg-emerald-500']
                return (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                      <span className={`h-3 w-3 rounded-full ${colors[index % colors.length]}`} />
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-neutral-900 dark:text-white">₹{value.toLocaleString()}</span>
                      <span className="text-neutral-400 text-xs w-10 text-right">{percentage}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- FILTER, SEARCH, AND SECTIONAL ADD BUTTON --- */}
      <div className="space-y-4">
        
        {/* Tab Buttons */}
        <div className="w-full flex justify-start overflow-x-auto border-b border-neutral-200 dark:border-neutral-800 gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {[
            { id: "all", label: "All Holdings" },
            { id: "stock", label: "Stocks" },
            { id: "mutual_fund", label: "Mutual Funds" },
            { id: "bond", label: "Bonds" },
            { id: "metal", label: "Metals" },
            { id: "insurance", label: "Insurance" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveFilter(tab.id); setSearchQuery(""); }} // Reset search when changing tabs
              className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 outline-none focus:outline-none focus:ring-0 ${
                activeFilter === tab.id
                  ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Row: Search Bar & Contextual Add Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
          
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input 
              placeholder={`Search ${activeFilter === 'all' ? 'portfolio' : activeFilter.replace('_', ' ')}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-transparent border-none shadow-none focus-visible:ring-0"
            />
          </div>

          <Button 
            onClick={() => handleOpenAddModal(activeFilter)} 
            variant="ghost"
            className="w-full sm:w-auto text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Plus className="mr-2 h-4 w-4" /> 
            Add {activeFilter === 'all' ? 'Asset' : activeFilter.replace('_', ' ')}
          </Button>

        </div>

        {/* RENDERED CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredInvestments.map((inv) => {
            const profit = inv.current - inv.invested
            const profitPct = (profit / inv.invested) * 100
            const isProfit = profit >= 0

            return (
              <Card key={inv.id} className="hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-600 dark:text-neutral-300">
                        {getTypeIcon(inv.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white leading-tight">{inv.name}</p>
                        <p className="text-xs text-neutral-500 mt-1">{inv.ticker} • {inv.quantity} Units</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Current Value</p>
                      <p className="text-xl font-bold text-neutral-900 dark:text-white">₹{inv.current.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Returns</p>
                      <p className={`font-semibold ${isProfit ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                        {isProfit ? '+' : ''}₹{profit.toLocaleString()}
                      </p>
                      <p className={`text-xs font-medium ${isProfit ? 'text-green-600/80 dark:text-green-500/80' : 'text-red-600/80 dark:text-red-500/80'}`}>
                        ({isProfit ? '+' : ''}{profitPct.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          
          {filteredInvestments.length === 0 && (
            <div className="col-span-full py-10 flex flex-col items-center justify-center text-center text-neutral-500 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50">
              <Search className="h-8 w-8 mb-3 text-neutral-400 opacity-50" />
              <p className="font-medium text-neutral-700 dark:text-neutral-300">No results found</p>
              <p className="text-sm">Try adjusting your search or add a new asset.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}