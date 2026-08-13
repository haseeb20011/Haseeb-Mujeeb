import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import App from "./App.jsx";
import AdminLogin from "./admin/AdminLogin.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute.jsx";
import { applySavedSiteStyles } from "./siteStyles.js";

// Apply saved global website styles when the app loads.
applySavedSiteStyles();

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Admin login */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* Protected admin routes */}
        <Route element={<ProtectedAdminRoute />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
        </Route>

        {/* Public portfolio website */}
        <Route
          path="*"
          element={<App />}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);