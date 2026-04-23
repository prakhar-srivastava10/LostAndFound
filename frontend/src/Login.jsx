import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/login", form);

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data || "Login failed");
    }
  };

return (
  <div className="authContainer">
    <div className="authBox">

      <h2>Login</h2>

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
      />

      <button onClick={handleSubmit}>Login</button>

      {error && <p className="error">{error}</p>}

      <p>
        Don't have an account?{" "}
        <span className="authLink" onClick={() => navigate("/")}>
          Register
        </span>
      </p>

    </div>
  </div>
);
}