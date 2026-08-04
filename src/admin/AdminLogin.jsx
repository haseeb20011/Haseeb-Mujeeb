import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import "./AdminLogin.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to log in.");
      }

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to connect to the server."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-login">
      <section className="admin-login__panel">
        <div className="admin-login__brand">
          <div className="admin-login__logo">
            <ShieldCheck size={28} />
          </div>

          <div>
            <span>Portfolio CMS</span>
            <small>Secure administration</small>
          </div>
        </div>

        <div className="admin-login__content">
          <div className="admin-login__heading">
            <span className="admin-login__eyebrow">
              Administrator access
            </span>

            <h1>Welcome back</h1>

            <p>
              Sign in to manage your portfolio content, projects,
              messages, settings, and website information.
            </p>
          </div>

          <form
            className="admin-login__form"
            onSubmit={handleSubmit}
            noValidate
          >
            {errorMessage && (
              <div className="admin-login__error" role="alert">
                {errorMessage}
              </div>
            )}

            <div className="admin-login__field">
              <label htmlFor="admin-email">Email address</label>

              <div className="admin-login__input-wrap">
                <Mail size={18} />

                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="admin-login__field">
              <label htmlFor="admin-password">Password</label>

              <div className="admin-login__input-wrap">
                <LockKeyhole size={18} />

                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />

                <button
                  type="button"
                  className="admin-login__password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              className="admin-login__submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle
                    className="admin-login__spinner"
                    size={18}
                  />
                  Signing in...
                </>
              ) : (
                "Sign in to CMS"
              )}
            </button>
          </form>

          <p className="admin-login__security">
            Protected using secure HTTP-only authentication.
          </p>
        </div>
      </section>

      <section className="admin-login__visual">
        <div className="admin-login__visual-content">
          <span>Haseeb Mujeeb</span>

          <h2>Your portfolio. Your content. Fully under your control.</h2>

          <p>
            Manage projects, skills, messages, SEO information, media,
            and website settings from one private dashboard.
          </p>

          <div className="admin-login__features">
            <span>Content management</span>
            <span>Project publishing</span>
            <span>Secure admin access</span>
          </div>
        </div>
      </section>
    </main>
  );
}