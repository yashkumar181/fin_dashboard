import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PieChart, Wallet, AlertCircle } from "lucide-react"

const budgetData = [
  { id: 1, category: "Housing & Utilities", allocated: 25000, spent: 25000, type: "Fixed" },
  { id: 2, category: "Groceries", allocated: 12000, spent: 9500, type: "Soft" },
  { id: 3, category: "Dining Out", allocated: 8000, spent: 7200, type: "Soft" },
  { id: 4, category: "Transport", allocated: 5000, spent: 3100, type: "Soft" },
  { id: 5, category: "Entertainment", allocated: 4000, spent: 4500, type: "Soft" },
]

export default function Budget() {
  const totalIncome = 90000
  const totalCommitted = 35000
  const discretionaryLimit = totalIncome - totalCommitted
  const totalSpentDiscretionary = 24300
  
  const overallUtilization = (totalSpentDiscretionary / discretionaryLimit) * 100

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Budgeting</h1>
        <p className="text-neutral-500 mt-2">Monitor your discretionary spending against your real limit.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalIncome.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500 flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Committed (Fixed)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalCommitted.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              True Discretionary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">
              ₹{discretionaryLimit.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discretionary Spending</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium">Overall Utilization</span>
              <span className="text-sm text-neutral-500">
                ₹{totalSpentDiscretionary.toLocaleString()} / ₹{discretionaryLimit.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={overallUtilization} 
              className={`h-3 ${overallUtilization > 90 ? '[&>div]:bg-red-500' : overallUtilization > 75 ? '[&>div]:bg-amber-500' : '[&>div]:bg-green-500'}`} 
            />
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-6">
            {budgetData.map((item) => {
              const util = (item.spent / item.allocated) * 100
              const isOver = util > 100
              const progressColor = isOver ? '[&>div]:bg-red-500' : util > 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-neutral-900 dark:[&>div]:bg-white'
              
              return (
                <div key={item.id}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className={`text-sm ${isOver ? 'text-red-500 font-bold' : 'text-neutral-500'}`}>
                      ₹{item.spent.toLocaleString()} / ₹{item.allocated.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={Math.min(util, 100)} className={`h-2 ${progressColor}`} />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}