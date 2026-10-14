import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, deleteInterviewReport } from "../services/interview.api"
import { useContext } from "react"
import { InterviewContext } from "../context/InterviewContext";

export const useInterview = () => {

    const context = useContext(InterviewContext)

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports, totalReports, setTotalReports } = context

    const generateReport = async ({ jobDescription, resumeFile }) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, resumeFile })
            if (response?.interviewReport) {
                setReport(response.interviewReport)
                setReports(prev => [response.interviewReport, ...prev])
                setTotalReports(prev => prev + 1)
            }
        } catch (error) {
            console.error("Failed to generate report:", error)
            return null
        } finally {
            setLoading(false)
        }

        return response?.interviewReport || null
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            if (response?.interviewReport) {
                setReport(response.interviewReport)
            }
        } catch (error) {
            console.error("Failed to fetch report by id:", error)
        } finally {
            setLoading(false)
        }
        return response?.interviewReport || null
    }

    const getReports = async (page = 1, limit = 6) => {
        if (page === 1) setLoading(true) // Only show main loader for initial fetch
        let response = null
        try {
            response = await getAllInterviewReports(page, limit)
            if (page === 1) {
                setReports(response.interviewReports)
            } else {
                setReports(prev => [...prev, ...response.interviewReports])
            }
            if (response.totalCount !== undefined) {
                setTotalReports(response.totalCount)
            }
        } catch (error) {
            console.error("Failed to fetch interview reports:", error?.response?.data?.message || error?.message || error);
        } finally {
            setLoading(false)
        }

        return response?.interviewReports || []
    }

    const deleteReport = async (id) => {
        try {
            await deleteInterviewReport(id)
            setReports(prev => prev.filter(report => report.id !== id))
            setTotalReports(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Failed to delete report:", error)
        }
    }

    return { loading, report, reports, totalReports, generateReport, getReportById, getReports, deleteReport }

}


