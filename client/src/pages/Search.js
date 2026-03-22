import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Search() {

  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const navigate = useNavigate();

  // 🎬 SEARCH FUNCTION
  const searchMovies = async () => {
    if (!query) return;

    const res = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=c3eb192bb06b83bf9707742f3f5d851a&query=${query}`
    );

    setMovies(res.data.results);
  };

  // 🔍 LIVE SUGGESTIONS
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query) {
        setSuggestions([]);
        return;
      }

      const res = await axios.get(
        `https://api.themoviedb.org/3/search/movie?api_key=c3eb192bb06b83bf9707742f3f5d851a&query=${query}`
      );

      setSuggestions(res.data.results.slice(0, 5));
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <div
      style={{
        minHeight: "100vh",

        // 🎬 BACKGROUND IMAGE
        backgroundImage:
          "url('https://images.unsplash.com/photo-1524985069026-dd778a71c7b4')",
        backgroundSize: "cover",
        backgroundPosition: "center",

        display: "flex",
        flexDirection: "column",
        alignItems: "center",

        paddingTop: "120px"
      }}
    >

      {/* 🔍 SEARCH CONTAINER */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "500px"
        }}
      >

        {/* 💧 GLASS SEARCH BAR */}
        <input
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "30px",

            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",

            border: "1px solid rgba(255,255,255,0.2)",
            borderTop: "1px solid rgba(255,255,255,0.3)",

            color: "white",
            outline: "none",
            fontSize: "15px"
          }}
        />

        {/* 💡 SUGGESTIONS */}
        {suggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "55px",
              width: "100%",

              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(12px)",

              borderRadius: "12px",
              overflow: "hidden"
            }}
          >
            {suggestions.map((movie) => (
              <div
                key={movie.id}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(255,255,255,0.1)"
                }}
                onClick={() => {
                  navigate(`/movie/${movie.id}`);
                  setSuggestions([]);
                }}
              >
                {movie.title}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* 🔐 SEARCH BUTTON */}
      <button
        onClick={searchMovies}
        style={{
          marginTop: "20px",
          padding: "10px 25px",
          borderRadius: "25px",
          border: "none",
          background: "#e50914",
          color: "white",
          cursor: "pointer",
          fontWeight: "500"
        }}
      >
        Search
      </button>

      {/* 🎬 RESULTS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginTop: "50px",
          justifyContent: "center"
        }}
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            style={{
              width: "160px",
              cursor: "pointer",
              transition: "0.3s"
            }}
            onClick={() => navigate(`/movie/${movie.id}`)}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.1)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            <img
              src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
              alt={movie.title}
              style={{ width: "100%", borderRadius: "10px" }}
            />
            <p style={{ marginTop: "8px", fontWeight: "bold" }}>
              {movie.title}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Search;