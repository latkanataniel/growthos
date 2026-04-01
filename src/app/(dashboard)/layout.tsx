import { BottomNav } from '@/components/layout/bottom-nav'
import { Topbar } from '@/components/layout/topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />
      <main className="flex-1 pt-16 pb-20 px-4 md:px-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
