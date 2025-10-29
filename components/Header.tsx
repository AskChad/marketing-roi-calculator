'use client'

import Link from 'next/link'
import { TrendingUp, Settings } from 'lucide-react'

interface HeaderProps {
  showLogin?: boolean
  showDashboard?: boolean
  userName?: string
  isAdmin?: boolean
}

export default function Header({ showLogin = true, showDashboard = false, userName, isAdmin = false }: HeaderProps) {
  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
            <TrendingUp className="h-8 w-8 text-brand-primary" />
            <span className="text-xl font-bold text-neutral-900">
              ROI Calculator
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {showDashboard && (
              <Link
                href="/dashboard"
                className="text-neutral-600 hover:text-brand-primary transition"
              >
                Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center text-neutral-600 hover:text-brand-primary transition"
              >
                <Settings className="mr-1 h-4 w-4" />
                Admin
              </Link>
            )}

            {userName ? (
              <div className="flex items-center space-x-3">
                <span className="text-neutral-700">Hi, {userName}</span>
                <button className="text-neutral-600 hover:text-brand-primary transition">
                  Logout
                </button>
              </div>
            ) : showLogin ? (
              <Link
                href="/login"
                className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Login
              </Link>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  )
}
