import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
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
      await axios.post("http://localhost:5000/api/register", form);
      alert("Registered successfully");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data || "Registration failed");
    }
  };

return (
  <div className="authContainer">
    <div className="authBox">

      <h2>Register</h2>

      <input
        name="name"
        placeholder="Name"
        onChange={handleChange}
      />

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

      <button onClick={handleSubmit}>Register</button>

      {error && <p className="error">{error}</p>}

      <p>
        Already have account?{" "}
        <span className="authLink" onClick={() => navigate("/login")}>
          Login
        </span>
      </p>

    </div>
  </div>
);
}