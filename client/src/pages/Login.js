import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

// Separate component for background animation to prevent flickering
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

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseFrameRef.current) window.cancelAnimationFrame(mouseFrameRef.current);
    };
  }, []);

  return (
    <>
      {/* ANIMATED GRADIENT */}
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(229, 9, 20, 0.1) 0%, transparent 50%)`,
        }}
      ></div>

      {/* STATIC GRADIENT */}
      <div className="fixed inset-0 bg-gradient-to-br from-deep-charcoal via-obsidian to-black animate-gradient opacity-80 pointer-events-none"></div>
    </>
  );
}

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle login
  const handleLogin = async () => {
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      const data = res.data;

      // Save token
      login(data.token);
      localStorage.setItem("token", data.token);

      toast.success("Login successful! Welcome back");

      navigate("/");
    } catch (error) {
      console.log(error.response || error);
      toast.error(error.response?.data?.message || "Invalid Credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen text-white overflow-hidden relative"
      style={{
        backgroundImage: "url('/login-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/90" />

      {/* ANIMATED BACKGROUND */}
      <AnimatedBackground />

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* HEADER */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-electric-crimson to-red-400 bg-clip-text text-transparent drop-shadow-2xl">
              Welcome Back
            </h1>
            <p className="text-lg text-gray-300">
              Sign in to continue your cinematic journey
            </p>
          </motion.div>

          {/* LOGIN FORM */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
          >
            {/* EMAIL INPUT */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
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

            {/* PASSWORD INPUT */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
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
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full py-4 px-4 rounded-xl bg-white/10 border border-white/20 outline-none text-white placeholder-gray-400 transition-all duration-300 focus:border-electric-crimson focus:shadow-electric-crimson/20 focus:shadow-lg"
              />
            </motion.div>

            {/* LOGIN BUTTON */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 ${
                !isLoading
                  ? 'bg-electric-crimson text-white shadow-lg shadow-electric-crimson/30 hover:bg-red-600 hover:shadow-electric-crimson/50'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </motion.button>

            {/* REGISTER LINK */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.4 }}
              className="text-center mt-6"
            >
              <p className="text-gray-400">
                New to Watchverse?{" "}
                <Link
                  to="/register"
                  className="text-electric-crimson hover:text-red-400 font-semibold transition-colors duration-300"
                >
                  Create Account
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;