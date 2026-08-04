import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import App from "./App.jsx";
import AdminLogin from "./admin/AdminLogin.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route element={<ProtectedAdminRoute />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);