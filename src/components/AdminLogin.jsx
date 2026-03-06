import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Lock } from "lucide-react";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Invalid credentials or authentication error. Please try again.");
      setLoading(false);
      return;
    }

    onLogin(data.session);
  }

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={handleSubmit}>
        <div className="admin-login__icon">
          <Lock size={28} />
        </div>
        <h1 className="admin-login__title">Admin Login</h1>
        <p className="admin-login__subtitle">Sign in to access the dashboard</p>

        {error && <p className="admin-login__error">{error}</p>}

        <label className="admin-login__label">
          Email
          <input
            type="email"
            className="admin-login__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label className="admin-login__label">
          Password
          <input
            type="password"
            className="admin-login__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button
          type="submit"
          className="btn btn-primary admin-login__btn"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
