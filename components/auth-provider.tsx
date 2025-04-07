"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type User = {
  id: string
  name: string
  email: string
  image?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Check for stored user in localStorage
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
        
        // Set up Supabase auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              // Fetch user profile from users table
              const { data: userData, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single()
              
              if (error) {
                console.error('Error fetching user profile:', error)
                return
              }
              
              const userProfile = {
                id: session.user.id,
                name: userData?.name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                image: userData?.image || "/placeholder.svg?height=40&width=40",
              }
              
              localStorage.setItem("user", JSON.stringify(userProfile))
              setUser(userProfile)
            } else if (event === 'SIGNED_OUT') {
              localStorage.removeItem("user")
              setUser(null)
            }
          }
        )
        
        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Error checking auth state:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkUser()
  }, [])

  // Login function using Supabase
  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Login error:', error)
        throw error
      }
      
      if (data.user) {
        // Fetch user profile from users table
        const { data: userData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          console.error('Error fetching user profile:', profileError)
          throw profileError
        }
        
        const userProfile = {
          id: data.user.id,
          name: userData?.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          image: userData?.image || "/placeholder.svg?height=40&width=40",
        }
        
        localStorage.setItem("user", JSON.stringify(userProfile))
        setUser(userProfile)
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login failed", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Signup function using Supabase
  const signup = async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      // Register the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        console.error('Signup error:', error)
        throw error
      }
      
      if (data.user) {
        // Create a user profile in the users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name,
            email,
            image: "/placeholder.svg?height=40&width=40",
            total_miles: 0,
            monthly_miles: 0,
            pace_status: 0,
            streak: 0,
          })
        
        if (profileError) {
          console.error('Error creating user profile:', profileError)
          throw profileError
        }
        
        const userProfile = {
          id: data.user.id,
          name,
          email,
          image: "/placeholder.svg?height=40&width=40",
        }
        
        localStorage.setItem("user", JSON.stringify(userProfile))
        setUser(userProfile)
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Signup failed", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout function using Supabase
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
        throw error
      }
      
      localStorage.removeItem("user")
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

