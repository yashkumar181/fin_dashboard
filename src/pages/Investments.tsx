// src/pages/Investments.tsx
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  TrendingUp, TrendingDown, RefreshCw, DollarSign,
  PieChart as PieChartIcon, ArrowUpRight, Plus, Pencil,
} from "lucide-react"
import {
  Area, AreaChart, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell,
} from "recharts"
import { useAppStore } from "@/store/useAppStore"
import { useApi, type Holding } from "@/lib/api"

const ASSET_TYPES = ["Equity", "US Equity", "ETF", "Crypto", "Bonds/FD", "Real Estate", "Other"]
const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#f97316"]

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800 ${className}`} />
}

export default function Investments() {
  const api = useApi()
  const { investments, investmentsLoading, setInvestments, setInvestmentsLoading } = useAppStore()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editHolding, setEditHolding] = useState<Holding | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add form
  const [form, setForm] = useState({
    symbol: "", assetName: "", assetType: "Equity",
    sharesOwned: "", averageBuyPrice: "", currentPrice: "",
  })
  // Edit form (just update current price or shares)
  const [editForm, setEditForm] = useState({ currentPrice: "", sharesOwned: "" })

  const load = () => {
    setInvestmentsLoading(true)
    api.getInvestments()
      .then(setInvestments)
      .catch((e) => setError(e.message))
      .finally(() => setInvestmentsLoading(false))
  }

  useEffect(() => {
    if (!investments) load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.createHolding({
        symbol: form.symbol,
        assetName: form.assetName,
        assetType: form.assetType,
        sharesOwned: Number(form.sharesOwned),
        averageBuyPrice: Number(form.averageBuyPrice),
        currentPrice: form.currentPrice ? Number(form.currentPrice) : undefined,
      })
      setForm({ symbol: "", assetName: "", assetType: "Equity", sharesOwned: "", averageBuyPrice: "", currentPrice: "" })
      setIsAddOpen(false)
      load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editHolding) return
    setSaving(true)
    try {
      await api.updateHolding(editHolding.id, {
        currentPrice: editForm.currentPrice ? Number(editForm.currentPrice) : undefined,
        sharesOwned: editForm.sharesOwned ? Number(editForm.sharesOwned) : undefined,
      })
      setEditHolding(null)
      load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this holding?")) return
    try {
      await api.deleteHolding(id)
      load()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const summary = investments?.summary
  const holdings = investments?.holdings ?? []
  const allocation = (investments?.allocation ?? []).map((a, i) => ({
    ...a,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }))

  const totalProfitPositive = (summary?.totalProfit ?? 0) >= 0

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Portfolio</h1>
          <p className="text-neutral-500">Track your wealth generation and asset performance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={load} disabled={investmentsLoading}>
            <RefreshCw className={`h-4 w-4 ${investmentsLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                <Plus className="h-4 w-4 mr-2" /> Add Holding
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Investment Holding</DialogTitle>
                <DialogDescription>Track a new stock, ETF, crypto or other asset.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ticker / Symbol</Label>
                    <Input placeholder="RELIANCE, BTC, NIFTY50" value={form.symbol}
                      onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Asset Type</Label>
                    <Select value={form.assetType} onValueChange={(v) => setForm({ ...form, assetType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ASSET_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="Reliance Industries Ltd" value={form.assetName}
                    onChange={(e) => setForm({ ...form, assetName: e.target.value })} required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Shares / Units</Label>
                    <Input type="number" placeholder="50" step="any" value={form.sharesOwned}
                      onChange={(e) => setForm({ ...form, sharesOwned: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Avg Buy Price (₹)</Label>
                    <Input type="number" placeholder="2450" step="any" value={form.averageBuyPrice}
                      onChange={(e) => setForm({ ...form, averageBuyPrice: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Price (₹)</Label>
                    <Input type="number" placeholder="2950" step="any" value={form.currentPrice}
                      onChange={(e) => setForm({ ...form, currentPrice: e.target.value })} />
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Add Holding"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit holding modal */}
      <Dialog open={!!editHolding} onOpenChange={(open) => !open && setEditHolding(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update {editHolding?.symbol}</DialogTitle>
            <DialogDescription>Update the current price or number of shares.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Current Price (₹)</Label>
              <Input type="number" step="any"
                placeholder={editHolding?.currentPrice?.toString()}
                value={editForm.currentPrice}
                onChange={(e) => setEditForm({ ...editForm, currentPrice: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Shares / Units</Label>
              <Input type="number" step="any"
                placeholder={editHolding?.shares?.toString()}
                value={editForm.sharesOwned}
                onChange={(e) => setEditForm({ ...editForm, sharesOwned: e.target.value })} />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setEditHolding(null)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Update"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-neutral-500">Portfolio Value</p>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            {investmentsLoading ? <Skeleton className="h-9 w-36 mt-2" /> : (
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">
                ₹{summary?.totalValue?.toLocaleString() ?? "0"}
              </h2>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-neutral-500">Total Returns</p>
              <div className={`p-2 rounded-lg ${totalProfitPositive ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                {totalProfitPositive
                  ? <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  : <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />}
              </div>
            </div>
            {investmentsLoading ? <Skeleton className="h-9 w-36 mt-2" /> : (
              <>
                <h2 className={`text-3xl font-bold mt-2 ${totalProfitPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                  {totalProfitPositive ? "+" : ""}₹{summary?.totalProfit?.toLocaleString() ?? "0"}
                </h2>
                <p className={`text-sm font-medium mt-1 ${totalProfitPositive ? "text-green-600/80" : "text-red-600/80"}`}>
                  {totalProfitPositive ? "+" : ""}{summary?.totalProfitPercent?.toFixed(2)}% All time
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-neutral-500">Holdings</p>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <PieChartIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            {investmentsLoading ? <Skeleton className="h-9 w-16 mt-2" /> : (
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">
                {summary?.holdingCount ?? 0}
              </h2>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart + Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Holdings Performance</CardTitle>
            <CardDescription>P&L across your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            {investmentsLoading ? <Skeleton className="h-[300px] w-full mt-4" /> : (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={holdings.map((h) => ({ name: h.symbol, invested: h.invested, current: h.currentValue }))}
                    margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#525252" strokeOpacity={0.15} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 11 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                    <Area type="monotone" dataKey="invested" stroke="#94a3b8" strokeWidth={2} fill="#94a3b8" fillOpacity={0.1} name="Invested" />
                    <Area type="monotone" dataKey="current" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.1} name="Current Value" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5" /> Allocation</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center">
            {investmentsLoading ? <Skeleton className="h-[200px] w-full" /> : allocation.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center">Add holdings to see allocation</p>
            ) : (
              <>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={allocation} cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                        paddingAngle={5} dataKey="value" stroke="none">
                        {allocation.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => `₹${v.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full space-y-3 mt-4">
                  {allocation.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color }} />
                        <span className="text-neutral-600 dark:text-neutral-300">{a.type}</span>
                      </div>
                      <span className="font-medium text-neutral-900 dark:text-white">{a.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Live Market</CardTitle>
          <CardDescription>Real-time prices</CardDescription>
        </CardHeader>

      <CardContent>
        {holdings.map((h) => (
          <div key={h.id} className="flex justify-between py-2 border-b">
          <span className="font-medium">{h.symbol}</span>
          <span>
          ₹{h.currentPrice.toLocaleString()}
        </span>
      </div>
    ))}
  </CardContent>
</Card>

      {/* Holdings table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {investmentsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : holdings.length === 0 ? (
            <div className="py-12 text-center text-neutral-500">
              <p className="mb-4">No holdings yet.</p>
              <Button onClick={() => setIsAddOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Add your first holding
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-tl-lg">Asset</th>
                    <th className="px-4 py-3 font-medium text-right">Holdings</th>
                    <th className="px-4 py-3 font-medium text-right">Current Price</th>
                    <th className="px-4 py-3 font-medium text-right">P&L</th>
                    <th className="px-4 py-3 font-medium rounded-tr-lg"></th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => (
                    <tr key={h.id} className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors group">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-900 dark:text-white">
                            {h.symbol.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900 dark:text-white">{h.symbol}</p>
                            <p className="text-xs text-neutral-500">{h.name} • {h.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-neutral-900 dark:text-white">
                        {h.shares}
                        <p className="text-xs text-neutral-500 font-normal">Avg ₹{h.avgPrice.toLocaleString()}</p>
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-neutral-900 dark:text-white">
                        ₹{h.currentPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className={`inline-flex items-center gap-1 font-semibold ${h.profit >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                          {h.profit >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          ₹{Math.abs(h.profit).toLocaleString()}
                        </div>
                        <p className={`text-xs ${h.profit >= 0 ? "text-green-600/80" : "text-red-600/80"}`}>
                          {h.profit >= 0 ? "+" : ""}{h.profitPercent.toFixed(2)}%
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                          <Button size="sm" variant="ghost"
                            onClick={() => { setEditHolding(h); setEditForm({ currentPrice: h.currentPrice.toString(), sharesOwned: h.shares.toString() }) }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => handleDelete(h.id)}>
                            ✕
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
