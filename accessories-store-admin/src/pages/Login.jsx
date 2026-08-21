import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      localStorage.setItem("adminToken", response.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-nude-50">
      {/* Brand panel — hidden on mobile, shown on md+ */}
      <div className="hidden md:flex md:w-1/2 bg-espresso text-nude-50 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 left-16 bottom-0 w-px bg-nude-400/40" />
        <div>
          <p className="font-body text-xs tracking-[0.3em] uppercase text-nude-300 mb-3">
            Admin Studio
          </p>
          <h1 className="font-display text-5xl leading-tight">
            Nara
            <br />
            Accessories
          </h1>
        </div>
        <p className="font-body text-sm text-nude-300 max-w-xs">
          Manage your catalog, track orders, and keep every piece in its place.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8 text-center">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-muted mb-1">
              Admin Studio
            </p>
            <h1 className="font-display text-3xl text-espresso">Nara Accessories</h1>
          </div>

          <h2 className="font-display text-2xl text-espresso mb-1">Welcome back</h2>
          <p className="text-muted text-sm mb-8">Sign in to manage your store.</p>

          {error && (
            <div className="bg-brick/10 text-brick px-4 py-2.5 rounded-md mb-5 text-sm border border-brick/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-muted mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-nude-200 rounded-md px-3.5 py-2.5 text-espresso placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-nude-400 focus:border-nude-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-muted mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white border border-nude-200 rounded-md px-3.5 py-2.5 text-espresso focus:outline-none focus:ring-2 focus:ring-nude-400 focus:border-nude-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-espresso text-nude-50 py-2.5 rounded-md font-medium hover:bg-nude-600 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;