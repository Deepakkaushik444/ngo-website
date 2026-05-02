// frontend/src/pages/Admin/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Login.css';

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!data.email || !data.password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setIsLoading(true);

    // Simulate API call – replace with real backend later
    setTimeout(() => {
      if (data.email === "admin@gmail.com" && data.password === "admin") {
        localStorage.setItem("adminToken", "dummy-token");
        localStorage.setItem("admin", "true");
        localStorage.setItem("adminEmail", data.email);
        // ✅ Redirect to dashboard (not login page)
        navigate("/admin/dashboard");
      } else {
        setError("Invalid email or password");
        setIsLoading(false);
      }
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">✨</div>
          <h2>Welcome Back</h2>
          <p>Sign in to access admin panel</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="input-group">
          <span className="input-icon">📧</span>
          <input
            type="email"
            placeholder="Email Address"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            onKeyPress={handleKeyPress}
            autoComplete="email"
          />
        </div>

        <div className="input-group">
          <span className="input-icon">🔒</span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            onKeyPress={handleKeyPress}
            autoComplete="current-password"
          />
          <span 
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button 
          className={`login-button ${isLoading ? 'loading' : ''}`}
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? "Authenticating..." : "Login"}
        </button>

        <div className="forgot-password">
          <a href="#">Forgot password?</a>
        </div>
      </div>
    </div>
  );
}