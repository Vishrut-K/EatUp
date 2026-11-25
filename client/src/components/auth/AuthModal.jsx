import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { DEMO_CREDENTIALS } from "../../utils/constants";

export function AuthModal() {
  const { authModalOpen, authModalMode, setAuthModalMode, closeAuthModal, login, register } = useAuth();
  const { showToast } = useToast();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAlert({ message: "", type: "" });
    closeAuthModal();
  };

  const handleDemoFill = () => {
    setAuthModalMode("login");
    setLoginEmail(DEMO_CREDENTIALS.email);
    setLoginPassword(DEMO_CREDENTIALS.password);
    setAlert({ message: "Demo credentials filled! Click 'Sign In to EatUp' below.", type: "success" });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAlert({ message: "", type: "" });
    setSubmitting(true);
    try {
      const user = await login(loginEmail.trim(), loginPassword);
      handleClose();
      showToast(`Welcome back, ${user.name}! 👋`);
    } catch (err) {
      setAlert({ message: err?.response?.data?.message || "Sign in failed.", type: "error" });
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
      showToast(`Account created! Welcome to EatUp, ${user.name}! 🎉`);
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
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/65 p-5 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-[18px] bg-white shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 text-2xl leading-none text-[#8E9BAE] hover:text-[#111827]"
        >
          &times;
        </button>

        <div className="px-7 pt-6 pb-4 text-center">
          <h3 className="mb-1 text-2xl font-extrabold text-[#111827]">Welcome to EatUp</h3>
          <p className="text-sm text-[#4B5563]">Sign in or create an account to order food</p>

          <div className="mt-4 flex border-b border-[#E5EBE7]">
            <button
              type="button"
              onClick={() => {
                setAuthModalMode("login");
                setAlert({ message: "", type: "" });
              }}
              className={`flex-1 border-b-2 py-3 text-[0.95rem] font-bold transition ${
                authModalMode === "login"
                  ? "border-[#0D7A53] text-[#0D7A53]"
                  : "border-transparent text-[#8E9BAE]"
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
              className={`flex-1 border-b-2 py-3 text-[0.95rem] font-bold transition ${
                authModalMode === "signup"
                  ? "border-[#0D7A53] text-[#0D7A53]"
                  : "border-transparent text-[#8E9BAE]"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        <div className="px-7 pt-5 pb-7">
          <div className="mb-5 flex items-center justify-between rounded-xl border border-dashed border-[#0D7A53] bg-[#EBF7F1] px-3.5 py-3">
            <div className="text-xs font-semibold text-[#0D7A53]">
              <strong>Quick Demo Account</strong>
              <br />
              {DEMO_CREDENTIALS.email}
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="rounded-full bg-[#0D7A53] px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-[#086041]"
            >
              1-Click Auto Fill
            </button>
          </div>

          {alert.message && (
            <div
              className={`mb-4 rounded-lg border px-3.5 py-2.5 text-sm font-semibold ${
                alert.type === "success"
                  ? "border-green-200 bg-[#DCFCE7] text-[#15803D]"
                  : "border-red-200 bg-[#FEE2E2] text-[#B91C1C]"
              }`}
            >
              {alert.message}
            </div>
          )}

          {authModalMode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-[#4B5563]" htmlFor="login-email">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border-[1.5px] border-[#E5EBE7] px-3.5 py-3 text-[0.95rem] outline-none focus:border-[#0D7A53]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-[#4B5563]" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border-[1.5px] border-[#E5EBE7] px-3.5 py-3 text-[0.95rem] outline-none focus:border-[#0D7A53]"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-gradient-to-br from-[#0D7A53] to-[#149666] py-3 text-base font-extrabold text-white transition hover:opacity-95 disabled:opacity-60"
              >
                {submitting ? "Signing In..." : "Sign In to EatUp"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-[#4B5563]" htmlFor="signup-name">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full rounded-lg border-[1.5px] border-[#E5EBE7] px-3.5 py-3 text-[0.95rem] outline-none focus:border-[#0D7A53]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-[#4B5563]" htmlFor="signup-email">
                  Email Address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border-[1.5px] border-[#E5EBE7] px-3.5 py-3 text-[0.95rem] outline-none focus:border-[#0D7A53]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-[#4B5563]" htmlFor="signup-password">
                  Password (min 6 chars)
                </label>
                <input
                  id="signup-password"
                  type="password"
                  required
                  minLength={6}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border-[1.5px] border-[#E5EBE7] px-3.5 py-3 text-[0.95rem] outline-none focus:border-[#0D7A53]"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-gradient-to-br from-[#0D7A53] to-[#149666] py-3 text-base font-extrabold text-white transition hover:opacity-95 disabled:opacity-60"
              >
                {submitting ? "Creating Account..." : "Create My Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
