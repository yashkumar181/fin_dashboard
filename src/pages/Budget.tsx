// src/pages/Budget.tsx
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Plus, RefreshCw } from "lucide-react"
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
import { useAppStore } from "@/store/useAppStore"
import { useApi } from "@/lib/api"

const CATEGORY_OPTIONS = [
  "Food & Dining", "Transport", "Shopping", "Healthcare",
  "Housing", "Entertainment", "Education", "Other",
]

const CATEGORY_ICONS: Record<string, string> = {
  "Food & Dining": "🍔", Transport: "🚗", Shopping: "🛍️",
  Healthcare: "💊", Housing: "🏠", Entertainment: "🎬",
  Education: "📚", Other: "📦",
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800 ${className}`} />
}

export default function Budget() {
  const api = useApi()
  const { budget, budgetLoading, setBudget, setBudgetLoading } = useAppStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatLimit, setNewCatLimit] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setBudgetLoading(true)
    api.getBudget()
      .then(setBudget)
      .catch((e) => setError(e.message))
      .finally(() => setBudgetLoading(false))
  }

  useEffect(() => {
    if (!budget) load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName || !newCatLimit) return
    setSaving(true)
    try {
      await api.createBudgetCategory({
        category: newCatName,
        monthlyLimit: Number(newCatLimit),
      })
      setNewCatName("")
      setNewCatLimit("")
      setIsDialogOpen(false)
      load() // refresh
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.deleteBudgetCategory(id)
      load()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getProgressColor = (pct: number) => {
    if (pct >= 100) return "bg-red-500"
    if (pct >= 80) return "bg-amber-500"
    return "bg-neutral-900 dark:bg-white"
  }

  const summary = budget?.summary
  const categories = budget?.categories ?? []
  const overallPct = summary?.overallPercentage ?? 0

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Monthly Budget</h1>
          <p className="text-neutral-500">Track your spending limits.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={budgetLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${budgetLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90">
                <Plus className="h-4 w-4" /> Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>New Budget Category</DialogTitle>
                <DialogDescription>Set a monthly spending limit for a category.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateBudget} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select onValueChange={setNewCatName} value={newCatName}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>{CATEGORY_ICONS[c]} {c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limit">Monthly Limit (₹)</Label>
                  <Input
                    id="limit"
                    type="number"
                    placeholder="5000"
                    value={newCatLimit}
                    onChange={(e) => setNewCatLimit(e.target.value)}
                    required
                    min="1"
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Category"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="shadow-md border-neutral-200 dark:border-neutral-800 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ backgroundColor: overallPct > 90 ? "#ef4444" : "#3b82f6" }} />
        <CardContent className="p-8">
          {budgetLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="w-full md:w-1/2 text-center md:text-left">
                <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">Total Spent</p>
                <div className="flex items-baseline justify-center md:justify-start gap-2">
                  <span className="text-5xl font-bold text-neutral-900 dark:text-white">
                    ₹{summary?.totalSpent?.toLocaleString() ?? "0"}
                  </span>
                  <span className="text-xl text-neutral-500 font-medium">
                    / ₹{summary?.totalLimit?.toLocaleString() ?? "0"}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 mt-4">
                  You have{" "}
                  <span className="font-bold text-neutral-900 dark:text-white">
                    ₹{Math.max(0, summary?.totalRemaining ?? 0).toLocaleString()}
                  </span>{" "}
                  left for the rest of the month.
                </p>
              </div>

              <div className="w-full md:w-1/2 flex justify-center">
                <div className="relative h-40 w-40">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle className="text-neutral-100 dark:text-neutral-800 stroke-current"
                      strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                    <circle
                      className={`${overallPct > 90 ? "text-red-500" : "text-blue-500"} stroke-current transition-all duration-1000`}
                      strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent"
                      strokeDasharray={`${Math.min(overallPct, 100) * 2.51} 251.2`}
                      transform="rotate(-90 50 50)" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">{overallPct}%</span>
                    <span className="text-xs text-neutral-500">Used</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Category Breakdown</h2>

        {budgetLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <p className="mb-4">No budget categories yet.</p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Add your first category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                className={`shadow-sm transition-all hover:shadow-md ${cat.isOverBudget ? "border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10" : ""}`}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center text-lg">
                        {CATEGORY_ICONS[cat.name] ?? "📦"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white leading-none mb-1">{cat.name}</h3>
                        {cat.isOverBudget && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" /> Over Budget
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900 dark:text-white">₹{cat.spent.toLocaleString()}</p>
                      <p className="text-xs text-neutral-500">of ₹{cat.limit.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${getProgressColor(cat.percentage)}`}
                      style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-neutral-500 font-medium">
                    <span>{cat.percentage}%</span>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
