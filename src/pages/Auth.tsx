import { SignIn, SignUp } from "@clerk/clerk-react"
import { dark } from "@clerk/themes"
import { useTheme } from "../components/theme/ThemeProvider"
import { Wallet } from "lucide-react"

// A reusable wrapper for that premium glowing background
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl" />

      <div className="z-10 flex flex-col items-center">
        <div className="flex flex-col items-center text-center space-y-2 mb-8">
          <div className="p-3 bg-neutral-900 dark:bg-white rounded-xl shadow-lg mb-2">
            <Wallet className="h-8 w-8 text-white dark:text-neutral-900" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Finance Tracker</h1>
        </div>
        
        {children}
      </div>
    </div>
  )
}

export function SignInPage() {
  const { theme } = useTheme()
  return (
    <AuthLayout>
      <SignIn 
        routing="path" 
        path="/sign-in" 
        signUpUrl="/sign-up" 
        appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
      />
    </AuthLayout>
  )
}

export function SignUpPage() {
  const { theme } = useTheme()
  return (
    <AuthLayout>
      <SignUp 
        routing="path" 
        path="/sign-up" 
        signInUrl="/sign-in" 
        appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
      />
    </AuthLayout>
  )
}