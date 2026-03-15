import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Target, AlertTriangle, ArrowUp, ArrowDown, GripVertical, CheckCircle2, PauseCircle, PlayCircle, Plus, Calendar, FileText, History, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Expanded initial data to include descriptions and target dates
const initialGoals = [
  { id: 1, name: "Emergency Fund", target: 300000, current: 150000, desiredMonthly: 15000, isPaused: false, targetDate: "2026-12-31", description: "Six months of essential living expenses for total peace of mind." },
  { id: 2, name: "Goa Vacation", target: 50000, current: 20000, desiredMonthly: 5000, isPaused: false, targetDate: "2026-08-15", description: "Annual trip with college friends. Flight & Airbnb costs." },
  { id: 3, name: "New MacBook Pro", target: 120000, current: 30000, desiredMonthly: 8000, isPaused: false, targetDate: "2026-10-01", description: "Upgrading to the M-series chip for faster app development." },
  { id: 4, name: "Car Downpayment", target: 400000, current: 50000, desiredMonthly: 10000, isPaused: false, targetDate: "2027-05-20", description: "Initial 20% downpayment for a new SUV." },
]

export default function Goals() {
  const [goals, setGoals] = useState(initialGoals)
  const [isAddOpen, setIsAddOpen] = useState(false)
  
  // Detailed View State
  const [selectedGoal, setSelectedGoal] = useState<typeof initialGoals[0] | null>(null)
  const [addAmount, setAddAmount] = useState("")
  
  // New Goal Form State
  const [newGoal, setNewGoal] = useState({
    name: "", target: "", current: "0", desiredMonthly: "", targetDate: "", description: ""
  })
  
  const availableMonthlySavings = 25000 

  const moveUp = (index: number) => {
    if (index === 0) return
    const newGoals = [...goals]
    const temp = newGoals[index - 1]
    newGoals[index - 1] = newGoals[index]
    newGoals[index] = temp
    setGoals(newGoals)
  }

  const moveDown = (index: number) => {
    if (index === goals.length - 1) return
    const newGoals = [...goals]
    const temp = newGoals[index + 1]
    newGoals[index + 1] = newGoals[index]
    newGoals[index] = temp
    setGoals(newGoals)
  }

  const togglePause = (id: number) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, isPaused: !goal.isPaused } : goal
    ))
  }

  // Handle adding a new goal
  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.target || !newGoal.desiredMonthly) return

    const goal = {
      id: Date.now(), 
      name: newGoal.name,
      target: Number(newGoal.target),
      current: Number(newGoal.current),
      desiredMonthly: Number(newGoal.desiredMonthly),
      targetDate: newGoal.targetDate || "No date set",
      description: newGoal.description || "No description provided.",
      isPaused: false
    }

    setGoals([...goals, goal]) 
    setIsAddOpen(false) 
    setNewGoal({ name: "", target: "", current: "0", desiredMonthly: "", targetDate: "", description: "" }) 
  }

  // Quick Add Funds to Selected Goal
  const handleQuickAdd = () => {
    if (!addAmount || isNaN(Number(addAmount)) || !selectedGoal) return

    const amount = Number(addAmount)
    
    // Update the main goals array
    setGoals(goals.map(g => 
      g.id === selectedGoal.id ? { ...g, current: g.current + amount } : g
    ))
    
    // Update the modal's active state instantly
    setSelectedGoal({ ...selectedGoal, current: selectedGoal.current + amount })
    setAddAmount("")
  }

  let remainingFunds = availableMonthlySavings
  
  const processedGoals = goals.map((goal) => {
    const progressPercentage = Math.min((goal.current / goal.target) * 100, 100)

    if (goal.isPaused) {
      return { ...goal, allocatedAmount: 0, isFullyFunded: false, isPartiallyFunded: false, isUnfunded: true, progressPercentage }
    }

    const isFullyFunded = remainingFunds >= goal.desiredMonthly
    const allocatedAmount = isFullyFunded ? goal.desiredMonthly : Math.max(0, remainingFunds)
    remainingFunds -= allocatedAmount

    return { ...goal, allocatedAmount, isFullyFunded, isPartiallyFunded: !isFullyFunded && allocatedAmount > 0, isUnfunded: allocatedAmount === 0, progressPercentage }
  })

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Financial Goals</h1>
          <p className="text-neutral-500 mt-2">Rank your goals. Available funds cascade from top to bottom.</p>
        </div>
        
        {/* Add Goal Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
              <Plus className="mr-2 h-4 w-4" /> Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>Add a new financial target to your priority stack.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
              <div className="space-y-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input id="name" placeholder="e.g. Wedding Fund" value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Target Amount (₹)</Label>
                <Input id="target" type="number" placeholder="500000" value={newGoal.target} onChange={(e) => setNewGoal({...newGoal, target: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Already Saved (₹)</Label>
                  <Input id="current" type="number" value={newGoal.current} onChange={(e) => setNewGoal({...newGoal, current: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly">Monthly Target (₹)</Label>
                  <Input id="monthly" type="number" placeholder="10000" value={newGoal.desiredMonthly} onChange={(e) => setNewGoal({...newGoal, desiredMonthly: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Target Date</Label>
                <Input id="date" type="date" value={newGoal.targetDate} onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description (Optional)</Label>
                <Input id="desc" placeholder="What is this for?" value={newGoal.description} onChange={(e) => setNewGoal({...newGoal, description: e.target.value})} />
              </div>
            </div>
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <Button onClick={handleAddGoal} className="w-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 font-bold">
                Save Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
        <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-sm font-medium opacity-80">Available Monthly Savings</p>
            <p className="text-3xl font-bold mt-1">₹{availableMonthlySavings.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium opacity-80">Unallocated Funds</p>
            <p className="text-xl font-semibold mt-1">₹{Math.max(0, remainingFunds).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
          <Target className="h-5 w-5" />
          Priority Stack
        </h2>
        
        <div className="space-y-3">
          {processedGoals.map((goal, index) => (
            <Card 
              key={goal.id} 
              className={`transition-all duration-300 ${
                goal.isPaused ? 'border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/50 opacity-60 grayscale-[0.5]' 
                  : goal.isUnfunded ? 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10 opacity-75' 
                  : goal.isPartiallyFunded ? 'border-amber-200 dark:border-amber-900/50' : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <CardContent className="p-0 flex items-stretch">
                
                {/* Reorder Controls (Not Clickable for Detail View) */}
                <div className="p-4 flex flex-col items-center justify-center gap-1 border-r border-neutral-200 dark:border-neutral-800">
                  <button onClick={() => moveUp(index)} disabled={index === 0} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <GripVertical className="h-4 w-4 text-neutral-300 dark:text-neutral-700" />
                  <button onClick={() => moveDown(index)} disabled={index === goals.length - 1} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>

                {/* Clickable Goal Info Area */}
                <div 
                  className="flex-1 p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                  onClick={() => setSelectedGoal(goal)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                        {goal.name}
                        {!goal.isPaused && goal.isFullyFunded && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        {!goal.isPaused && goal.isPartiallyFunded && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                        {!goal.isPaused && goal.isUnfunded && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        Target: ₹{goal.target.toLocaleString()} • Saved: ₹{goal.current.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className={`text-sm font-bold ${goal.isPaused ? 'text-neutral-500' : 'text-neutral-900 dark:text-white'}`}>
                          ₹{goal.allocatedAmount.toLocaleString()} <span className="text-xs font-normal text-neutral-500">/mo</span>
                        </p>
                        <p className={`text-[10px] uppercase font-bold mt-1 ${
                          goal.isPaused ? 'text-neutral-500' : goal.isFullyFunded ? 'text-green-600 dark:text-green-500' : goal.isPartiallyFunded ? 'text-amber-600 dark:text-amber-500' : 'text-red-600 dark:text-red-500'
                        }`}>
                          {goal.isPaused ? 'Paused' : goal.isFullyFunded ? 'On Track' : goal.isPartiallyFunded ? 'Underfunded' : 'Halted'}
                        </p>
                      </div>

                      {/* Pause Button - e.stopPropagation() prevents opening the modal when clicking pause */}
                      <Button 
                        variant="ghost" size="icon" 
                        onClick={(e) => { e.stopPropagation(); togglePause(goal.id); }}
                        className={goal.isPaused ? "text-neutral-500 hover:text-neutral-900 dark:hover:text-white" : "text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"}
                        title={goal.isPaused ? "Resume Goal" : "Pause Goal"}
                      >
                        {goal.isPaused ? <PlayCircle className="h-5 w-5" /> : <PauseCircle className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Progress 
                    value={goal.progressPercentage} 
                    className={`h-2 ${goal.isPaused ? '[&>div]:bg-neutral-300 dark:[&>div]:bg-neutral-600' : goal.isUnfunded ? '[&>div]:bg-red-500' : goal.isPartiallyFunded ? '[&>div]:bg-amber-500' : '[&>div]:bg-neutral-900 dark:[&>div]:bg-white'}`} 
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* DETAILED VIEW DIALOG */}
      <Dialog open={!!selectedGoal} onOpenChange={(open) => !open && setSelectedGoal(null)}>
        <DialogContent className="sm:max-w-[450px]">
          {selectedGoal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-neutral-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Goal Details</span>
                </div>
                <DialogTitle className="text-2xl">{selectedGoal.name}</DialogTitle>
                <DialogDescription className="text-sm mt-2 flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                  {selectedGoal.description}
                </DialogDescription>
              </DialogHeader>

              <div className="py-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> Target Date</p>
                    <p className="font-semibold">{selectedGoal.targetDate || "Not set"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Progress</p>
                    <p className="font-semibold text-green-600 dark:text-green-500">
                      {Math.min((selectedGoal.current / selectedGoal.target) * 100, 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Big Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-2xl font-bold">₹{selectedGoal.current.toLocaleString()}</span>
                    <span className="text-neutral-400">of ₹{selectedGoal.target.toLocaleString()}</span>
                  </div>
                  <Progress value={(selectedGoal.current / selectedGoal.target) * 100} className="h-3 [&>div]:bg-green-500" />
                </div>

                {/* Quick Add Action */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                    <Plus className="h-3 w-3" /> Quick Add Funds
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">₹</span>
                      <Input 
                        type="number" 
                        placeholder="Amount" 
                        className="pl-8" 
                        value={addAmount} 
                        onChange={(e) => setAddAmount(e.target.value)} 
                      />
                    </div>
                    <Button onClick={handleQuickAdd} className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                      Deposit
                    </Button>
                  </div>
                </div>

                {/* Mock History */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                    <History className="h-3 w-3" /> Recent Activity
                  </h4>
                  <div className="text-sm border border-neutral-200 dark:border-neutral-800 rounded-md divide-y divide-neutral-200 dark:divide-neutral-800">
                    <div className="p-3 flex justify-between items-center bg-white dark:bg-neutral-950">
                      <div>
                        <p className="font-medium">Monthly Auto-Transfer</p>
                        <p className="text-xs text-neutral-500">Just now</p>
                      </div>
                      <span className="text-green-600 dark:text-green-500 font-medium">+₹{selectedGoal.desiredMonthly.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}