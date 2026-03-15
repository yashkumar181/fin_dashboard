import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Bell, Shield, CreditCard, LogOut } from "lucide-react"

export default function Settings() {
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Settings</h1>
        <p className="text-neutral-500 mt-2">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-8 w-full">
        
        {/* Left Sidebar Navigation */}
        <TabsList className="flex flex-col w-full md:w-64 h-auto bg-transparent p-0 space-y-1 items-start justify-start">
          <TabsTrigger 
            value="profile" 
            className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-none rounded-md transition-colors"
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-none rounded-md transition-colors"
          >
            <Bell className="mr-2 h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger 
            value="billing" 
            className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-none rounded-md transition-colors"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-red-50 dark:data-[state=active]:bg-red-950/30 data-[state=active]:shadow-none rounded-md text-red-600 dark:text-red-500 data-[state=active]:text-red-700 dark:data-[state=active]:text-red-400 transition-colors"
          >
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>
        
        {/* Right Side Content Area */}
        <div className="flex-1 w-full min-w-0">
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Personal Information</CardTitle>
                <CardDescription>Update your personal details and public profile.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue="Yash Kumar" className="max-w-md" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="yash@example.com" className="max-w-md" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" defaultValue="India" className="max-w-md" />
                </div>
              </CardContent>
              <CardFooter className="border-t border-neutral-200 dark:border-neutral-800 px-6 py-4">
                <Button className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Notification Preferences</CardTitle>
                <CardDescription>Choose what updates you want to receive.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="marketing" className="flex flex-col space-y-1">
                    <span className="text-base">Bill Reminders</span>
                    <span className="font-normal text-sm text-neutral-500">Receive alerts 3 days before a bill is due.</span>
                  </Label>
                  <Switch id="marketing" defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="security-alerts" className="flex flex-col space-y-1">
                    <span className="text-base">Budget Overdrafts</span>
                    <span className="font-normal text-sm text-neutral-500">Get notified when you exceed 90% of a budget category.</span>
                  </Label>
                  <Switch id="security-alerts" defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="weekly-summary" className="flex flex-col space-y-1">
                    <span className="text-base">Weekly Summary</span>
                    <span className="font-normal text-sm text-neutral-500">Receive a weekly email digest of your spending.</span>
                  </Label>
                  <Switch id="weekly-summary" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Subscription Plan</CardTitle>
                <CardDescription>Manage your app subscription and payment methods.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/50">
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">Pro Plan</p>
                    <p className="text-sm text-neutral-500 mt-1">₹499 / month</p>
                  </div>
                  <Badge variant="outline" className="bg-white dark:bg-neutral-800 font-medium">Active</Badge>
                </div>
              </CardContent>
              <CardFooter className="border-t border-neutral-200 dark:border-neutral-800 px-6 py-4">
                <Button variant="outline">Update Payment Method</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-0 space-y-6">
            <Card className="border-red-200 dark:border-red-900/50">
              <CardHeader>
                <CardTitle className="text-xl text-red-600 dark:text-red-500">Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-red-100 dark:border-red-900/30 pb-6">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">Sign out of all devices</p>
                    <p className="text-sm text-neutral-500 mt-1">Force all active sessions to log out immediately.</p>
                  </div>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out All
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <p className="font-medium text-red-600 dark:text-red-500">Delete Account</p>
                    <p className="text-sm text-neutral-500 mt-1">Permanently delete your account and all financial data.</p>
                  </div>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  )
}