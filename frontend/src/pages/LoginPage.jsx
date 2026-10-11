// Purpose: LoginPage implements this source module.
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
  const [regInviteKey, setRegInviteKey] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isRegister ? `${API_BASE}/auth/register` : `${API_BASE}/auth/login`;
    const payload = isRegister
      ? { name: regName, email: regEmail, password: regPassword, phone: regPhone, inviteKey: regInviteKey }
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

      // Invite-based registration joins an existing event; otherwise begin setup.
      if (isRegister && data.joinedEventId) {
        const eventsRes = await fetch(`${API_BASE}/events`, { headers: { Authorization: `Bearer ${data.token}` } });
        const eventsData = await eventsRes.json();
        const joinedEvent = eventsData.events?.find((event) => event.id === data.joinedEventId);
        if (joinedEvent) useAppStore.setState({ events: eventsData.events, eventsHydrated: true, activeEvent: joinedEvent, role: joinedEvent.accessLevel === "lead" ? "lead" : "member" });
        navigate("/dashboard");
      } else if (isRegister) {
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
    <div className="min-h-screen w-full bg-token-page flex items-center justify-center p-4">
      <div className="w-full max-w-md surface-card-token border border-token rounded-3xl p-8 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl accent-surface-token text-token-accent mb-2">
            <Sparkles size={24} />
          </div>
          <h1 className="type-2xl weight-bold text-token-primary">Welcome to Convene</h1>
          <p className="type-xs text-token-secondary weight-medium">Event operations & command portal authentication</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex field-token p-1 rounded-full mb-6">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(""); }}
            className={`flex-1 py-1.5 type-xs weight-bold rounded-full transition-colors ${!isRegister ? "surface-card-token text-token-primary shadow-sm" : "text-token-secondary hover:text-token-primary"
              }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(""); }}
            className={`flex-1 py-1.5 type-xs weight-bold rounded-full transition-colors ${isRegister ? "surface-card-token text-token-primary shadow-sm" : "text-token-secondary hover:text-token-primary"
              }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-token-error/10 p-3 type-xs weight-semibold text-token-error border border-token-error/20">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister ? (
            <>
              <div>
                <label className="type-xs weight-bold text-token-muted uppercase tracking-wider block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="h-10 w-full rounded-full field-token border border-token px-4 type-xs weight-semibold text-token-primary outline-none placeholder:text-token-muted"
                />
              </div>

              <div>
                <label className="type-xs weight-bold text-token-muted uppercase tracking-wider block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="h-10 w-full rounded-full field-token border border-token px-4 type-xs weight-semibold text-token-primary outline-none placeholder:text-token-muted"
                />
              </div>

              <div>
                <label className="type-xs weight-bold text-token-muted uppercase tracking-wider block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="h-10 w-full rounded-full field-token border border-token px-4 type-xs weight-semibold text-token-primary outline-none placeholder:text-token-muted"
                />
              </div>

              <div>
                <label className="type-xs weight-bold text-token-muted uppercase tracking-wider block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  minLength={10}
                  placeholder="9876543210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="h-10 w-full rounded-full field-token border border-token px-4 type-xs weight-semibold text-token-primary outline-none placeholder:text-token-muted"
                />
              </div>

              <div>
                <label className="type-xs weight-bold text-token-muted uppercase tracking-wider block mb-1">Event Invite Key <span className="normal-case weight-medium">(if provided)</span></label>
                <input
                  type="text"
                  maxLength={10}
                  value={regInviteKey}
                  onChange={(e) => setRegInviteKey(e.target.value.replace(/[^a-z0-9]/gi, "").slice(0, 10).toUpperCase())}
                  placeholder="10-character key"
                  className="h-10 w-full rounded-full field-token border border-token px-4 type-xs weight-semibold uppercase tracking-wider text-token-primary outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-token-muted"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="type-xs weight-bold text-token-muted uppercase tracking-wider block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="h-10 w-full rounded-full field-token border border-token px-4 type-xs weight-semibold text-token-primary outline-none placeholder:text-token-muted"
                />
              </div>

              <div>
                <label className="type-xs weight-bold text-token-muted uppercase tracking-wider block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="h-10 w-full rounded-full field-token border border-token px-4 type-xs weight-semibold text-token-primary outline-none placeholder:text-token-muted"
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
              className="w-full h-11 type-xs weight-bold rounded-full justify-center"
            >
              {loading ? "Authenticating..." : isRegister ? "Create Account" : "Sign In"}
            </GlassButton>
          </div>
        </form>

        {/* Demo Credentials Footer */}
        <div className="mt-6 pt-4 border-t border-subtle-token text-center type-11 text-token-muted">
          <p className="flex items-center justify-center gap-1 weight-medium">
            <ShieldCheck size={13} className="text-token-success" /> Direct backend integration active (`/api/auth`)
          </p>
        </div>
      </div>
    </div>
  );
}
