import { useCallback, useState } from "react"
import { RequestByEmployeeParams, FullResponse, Transaction } from "../utils/types"
import { FullTransactionResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function useLoadViewMoreTransactions(): FullTransactionResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [loadTransactions, setLoadTransactions] = useState<Transaction[] | null>()

  const fetchAll = useCallback(async (transactions: Transaction[]) => {
    const response = await fetchWithCache<FullResponse<Transaction[] | null>>("loadViewMore")

    // combine into one
    let finalArr: any[] = []

    // hashtable to keeo track of elements already added
    let transactionsTable = {};

    // add from object to array
    transactions.map((t) => {
        transactionsTable[t.id] = t.id;
        finalArr.push(t)
    })

    response?.data?.map((t) => {
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
