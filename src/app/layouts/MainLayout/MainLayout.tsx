import { Footer } from '@/shared/ui/Footer/Footer'
import { Header } from '@/shared/ui/Header/Header'
import { Outlet } from 'react-router-dom'

export function MainLayout() {
  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}
