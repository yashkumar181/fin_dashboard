import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  LayoutDashboard,
  CreditCard,
  RefreshCw,
  PieChart,
  Target,
  Settings,
  PlusCircle,
  ArrowRightLeft
} from "lucide-react"

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/accounts"))}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Accounts & Cards</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/subscriptions"))}>
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>Subscriptions</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/budget"))}>
            <PieChart className="mr-2 h-4 w-4" />
            <span>Budget</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/goals"))}>
            <Target className="mr-2 h-4 w-4" />
            <span>Goals</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => console.log("Add transaction"))}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Add Transaction</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => console.log("Transfer funds"))}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            <span>Transfer Funds</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}