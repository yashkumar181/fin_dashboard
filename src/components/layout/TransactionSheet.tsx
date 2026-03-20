// src/components/layout/TransactionSheet.tsx
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore, TransactionType } from "@/store/useAppStore"

export function TransactionSheet() {
  const { isTransactionSheetOpen, closeTransactionSheet, addTransaction } = useAppStore()
  
  // Local form state
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<TransactionType>("expense")
  const [category, setCategory] = useState("Shopping")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount) return

    // Push to global store
    addTransaction({
      name,
      amount: Number(amount),
      type,
      category,
      date: "Just now", // In a real app, use formatting like date-fns
      icon: type === 'expense' ? "💸" : "🤑"
    })
    
    // Reset form & close
    setName("")
    setAmount("")
    closeTransactionSheet()
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
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <div className="flex gap-2">
              <Button 
                type="button"
                variant={type === "expense" ? "default" : "outline"} 
                className={`flex-1 ${type === 'expense' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
                onClick={() => setType("expense")}
              >
                Expense
              </Button>
              <Button 
                type="button"
                variant={type === "income" ? "default" : "outline"}
                className={`flex-1 ${type === 'income' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                onClick={() => setType("income")}
              >
                Income
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Description</Label>
            <Input 
              id="name" 
              placeholder="e.g. Starbucks, Salary" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input 
              id="amount" 
              type="number" 
              placeholder="0.00" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Shopping">Shopping</SelectItem>
                <SelectItem value="Food">Food & Dining</SelectItem>
                <SelectItem value="Transport">Transport</SelectItem>
                <SelectItem value="Income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={closeTransactionSheet}>Cancel</Button>
            <Button type="submit">Save Transaction</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}