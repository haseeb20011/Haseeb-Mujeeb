import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import "./AdminLogin.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminLogin() {
  const navigate = useNavigate();
  const shellRef = useRef(null);
  const rafRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handlePointerMove = (event) => {
    const shell = shellRef.current;
    if (!shell || window.innerWidth < 921) return;

    const rect = shell.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      shell.style.setProperty("--mx", `${x * 100}%`);
      shell.style.setProperty("--my", `${y * 100}%`);
      shell.style.setProperty("--px", `${(x - 0.5) * 14}px`);
      shell.style.setProperty("--py", `${(y - 0.5) * 10}px`);
    });
  };

  const handlePointerLeave = () => {
    const shell = shellRef.current;
    if (!shell) return;
    shell.style.setProperty("--mx", "50%");
    shell.style.setProperty("--my", "50%");
    shell.style.setProperty("--px", "0px");
    shell.style.setProperty("--py", "0px");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (errorMessage) setErrorMessage("");
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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Unable to log in.");
      }

      navigate("/admin/dashboard", { replace: true });
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
      <div className="admin-login__scene" aria-hidden="true">
        <span className="admin-login__aurora admin-login__aurora--one" />
        <span className="admin-login__aurora admin-login__aurora--two" />
        <span className="admin-login__aurora admin-login__aurora--three" />
        <span className="admin-login__grid" />
        <span className="admin-login__grain" />
      </div>

      <div
        ref={shellRef}
        className="admin-login__shell"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <span className="admin-login__shell-spotlight" aria-hidden="true" />

        <section
          className="admin-login__showcase"
          aria-label="Portfolio CMS overview"
        >
          <div className="admin-login__showcase-header">
            <div className="admin-login__brand">
              <span className="admin-login__brand-mark">
                <ShieldCheck size={19} strokeWidth={2.25} />
              </span>
              <span className="admin-login__brand-copy">
                <strong>Haseeb.dev</strong>
                <small>Portfolio CMS</small>
              </span>
            </div>

            <span className="admin-login__secure-pill">
              <span />
              Secure access
            </span>
          </div>

          <div className="admin-login__showcase-main">
            <span className="admin-login__eyebrow admin-login__eyebrow--showcase">
              <Sparkles size={12} />
              Administrator console
            </span>

            <h2>
              One console to command your
              <span> everything.</span>
            </h2>

            <p>
              Pages, projects, media, navigation and SEO — organized in one
              focused workspace built for speed and control.
            </p>

            <div className="admin-login__code-card" aria-hidden="true">
              <div className="admin-login__code-head">
                <div className="admin-login__traffic-lights">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="admin-login__code-file">auth / session.ts</span>
              </div>

              <div className="admin-login__code-body">
                <code>
                  <span className="admin-login__code-line admin-login__code-line--one">
                    const session = await auth.verify({"{"}
                  </span>
                  <span className="admin-login__code-line admin-login__code-line--indent admin-login__code-line--two">
                    device: <em>"trusted"</em>,
                  </span>
                  <span className="admin-login__code-line admin-login__code-line--indent admin-login__code-line--three">
                    mfa: <b>true</b>,
                  </span>
                  <span className="admin-login__code-line admin-login__code-line--four">
                    {"}"});
                  </span>
                  <span className="admin-login__code-line admin-login__code-line--success admin-login__code-line--five">
                    → access granted<span className="admin-login__cursor" />
                  </span>
                </code>
              </div>
            </div>

            <div className="admin-login__feature-strip" aria-hidden="true">
              <div>
                <strong>Pages</strong>
                <span>Manage content</span>
              </div>
              <div>
                <strong>Projects</strong>
                <span>Publish work</span>
              </div>
              <div>
                <strong>Secure</strong>
                <span>HTTP-only auth</span>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-login__panel">
          <div className="admin-login__panel-orbit" aria-hidden="true">
            <span />
          </div>

          <div className="admin-login__mobile-brand">
            <div className="admin-login__brand">
              <span className="admin-login__brand-mark">
                <ShieldCheck size={19} strokeWidth={2.25} />
              </span>
              <span className="admin-login__brand-copy">
                <strong>Haseeb.dev</strong>
                <small>Portfolio CMS</small>
              </span>
            </div>

            <span className="admin-login__secure-pill">
              <span />
              Secure
            </span>
          </div>

          <div className="admin-login__panel-stack">
            <div className="admin-login__login-card">
              <span className="admin-login__card-glow" aria-hidden="true" />

              <div className="admin-login__heading">
                <span className="admin-login__eyebrow">
                  Administrator access
                </span>
                <h1>Welcome back.</h1>
                <p>Sign in to continue to your private portfolio workspace.</p>
              </div>

              <form
                className="admin-login__form"
                onSubmit={handleSubmit}
                noValidate
              >
                {errorMessage && (
                  <div
                    className="admin-login__error"
                    role="alert"
                    aria-live="polite"
                  >
                    <span>!</span>
                    <p>{errorMessage}</p>
                  </div>
                )}

                <div className="admin-login__field">
                  <label htmlFor="admin-email">Email address</label>
                  <div className="admin-login__input-wrap">
                    <Mail size={16} />
                    <input
                      id="admin-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="admin-login__field">
                  <label htmlFor="admin-password">Password</label>
                  <div className="admin-login__input-wrap">
                    <LockKeyhole size={16} />
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
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  className="admin-login__submit"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span>
                    {isSubmitting ? (
                      <>
                        <LoaderCircle
                          className="admin-login__spinner"
                          size={17}
                        />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in to CMS
                        <ArrowRight size={17} />
                      </>
                    )}
                  </span>
                </button>
              </form>

              <div className="admin-login__security-note">
                <ShieldCheck size={13} />
                <span>Protected with secure HTTP-only authentication</span>
              </div>
            </div>

            <p className="admin-login__panel-footer">
              Haseeb.dev · Private administration
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
