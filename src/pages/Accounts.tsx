import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Building2, CreditCard, Wallet, ArrowDownRight, ArrowUpRight, Landmark, MoreHorizontal, History } from "lucide-react"

// --- Mock Data ---
const initialAccounts = [
  { id: "a1", name: "Main Checking", bank: "HDFC Bank", type: "checking", balance: 145000.50, mask: "4098" },
  { id: "a2", name: "High-Yield Savings", bank: "SBI", type: "savings", balance: 850000.00, mask: "1102" },
]

const initialCards = [
  { id: "c1", name: "Sapphire Reserve", bank: "Chase", type: "credit", balance: 45000.00, limit: 200000.00, mask: "9088", expiry: "12/28", color: "from-blue-900 to-slate-900" },
  { id: "c2", name: "Cashback Platinum", bank: "ICICI", type: "credit", balance: 12500.00, limit: 100000.00, mask: "3341", expiry: "08/27", color: "from-neutral-800 to-neutral-950" },
]

const generateMockTransactions = () => {
  const merchants = ["Amazon", "Uber", "Swiggy", "Netflix", "Starbucks", "Grocery Store", "Salary", "Rent"]
  return Array.from({ length: 8 }).map((_, i) => {
    const isIncome = Math.random() > 0.8
    return {
      id: i,
      merchant: merchants[Math.floor(Math.random() * merchants.length)],
      date: new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000).toISOString().split('T')[0],
      amount: Math.floor(Math.random() * 5000) + 100,
      type: isIncome ? "income" : "expense"
    }
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function Accounts() {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [cards, setCards] = useState(initialCards)
  
  // Modal States
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false)
  
  // Detailed View State
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])

  // Form States
  const [newAcc, setNewAcc] = useState({ name: "", bank: "", type: "checking", balance: "", mask: "" })
  const [newCard, setNewCard] = useState({ name: "", bank: "", balance: "", limit: "", mask: "", color: "from-slate-800 to-slate-900" })
  const [txnForm, setTxnForm] = useState({ type: "expense", amount: "", merchant: "" })

  const handleAddAccount = () => {
    if (!newAcc.name || !newAcc.balance) return
    setAccounts([...accounts, { id: `a${Date.now()}`, name: newAcc.name, bank: newAcc.bank || "Bank", type: newAcc.type, balance: Number(newAcc.balance), mask: newAcc.mask || "0000" }])
    setIsAddAccountOpen(false)
    setNewAcc({ name: "", bank: "", type: "checking", balance: "", mask: "" })
  }

  const handleAddCard = () => {
    if (!newCard.name || !newCard.balance) return
    setCards([...cards, { id: `c${Date.now()}`, name: newCard.name, bank: newCard.bank || "Bank", type: "credit", balance: Number(newCard.balance), limit: Number(newCard.limit || 100000), mask: newCard.mask || "0000", expiry: "12/29", color: newCard.color }])
    setIsAddCardOpen(false)
    setNewCard({ name: "", bank: "", balance: "", limit: "", mask: "", color: "from-slate-800 to-slate-900" })
  }

  const openDetailedView = (item: any) => {
    setSelectedItem(item)
    setTransactions(generateMockTransactions())
  }

  const openTxnModal = (type: "expense" | "income") => {
    setTxnForm({ type, amount: "", merchant: "" })
    setIsTxnModalOpen(true)
  }

  // --- The Core Math Engine for Transactions ---
  const handleRecordTransaction = () => {
    if (!txnForm.amount || !txnForm.merchant || !selectedItem) return

    const amountNum = Number(txnForm.amount)
    
    // 1. Update Balance Logic
    if (selectedItem.limit) {
      // CREDIT CARD MATH: Spending (expense) adds to your balance. Paying it off (income) lowers your balance.
      const balanceChange = txnForm.type === "expense" ? amountNum : -amountNum
      const updatedCard = { ...selectedItem, balance: selectedItem.balance + balanceChange }
      setCards(cards.map(c => c.id === selectedItem.id ? updatedCard : c))
      setSelectedItem(updatedCard)
    } else {
      // BANK ACCOUNT MATH: Spending (expense) lowers your balance. Receiving (income) adds to your balance.
      const balanceChange = txnForm.type === "expense" ? -amountNum : amountNum
      const updatedAcc = { ...selectedItem, balance: selectedItem.balance + balanceChange }
      setAccounts(accounts.map(a => a.id === selectedItem.id ? updatedAcc : a))
      setSelectedItem(updatedAcc)
    }

    // 2. Add to Recent Transactions List
    const newTxn = {
      id: Date.now(),
      merchant: txnForm.merchant,
      date: new Date().toISOString().split('T')[0],
      amount: amountNum,
      type: txnForm.type
    }
    
    // Push new transaction to the top of the list
    setTransactions([newTxn, ...transactions])
    
    // 3. Cleanup
    setIsTxnModalOpen(false)
    setTxnForm({ type: "expense", amount: "", merchant: "" })
  }

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-6xl mx-auto">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Accounts & Cards</h1>
        <p className="text-neutral-500 mt-2">Manage your liquid assets, credit limits, and recent transactions.</p>
      </div>

      {/* BANK ACCOUNTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Bank Accounts
          </h2>
          
          <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8"><Plus className="h-4 w-4 mr-1" /> Add Account</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader><DialogTitle>Add Bank Account</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2"><Label>Account Nickname</Label><Input placeholder="e.g. Joint Checking" value={newAcc.name} onChange={(e) => setNewAcc({...newAcc, name: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Bank Name</Label><Input placeholder="e.g. HDFC" value={newAcc.bank} onChange={(e) => setNewAcc({...newAcc, bank: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Last 4 Digits</Label><Input placeholder="1234" maxLength={4} value={newAcc.mask} onChange={(e) => setNewAcc({...newAcc, mask: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Current Balance (₹)</Label><Input type="number" placeholder="50000" value={newAcc.balance} onChange={(e) => setNewAcc({...newAcc, balance: e.target.value})} /></div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select onValueChange={(val) => setNewAcc({...newAcc, type: val})} defaultValue={newAcc.type}>
                      <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent><SelectItem value="checking">Checking</SelectItem><SelectItem value="savings">Savings</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button onClick={handleAddAccount} className="w-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">Add Account</Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(acc => (
            <Card key={acc.id} className="cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-500 transition-all group" onClick={() => openDetailedView(acc)}>
              <CardContent className="p-5 flex flex-col justify-between h-full min-h-[140px]">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-600 dark:text-neutral-300"><Landmark className="h-5 w-5" /></div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{acc.name}</p>
                      <p className="text-xs text-neutral-500">{acc.bank} •••• {acc.mask}</p>
                    </div>
                  </div>
                  <MoreHorizontal className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">₹{acc.balance.toLocaleString()}</p>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mt-1">{acc.type}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CREDIT CARDS */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Credit Cards
          </h2>
          
          <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8"><Plus className="h-4 w-4 mr-1" /> Add Card</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader><DialogTitle>Add Credit Card</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2"><Label>Card Name</Label><Input placeholder="e.g. Travel Rewards" value={newCard.name} onChange={(e) => setNewCard({...newCard, name: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Issuer / Bank</Label><Input placeholder="e.g. Amex" value={newCard.bank} onChange={(e) => setNewCard({...newCard, bank: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Last 4 Digits</Label><Input placeholder="1234" maxLength={4} value={newCard.mask} onChange={(e) => setNewCard({...newCard, mask: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Current Balance (₹)</Label><Input type="number" placeholder="0.00" value={newCard.balance} onChange={(e) => setNewCard({...newCard, balance: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Total Limit (₹)</Label><Input type="number" placeholder="100000" value={newCard.limit} onChange={(e) => setNewCard({...newCard, limit: e.target.value})} /></div>
                </div>
              </div>
              <Button onClick={handleAddCard} className="w-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">Add Card</Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(card => (
            <div key={card.id} onClick={() => openDetailedView(card)} className={`relative h-48 rounded-xl p-6 text-white cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${card.color} flex flex-col justify-between overflow-hidden group`}>
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
              <div className="flex justify-between items-start z-10"><p className="font-semibold tracking-wide">{card.bank}</p><MoreHorizontal className="h-5 w-5 text-white/70" /></div>
              <div className="z-10 space-y-4">
                <div className="flex items-center gap-2 text-white/80 font-mono text-sm tracking-widest"><span>••••</span><span>••••</span><span>••••</span><span>{card.mask}</span></div>
                <div className="flex justify-between items-end">
                  <div><p className="text-xs text-white/60 uppercase">Current Balance</p><p className="text-xl font-bold">₹{card.balance.toLocaleString()}</p></div>
                  <div className="text-right"><p className="text-xs text-white/60 uppercase">Valid Thru</p><p className="text-sm font-medium">{card.expiry}</p></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- DETAILED VIEW SHEET --- */}
      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent className="w-full sm:max-w-md border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-y-auto pb-10">
          {selectedItem && (
            <div className="space-y-6 pt-6">
              <SheetHeader>
                <div className="flex items-center gap-2 mb-2">
                  {selectedItem.limit ? <CreditCard className="h-5 w-5 text-neutral-500" /> : <Landmark className="h-5 w-5 text-neutral-500" />}
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">{selectedItem.limit ? "Credit Card" : "Bank Account"}</span>
                </div>
                <SheetTitle className="text-2xl">{selectedItem.name}</SheetTitle>
                <SheetDescription>{selectedItem.bank} ending in {selectedItem.mask}</SheetDescription>
              </SheetHeader>

              {/* Big Balance */}
              <div className="py-6 border-b border-neutral-200 dark:border-neutral-800">
                <p className="text-sm font-medium text-neutral-500 mb-1">Total Balance</p>
                <p className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">₹{selectedItem.balance.toLocaleString()}</p>
                {selectedItem.limit && (
                  <p className="text-sm text-neutral-500 mt-2">Available Credit: ₹{(selectedItem.limit - selectedItem.balance).toLocaleString()}</p>
                )}
              </div>

              {/* Functional Send/Receive Actions */}
              <div className="flex gap-3">
                <Button onClick={() => openTxnModal("expense")} className="flex-1 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
                  <ArrowUpRight className="h-4 w-4 mr-2" /> Send / Spend
                </Button>
                <Button onClick={() => openTxnModal("income")} variant="outline" className="flex-1">
                  <ArrowDownRight className="h-4 w-4 mr-2" /> Receive / Pay
                </Button>
              </div>

              {/* Transaction History */}
              <div className="pt-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2"><History className="h-4 w-4" /> Recent Transactions</h3>
                <div className="space-y-1 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden divide-y divide-neutral-200 dark:divide-neutral-800">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="p-4 flex justify-between items-center bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${txn.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400'}`}>
                          {txn.type === 'income' ? <ArrowDownRight className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white text-sm">{txn.merchant}</p>
                          <p className="text-xs text-neutral-500">{new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <span className={`font-semibold text-sm ${txn.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-neutral-900 dark:text-white'}`}>
                        {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* --- RECORD TRANSACTION MODAL (Triggered by Send/Receive Buttons) --- */}
      <Dialog open={isTxnModalOpen} onOpenChange={setIsTxnModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{txnForm.type === "expense" ? "Send Money / Record Spend" : "Receive Money / Pay Bill"}</DialogTitle>
            <DialogDescription>
              {txnForm.type === "expense" ? "Record an outgoing transaction." : "Record incoming funds."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">₹</span>
                <Input type="number" placeholder="0.00" className="pl-8 text-lg" value={txnForm.amount} onChange={(e) => setTxnForm({...txnForm, amount: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Merchant / Description</Label>
              <Input placeholder="e.g. Swiggy, Uber, Salary" value={txnForm.merchant} onChange={(e) => setTxnForm({...txnForm, merchant: e.target.value})} />
            </div>
          </div>
          <Button onClick={handleRecordTransaction} className="w-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
            Confirm Transaction
          </Button>
        </DialogContent>
      </Dialog>

    </div>
  )
}