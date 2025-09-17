import { useState } from "react";
import Header from "../components/Header.jsx";
import { useNavigate } from "react-router-dom";

function Register() {
  let navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function Register(e) {
    e.preventDefault();
    fetch("https://fullstack-backend-fwbm.onrender.com/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          alert("register successful!");
          navigate("/contacts");
        } else {
          alert(data.message || "register failed");
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
      <h2>Register</h2>
      <form onSubmit={Register}>
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
