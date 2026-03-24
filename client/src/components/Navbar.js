import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {

  const auth = useContext(AuthContext);
  const token = auth?.token;
  const logout = auth?.logout;

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <div style={{ position: "relative", padding: "10px 16px" }}>

      {/* NAVBAR PILL */}
      <div style={{
        padding: "12px 25px",
        borderRadius: "100px",
        background: "rgba(0, 0, 0, 0.03)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderTop: "1px solid rgba(255,255,255,0.3)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        position: "sticky",
        top: 20,
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "all 0.3s ease"
      }}>

        {/* LOGO */}
        <h2
          onClick={() => { navigate("/"); setMenuOpen(false); }}
          style={{
            color: "#e50914",
            cursor: "pointer",
            fontWeight: "700",
            letterSpacing: "1px",
            transition: "0.3s",
            fontSize: "clamp(1rem, 4vw, 1.3rem)"
          }}
          onMouseOver={(e) => e.target.style.transform = "scale(1.08)"}
          onMouseOut={(e) => e.target.style.transform = "scale(1)"}
        >
          Watchverse
        </h2>

        {/* HAMBURGER - CSS controls show/hide, no inline display */}
        <div
          className="menu-icon"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            fontSize: "22px",
            cursor: "pointer",
            color: "white"
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </div>

        {/* DESKTOP NAV */}
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "50px" }}>

          <Link to="/search" style={linkStyle} onMouseOver={hoverIn} onMouseOut={hoverOut}>
            Search
          </Link>

          {token && (
            <Link to="/watchlist" style={linkStyle} onMouseOver={hoverIn} onMouseOut={hoverOut}>
              Watchlist
            </Link>
          )}

          {token ? (
            <div style={{ position: "relative" }}>

              {/* PROFILE BUTTON */}
              <div
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  cursor: "pointer",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: "500",
                  transition: "0.3s"
                }}
                onMouseOver={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
                onMouseOut={(e) => e.target.style.background = "rgba(255,255,255,0.08)"}
              >
                Profile
              </div>

              {/* DROPDOWN */}
              {profileOpen && (
                <div style={{
                  position: "absolute",
                  top: "45px",
                  right: 0,
                  background: "rgba(20,20,20,0.9)",
                  backdropFilter: "blur(12px)",
                  padding: "12px",
                  borderRadius: "10px",
                  minWidth: "140px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  zIndex: 1001
                }}>
                  <p style={{ marginBottom: "8px", fontSize: "13px", color: "#aaa" }}>
                    Logged in
                  </p>
                  <p
                    onClick={handleLogout}
                    style={{ padding: "6px", cursor: "pointer", borderRadius: "6px", transition: "0.3s" }}
                    onMouseOver={(e) => e.target.style.background = "#e50914"}
                    onMouseOut={(e) => e.target.style.background = "transparent"}
                  >
                    🚪 Logout
                  </p>
                </div>
              )}

            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "8px 18px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(15px)",
                WebkitBackdropFilter: "blur(15px)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderTop: "1px solid rgba(255,255,255,0.3)",
                color: "white",
                fontWeight: "500",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "rgba(255,255,255,0.2)";
                e.target.style.boxShadow = "0 0 10px #e50914";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "rgba(255,255,255,0.08)";
                e.target.style.boxShadow = "0 4px 20px rgba(0,0,0,0.4)";
                e.target.style.transform = "scale(1)";
              }}
            >
              Login
            </button>
          )}

        </div>
      </div>

      {/* MOBILE MENU - outside navbar pill so it drops down below */}
      {menuOpen && (
        <div style={{
          position: "absolute",
          top: "70px",
          left: "10px",
          right: "10px",
          background: "rgba(10,10,20,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          zIndex: 999
        }}>

          <Link
            to="/search"
            onClick={() => setMenuOpen(false)}
            style={{
              color: "white",
              fontSize: "16px",
              fontWeight: "500",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              paddingBottom: "12px",
              textDecoration: "none"
            }}
          >
            🔍 Search
          </Link>

          {token && (
            <Link
              to="/watchlist"
              onClick={() => setMenuOpen(false)}
              style={{
                color: "white",
                fontSize: "16px",
                fontWeight: "500",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                paddingBottom: "12px",
                textDecoration: "none"
              }}
            >
              ⭐ Watchlist
            </Link>
          )}

          {token ? (
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "#e50914",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "Poppins, sans-serif",
                padding: 0
              }}
            >
              🚪 Logout
            </button>
          ) : (
            <button
              onClick={() => { navigate("/login"); setMenuOpen(false); }}
              style={{
                background: "none",
                border: "none",
                color: "#e50914",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "Poppins, sans-serif",
                padding: 0
              }}
            >
              Login
            </button>
          )}

        </div>
      )}

    </div>
  );
}

/* STYLES */

const linkStyle = {
  color: "white",
  fontWeight: "500",
  textDecoration: "none",
  transition: "0.3s"
};

const hoverIn = (e) => {
  e.target.style.color = "#e50914";
  e.target.style.textShadow = "0 0 8px #e50914";
};

const hoverOut = (e) => {
  e.target.style.color = "white";
  e.target.style.textShadow = "none";
};

export default Navbar;