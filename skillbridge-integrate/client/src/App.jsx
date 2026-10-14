import React from "react";
import { RouterProvider } from "react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import { router } from "./routes/app.routes";
import { AuthProvider } from "./context/AuthContext";
import { InterviewProvider } from "./context/InterviewContext";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <InterviewProvider>
          <RouterProvider router={router} />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#141416",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "14px",
                fontSize: "13px",
                fontWeight: "600",
                boxShadow: "0 12px 36px rgba(0, 0, 0, 0.6)",
              },
              success: {
                iconTheme: {
                  primary: "#ff6662",
                  secondary: "#ffffff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#f87171",
                  secondary: "#ffffff",
                },
              },
            }}
          />
        </InterviewProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;


