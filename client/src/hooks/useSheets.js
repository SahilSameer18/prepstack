import { useContext } from "react";
import { useParams } from "react-router-dom";
import { SheetContext } from "../context/SheetContext";
import { getSheetsByProjectId } from "../api/services/sheetService";

export const useSheets = () => {

  const context = useContext(SheetContext);
  const {sheetId} = useParams();

  if(!context) {
    throw new Error('useProject must be used within ProjectProvider')
  }

  const { sheets, setSheets, loading, setLoading } = context;

  const getSheets = async () => {
    setLoading(true);
    try {
      const response = await getSheetsByProjectId(sheetId);
      setSheets(response?.sheets || response);
      return response;
    } catch (error) {
      console.error('Error fetching sheets:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return {
    sheets,
    setSheets,
    loading,
    setLoading,
    getSheets
  }
}