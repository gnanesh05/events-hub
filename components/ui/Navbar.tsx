'use client'
import Link from 'next/link'
import Image from 'next/image'
import posthog from 'posthog-js'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

const Navbar = () => {

  const {data:session, isPending} = authClient.useSession()
  const router = useRouter();

  const handleNavClick = (linkName: string) => {
    posthog.capture(`navbar_${linkName}_clicked`, {
      link_name: linkName,
    });
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      posthog.capture('user_logged_out');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
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
      {
        session?.user && (
          <Link href="/events/create" onClick={() => handleNavClick('create_event')}>Create Event</Link>
        )
      }
      {isPending ? (
            <span>Loading...</span>
          ) : session?.user ? (
            <>
              <span>Welcome, {session.user.name}</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link href="/login" onClick={() => handleNavClick('login')}>Login</Link>
          )}
      </ul>
    </nav>
   </header>
  )
}

export default Navbar