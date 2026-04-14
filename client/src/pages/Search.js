import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Search() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);
  const [filters, setFilters] = useState({
    genre: "",
    year: "",
    rating: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const searchWrapperRef = useRef(null);
  const recognitionRef = useRef(null);

  // ================= LOAD SEARCH HISTORY =================
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    setSearchHistory(history);
  }, []);

  // ================= SAVE TO SEARCH HISTORY =================
  const saveToHistory = (searchQuery) => {
    if (!searchQuery.trim()) return;

    const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    const updatedHistory = [searchQuery, ...history.filter(item => item !== searchQuery)].slice(0, 10);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
    setSearchHistory(updatedHistory);
  };

  // ================= VOICE SEARCH =================
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setVoiceSearchActive(true);
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setVoiceSearchActive(false);
    };

    recognitionRef.current.onerror = () => {
      setVoiceSearchActive(false);
    };

    recognitionRef.current.onend = () => {
      setVoiceSearchActive(false);
    };

    recognitionRef.current.start();
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceSearchActive(false);
  };

  // ================= MOVIE CLICK HANDLER =================
  const handleMovieClick = async (movie) => {
    const userId = localStorage.getItem("userId");
    let movieId = movie?.id || movie?.tmdb_id || movie?.movie_id;

    if (userId) {
      try {
        await fetch("http://localhost:5000/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, movie })
        });
      } catch (err) {
        console.error("Error saving activity:", err);
      }
    }

    if (!movieId && movie?.title) {
      try {
        const searchRes = await axios.get(
          `https://api.themoviedb.org/3/search/movie?api_key=c3eb192bb06b83bf9707742f3f5d851a&query=${encodeURIComponent(movie.title)}`
        );
        movieId = searchRes.data.results?.[0]?.id;
      } catch (searchErr) {
        console.error("Error resolving movie id from title:", searchErr);
      }
    }

    if (movieId) {
      navigate(`/movie/${movieId}`);
    } else {
      console.warn("Unable to navigate to movie detail because movie id is unavailable.");
    }
  };

  // ================= FETCH RECOMMENDATIONS =================
  const fetchRecommendations = async () => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        const popularRes = await axios.get(
          `https://api.themoviedb.org/3/movie/popular?api_key=c3eb192bb06b83bf9707742f3f5d851a`
        );
        setRecommendations(popularRes.data.results.slice(0, 12));
        return;
      }

      const res = await axios.get(`http://localhost:5000/api/recommendations?user_id=${userId}`);
      setRecommendations(res.data.recommendations || []);

      if (!res.data.recommendations || res.data.recommendations.length === 0) {
        const popularRes = await axios.get(
          `https://api.themoviedb.org/3/movie/popular?api_key=c3eb192bb06b83bf9707742f3f5d851a`
        );
        setRecommendations(popularRes.data.results.slice(0, 12));
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      const popularRes = await axios.get(
        `https://api.themoviedb.org/3/movie/popular?api_key=c3eb192bb06b83bf9707742f3f5d851a`
      );
      setRecommendations(popularRes.data.results.slice(0, 12));
    }
  };

  // ================= FETCH TRENDING MOVIES =================
  const fetchTrendingMovies = async () => {
    setTrendingLoading(true);

    try {
      const trendingRes = await axios.get(
        `https://api.themoviedb.org/3/trending/movie/week?api_key=c3eb192bb06b83bf9707742f3f5d851a`
      );
      setTrendingMovies(trendingRes.data.results.slice(0, 16));
    } catch (err) {
      console.error("Error fetching trending movies:", err);
      setTrendingMovies([]);
    } finally {
      setTrendingLoading(false);
    }
  };

  // ================= SEARCH MOVIES =================
  const searchMovies = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    saveToHistory(searchQuery);

    try {
      let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=c3eb192bb06b83bf9707742f3f5d851a&query=${encodeURIComponent(searchQuery)}`;

      // Add filters to search
      if (filters.year) searchUrl += `&year=${filters.year}`;
      if (filters.genre) searchUrl += `&with_genres=${filters.genre}`;

      const res = await axios.get(searchUrl);
      setMovies(res.data.results);
      setActiveTab("results");
    } catch (err) {
      console.error("Error searching movies:", err);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ================= AI SUGGESTIONS =================
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      setIsSuggestionsLoading(true);

      try {
        const res = await axios.get(
          `http://localhost:5000/api/search/ai-suggestions?query=${encodeURIComponent(query)}`
        );
        setSuggestions(res.data.suggestions || []);
      } catch (err) {
        console.error("Error fetching AI suggestions:", err);
        try {
          const fallbackRes = await axios.get(
            `https://api.themoviedb.org/3/search/movie?api_key=c3eb192bb06b83bf9707742f3f5d851a&query=${query}`
          );
          setSuggestions(fallbackRes.data.results.slice(0, 8));
        } catch (fallbackErr) {
          console.error("Error fetching fallback suggestions:", fallbackErr);
          setSuggestions([]);
        }
      } finally {
        setIsSuggestionsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  // ================= INITIAL LOAD =================
  useEffect(() => {
    fetchRecommendations();
  }, []);

  useEffect(() => {
    if (activeTab === "trending" && trendingMovies.length === 0 && !trendingLoading) {
      fetchTrendingMovies();
    }
  }, [activeTab, trendingMovies.length, trendingLoading]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setSuggestions([]);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // ================= CLEAR SEARCH =================
  const clearSearch = () => {
    setQuery("");
    setMovies([]);
    setSuggestions([]);
    setActiveTab("search");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // ================= MOVIE CARD COMPONENT =================
  const MovieCard = ({ movie, size = "medium" }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const sizes = {
      small: { width: 140, height: 210 },
      medium: { width: 180, height: 270 },
      large: { width: 220, height: 330 }
    };

    const dimensions = sizes[size];

    return (
      <div
        className="movie-card"
        role="button"
        tabIndex={0}
        onClick={() => handleMovieClick(movie)}
        onKeyPress={(e) => e.key === 'Enter' && handleMovieClick(movie)}
        style={{
          position: 'relative',
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          background: 'linear-gradient(180deg, #111 0%, #14141c 100%)',
          boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
          touchAction: 'manipulation'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(229, 9, 20, 0.3)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(229, 9, 20, 0.3)';
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        }}
      >
        {/* LOADING SKELETON */}
        {!imageLoaded && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, #333 25%, #444 50%, #333 75%)',
              backgroundSize: '200% 100%',
              animation: 'loading 1.5s infinite',
              borderRadius: '12px'
            }}
          />
        )}

        {/* POSTER IMAGE */}
        <img
          src={movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/300x450/333/fff?text=No+Image'
          }
          alt={movie.title}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />

        {/* HOVER OVERLAY */}
        <div
          className="movie-overlay"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '15px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            transform: 'translateY(20px)',
            pointerEvents: 'none'
          }}
        >
          <h4
            style={{
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '5px',
              color: 'white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {movie.title}
          </h4>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                color: '#ffd700',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              ⭐ {movie.vote_average?.toFixed(1)}
            </span>
            <span
              style={{
                color: '#bbb',
                fontSize: '11px'
              }}
            >
              {movie.release_date?.split('-')[0]}
            </span>
          </div>
        </div>

        {/* PLAY BUTTON */}
        <div
          className="play-button"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(0)',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'rgba(229, 9, 20, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(229, 9, 20, 0.45)',
            opacity: 0,
            transition: 'all 0.3s ease',
            pointerEvents: 'none'
          }}
        >
          <span style={{ color: 'white', fontSize: '18px', marginLeft: '2px' }}>▶</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
      color: "white",
      paddingTop: "80px"
    }}>

      {/* ================= HERO SEARCH SECTION ================= */}
      <div style={{
        padding: "40px 20px",
        textAlign: "center",
        background: "linear-gradient(45deg, rgba(229, 9, 20, 0.1) 0%, rgba(0,0,0,0.8) 100%)",
        marginBottom: "40px"
      }}>
        <h1 style={{
          fontSize: "clamp(2.5rem, 8vw, 4rem)",
          fontWeight: "900",
          marginBottom: "20px",
          background: "linear-gradient(45deg, #e50914, #ff6b6b)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "3px 3px 6px rgba(0,0,0,0.5)"
        }}>
          Discover Movies
        </h1>

        <p style={{
          fontSize: "clamp(1rem, 3vw, 1.3rem)",
          marginBottom: "40px",
          opacity: 0.8,
          maxWidth: "600px",
          margin: "0 auto 40px auto"
        }}>
          Search millions of movies with AI-powered suggestions and personalized recommendations
        </p>

        {/* ================= SEARCH BAR ================= */}
        <div ref={searchWrapperRef} style={{
          position: "relative",
          maxWidth: "600px",
          margin: "0 auto",
          zIndex: 10
        }}>
          <div style={{
            position: "relative",
            display: "flex",
            alignItems: "center"
          }}>
            {/* SEARCH ICON */}
            <div style={{
              position: "absolute",
              left: "20px",
              zIndex: 2,
              color: "#e50914",
              fontSize: "20px"
            }}>
              
            </div>

            {/* SEARCH INPUT */}
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for movies, actors, directors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchMovies()}
              style={{
                width: "100%",
                padding: "18px 60px 18px 60px",
                borderRadius: "50px",
                background: "rgba(255,255,255,0.16)",
                backdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.24)",
                outline: "none",
                fontSize: "16px",
                fontWeight: "500",
                color: "white",
                boxShadow: "0 18px 60px rgba(0,0,0,0.25)",
                transition: "all 0.3s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#e50914";
                e.target.style.boxShadow = "0 8px 32px rgba(229, 9, 20, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.24)";
                e.target.style.boxShadow = "0 18px 60px rgba(0,0,0,0.25)";
              }}
            />

            {/* VOICE SEARCH BUTTON */}
            <button
              onClick={voiceSearchActive ? stopVoiceSearch : startVoiceSearch}
              style={{
                position: "absolute",
                right: "120px",
                zIndex: 2,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "10px",
                borderRadius: "50%",
                transition: "all 0.3s ease",
                color: voiceSearchActive ? "#e50914" : "#666"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "rgba(229, 9, 20, 0.1)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "transparent";
              }}
            >
              {voiceSearchActive ? "🎤" : "🎙️"}
            </button>

            {/* CLEAR BUTTON */}
            {query && (
              <button
                onClick={clearSearch}
                style={{
                  position: "absolute",
                  right: "70px",
                  zIndex: 2,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "10px",
                  borderRadius: "50%",
                  color: "#666",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "rgba(229, 9, 20, 0.1)";
                  e.target.style.color = "#e50914";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = "#666";
                }}
              >
                ✕
              </button>
            )}

            {/* SEARCH BUTTON */}
            <button
              onClick={() => searchMovies()}
              disabled={!query.trim() || isLoading}
              style={{
                position: "absolute",
                right: "10px",
                zIndex: 2,
                padding: "14px 28px",
                borderRadius: "30px",
                border: "none",
                background: query.trim() && !isLoading ? "#e50914" : "#999",
                color: "white",
                cursor: query.trim() && !isLoading ? "pointer" : "not-allowed",
                fontWeight: "700",
                fontSize: "15px",
                letterSpacing: "0.5px",
                transition: "all 0.3s ease",
                boxShadow: query.trim() && !isLoading ? "0 10px 30px rgba(229, 9, 20, 0.35)" : "none"
              }}
              onMouseOver={(e) => {
                if (query.trim() && !isLoading) {
                  e.target.style.background = "#ff1a1a";
                  e.target.style.transform = "scale(1.05)";
                }
              }}
              onMouseOut={(e) => {
                if (query.trim() && !isLoading) {
                  e.target.style.background = "#e50914";
                  e.target.style.transform = "scale(1)";
                }
              }}
            >
              {isLoading ? "" : "Search"}
            </button>
          </div>

          {/* ================= FILTERS TOGGLE ================= */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
            gap: "15px"
          }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: showFilters ? "rgba(229, 9, 20, 0.2)" : "transparent",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.3s ease"
              }}
            >
               Filters {showFilters ? "▲" : "▼"}
            </button>

            {searchHistory.length > 0 && (
              <button
                onClick={() => setActiveTab(activeTab === "history" ? "search" : "history")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: activeTab === "history" ? "rgba(229, 9, 20, 0.2)" : "transparent",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "all 0.3s ease"
                }}
              >
                 History
              </button>
            )}
          </div>

          {/* ================= FILTERS PANEL ================= */}
          {showFilters && (
            <div style={{
              marginTop: "20px",
              padding: "20px",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: "15px",
              border: "1px solid rgba(255,255,255,0.2)"
            }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "15px"
              }}>
                <select
                  value={filters.genre}
                  onChange={(e) => setFilters({...filters, genre: e.target.value})}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    outline: "none"
                  }}
                >
                  <option value="">All Genres</option>
                  <option value="28">Action</option>
                  <option value="12">Adventure</option>
                  <option value="16">Animation</option>
                  <option value="35">Comedy</option>
                  <option value="80">Crime</option>
                  <option value="99">Documentary</option>
                  <option value="18">Drama</option>
                  <option value="10751">Family</option>
                  <option value="14">Fantasy</option>
                  <option value="36">History</option>
                  <option value="27">Horror</option>
                  <option value="10402">Music</option>
                  <option value="9648">Mystery</option>
                  <option value="10749">Romance</option>
                  <option value="878">Science Fiction</option>
                  <option value="10770">TV Movie</option>
                  <option value="53">Thriller</option>
                  <option value="10752">War</option>
                  <option value="37">Western</option>
                </select>

                <input
                  type="number"
                  placeholder="Release Year"
                  value={filters.year}
                  onChange={(e) => setFilters({...filters, year: e.target.value})}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    outline: "none"
                  }}
                />

                <select
                  value={filters.rating}
                  onChange={(e) => setFilters({...filters, rating: e.target.value})}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    outline: "none"
                  }}
                >
                  <option value="">Any Rating</option>
                  <option value="7">⭐⭐⭐⭐⭐⭐⭐+</option>
                  <option value="6">⭐⭐⭐⭐⭐⭐+</option>
                  <option value="5">⭐⭐⭐⭐⭐+</option>
                  <option value="4">⭐⭐⭐⭐+</option>
                  <option value="3">⭐⭐⭐+</option>
                </select>
              </div>
            </div>
          )}

          {/* ================= AI SUGGESTIONS ================= */}
          {(suggestions.length > 0 || isSuggestionsLoading) && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: "0",
              right: "0",
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(24px)",
              borderRadius: "18px",
              marginTop: "10px",
              border: "1px solid rgba(255,255,255,0.24)",
              maxHeight: "300px",
              overflowY: "auto",
              zIndex: 1000,
              boxShadow: "0 18px 50px rgba(0,0,0,0.25)"
            }}>
              {isSuggestionsLoading && (
                <div style={{
                  padding: "15px",
                  textAlign: "center",
                  color: "#e50914",
                  fontSize: "14px"
                }}>
                  On the Way...
                </div>
              )}

              {suggestions.slice(0, 8).map((movie, index) => (
                <div
                  key={movie.id || index}
                  onClick={() => {
                    setQuery(movie.title);
                    setSuggestions([]);
                    searchMovies(movie.title);
                  }}
                  style={{
                    padding: "12px 20px",
                    cursor: "pointer",
                    borderBottom: index < suggestions.length - 1 ? "1px solid rgba(255,255,255,0.14)" : "none",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    color: "white"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "rgba(229, 9, 20, 0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "transparent";
                  }}
                >
                  <span style={{ color: "#e50914", fontSize: "16px" }}></span>
                  <div>
                    <div style={{ fontWeight: "500", marginBottom: "2px" }}>
                      {movie.title}
                    </div>
                    {movie.release_date && (
                      <div style={{ fontSize: "12px", color: "#bbb" }}>
                        {movie.release_date.split('-')[0]} • ⭐ {movie.vote_average?.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="search-tabs" style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "nowrap",
        marginBottom: "30px",
        gap: "12px"
      }}>
        {[
          { id: "search", label: " Search", icon: "" },
          { id: "recommendations", label: " For You", icon: "" },
          { id: "trending", label: " Trending", icon: "" },
          { id: "history", label: " History", icon: "" }
        ].map(tab => (
          <button
            key={tab.id}
            className="search-tab-btn"
            aria-pressed={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "14px 24px",
              borderRadius: "30px",
              border: activeTab === tab.id ? "2px solid #e50914" : "1px solid rgba(255,255,255,0.18)",
              background: activeTab === tab.id ? "rgba(229, 9, 20, 0.25)" : "rgba(255,255,255,0.06)",
              color: "white",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600",
              transition: "all 0.25s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: "120px",
              boxShadow: activeTab === tab.id ? "0 10px 30px rgba(229, 9, 20, 0.15)" : "none"
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= CONTENT AREA ================= */}
      <div style={{ padding: "0 20px", maxWidth: "1400px", margin: "0 auto" }}>

        {/* ================= SEARCH RESULTS ================= */}
        {activeTab === "results" && (
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px"
            }}>
              <h2 style={{
                fontSize: "2rem",
                fontWeight: "700",
                margin: 0,
                background: "linear-gradient(45deg, #e50914, #ff6b6b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                Search Results for "{query}"
              </h2>
              <span style={{ color: "#bbb", fontSize: "14px" }}>
                {movies.length} results found
              </span>
            </div>

            {isLoading ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "20px"
              }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: "300px",
                      background: "linear-gradient(90deg, #333 25%, #444 50%, #333 75%)",
                      backgroundSize: "200% 100%",
                      animation: "loading 1.5s infinite",
                      borderRadius: "12px"
                    }}
                  />
                ))}
              </div>
            ) : movies.length > 0 ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "25px"
              }}>
                {movies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} size="medium" />
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#bbb"
              }}>
                <div style={{ fontSize: "4rem", marginBottom: "20px" }}></div>
                <h3 style={{ marginBottom: "10px", color: "#fff" }}>No movies found</h3>
                <p>Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        )}

        {/* ================= RECOMMENDATIONS ================= */}
        {activeTab === "recommendations" && (
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px"
            }}>
              <h2 style={{
                fontSize: "2rem",
                fontWeight: "700",
                margin: 0,
                background: "linear-gradient(45deg, #e50914, #ff6b6b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                 Recommended for You
              </h2>
              <button
                onClick={fetchRecommendations}
                style={{
                  padding: "10px 20px",
                  borderRadius: "25px",
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgba(229, 9, 20, 0.1)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "rgba(229, 9, 20, 0.3)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "rgba(229, 9, 20, 0.1)";
                }}
              >
                 Refresh
              </button>
            </div>

            {recommendations.length > 0 ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "25px"
              }}>
                {recommendations.map(movie => (
                  <MovieCard key={movie.id} movie={movie} size="medium" />
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#bbb"
              }}>
                <div style={{ fontSize: "4rem", marginBottom: "20px" }}></div>
                <h3 style={{ marginBottom: "10px", color: "#fff" }}>Loading recommendations...</h3>
                <p>Watch some movies to get personalized suggestions!</p>
              </div>
            )}
          </div>
        )}

        {/* ================= TRENDING ================= */}
        {activeTab === "trending" && (
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px"
            }}>
              <h2 style={{
                fontSize: "2rem",
                fontWeight: "700",
                margin: 0,
                background: "linear-gradient(45deg, #e50914, #ff6b6b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                 Trending Now
              </h2>
              <button
                onClick={fetchTrendingMovies}
                style={{
                  padding: "10px 20px",
                  borderRadius: "25px",
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgba(229, 9, 20, 0.1)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "rgba(229, 9, 20, 0.3)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "rgba(229, 9, 20, 0.1)";
                }}
              >
                 Refresh
              </button>
            </div>

            {trendingLoading ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "25px"
              }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: "300px",
                      background: "linear-gradient(90deg, #333 25%, #444 50%, #333 75%)",
                      backgroundSize: "200% 100%",
                      animation: "loading 1.5s infinite",
                      borderRadius: "12px"
                    }}
                  />
                ))}
              </div>
            ) : trendingMovies.length > 0 ? (
                      <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "24px"
              }}>
                {trendingMovies.map(movie => (
                  <MovieCard key={movie.id || movie.title} movie={movie} size="medium" />
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#bbb"
              }}>
                <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🔥</div>
                <h3 style={{ marginBottom: "10px", color: "#fff" }}>No trending movies available</h3>
                <p>Please try refreshing or check your connection.</p>
              </div>
            )}
          </div>
        )}

        {/* ================= SEARCH HISTORY ================= */}
        {activeTab === "history" && (
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px"
            }}>
              <h2 style={{
                fontSize: "2rem",
                fontWeight: "700",
                margin: 0,
                background: "linear-gradient(45deg, #e50914, #ff6b6b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                 Search History
              </h2>
              <button
                onClick={() => {
                  localStorage.removeItem("searchHistory");
                  setSearchHistory([]);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgba(229, 9, 20, 0.1)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "rgba(229, 9, 20, 0.3)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "rgba(229, 9, 20, 0.1)";
                }}
              >
                 Clear History
              </button>
            </div>

            {searchHistory.length > 0 ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "15px"
              }}>
                {searchHistory.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setQuery(item);
                      searchMovies(item);
                    }}
                    style={{
                      padding: "15px",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "rgba(229, 9, 20, 0.1)";
                      e.target.style.borderColor = "#e50914";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "rgba(255,255,255,0.05)";
                      e.target.style.borderColor = "rgba(255,255,255,0.1)";
                    }}
                  >
                    <span style={{ color: "#e50914", fontSize: "18px" }}>🔍</span>
                    <span style={{ color: "white", fontWeight: "500" }}>{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#bbb"
              }}>
                <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🕒</div>
                <h3 style={{ marginBottom: "10px", color: "#fff" }}>No search history</h3>
                <p>Start searching to build your history!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= CSS ANIMATIONS ================= */}
      <style jsx>{`
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .movie-card:hover .movie-overlay {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        .movie-card:hover .play-button {
          opacity: 1 !important;
          transform: translate(-50%, -50%) scale(1) !important;
        }

        @media (max-width: 768px) {
          .movie-card {
            width: 140px !important;
            height: 210px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Search;