import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Transaction } from '../types/finance'

export function useSupabaseFinance() {
  const [user, setUser] = useState<any>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_: any, session: any) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      loadTransactions()
    } else {
      setTransactions([])
    }
  }, [user])

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
    
    if (!error && data) {
      // Map dari database format ke app format
      const mappedData: Transaction[] = data.map((item: any) => ({
        id: item.id,
        amount: item.amount,
        description: item.description,
        category: item.category,
        type: item.type,
        date: item.date,
        createdAt: new Date(item.created_at).getTime()
      }))
      setTransactions(mappedData)
    }
  }

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transaction,
        user_id: user.id,
        created_at: new Date().toISOString()
      }])
      .select()
    
    if (!error && data) {
      const newTransaction: Transaction = {
        id: data[0].id,
        amount: data[0].amount,
        description: data[0].description,
        category: data[0].category,
        type: data[0].type,
        date: data[0].date,
        createdAt: new Date(data[0].created_at).getTime()
      }
      setTransactions(prev => [newTransaction, ...prev])
      return newTransaction
    }
    return null
  }

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    
    if (!error) {
      setTransactions(prev => prev.filter(t => t.id !== id))
    }
  }

  const getSummary = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    return {
      income,
      expense,
      balance: income - expense
    }
  }

  return {
    user,
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    loadTransactions,
    get
