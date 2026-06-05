import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { setAuthToken } from "@/api/client";
import LoginPage from "@/pages/LoginPage";
import TenantListPage from "@/pages/TenantListPage";
import ChatPage from "@/pages/ChatPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = sessionStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) setAuthToken(token);
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <TenantListPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
