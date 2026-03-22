// src/pages/Subscriptions.tsx
import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertCircle, Calendar, CreditCard, ExternalLink,
  Plus, RefreshCw, CheckCircle2, PauseCircle,
} from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { useApi, type Subscription } from "@/lib/api"

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800 ${className}`} />
}

export default function Subscriptions() {
  const api = useApi()
  const { subscriptions, subscriptionsLoading, setSubscriptions, setSubscriptionsLoading } = useAppStore()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New subscription form
  const [form, setForm] = useState({
    serviceName: "", amount: "", billingDay: "", category: "",
  })

  const load = () => {
    setSubscriptionsLoading(true)
    api.getSubscriptions("active")
      .then(setSubscriptions)
      .catch((e) => setError(e.message))
      .finally(() => setSubscriptionsLoading(false))
  }

  useEffect(() => {
    if (!subscriptions) load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.serviceName || !form.amount) return
    setSaving(true)
    try {
      await api.createSubscription({
        serviceName: form.serviceName,
        amount: Number(form.amount),
        billingDay: form.billingDay ? Number(form.billingDay) : undefined,
        category: form.category || undefined,
      })
      setForm({ serviceName: "", amount: "", billingDay: "", category: "" })
      setIsAddOpen(false)
      load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePause = async (sub: Subscription) => {
    try {
      await api.updateSubscription(sub.id, {
        status: sub.status === "active" ? "paused" : "active",
      })
      load()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this subscription?")) return
    try {
      await api.deleteSubscription(id)
      load()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const subs = subscriptions?.subscriptions ?? []
  const summary = subscriptions?.summary

  // Split: upcoming (due within 5 days) vs regular
  const dueSoon = subs.filter((s) => s.daysUntil !== null && s.daysUntil <= 5)
  const active = subs.filter((s) => s.status === "active")

  return (
    <div className="p-6 md:p-10 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Subscriptions</h1>
          <p className="text-neutral-500 mt-2">Track, manage, and optimize your recurring payments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={subscriptionsLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${subscriptionsLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                <Plus className="h-4 w-4 mr-2" /> Add Subscription
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Subscription</DialogTitle>
                <DialogDescription>Track a new recurring payment.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Input placeholder="Netflix, Spotify, Gym..." value={form.serviceName}
                    onChange={(e) => setForm({ ...form, serviceName: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount (₹/mo)</Label>
                    <Input type="number" placeholder="649" value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })} required min="1" />
                  </div>
                  <div className="space-y-2">
                    <Label>Billing Day</Label>
                    <Input type="number" placeholder="15" min="1" max="31" value={form.billingDay}
                      onChange={(e) => setForm({ ...form, billingDay: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category (optional)</Label>
                  <Input placeholder="Streaming, Fitness, Software..." value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Add"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary bar */}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{summary.count}</p>
            <p className="text-xs text-neutral-500 mt-1">Active</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">₹{summary.monthlyTotal.toLocaleString()}</p>
            <p className="text-xs text-neutral-500 mt-1">Per Month</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">₹{summary.annualTotal.toLocaleString()}</p>
            <p className="text-xs text-neutral-500 mt-1">Per Year</p>
          </CardContent></Card>
        </div>
      )}

      {/* Due soon alerts */}
      {!subscriptionsLoading && dueSoon.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" /> Due Soon
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {dueSoon.map((s) => (
              <Card key={s.id} className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-semibold text-red-700 dark:text-red-400">{s.name}</CardTitle>
                    <Badge variant="destructive" className="text-[10px]">
                      {s.paidThisMonth ? "Paid ✓" : s.dueLabel}
                    </Badge>
                  </div>
                  <CardDescription className="text-red-600/80 dark:text-red-300/80 text-xs">
                    {s.category} • {s.accountName ?? "No account linked"}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between items-center pt-2">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">₹{s.amount.toLocaleString()}/mo</span>
                  {s.paidThisMonth && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All subscriptions */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">All Active Subscriptions</h2>
        <Card>
          <CardContent className="p-0">
            {subscriptionsLoading ? (
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-6 gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : active.length === 0 ? (
              <div className="p-10 text-center text-neutral-500">
                No active subscriptions. Add one above.
              </div>
            ) : (
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {active.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group">
                    <div className="flex items-start gap-4">
                      <div className="hidden sm:flex h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center">
                        <ExternalLink className="h-4 w-4 text-neutral-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-neutral-900 dark:text-white">{sub.name}</h3>
                          {sub.paidThisMonth && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" title="Paid this month" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                          {sub.billingDay && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {sub.dueLabel ?? `Day ${sub.billingDay}`}
                            </span>
                          )}
                          {sub.accountName && (
                            <span className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" /> {sub.accountName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold text-neutral-900 dark:text-white">
                          ₹{sub.amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-neutral-500 uppercase mt-0.5">Monthly</div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm" variant="ghost"
                          onClick={() => handleTogglePause(sub)}
                          title={sub.status === "active" ? "Pause" : "Resume"}
                        >
                          <PauseCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm" variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => handleDelete(sub.id)}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
