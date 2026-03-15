import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Calendar, CreditCard, ExternalLink } from "lucide-react"

// Dummy Data
const auditAlerts = [
  {
    id: 1,
    name: "Adobe Creative Cloud",
    issue: "Rarely Used",
    message: "You have only logged in once in the last 60 days.",
    cost: "₹4,230/mo",
    severity: "high"
  },
  {
    id: 2,
    name: "Canva Pro Trial",
    issue: "Trial Expiring",
    message: "Free trial converts to paid plan in 3 days.",
    cost: "₹499/mo",
    severity: "medium"
  }
]

const activeSubscriptions = [
  { id: 1, name: "Netflix Premium", cost: 649, billingCycle: "Monthly", nextBill: "Mar 17", card: "•••• 4922", status: "Active" },
  { id: 2, name: "Spotify Duo", cost: 149, billingCycle: "Monthly", nextBill: "Mar 21", card: "•••• 8110", status: "Active" },
  { id: 3, name: "Amazon Prime", cost: 1499, billingCycle: "Yearly", nextBill: "Aug 14", card: "•••• 4922", status: "Active" },
  { id: 4, name: "Gym Membership", cost: 1500, billingCycle: "Monthly", nextBill: "Apr 01", card: "•••• 8831", status: "Active" },
]

export default function Subscriptions() {
  return (
    <div className="p-6 md:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Subscription Audit</h1>
        <p className="text-neutral-500 mt-2">Track, manage, and optimize your recurring payments.</p>
      </div>

      {/* Audit Alerts Section (The Proactive UX) */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          Requires Attention
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {auditAlerts.map((alert) => (
            <Card key={alert.id} className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-semibold text-red-700 dark:text-red-400">
                    {alert.name}
                  </CardTitle>
                  <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'} className="text-[10px]">
                    {alert.issue}
                  </Badge>
                </div>
                <CardDescription className="text-red-600/80 dark:text-red-300/80 text-xs">
                  {alert.message}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between items-center pt-2">
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{alert.cost}</span>
                <button className="text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-1.5 rounded-md transition-colors font-medium">
                  Review & Cancel
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* All Active Subscriptions */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Active Subscriptions</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {activeSubscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="hidden sm:flex h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center">
                      <ExternalLink className="h-4 w-4 text-neutral-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-white">{sub.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {sub.nextBill}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" /> {sub.card}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-neutral-900 dark:text-white">
                      ₹{sub.cost}
                    </div>
                    <div className="text-[10px] text-neutral-500 uppercase mt-0.5">
                      {sub.billingCycle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}