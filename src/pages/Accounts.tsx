// src/pages/Accounts.tsx
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus, Building2, CreditCard, Wallet, ArrowDownRight,
  ArrowUpRight, Landmark, MoreHorizontal, History, RefreshCw,
} from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { useApi, type Account, type Transaction } from "@/lib/api"

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800 ${className}`} />
}

const CARD_COLORS = [
  "from-blue-900 to-slate-900",
  "from-neutral-800 to-neutral-950",
  "from-purple-900 to-indigo-950",
  "from-emerald-900 to-slate-900",
]

export default function Accounts() {
  const api = useApi()
  const { accounts, accountsLoading, setAccounts, setAccountsLoading } = useAppStore()

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [accountTxns, setAccountTxns] = useState<Transaction[]>([])
  const [txnsLoading, setTxnsLoading] = useState(false)

  // Add account modal state
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [newAcc, setNewAcc] = useState({
    nickname: "", bankName: "", category: "bank", type: "savings",
    balance: "", creditLimit: "", isDefault: "false",
  })

  // Quick transaction modal state
  const [isTxnOpen, setIsTxnOpen] = useState(false)
  const [txnForm, setTxnForm] = useState({ type: "expense", amount: "", merchant: "" })
  const [txnSaving, setTxnSaving] = useState(false)
  const [accSaving, setAccSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ACCOUNT_TYPE_MAP: Record<string, string[]> = {
    bank: ["savings", "current", "salary"],
    card: ["credit_card", "prepaid_card"],
    digital: ["wallet"],
    cash: ["cash"],
  }

  const load = () => {
    setAccountsLoading(true)
    api.getAccounts()
      .then(setAccounts)
      .catch((e) => setError(e.message))
      .finally(() => setAccountsLoading(false))
  }

  useEffect(() => {
    if (accounts.length === 0) load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openDetail = async (acc: Account) => {
    setSelectedAccount(acc)
    setTxnsLoading(true)
    try {
      const txns = await api.getTransactions({ limit: 10 })
      // Filter to this account
      setAccountTxns(txns.filter((t) => t.accountId === acc.id))
    } catch {
      setAccountTxns([])
    } finally {
      setTxnsLoading(false)
    }
  }

  const handleAddAccount = async () => {
    if (!newAcc.nickname) return
    setAccSaving(true)
    try {
      await api.createAccount({
        nickname: newAcc.nickname,
        bankName: newAcc.bankName || undefined,
        category: newAcc.category as any,
        type: newAcc.type,
        balance: Number(newAcc.balance) || 0,
        creditLimit: newAcc.creditLimit ? Number(newAcc.creditLimit) : undefined,
        isDefault: newAcc.isDefault === "true",
      })
      setIsAddAccountOpen(false)
      setNewAcc({ nickname: "", bankName: "", category: "bank", type: "savings", balance: "", creditLimit: "", isDefault: "false" })
      load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setAccSaving(false)
    }
  }

  const handleRecordTransaction = async () => {
    if (!txnForm.amount || !txnForm.merchant || !selectedAccount) return
    setTxnSaving(true)
    try {
      await api.createTransaction({
        accountId: selectedAccount.id,
        amount: Number(txnForm.amount),
        type: txnForm.type as any,
        merchant: txnForm.merchant,
      })
      setIsTxnOpen(false)
      setTxnForm({ type: "expense", amount: "", merchant: "" })
      // Reload account list to reflect new balance
      load()
      // Refresh transactions for this account
      const txns = await api.getTransactions({ limit: 10 })
      setAccountTxns(txns.filter((t) => t.accountId === selectedAccount.id))
      // Update selected account balance optimistically
      const updated = await api.getAccounts()
      const refreshed = updated.find((a) => a.id === selectedAccount.id)
      if (refreshed) setSelectedAccount(refreshed)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setTxnSaving(false)
    }
  }

  const banks = accounts.filter((a) => a.category === "bank")
  const cards = accounts.filter((a) => a.category === "card")

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-6xl mx-auto">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Accounts & Cards</h1>
          <p className="text-neutral-500 mt-2">Manage your liquid assets and credit cards.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={accountsLoading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${accountsLoading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md">{error}</p>
      )}

      {/* ── BANK ACCOUNTS ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Bank Accounts
          </h2>
          <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Plus className="h-4 w-4 mr-1" /> Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px]">
              <DialogHeader><DialogTitle>Add Account</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Nickname</Label>
                    <Input placeholder="HDFC Salary" value={newAcc.nickname}
                      onChange={(e) => setNewAcc({ ...newAcc, nickname: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank / Provider</Label>
                    <Input placeholder="HDFC, SBI..." value={newAcc.bankName}
                      onChange={(e) => setNewAcc({ ...newAcc, bankName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newAcc.category}
                      onValueChange={(v) => setNewAcc({ ...newAcc, category: v, type: ACCOUNT_TYPE_MAP[v][0] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">🏦 Bank</SelectItem>
                        <SelectItem value="card">💳 Card</SelectItem>
                        <SelectItem value="digital">📱 Wallet</SelectItem>
                        <SelectItem value="cash">💵 Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={newAcc.type} onValueChange={(v) => setNewAcc({ ...newAcc, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ACCOUNT_TYPE_MAP[newAcc.category].map((t) => (
                          <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Balance (₹)</Label>
                    <Input type="number" placeholder="50000" value={newAcc.balance}
                      onChange={(e) => setNewAcc({ ...newAcc, balance: e.target.value })} />
                  </div>
                  {newAcc.type === "credit_card" && (
                    <div className="space-y-2">
                      <Label>Credit Limit (₹)</Label>
                      <Input type="number" placeholder="200000" value={newAcc.creditLimit}
                        onChange={(e) => setNewAcc({ ...newAcc, creditLimit: e.target.value })} />
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={handleAddAccount} disabled={accSaving}
                className="w-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                {accSaving ? "Adding..." : "Add Account"}
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {accountsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        ) : banks.length === 0 ? (
          <p className="text-neutral-500 py-6 text-center">No bank accounts yet. Add one above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banks.map((acc) => (
              <Card key={acc.id}
                className="cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-500 transition-all group"
                onClick={() => openDetail(acc)}>
                <CardContent className="p-5 flex flex-col justify-between h-full min-h-[140px]">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-600 dark:text-neutral-300">
                        <Landmark className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {acc.isDefault ? "⭐ " : ""}{acc.nickname}
                        </p>
                        <p className="text-xs text-neutral-500">{acc.bankName ?? acc.type}</p>
                      </div>
                    </div>
                    <MoreHorizontal className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                      ₹{acc.balance.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mt-1">
                      {acc.type.replace(/_/g, " ")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── CREDIT CARDS ──────────────────────────────────────────────────── */}
      {(accountsLoading || cards.length > 0) && (
        <div className="space-y-4 pt-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Credit Cards
          </h2>
          {accountsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card, idx) => (
                <div key={card.id} onClick={() => openDetail(card)}
                  className={`relative h-48 rounded-xl p-6 text-white cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${CARD_COLORS[idx % CARD_COLORS.length]} flex flex-col justify-between overflow-hidden group`}>
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                  <div className="flex justify-between items-start z-10">
                    <p className="font-semibold tracking-wide">{card.bankName ?? card.nickname}</p>
                  </div>
                  <div className="z-10 space-y-4">
                    <p className="text-white/80 font-mono text-sm tracking-widest">{card.nickname}</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-white/60 uppercase">Outstanding</p>
                        <p className="text-xl font-bold">₹{card.outstanding.toLocaleString()}</p>
                      </div>
                      {card.availableCredit !== null && (
                        <div className="text-right">
                          <p className="text-xs text-white/60 uppercase">Available</p>
                          <p className="text-sm font-medium">₹{card.availableCredit.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── DETAIL SHEET ──────────────────────────────────────────────────── */}
      <Sheet open={!!selectedAccount} onOpenChange={(open) => !open && setSelectedAccount(null)}>
        <SheetContent className="w-full sm:max-w-md border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-y-auto pb-10">
          {selectedAccount && (
            <div className="space-y-6 pt-6">
              <SheetHeader>
                <div className="flex items-center gap-2 mb-2">
                  {selectedAccount.category === "card"
                    ? <CreditCard className="h-5 w-5 text-neutral-500" />
                    : <Landmark className="h-5 w-5 text-neutral-500" />}
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    {selectedAccount.type.replace(/_/g, " ")}
                  </span>
                </div>
                <SheetTitle className="text-2xl">{selectedAccount.nickname}</SheetTitle>
                <SheetDescription>{selectedAccount.bankName ?? "—"}</SheetDescription>
              </SheetHeader>

              <div className="py-6 border-b border-neutral-200 dark:border-neutral-800">
                <p className="text-sm font-medium text-neutral-500 mb-1">
                  {selectedAccount.type === "credit_card" ? "Outstanding" : "Balance"}
                </p>
                <p className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  ₹{(selectedAccount.type === "credit_card"
                    ? selectedAccount.outstanding
                    : selectedAccount.balance
                  ).toLocaleString()}
                </p>
                {selectedAccount.availableCredit !== null && (
                  <p className="text-sm text-neutral-500 mt-2">
                    Available Credit: ₹{selectedAccount.availableCredit.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={() => { setTxnForm({ ...txnForm, type: "expense" }); setIsTxnOpen(true) }}
                  className="flex-1 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
                  <ArrowUpRight className="h-4 w-4 mr-2" /> Send / Spend
                </Button>
                <Button onClick={() => { setTxnForm({ ...txnForm, type: "income" }); setIsTxnOpen(true) }}
                  variant="outline" className="flex-1">
                  <ArrowDownRight className="h-4 w-4 mr-2" /> Receive / Pay
                </Button>
              </div>

              {/* Transaction history */}
              <div className="pt-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                  <History className="h-4 w-4" /> Recent Transactions
                </h3>
                {txnsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                  </div>
                ) : accountTxns.length === 0 ? (
                  <p className="text-sm text-neutral-500 text-center py-4">No transactions yet for this account.</p>
                ) : (
                  <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden divide-y divide-neutral-200 dark:divide-neutral-800">
                    {accountTxns.map((t) => (
                      <div key={t.id} className="p-4 flex justify-between items-center bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${t.type === "income" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500" : "bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"}`}>
                            {t.type === "income" ? <ArrowDownRight className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white text-sm">{t.merchant || t.category || t.type}</p>
                            <p className="text-xs text-neutral-500">
                              {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </p>
                          </div>
                        </div>
                        <span className={`font-semibold text-sm ${t.type === "income" ? "text-green-600 dark:text-green-500" : "text-neutral-900 dark:text-white"}`}>
                          {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── QUICK TRANSACTION MODAL ───────────────────────────────────────── */}
      <Dialog open={isTxnOpen} onOpenChange={setIsTxnOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{txnForm.type === "expense" ? "Record Spend" : "Record Income / Payment"}</DialogTitle>
            <DialogDescription>for {selectedAccount?.nickname}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">₹</span>
                <Input type="number" placeholder="0.00" className="pl-8 text-lg"
                  value={txnForm.amount} onChange={(e) => setTxnForm({ ...txnForm, amount: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="e.g. Swiggy, Salary"
                value={txnForm.merchant} onChange={(e) => setTxnForm({ ...txnForm, merchant: e.target.value })} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <Button onClick={handleRecordTransaction} disabled={txnSaving}
            className="w-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
            {txnSaving ? "Saving..." : "Confirm"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
