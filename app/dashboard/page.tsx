import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from "@/components/Header"
import DashboardContent from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <Header />
      <DashboardContent user={user} />
    </div>
  )
}