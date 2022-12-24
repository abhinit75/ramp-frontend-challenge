import { useCallback, useState } from "react"
import { RequestByEmployeeParams, Transaction, EmployeeTransactions } from "../utils/types"
import { TransactionsByEmployeeResult, } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function useTransactionsByEmployee(): TransactionsByEmployeeResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [transactionsByEmployee, setTransactionsByEmployee] = useState<EmployeeTransactions<Transaction[] | null> | null>()

  const [id, setId] = useState("")

  const fetchById = useCallback(
    async (employeeId: string) => {
      setId(employeeId)
      const response = await fetchWithCache<EmployeeTransactions<Transaction[] | null>, RequestByEmployeeParams>(
        "transactionsByEmployee",
        {
          employeeId,
        }
      )
      console.log(response)

      setTransactionsByEmployee(response)
    },
    [fetchWithCache]
  )

  const invalidateData = useCallback(() => {
    setTransactionsByEmployee(null)
  }, [])

  //console.log("Employee ID: " + id)

  return { data: transactionsByEmployee, employeeId: id, loading, fetchById, invalidateData }
}
