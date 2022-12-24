import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { useLoadViewMoreTransactions } from "./hooks/useLoadViewMore"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee, Transaction } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: allTransactions, ...allTransactionsUtils} = useLoadViewMoreTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)
  const [isEmployeeLoading, setIsEmployeeLoading] = useState(false)
  const [allLoaded, setAllLoaded] = useState(false)

  const transactions = useMemo(
    () => allTransactions?.data ?? paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [allTransactions, paginatedTransactions, transactionsByEmployee]
  )

  const loadViewMore = useCallback(
    async (transactions: Transaction[]) => {
      setIsLoading(true)
      setIsEmployeeLoading(true)

      await employeeUtils.fetchAll()
      setIsEmployeeLoading(false)
      await allTransactionsUtils.fetchAll(transactions)

      setAllLoaded(true)
      setIsLoading(false)
  }, [employeeUtils, allTransactionsUtils])

  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true)
    setIsEmployeeLoading(true)
    allTransactionsUtils.invalidateData()
    transactionsByEmployeeUtils.invalidateData()

    await employeeUtils.fetchAll()
    setIsEmployeeLoading(false)
    await paginatedTransactionsUtils.fetchAll()

    setAllLoaded(false)
    setIsLoading(false)
  }, [employeeUtils, allTransactionsUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      setIsLoading(true)
      setIsEmployeeLoading(true)
      allTransactionsUtils.invalidateData()
      paginatedTransactionsUtils.invalidateData()
      setIsEmployeeLoading(false)
      await transactionsByEmployeeUtils.fetchById(employeeId)
      setAllLoaded(false)
      setIsLoading(false)
    },
    [allTransactionsUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])
  
  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isEmployeeLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            } else if (newValue.firstName == "All" && newValue.lastName == "Employees") {
              await loadAllTransactions()
              return
            }
            await loadTransactionsByEmployee(newValue.id)
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
         <Transactions transactions={transactions} />
          {transactions !== null && allLoaded == false && (
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading}
              onClick={async () => {
                await loadViewMore(transactions)
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
