import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { GlassButton } from "@/components/glass/GlassButton";
import { LogIn, UserPlus, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const setUserSession = useAppStore((state) => state.setUserSession);

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isRegister ? `${API_BASE}/auth/register` : `${API_BASE}/auth/login`;
    const payload = isRegister
      ? { name: regName, email: regEmail, password: regPassword, phone: regPhone }
      : { email: loginEmail, password: loginPassword };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      // Store JWT Token & update global user state
      localStorage.setItem("convene_token", data.token);
      if (setUserSession) setUserSession(data.user, data.token);

      // Navigate to onboarding if registering, or dashboard if logging in
      if (isRegister) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F6F7FB] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[rgba(0,0,0,0.08)] rounded-3xl p-8 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF0FA] text-[#3B6FD4] mb-2">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1D23]">Welcome to Convene</h1>
          <p className="text-xs text-[#5A6577] font-medium">Event operations & command portal authentication</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#F0F2F5] p-1 rounded-full mb-6">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(""); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-colors ${!isRegister ? "bg-white text-[#1A1D23] shadow-sm" : "text-[#5A6577] hover:text-[#1A1D23]"
              }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(""); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-colors ${isRegister ? "bg-white text-[#1A1D23] shadow-sm" : "text-[#5A6577] hover:text-[#1A1D23]"
              }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-[#D6453D]/10 p-3 text-xs font-semibold text-[#D6453D] border border-[#D6453D]/20">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister ? (
            <>
              <div>
                <label className="text-xs font-bold text-[#8E99A8] uppercase tracking-wider block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="h-10 w-full rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-4 text-xs font-semibold text-[#1A1D23] outline-none placeholder:text-[#8E99A8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#8E99A8] uppercase tracking-wider block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="h-10 w-full rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-4 text-xs font-semibold text-[#1A1D23] outline-none placeholder:text-[#8E99A8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#8E99A8] uppercase tracking-wider block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="h-10 w-full rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-4 text-xs font-semibold text-[#1A1D23] outline-none placeholder:text-[#8E99A8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#8E99A8] uppercase tracking-wider block mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="h-10 w-full rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-4 text-xs font-semibold text-[#1A1D23] outline-none placeholder:text-[#8E99A8]"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold text-[#8E99A8] uppercase tracking-wider block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="h-10 w-full rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-4 text-xs font-semibold text-[#1A1D23] outline-none placeholder:text-[#8E99A8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#8E99A8] uppercase tracking-wider block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="h-10 w-full rounded-full bg-[#F0F2F5] border border-[rgba(0,0,0,0.08)] px-4 text-xs font-semibold text-[#1A1D23] outline-none placeholder:text-[#8E99A8]"
                />
              </div>
            </>
          )}

          <div className="pt-2">
            <GlassButton
              type="submit"
              variant="primary"
              disabled={loading}
              icon={isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
              className="w-full h-11 text-xs font-bold rounded-full justify-center"
            >
              {loading ? "Authenticating..." : isRegister ? "Create Account" : "Sign In"}
            </GlassButton>
          </div>
        </form>

        {/* Demo Credentials Footer */}
        <div className="mt-6 pt-4 border-t border-[rgba(0,0,0,0.06)] text-center text-[11px] text-[#8E99A8]">
          <p className="flex items-center justify-center gap-1 font-medium">
            <ShieldCheck size={13} className="text-[#22A65E]" /> Direct backend integration active (`/api/auth`)
          </p>
        </div>
      </div>
    </div>
  );
}
