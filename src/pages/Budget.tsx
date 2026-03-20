// src/pages/Budget.tsx
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { useAppStore } from "@/store/useAppStore"

export default function Budget() {
  // Global Store State
  const { categories, monthlyBudget, monthlySpent, addCategory } = useAppStore()
  
  // Local Popup Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatLimit, setNewCatLimit] = useState("")
  const [newCatIcon, setNewCatIcon] = useState("🏷️")

  const overallPercentage = (monthlySpent / monthlyBudget) * 100;
  
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-amber-500";
    return "bg-neutral-900 dark:bg-white"; 
  }

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName || !newCatLimit) return

    addCategory({
      name: newCatName,
      limit: Number(newCatLimit),
      icon: newCatIcon
    })

    // Reset and close
    setNewCatName("")
    setNewCatLimit("")
    setNewCatIcon("🏷️")
    setIsDialogOpen(false)
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto">
      
      {/* Header & Dialog Trigger */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Monthly Budget</h1>
          <p className="text-neutral-500">Track your spending limits and goals.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90">
              <Plus className="h-4 w-4" /> Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
            <DialogHeader>
              <DialogTitle className="text-neutral-900 dark:text-white">New Budget Category</DialogTitle>
              <DialogDescription className="text-neutral-500">
                Set a new monthly spending limit for a specific category.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBudget} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Groceries, Tech Subscriptions" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="limit">Monthly Limit (₹)</Label>
                <Input 
                  id="limit" 
                  type="number" 
                  placeholder="0.00" 
                  value={newCatLimit}
                  onChange={(e) => setNewCatLimit(e.target.value)}
                  required
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Emoji Icon</Label>
                <Input 
                  id="icon" 
                  placeholder="🍕" 
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  maxLength={2}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Category</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Budget Summary */}
      <Card className="shadow-md border-neutral-200 dark:border-neutral-800 overflow-hidden relative">
        <div 
          className="absolute left-0 top-0 bottom-0 w-1.5" 
          style={{ backgroundColor: overallPercentage > 90 ? '#ef4444' : '#3b82f6' }} 
        />
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="w-full md:w-1/2 text-center md:text-left">
              <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">Total Spent</p>
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span className="text-5xl font-bold text-neutral-900 dark:text-white">₹{monthlySpent.toLocaleString()}</span>
                <span className="text-xl text-neutral-500 font-medium">/ ₹{monthlyBudget.toLocaleString()}</span>
              </div>
              <p className="text-sm text-neutral-500 mt-4">
                You have <span className="font-bold text-neutral-900 dark:text-white">₹{Math.max(0, monthlyBudget - monthlySpent).toLocaleString()}</span> left for the rest of the month.
              </p>
            </div>
            
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative h-40 w-40">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle 
                    className="text-neutral-100 dark:text-neutral-800 stroke-current" 
                    strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" 
                  />
                  <circle 
                    className={`${overallPercentage > 90 ? 'text-red-500' : 'text-blue-500'} stroke-current transition-all duration-1000 ease-in-out`} 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    cx="50" cy="50" r="40" 
                    fill="transparent" 
                    strokeDasharray={`${Math.min(overallPercentage, 100) * 2.51} 251.2`} 
                    transform="rotate(-90 50 50)" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-neutral-900 dark:text-white">{overallPercentage.toFixed(0)}%</span>
                  <span className="text-xs text-neutral-500">Used</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Category Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const percentage = (cat.spent / cat.limit) * 100;
            const isOverBudget = percentage > 100;

            return (
              <Card key={cat.id} className={`shadow-sm transition-all hover:shadow-md ${isOverBudget ? 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center text-lg">
                        {cat.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white leading-none mb-1">{cat.name}</h3>
                        {isOverBudget && (
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
                      className={`h-full transition-all duration-500 ease-in-out rounded-full ${getProgressColor(percentage)}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-neutral-500 font-medium">
                    <span>{percentage.toFixed(0)}%</span>
                    <span>₹{Math.max(0, cat.limit - cat.spent).toLocaleString()} left</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

    </div>
  )
}