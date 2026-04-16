import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

function Watchlist() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const token = auth?.token || localStorage.getItem("token");

  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("added"); // "added", "title", "rating"
  const [filterGenre, setFilterGenre] = useState("all");

  // Fetch watchlist
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchWatchlist();
  }, [token, navigate]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const res = await API.get("/watchlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWatchlist(res.data || []);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        if (auth?.logout) {
          auth.logout();
        } else {
          localStorage.removeItem("token");
        }
        navigate("/login");
      } else {
        toast.error("Failed to load watchlist");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (movieId) => {
    try {
      await API.post("/watchlist/remove", 
        { movieId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setWatchlist(watchlist.filter((m) => String(m.movieId) !== String(movieId)));
      toast.success("Removed from Watchlist");
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      toast.error("Failed to remove from watchlist");
    }
  };

  // Filter and sort
  let filteredWatchlist = watchlist.filter((movie) => {
    const matchesSearch = movie.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Sort
  filteredWatchlist = [...filteredWatchlist].sort((a, b) => {
    if (sortBy === "title") {
      return (a.title || "").localeCompare(b.title || "");
    } else if (sortBy === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    }
    // Default: added (newest first)
    return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
  });

  // Empty state
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "18px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "48px",
              marginBottom: "15px",
              animation: "spin 2s linear infinite",
            }}
          >
            ⟳
          </div>
          <p>Loading your watchlist...</p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "500px" }}>
          <div style={{ fontSize: "120px", marginBottom: "20px" }}>○</div>
          <h1
            style={{
              color: "white",
              fontSize: "32px",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Your Watchlist is Empty
          </h1>
          <p
            style={{
              color: "#aaa",
              fontSize: "16px",
              marginBottom: "30px",
              lineHeight: "1.6",
            }}
          >
            Start adding movies to your watchlist and keep track of films you want
            to watch!
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "12px 32px",
              background: "linear-gradient(135deg, #e50914 0%, #d63031 100%)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(229, 9, 20, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Explore Movies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)",
        color: "white",
        paddingTop: "120px", // Increased to clear navbar
        paddingBottom: "40px",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "40px 20px",
          textAlign: "center",
          background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            fontWeight: "bold",
            marginBottom: "10px",
            background: "linear-gradient(135deg, #e50914 0%, #ff6b6b 100%)",
            "-webkit-background-clip": "text",
            "-webkit-text-fill-color": "transparent",
            backgroundClip: "text",
          }}
        >
          My Watchlist
        </h1>
        <p
          style={{
            color: "#aaa",
            fontSize: "16px",
          }}
        >
          {filteredWatchlist.length} {filteredWatchlist.length === 1 ? "movie" : "movies"} saved
        </p>
      </div>

      {/* CONTROLS */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "30px 20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: "15px",
            marginBottom: "30px",
            alignItems: "center",
            "@media (max-width: 768px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          {/* Search */}
          <div
            style={{
              position: "relative",
            }}
          >
            <input
              type="text"
              placeholder="Search your watchlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "white",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.borderColor = "rgba(229, 9, 20, 0.5)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              }}
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "12px 16px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px",
              cursor: "pointer",
              outline: "none",
              transition: "all 0.3s ease",
            }}
          >
            <option value="added">Recently Added</option>
            <option value="title">Title (A-Z)</option>
            <option value="rating">Highest Rated</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchWatchlist}
            style={{
              padding: "12px 20px",
              background: "rgba(229, 9, 20, 0.2)",
              border: "1px solid rgba(229, 9, 20, 0.4)",
              borderRadius: "8px",
              color: "#ff6b6b",
              fontSize: "14px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(229, 9, 20, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(229, 9, 20, 0.2)";
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "20px",
            "@media (max-width: 1024px)": {
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            },
            "@media (max-width: 640px)": {
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            },
          }}
        >
          {filteredWatchlist.map((movie) => (
            <div
              key={movie._id || movie.movieId}
              style={{
                position: "relative",
                borderRadius: "12px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s ease",
                group: "movie-card",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* POSTER */}
              <div
                style={{
                  position: "relative",
                  paddingBottom: "150%",
                  background: "#222",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/movie/${movie.movieId}`)}
              >
                <img
                  src={
                    movie.poster
                      ? `https://image.tmdb.org/t/p/w300${movie.poster}`
                      : "https://via.placeholder.com/300x450/222/fff?text=No+Image"
                  }
                  alt={movie.title}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />

                {/* OVERLAY */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "12px",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = 1;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = 0;
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(movie.movieId);
                    }}
                    style={{
                      padding: "8px 12px",
                      background: "rgba(229, 9, 20, 0.9)",
                      border: "none",
                      borderRadius: "6px",
                      color: "white",
                      fontSize: "13px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#e50914";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(229, 9, 20, 0.9)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
              </div>

              {/* INFO */}
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  padding: "12px",
                  backdropFilter: "blur(10px)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "white",
                    lineHeight: "1.4",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                  }}
                >
                  {movie.title}
                </h3>
                <p
                  style={{
                    margin: "0",
                    fontSize: "12px",
                    color: "#aaa",
                  }}
                >
                  Added {movie.dateAdded ? new Date(movie.dateAdded).toLocaleDateString() : "Recently"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY SEARCH RESULT */}
        {filteredWatchlist.length === 0 && searchQuery && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>🔍</div>
            <p style={{ color: "#aaa", fontSize: "16px" }}>
              No movies found for "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              style={{
                marginTop: "15px",
                padding: "10px 20px",
                background: "rgba(229, 9, 20, 0.2)",
                border: "1px solid rgba(229, 9, 20, 0.4)",
                borderRadius: "6px",
                color: "#ff6b6b",
                fontSize: "14px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Watchlist;
