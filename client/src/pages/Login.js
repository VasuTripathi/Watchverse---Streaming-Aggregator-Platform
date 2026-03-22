import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

function Login() {

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🔄 Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔐 Handle login
  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", form);

      const data = res.data;

      // ✅ Save token
      login(data.token);
      localStorage.setItem("token", data.token);

      alert("Login Successful ✅");

      navigate("/");

    } catch (error) {
      console.log(error.response || error);
      alert(error.response?.data?.message || "Invalid Credentials ❌");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #000000, #1c1c3c)"
      }}
    >

      {/* 💎 GLASS CARD */}
      <div
        style={{
          width: "350px",
          padding: "30px",
          borderRadius: "15px",
          background: "rgba(255,255,255,0.04)", // 🔥 more transparent
          backdropFilter: "blur(25px)",
          WebkitBackdropFilter: "blur(25px)",

          border: "1px solid rgba(255,255,255,0.12)",
          borderTop: "1px solid rgba(255,255,255,0.25)",

          boxShadow: "0 8px 40px rgba(0,0,0,0.5)"
        }}
      >

        {/* 🎬 TITLE */}
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#e50914"
          }}
        >
           Login to Watchverse
        </h2>

        {/* 📧 EMAIL */}
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          onChange={handleChange}
          style={inputStyle}
        />

        {/* 🔒 PASSWORD */}
        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          onChange={handleChange}
          style={inputStyle}
        />

        {/* 🔐 BUTTON */}
        <button
          onClick={handleLogin}
          style={buttonStyle}
          onMouseOver={(e) => e.target.style.background = "#ff1e1e"}
          onMouseOut={(e) => e.target.style.background = "#e50914"}
        >
          Login
        </button>

        {/* 🔗 REGISTER LINK */}
        <p
          style={{
            textAlign: "center",
            marginTop: "15px",
            color: "#aaa"
          }}
        >
          New user?{" "}
          <Link
            to="/register"
            style={{
              color: "#e50914",
              fontWeight: "bold",
              textDecoration: "none"
            }}
          >
            Register now
          </Link>
        </p>

      </div>

    </div>
  );
}

/* 🔥 STYLES */

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "none",
  outline: "none",
  background: "#222",
  color: "white"
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: "#e50914",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "0.3s"
};

export default Login;