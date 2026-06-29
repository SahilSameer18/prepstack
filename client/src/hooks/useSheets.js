import { useContext } from "react";
import { SheetContext } from "../context/SheetContext";
import { dsaSheet } from "../api/services/sheetService";
import { extractError } from "../utils/extractError";

export const useSheets = () => {

  const context = useContext(SheetContext);

  if(!context) {
    throw new Error('useSheets must be used within SheetProvider')
  }

  const { sheets, setSheets, loading, setLoading } = context;

  const getSheets = async () => {
    setLoading(true);
    try {
      const response = await dsaSheet();
      setSheets(response?.data || response);
      return response;
    } catch (error) {
      throw new Error(extractError(error, 'Failed to fetch sheets. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return {
    sheets,
    setSheets,
    loading,
    setLoading,
    getSheets
  }
}