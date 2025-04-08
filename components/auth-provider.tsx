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
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Function to fetch and update user data
  const refreshUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        // Fetch user profile from users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        if (error) {
          console.error('Error fetching user profile:', error)
          return
        }
        
        const userProfile = {
          id: authUser.id,
          name: userData?.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          image: userData?.image || 'default',
        }
        
        localStorage.setItem("user", JSON.stringify(userProfile))
        setUser(userProfile)
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }

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
              await refreshUser()
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

  // Signup function using Supabase
  const signup = async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (authError) {
        console.error('Signup error:', authError)
        throw authError
      }
      
      if (authData.user) {
        // Create user profile in users table
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              name,
              email,
              image: 'default',
            }
          ])
        
        if (profileError) {
          console.error('Error creating user profile:', profileError)
          throw profileError
        }
        
        // Refresh user data and redirect
        await refreshUser()
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Signup failed", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

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
        await refreshUser()
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login failed", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      localStorage.removeItem("user")
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Logout failed", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, signup }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

