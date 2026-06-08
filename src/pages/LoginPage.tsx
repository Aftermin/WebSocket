import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/authApi";
import { Mail, Lock, Eye, EyeOff, CircleAlert, Store } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authApi.login(email, password);
      navigate("/");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-black/[0.08] p-8 shadow-sm">
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-8 h-8 rounded-[9px] bg-[#6D071A] flex items-center justify-center shrink-0">
            <Store size={16} className="text-white" />
          </div>
          <span className="text-sm font-medium text-gray-900">Tenant</span>
        </div>

        <h1 className="text-[22px] font-medium text-gray-900 leading-tight mb-1">
          Welcome back
        </h1>

        <p className="text-[13px] text-gray-500 mb-6">
          Sign in to your account to continue
        </p>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-[13px] text-red-700 mb-4">
            <CircleAlert size={14} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="mb-3">
          <label
            htmlFor="email"
            className="block text-[12px] font-medium text-gray-500 tracking-wide mb-1.5"
          >
            Email address
          </label>

          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />

            <input
              id="email"
              type="email"
              value={email}
              placeholder="you@company.com"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[38px] pl-[36px] pr-3 text-sm text-gray-900 bg-gray-50 border border-black/[0.08] rounded-lg outline-none transition-all focus:border-[#6D071A] focus:ring-2 focus:ring-[#6D071A]/10 placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="mb-1.5">
          <label
            htmlFor="password"
            className="block text-[12px] font-medium text-gray-500 tracking-wide mb-1.5"
          >
            Password
          </label>

          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="••••••••"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full h-[38px] pl-[36px] pr-10 text-sm text-gray-900 bg-gray-50 border border-black/[0.08] rounded-lg outline-none transition-all focus:border-[#6D071A] focus:ring-2 focus:ring-[#6D071A]/10 placeholder:text-gray-400"
            />

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-[38px] mt-5 flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-white bg-[#6D071A] hover:bg-[#560615] active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </div>
    </div>
  );
}
