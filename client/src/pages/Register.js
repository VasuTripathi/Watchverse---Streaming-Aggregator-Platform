import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Register() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const res = await API.post("/auth/register", form);

      alert("Registered Successfully ✅");

      navigate("/login");

    } catch (error) {
      console.log(error.response || error);
      alert(error.response?.data?.message || "Error ");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        // 🎬 BACKGROUND
        background: "linear-gradient(135deg, #000000, #0f172a)"
      }}
    >

      {/* 💧 GLASS CARD */}
      <div
        style={{
          width: "380px",
          padding: "35px",
          borderRadius: "18px",

          // 💧 TRANSLUCENT GLASS
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(25px)",
          WebkitBackdropFilter: "blur(25px)",

          border: "1px solid rgba(255,255,255,0.12)",
          borderTop: "1px solid rgba(255,255,255,0.25)",

          boxShadow: "0 0 20px rgba(255,255,255,0.05), 0 8px 40px rgba(0,0,0,0.6)"
        }}
      >

        {/* 🎬 TITLE */}
        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
            color: "#e50914",
            letterSpacing: "1px"
          }}
        >
          Create Account
        </h2>

        {/* 👤 NAME */}
        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          onChange={handleChange}
          style={inputStyle}
        />

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
          onClick={handleRegister}
          style={buttonStyle}
          onMouseOver={(e) => {
            e.target.style.background = "#ff1e1e";
            e.target.style.boxShadow = "0 0 10px #e50914";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#e50914";
            e.target.style.boxShadow = "none";
          }}
        >
          Register
        </button>

        {/* 🔗 LOGIN LINK */}
        <p
          style={{
            textAlign: "center",
            marginTop: "18px",
            color: "#ccc"
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#e50914",
              fontWeight: "bold",
              textDecoration: "none"
            }}
          >
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}

/* 🔥 INPUT STYLE */
const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.08)",
  outline: "none",
  background: "rgba(255,255,255,0.03)",
  color: "white"
};

/* 🔥 BUTTON STYLE */
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

export default Register;