import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProtectedAdminRoute() {
  const [authStatus, setAuthStatus] = useState("checking");

  useEffect(() => {
    let isMounted = true;

    const verifyAdmin = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!isMounted) {
          return;
        }

        setAuthStatus(
          response.ok ? "authenticated" : "unauthenticated"
        );
      } catch {
        if (isMounted) {
          setAuthStatus("unauthenticated");
        }
      }
    };

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, []);

  if (authStatus === "checking") {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f5f6fa",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              margin: "0 auto 16px",
              border: "4px solid #e4e5eb",
              borderTopColor: "#6d4aff",
              borderRadius: "50%",
              animation: "adminRouteSpin 700ms linear infinite",
            }}
          />

          <style>
            {`
              @keyframes adminRouteSpin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}
          </style>

          <p style={{ color: "#6d7381" }}>
            Verifying administrator session...
          </p>
        </div>
      </main>
    );
  }

  if (authStatus === "unauthenticated") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}