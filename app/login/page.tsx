'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for the confirmation link!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-white mb-2">ZeBridge</h1>
          </Link>
          <p className="text-gray-400">Sign in to access your dashboard</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1A233A]/50 backdrop-blur-sm border border-gray-800 rounded-lg p-8">
          <form onSubmit={handleSignIn} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0B0F19] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#4ADE80] transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0B0F19] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#4ADE80] transition"
                placeholder="••••••••"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#4ADE80] text-black font-medium rounded-lg hover:bg-[#4ADE80]/90 transition disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={handleSignUp}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
              >
                Sign Up
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-[#4ADE80] hover:underline text-sm">
              ← Back to home
            </Link>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
