import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useAppStore } from "@/store/useAppStore"
import { IndianRupee, Tag, Layers, CalendarDays } from "lucide-react"

export function TransactionSheet() {
  const { isTransactionSheetOpen, closeTransactionSheet } = useAppStore()

  return (
    <Sheet open={isTransactionSheetOpen} onOpenChange={closeTransactionSheet}>
      <SheetContent className="w-full sm:max-w-md border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0">
        <div className="p-6 space-y-8">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold tracking-tight">Add Transaction</SheetTitle>
            <SheetDescription className="text-neutral-500">
              Fill in the details below to track your spending or income.
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-3">
              <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                <IndianRupee className="h-3 w-3" /> Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-bold text-neutral-400">₹</span>
                <Input 
                  id="amount" 
                  placeholder="0.00" 
                  type="number" 
                  className="pl-8 h-14 text-2xl font-bold border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-900 dark:focus-visible:ring-white" 
                />
              </div>
            </div>
            
            {/* Type & Category Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                  <Layers className="h-3 w-3" /> Type
                </Label>
                <Select defaultValue="expense">
                  <SelectTrigger className="h-11 border-neutral-200 dark:border-neutral-800">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                  <Tag className="h-3 w-3" /> Category
                </Label>
                <Select>
                  <SelectTrigger className="h-11 border-neutral-200 dark:border-neutral-800">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="housing">Housing</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                <CalendarDays className="h-3 w-3" /> Transaction Date
              </Label>
              <Input type="date" className="h-11 border-neutral-200 dark:border-neutral-800" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>

            {/* Note/Description */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Note (Optional)</Label>
              <Input placeholder="What was this for?" className="h-11 border-neutral-200 dark:border-neutral-800" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 h-12 font-medium" 
              onClick={closeTransactionSheet}
            >
              Cancel
            </Button>
            <Button 
              className="flex-[2] h-12 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 font-bold"
              onClick={closeTransactionSheet}
            >
              Confirm Transaction
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}