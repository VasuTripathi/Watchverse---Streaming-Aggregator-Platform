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
    <>
      {/* FIXED GLASS NAVBAR */}
      <nav className="navbar">

        {/* LOGO */}
        <h2
          onClick={() => { navigate("/"); setMenuOpen(false); }}
          className="nav-logo"
        >
          Watchverse
        </h2>

        {/* HAMBURGER - mobile only, CSS controls visibility */}
        <div
          className="menu-icon"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "X" : "Menu"}
        </div>

        {/* DESKTOP NAV LINKS */}
        <div className="nav-links">

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

              <div
                onClick={() => setProfileOpen(!profileOpen)}
                style={profileBtnStyle}
                onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
                onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              >
                Profile
              </div>

              {profileOpen && (
                <div style={dropdownStyle}>
                  <p style={{ marginBottom: "8px", fontSize: "13px", color: "#aaa" }}>
                    Logged in
                  </p>
                  <p
                    onClick={handleLogout}
                    style={{ padding: "6px 8px", cursor: "pointer", borderRadius: "6px", transition: "0.2s", color: "white" }}
                    onMouseOver={(e) => e.currentTarget.style.background = "#e50914"}
                    onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    Logout
                  </p>
                </div>
              )}

            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              style={loginBtnStyle}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                e.currentTarget.style.boxShadow = "0 0 12px rgba(229,9,20,0.5)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Login
            </button>
          )}

        </div>
      </nav>

      {/* MOBILE DROPDOWN - slides below navbar */}
      {menuOpen && (
        <div className="mobile-menu">

          <Link
            to="/search"
            onClick={() => setMenuOpen(false)}
            className="mobile-menu-link"
          >
            Search
          </Link>

          {token && (
            <Link
              to="/watchlist"
              onClick={() => setMenuOpen(false)}
              className="mobile-menu-link"
            >
              Watchlist
            </Link>
          )}

          {token ? (
            <button onClick={handleLogout} className="mobile-menu-btn">
              Logout
            </button>
          ) : (
            <button onClick={() => { navigate("/login"); setMenuOpen(false); }} className="mobile-menu-btn">
              Login
            </button>
          )}

        </div>
      )}
    </>
  );
}

const linkStyle = {
  color: "white",
  fontWeight: "500",
  textDecoration: "none",
  transition: "0.3s",
  fontSize: "15px"
};

const hoverIn = (e) => {
  e.target.style.color = "#e50914";
  e.target.style.textShadow = "0 0 8px rgba(229,9,20,0.6)";
};

const hoverOut = (e) => {
  e.target.style.color = "white";
  e.target.style.textShadow = "none";
};

const profileBtnStyle = {
  cursor: "pointer",
  padding: "6px 16px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "white",
  fontWeight: "500",
  fontSize: "15px",
  transition: "0.3s",
  userSelect: "none"
};

const loginBtnStyle = {
  padding: "7px 20px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.25)",
  color: "white",
  fontWeight: "500",
  fontSize: "15px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  fontFamily: "Poppins, sans-serif"
};

const dropdownStyle = {
  position: "absolute",
  top: "42px",
  right: 0,
  background: "rgba(15,15,25,0.95)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  padding: "12px",
  borderRadius: "12px",
  minWidth: "140px",
  boxShadow: "0 12px 30px rgba(0,0,0,0.7)",
  border: "1px solid rgba(255,255,255,0.1)",
  zIndex: 2000
};

export default Navbar;