// src/components/layout/OnboardingModal.tsx
import { useState, useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, ArrowRight, ShieldCheck } from "lucide-react"
import { useApi } from "@/lib/api"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 80 }, (_, i) => currentYear - 18 - i)
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

export function OnboardingModal() {
  const { user, isLoaded } = useUser()
  const api = useApi()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [phone, setPhone] = useState("")
  const [month, setMonth] = useState("")
  const [day, setDay] = useState("")
  const [year, setYear] = useState("")

  useEffect(() => {
    if (isLoaded && user && !user.unsafeMetadata?.onboardingComplete) {
      setIsOpen(true)
    }
  }, [isLoaded, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!month || !day || !year) return
    setIsLoading(true)
    setError(null)

    try {
      const monthIndex = MONTHS.indexOf(month) + 1
      const formattedDOB = `${year}-${String(monthIndex).padStart(2, "0")}-${String(day).padStart(2, "0")}`

      // 1. Save to Clerk metadata first
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          onboardingComplete: true,
          phone,
          dob: formattedDOB,
        },
      })

      // 2. Sync the phone number to the Neon database
      //    This creates/updates the users table row and links the Clerk account
      //    to whatever WhatsApp bot registration exists for this number.
      try {
        await api.syncUser({
          phone,
          name: user?.firstName ?? user?.fullName ?? undefined,
        })
      } catch (dbErr) {
        // Non-fatal: user can still use the app; show a soft warning
        console.warn("DB sync failed (user may not be WhatsApp-registered yet):", dbErr)
      }

      setIsOpen(false)
    } catch (err: any) {
      console.error("Onboarding error:", err)
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !user?.unsafeMetadata?.onboardingComplete) return
    setIsOpen(open)
  }

  if (!isLoaded || !user) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-6 sm:p-8 [&>button]:hidden border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-2xl">
        <DialogHeader className="space-y-3 mb-4">
          <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-fit mb-2">
            <ShieldCheck className="h-8 w-8 text-green-600 dark:text-green-500" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">Secure your account</DialogTitle>
          <DialogDescription className="text-center text-base">
            Welcome, <span className="font-semibold text-neutral-900 dark:text-white">{user.firstName}</span>!
            We need two final details to activate your AI financial assistant.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">
              WhatsApp Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                className="pl-11 h-12 text-base"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <p className="text-xs text-neutral-500">
              Use the same number you registered with the Finance Tracker WhatsApp bot.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">Date of Birth</Label>
            <div className="grid grid-cols-3 gap-3">
              <Select onValueChange={setMonth} required>
                <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Month" /></SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  {MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select onValueChange={setDay} required>
                <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Day" /></SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  {DAYS.map((d) => <SelectItem key={d} value={d.toString()}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select onValueChange={setYear} required>
                <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  {YEARS.map((y) => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading || !month || !day || !year || !phone}
            className="w-full h-12 text-base font-medium bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
          >
            {isLoading ? "Saving Profile..." : "Enter Dashboard"}
            {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
