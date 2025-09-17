import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/contacts";

  function Login(e) {
    e.preventDefault();
    fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          alert("Login successful!");
          navigate(from, { replace: true });
        } else {
          alert(data.message || "Login failed");
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        alert("An error occurred. Please try again.");
      });
  }

  return (
    <div>
      <Header />
      <h2>Login</h2>
      <form onSubmit={Login}>
        <div>
          <label htmlFor="email">Email</label>
          <br />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <br />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
