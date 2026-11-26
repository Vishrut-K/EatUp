import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, User as UserIcon, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export function AuthModal() {
  const { authModalOpen, authModalMode, setAuthModalMode, closeAuthModal, login, register } = useAuth();
  const { showToast } = useToast();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAlert({ message: "", type: "" });
    setShowPassword(false);
    closeAuthModal();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAlert({ message: "", type: "" });
    setSubmitting(true);
    try {
      const user = await login(loginEmail.trim(), loginPassword);
      handleClose();
      showToast(`Welcome back, ${user.name}.`);
    } catch (err) {
      setAlert({ message: err?.response?.data?.message || "Invalid email or password.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setAlert({ message: "", type: "" });
    setSubmitting(true);
    try {
      const user = await register(signupName.trim(), signupEmail.trim(), signupPassword);
      handleClose();
      showToast(`Welcome to EatUp, ${user.name}.`);
    } catch (err) {
      setAlert({ message: err?.response?.data?.message || "Account creation failed.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#1C1917]/65 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-3xl border border-[#EAE3D9] bg-[#FAF7F2] shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#EAE3D9] bg-white text-[#57534E] transition hover:border-[#1C1917] hover:text-[#1C1917]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b border-[#EAE3D9] bg-white px-7 pt-7 pb-0 text-center">
          <span className="mb-2 inline-block text-[10px] font-bold tracking-[0.18em] text-[#C83E2B] uppercase">
            Member Access
          </span>
          <h3 className="font-editorial text-3xl tracking-tight text-[#1C1917]">
            Welcome to <span className="italic text-[#C83E2B]">EatUp.</span>
          </h3>
          <p className="mt-1 text-xs text-[#57534E]">
            Sign in or create an account to order &amp; host group tables
          </p>

          <div className="mt-5 flex">
            <button
              type="button"
              onClick={() => {
                setAuthModalMode("login");
                setAlert({ message: "", type: "" });
              }}
              className={`flex-1 border-b-2 py-3 text-sm font-bold transition ${
                authModalMode === "login"
                  ? "border-[#C83E2B] text-[#C83E2B]"
                  : "border-transparent text-[#A8A29E] hover:text-[#1C1917]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalMode("signup");
                setAlert({ message: "", type: "" });
              }}
              className={`flex-1 border-b-2 py-3 text-sm font-bold transition ${
                authModalMode === "signup"
                  ? "border-[#C83E2B] text-[#C83E2B]"
                  : "border-transparent text-[#A8A29E] hover:text-[#1C1917]"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        <div className="px-7 py-6">
          {alert.message && (
            <div
              className={`mb-4 rounded-xl border px-3.5 py-2.5 text-xs font-semibold ${
                alert.type === "success"
                  ? "border-[#2D5A3C]/20 bg-[#EAF2EC] text-[#2D5A3C]"
                  : "border-[#C83E2B]/20 bg-[#FBECE9] text-[#C83E2B]"
              }`}
            >
              {alert.message}
            </div>
          )}

          {authModalMode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-[#57534E] uppercase" htmlFor="login-email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#A8A29E]" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#EAE3D9] bg-white py-3 pr-3.5 pl-10 text-sm text-[#1C1917] outline-none transition focus:border-[#C83E2B]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-[#57534E] uppercase" htmlFor="login-password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#A8A29E]" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[#EAE3D9] bg-white py-3 pr-10 pl-10 text-sm text-[#1C1917] outline-none transition focus:border-[#C83E2B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-[#A8A29E] hover:text-[#1C1917]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-[#C83E2B] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#A62F1F] disabled:opacity-60"
              >
                {submitting ? "Signing In..." : "Sign In to EatUp"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-[#57534E] uppercase" htmlFor="signup-name">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#A8A29E]" />
                  <input
                    id="signup-name"
                    type="text"
                    required
                    minLength={2}
                    autoComplete="name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-[#EAE3D9] bg-white py-3 pr-3.5 pl-10 text-sm text-[#1C1917] outline-none transition focus:border-[#C83E2B]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-[#57534E] uppercase" htmlFor="signup-email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#A8A29E]" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#EAE3D9] bg-white py-3 pr-3.5 pl-10 text-sm text-[#1C1917] outline-none transition focus:border-[#C83E2B]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-[#57534E] uppercase" htmlFor="signup-password">
                  Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#A8A29E]" />
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full rounded-xl border border-[#EAE3D9] bg-white py-3 pr-10 pl-10 text-sm text-[#1C1917] outline-none transition focus:border-[#C83E2B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-[#A8A29E] hover:text-[#1C1917]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-[#C83E2B] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#A62F1F] disabled:opacity-60"
              >
                {submitting ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
