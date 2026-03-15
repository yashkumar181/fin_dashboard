import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Target, AlertTriangle, ArrowUp, ArrowDown, GripVertical, CheckCircle2 } from "lucide-react"

// Initial state
const initialGoals = [
  { id: 1, name: "Emergency Fund", target: 300000, current: 150000, desiredMonthly: 15000 },
  { id: 2, name: "Goa Vacation", target: 50000, current: 20000, desiredMonthly: 5000 },
  { id: 3, name: "New MacBook Pro", target: 120000, current: 30000, desiredMonthly: 8000 },
  { id: 4, name: "Car Downpayment", target: 400000, current: 50000, desiredMonthly: 10000 },
]

export default function Goals() {
  const [goals, setGoals] = useState(initialGoals)
  
  // The user only has ₹25,000 left over each month to put towards goals
  const availableMonthlySavings = 25000 

  // Move a goal up in priority
  const moveUp = (index: number) => {
    if (index === 0) return
    const newGoals = [...goals]
    const temp = newGoals[index - 1]
    newGoals[index - 1] = newGoals[index]
    newGoals[index] = temp
    setGoals(newGoals)
  }

  // Move a goal down in priority
  const moveDown = (index: number) => {
    if (index === goals.length - 1) return
    const newGoals = [...goals]
    const temp = newGoals[index + 1]
    newGoals[index + 1] = newGoals[index]
    newGoals[index] = temp
    setGoals(newGoals)
  }

  // Dynamic funding logic (The Engine)
  let remainingFunds = availableMonthlySavings
  
  const processedGoals = goals.map((goal) => {
    const isFullyFunded = remainingFunds >= goal.desiredMonthly
    const allocatedAmount = isFullyFunded ? goal.desiredMonthly : Math.max(0, remainingFunds)
    
    remainingFunds -= allocatedAmount
    const progressPercentage = (goal.current / goal.target) * 100

    return {
      ...goal,
      allocatedAmount,
      isFullyFunded,
      isPartiallyFunded: !isFullyFunded && allocatedAmount > 0,
      isUnfunded: allocatedAmount === 0,
      progressPercentage
    }
  })

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Financial Goals</h1>
        <p className="text-neutral-500 mt-2">Rank your goals. Available funds cascade from top to bottom.</p>
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
                goal.isUnfunded 
                  ? 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10 opacity-75' 
                  : goal.isPartiallyFunded 
                    ? 'border-amber-200 dark:border-amber-900/50' 
                    : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <CardContent className="p-4 flex items-center gap-4">
                
                {/* Reorder Controls */}
                <div className="flex flex-col items-center gap-1 border-r border-neutral-200 dark:border-neutral-800 pr-4">
                  <button onClick={() => moveUp(index)} disabled={index === 0} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <GripVertical className="h-4 w-4 text-neutral-300 dark:text-neutral-700" />
                  <button onClick={() => moveDown(index)} disabled={index === goals.length - 1} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>

                {/* Goal Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                        {goal.name}
                        {goal.isFullyFunded && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        {goal.isPartiallyFunded && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                        {goal.isUnfunded && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        Target: ₹{goal.target.toLocaleString()} • Saved: ₹{goal.current.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">
                        ₹{goal.allocatedAmount.toLocaleString()} <span className="text-xs font-normal text-neutral-500">/mo</span>
                      </p>
                      <p className={`text-[10px] uppercase font-bold mt-1 ${
                        goal.isFullyFunded ? 'text-green-600 dark:text-green-500' :
                        goal.isPartiallyFunded ? 'text-amber-600 dark:text-amber-500' :
                        'text-red-600 dark:text-red-500'
                      }`}>
                        {goal.isFullyFunded ? 'On Track' : goal.isPartiallyFunded ? 'Underfunded' : 'Halted'}
                      </p>
                    </div>
                  </div>
                  
                  <Progress 
                    value={goal.progressPercentage} 
                    className={`h-2 ${
                      goal.isUnfunded ? '[&>div]:bg-red-500' : 
                      goal.isPartiallyFunded ? '[&>div]:bg-amber-500' : 
                      '[&>div]:bg-neutral-900 dark:[&>div]:bg-white'
                    }`} 
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}