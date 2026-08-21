import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import naraImage from "../assets/nara-login.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("adminToken", response.data.token);

      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-nude-50 flex flex-col xl:flex-row">
      
      {/* ================= LEFT IMAGE PANEL ================= */}
      <div className="relative hidden xl:flex xl:w-2/5 min-h-screen overflow-hidden">
        <img
          src={naraImage}
          alt="Nara Accessories"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0" />

        <div className="relative z-10 w-full flex flex-col justify-between p-10">
          <div>
            <div className="inline-flex items-center gap-3">
              <span className="font-body text-xs tracking-[0.3em] uppercase text-muted mb-2">
                Admin Studio
              </span>
            </div>
          </div>
          <div className="text-center px-10">
            {/* Kept your commented code intact */}
          </div>
          <div />
        </div>
      </div>

      {/* ================= LOGIN PANEL ================= */}
      <div className="flex-1 flex items-start xl:items-center justify-center px-6 pt-0 pb-12 sm:px-10 sm:py-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-lg">
          
          {/* Mobile / Tablet branding */}
          <div className="xl:hidden text-center mb-10">
            <img
              src={naraImage}
              alt="Nara Accessories"
              className="relative left-1/2 w-screen max-w-none -translate-x-1/2 h-40 object-cover mb-6 sm:static sm:w-full sm:max-w-lg sm:translate-x-0 sm:rounded-2xl sm:mx-auto sm:h-64 md:h-80"
            />
            <p className="font-body text-xs tracking-[0.3em] uppercase text-muted mb-2">
              Admin Studio
            </p>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <h2 className="font-display text-4xl sm:text-5xl text-[#855B54] mb-3">
              Welcome back
            </h2>
            <p className="font-body text-muted text-sm sm:text-base">
              Sign in to manage your store and collections.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-lg border border-brick/20 bg-brick/10 px-4 py-3 text-sm text-brick">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email */}
            <div>
              <label className="block mb-2 text-xs font-medium tracking-[0.12em] uppercase text-muted">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="
                  w-full
                  rounded-lg
                  border border-nude-300
                  bg-white
                  px-5 py-4
                  text-base text-espresso
                  placeholder:text-muted/50
                  transition
                  outline-none
                  focus:border-nude-500
                  focus:ring-2
                  focus:ring-nude-300/50
                "
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 text-xs font-medium tracking-[0.12em] uppercase text-muted">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="
                    w-full
                    rounded-lg
                    border border-nude-300
                    bg-white
                    px-5 py-4
                    pr-12
                    text-base text-espresso
                    placeholder:text-muted/50
                    transition
                    outline-none
                    focus:border-nude-500
                    focus:ring-2
                    focus:ring-nude-300/50
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-muted hover:text-espresso transition"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.25 19.5 12 19.5c1.757 0 3.415-.433 4.87-1.2M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.75 0 8.774 3.162 10.066 7.5a10.522 10.522 0 0 1-4.132 5.411M6.228 6.228 3 3m3.228 3.228 11.544 11.544M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12S5.25 4.5 12 4.5 21.75 12 21.75 12 18.75 19.5 12 19.5 2.25 12 2.25 12Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-lg
                bg-[#8e625a]
                py-4
                text-base
                font-medium
                tracking-wide
                text-nude-50
                transition
                hover:bg-nude-700
                hover:shadow-lg
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-10 text-center text-sm text-muted">
            © {new Date().getFullYear()} Nara Accessories
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;