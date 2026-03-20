import { UserButton } from "@clerk/clerk-react"
import { useTheme } from "../theme/ThemeProvider"
import { dark } from "@clerk/themes"

export function UserNav() {
  const { theme } = useTheme()
  
  return (
    <div className="flex items-center gap-4">
      <UserButton 
        afterSignOutUrl="/sign-in"
        appearance={{
          baseTheme: theme === "dark" ? dark : undefined,
          elements: {
            avatarBox: "h-8 w-8 ring-2 ring-neutral-200 dark:ring-neutral-800"
          }
        }}
      />
    </div>
  )
}