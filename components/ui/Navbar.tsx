'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import posthog from 'posthog-js'

const Navbar = () => {
  const handleNavClick = (linkName: string) => {
    posthog.capture(`navbar_${linkName}_clicked`, {
      link_name: linkName,
    });
  };

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
      <Link href="/create-event" onClick={() => handleNavClick('create_event')}>Create Event</Link>
      </ul>
    </nav>
   </header>
  )
}

export default Navbar