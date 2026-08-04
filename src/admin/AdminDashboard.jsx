import { useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      navigate("/admin/login", {
        replace: true,
      });
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "30px",
        background: "#f5f6fa",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "620px",
          padding: "50px",
          borderRadius: "24px",
          background: "#ffffff",
          boxShadow: "0 20px 60px rgba(30, 35, 60, 0.12)",
          textAlign: "center",
        }}
      >
        <LayoutDashboard size={48} color="#6d4aff" />

        <h1
          style={{
            margin: "20px 0 12px",
            fontSize: "38px",
          }}
        >
          Portfolio CMS
        </h1>

        <p
          style={{
            margin: "0 0 28px",
            color: "#6d7381",
            lineHeight: "1.7",
          }}
        >
          Your login worked successfully. The complete admin dashboard
          will be built here next.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "13px 20px",
            border: "0",
            borderRadius: "10px",
            color: "#ffffff",
            background: "#171a23",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          <LogOut size={17} />
          Log out
        </button>
      </section>
    </main>
  );
}