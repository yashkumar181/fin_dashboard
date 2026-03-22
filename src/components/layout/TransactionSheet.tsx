// src/components/layout/TransactionSheet.tsx
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/store/useAppStore"
import { useApi } from "@/lib/api"

const CATEGORIES = [
  "Food & Dining", "Transport", "Shopping", "Healthcare",
  "Housing", "Entertainment", "Education", "Other",
]

export function TransactionSheet() {
  const api = useApi()
  const {
    isTransactionSheetOpen,
    closeTransactionSheet,
    accounts,
    setAccounts,
    setDashboard,
    dashboard,
  } = useAppStore()

  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"expense" | "income">("expense")
  const [category, setCategory] = useState("Shopping")
  const [accountId, setAccountId] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load accounts if not yet loaded
  useEffect(() => {
    if (accounts.length === 0) {
      api.getAccounts().then(setAccounts).catch(console.error)
    }
  }, [isTransactionSheetOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount) return
    setSaving(true)
    setError(null)

    try {
      await api.createTransaction({
        accountId: accountId ? Number(accountId) : undefined,
        amount: Number(amount),
        type,
        category,
        merchant: name,
        isEssential: true,
      })

      // Optimistically update the dashboard store so the number changes instantly
      if (dashboard && type === "expense") {
        setDashboard({
          ...dashboard,
          monthlySpent: dashboard.monthlySpent + Number(amount),
          spendingPercentage: dashboard.monthlyBudget > 0
            ? Math.round(((dashboard.monthlySpent + Number(amount)) / dashboard.monthlyBudget) * 100)
            : 0,
        })
      }

      // Reset & close
      setName("")
      setAmount("")
      setAccountId("")
      closeTransactionSheet()
    } catch (err: any) {
      setError(err.message || "Failed to save transaction")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={isTransactionSheetOpen} onOpenChange={closeTransactionSheet}>
      <SheetContent className="bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
        <SheetHeader>
          <SheetTitle className="text-neutral-900 dark:text-white">Add Transaction</SheetTitle>
          <SheetDescription className="text-neutral-500">
            Record a new movement in your accounts.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          {/* Type */}
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "expense" ? "default" : "outline"}
                className={`flex-1 ${type === "expense" ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                onClick={() => setType("expense")}
              >Expense</Button>
              <Button
                type="button"
                variant={type === "income" ? "default" : "outline"}
                className={`flex-1 ${type === "income" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                onClick={() => setType("income")}
              >Income</Button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="name">Description / Merchant</Label>
            <Input id="name" placeholder="e.g. Swiggy, Salary, Uber"
              value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" type="number" placeholder="0.00"
              value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                <SelectItem value="Income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label>Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue placeholder="Select account (optional)" /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.isDefault ? "⭐ " : ""}{a.nickname}
                    {a.type === "credit_card" ? ` (₹${a.outstanding.toLocaleString()} due)` : ` (₹${a.balance.toLocaleString()})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={closeTransactionSheet}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Transaction"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
