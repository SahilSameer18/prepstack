import { createContext, useState } from "react";

export const SheetContext = createContext();

export const SheetProvider = ({ children }) => {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <SheetContext.Provider value={{ sheets, setSheets, loading, setLoading }}>
      {children}
    </SheetContext.Provider>
  )
}
