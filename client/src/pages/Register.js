import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const mouseFrameRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (mouseFrameRef.current) return;
      mouseFrameRef.current = window.requestAnimationFrame(() => {
        setMousePosition({
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100,
        });
        mouseFrameRef.current = null;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (mouseFrameRef.current) window.cancelAnimationFrame(mouseFrameRef.current);
    };
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(229, 9, 20, 0.12) 0%, transparent 45%)`,
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/90 animate-gradient pointer-events-none" />
    </>
  );
}

function Register() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await API.post("/auth/register", form);
      alert("Registered Successfully ✅");
      navigate("/login");
    } catch (error) {
      console.log(error.response || error);
      alert(error.response?.data?.message || "Registration failed ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen text-white overflow-hidden relative"
      style={{
        backgroundImage: "url('/login-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/90" />
      <AnimatedBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-electric-crimson to-red-400 bg-clip-text text-transparent drop-shadow-2xl">
              Create Your Account
            </h1>
            <p className="text-lg text-gray-300">
              Join Watchverse and discover your favorite streaming content.
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
          >
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="mb-6"
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                className="w-full py-4 px-4 rounded-xl bg-white/10 border border-white/20 outline-none text-white placeholder-gray-400 transition-all duration-300 focus:border-electric-crimson focus:shadow-electric-crimson/20 focus:shadow-lg"
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="mb-6"
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="w-full py-4 px-4 rounded-xl bg-white/10 border border-white/20 outline-none text-white placeholder-gray-400 transition-all duration-300 focus:border-electric-crimson focus:shadow-electric-crimson/20 focus:shadow-lg"
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="mb-8"
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                onKeyPress={(e) => e.key === "Enter" && handleRegister()}
                className="w-full py-4 px-4 rounded-xl bg-white/10 border border-white/20 outline-none text-white placeholder-gray-400 transition-all duration-300 focus:border-electric-crimson focus:shadow-electric-crimson/20 focus:shadow-lg"
              />
            </motion.div>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              onClick={handleRegister}
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 ${
                !isLoading
                  ? "bg-electric-crimson text-white shadow-lg shadow-electric-crimson/30 hover:bg-red-600 hover:shadow-electric-crimson/50"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.4 }}
              className="text-center mt-6"
            >
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-electric-crimson hover:text-red-400 font-semibold transition-colors duration-300"
                >
                  Login
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
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