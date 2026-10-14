import { createContext, useState, useMemo } from "react";

export const InterviewContext = createContext()

export const InterviewProvider = ({children}) => {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [reports, setReports] = useState([])
  const [totalReports, setTotalReports] = useState(0)

  const value = useMemo(
    () => ({
      loading,
      setLoading,
      report,
      setReport,
      reports,
      setReports,
      totalReports,
      setTotalReports,
    }),
    [loading, report, reports, totalReports]
  );

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  )
}

