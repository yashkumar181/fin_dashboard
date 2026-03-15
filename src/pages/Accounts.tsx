import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Landmark, CreditCard as CreditCardIcon, ArrowUpRight, Plus } from "lucide-react"

// Dummy Data
const bankAccounts = [
  { id: 1, name: "HDFC Salary Account", type: "Savings", balance: 142000, accountNumber: "•••• 4092" },
  { id: 2, name: "SBI Emergency Fund", type: "Savings", balance: 500000, accountNumber: "•••• 1104" },
  { id: 3, name: "ICICI Joint Account", type: "Checking", balance: 24500, accountNumber: "•••• 8831" },
]

const creditCards = [
  { 
    id: 1, 
    name: "Amazon Pay ICICI", 
    network: "Visa", 
    outstanding: 14500, 
    limit: 100000, 
    dueDate: "Mar 18",
    cardNumber: "•••• 4922"
  },
  { 
    id: 2, 
    name: "HDFC Regalia", 
    network: "Mastercard", 
    outstanding: 85000, 
    limit: 150000, 
    dueDate: "Mar 22",
    cardNumber: "•••• 8110"
  },
]

export default function Accounts() {
  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Accounts & Cards</h1>
        <button className="flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
          <Plus className="h-4 w-4" />
          Link Account
        </button>
      </div>

      {/* Bank Accounts Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <Landmark className="h-5 w-5 text-neutral-500" />
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Bank Accounts</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bankAccounts.map((account) => (
            <Card key={account.id} className="hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">₹{account.balance.toLocaleString()}</div>
                <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span>{account.type}</span>
                  <span>{account.accountNumber}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Credit Cards Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <CreditCardIcon className="h-5 w-5 text-neutral-500" />
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Credit Cards</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {creditCards.map((card) => {
            const utilization = (card.outstanding / card.limit) * 100
            const isHighUtilization = utilization > 50

            return (
              <Card key={card.id} className="hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">{card.name}</CardTitle>
                    <p className="text-xs text-neutral-500">{card.network} • {card.cardNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-neutral-500 uppercase">Due {card.dueDate}</p>
                  </div>
                </CardHeader>
                <CardContent className="mt-4">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Outstanding</p>
                      <div className="text-2xl font-bold">₹{card.outstanding.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-500 mb-1">Limit</p>
                      <div className="text-sm font-medium">₹{card.limit.toLocaleString()}</div>
                    </div>
                  </div>
                  <Progress 
                    value={utilization} 
                    className={`h-2 ${isHighUtilization ? '[&>div]:bg-red-500' : '[&>div]:bg-neutral-900 dark:[&>div]:bg-white'}`} 
                  />
                  <p className="text-xs text-neutral-500 mt-2 text-right">
                    {utilization.toFixed(1)}% Utilized
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}