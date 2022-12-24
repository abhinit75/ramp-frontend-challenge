import { useCallback, useState } from "react"
import { RequestByEmployeeParams, FullResponse, Transaction } from "../utils/types"
import { FullTransactionResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function useLoadViewMoreTransactions(): FullTransactionResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [loadTransactions, setLoadTransactions] = useState<Transaction[] | null>()
  const [transactionsByEmployee, setTransactionsByEmployee] = useState<Transaction[] | null>(null)

  const fetchAll = useCallback(async (transactions: Transaction[]) => {
    console.log("Final Transactions: " + typeof(transactions))

    const response = await fetchWithCache<FullResponse<Transaction[] | null>>("loadViewMore")

    // combine into one
    let finalArr: any[] = []

    // hashtable to keeo track of elements already added
    let transactionsTable = {};

    // add from object to array
    transactions.map((t) => {
        console.log("ID FOR KEY: " + t.id)
        transactionsTable[t.id] = t.id;
        finalArr.push(t)
    })

    response?.data?.map((t) => {
        console.log(t)
        if (!(t.id in transactionsTable)) {
            finalArr.push(t)
        }
    })
    
    await setLoadTransactions(() => {
      if (finalArr === null) {
        return response
      }

      return { data: finalArr }
    })
  }, [fetchWithCache, loadTransactions])
  
  const invalidateData = useCallback(() => {
    setLoadTransactions(null)
  }, [])

  return { data: loadTransactions, loading, fetchAll, invalidateData }
}
