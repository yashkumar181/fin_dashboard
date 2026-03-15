import { BrowserRouter, Routes, Route } from "react-router-dom"
import AppLayout from "./components/layout/AppLayout"

function Dashboard() {
  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics Dashboard</h1>
    </div>
  )
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/accounts" element={<PlaceholderPage title="Accounts & Cards" />} />
          <Route path="/subscriptions" element={<PlaceholderPage title="Subscriptions" />} />
          <Route path="/budget" element={<PlaceholderPage title="Budgeting" />} />
          <Route path="/goals" element={<PlaceholderPage title="Financial Goals" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}