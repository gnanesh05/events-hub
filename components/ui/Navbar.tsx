'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState, useEffect } from 'react'
import { FaUserCircle } from 'react-icons/fa'
import posthog from 'posthog-js'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const Navbar = () => {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNavClick = (linkName: string) => {
    posthog.capture(`navbar_${linkName}_clicked`, { link_name: linkName })
  }

  const handleLogout = async () => {
    try {
      await authClient.signOut()
      toast.success('Logged out successfully')
      posthog.capture('user_logged_out')
      setDropdownOpen(false)
      router.push('/')
    } catch (error) {
      toast.error('Failed to log out')
      console.error('Logout error:', error)
    }
  }

  return (
    <header>
      <nav>
        <Link href="/" className="logo" onClick={() => handleNavClick('logo')}>
          <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
          <p>Events Hub</p>
        </Link>
        <ul>
          <Link href="/" onClick={() => handleNavClick('home')}>Home</Link>
          <Link href="/events" onClick={() => handleNavClick('events')}>Events</Link>
          {session?.user?.role === 'organizer' && (
            <Link href="/events/create" onClick={() => handleNavClick('create_event')}>Create Event</Link>
          )}
          {isPending ? (
            <span>Loading...</span>
          ) : session?.user ? (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-label="Account menu"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span className="max-sm:hidden">Hi, {session.user.name}</span>
                <FaUserCircle size={24} />
              </button>
              {dropdownOpen && (
                <div className="account-dropdown">
                  <Link
                    href="/dashboard"
                    onClick={() => { handleNavClick('dashboard'); setDropdownOpen(false) }}
                  >
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" onClick={() => handleNavClick('login')}>Login</Link>
          )}
        </ul>
      </nav>
    </header>
  )
}

export default Navbar
