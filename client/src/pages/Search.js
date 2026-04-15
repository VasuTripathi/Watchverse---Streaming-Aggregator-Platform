import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    rating: "",
    platforms: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

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
  const searchMovies = async (searchQuery = query, searchFilters = filters) => {
    const trimmedQuery = searchQuery.trim();
    const hasFilter = searchFilters.genre || searchFilters.year || searchFilters.rating || searchFilters.platforms.length > 0;

    if (!trimmedQuery && !hasFilter) return;

    setIsLoading(true);
    if (trimmedQuery) saveToHistory(trimmedQuery);

    try {
      const apiKey = "c3eb192bb06b83bf9707742f3f5d851a";
      let url;
      const params = new URLSearchParams({ api_key: apiKey, language: 'en-US', include_adult: 'false', page: '1' });

      if (trimmedQuery) {
        url = 'https://api.themoviedb.org/3/search/movie';
        params.append('query', trimmedQuery);
        if (searchFilters.year) params.append('year', searchFilters.year);
        if (searchFilters.genre) params.append('with_genres', searchFilters.genre);
      } else {
        url = 'https://api.themoviedb.org/3/discover/movie';
        if (searchFilters.year) params.append('primary_release_year', searchFilters.year);
        if (searchFilters.genre) params.append('with_genres', searchFilters.genre);
      }

      if (searchFilters.rating) params.append('vote_average.gte', searchFilters.rating);

      const res = await axios.get(`${url}?${params.toString()}`);
      let results = res.data.results || [];

      if (searchFilters.platforms.length > 0) {
        results = results.filter((movie) => movie.poster_path || movie.title);
      }

      setMovies(results);
      setActiveTab('search');
    } catch (err) {
      console.error('Error searching movies:', err);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ================= AUTO SEARCH AS YOU TYPE =================
  useEffect(() => {
    const delay = setTimeout(() => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }
      searchMovies(query, filters);
    }, 500);

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

  // ================= FILTER MANAGEMENT =================
  const applyFilters = () => {
    const newActiveFilters = [];
    if (filters.genre) newActiveFilters.push({ type: 'genre', value: filters.genre, label: getGenreName(filters.genre) });
    if (filters.year) newActiveFilters.push({ type: 'year', value: filters.year, label: filters.year });
    if (filters.rating) newActiveFilters.push({ type: 'rating', value: filters.rating, label: `${filters.rating}+ Rating` });
    if (filters.platforms.length > 0) {
      filters.platforms.forEach(platform => {
        newActiveFilters.push({ type: 'platform', value: platform, label: platform });
      });
    }
    setActiveFilters(newActiveFilters);
    setShowFilters(false);
    searchMovies(query, filters);
  };

  const removeFilter = (filterToRemove) => {
    const newFilters = { ...filters };
    const newActiveFilters = activeFilters.filter(filter => filter !== filterToRemove);

    if (filterToRemove.type === 'genre') newFilters.genre = '';
    if (filterToRemove.type === 'year') newFilters.year = '';
    if (filterToRemove.type === 'rating') newFilters.rating = '';
    if (filterToRemove.type === 'platform') {
      newFilters.platforms = newFilters.platforms.filter(p => p !== filterToRemove.value);
    }

    setFilters(newFilters);
    setActiveFilters(newActiveFilters);
  };

  const getGenreName = (genreId) => {
    const genres = {
      '28': 'Action', '12': 'Adventure', '16': 'Animation', '35': 'Comedy',
      '80': 'Crime', '99': 'Documentary', '18': 'Drama', '10751': 'Family',
      '14': 'Fantasy', '36': 'History', '27': 'Horror', '10402': 'Music',
      '9648': 'Mystery', '10749': 'Romance', '878': 'Sci-Fi', '10770': 'TV Movie',
      '53': 'Thriller', '10752': 'War', '37': 'Western'
    };
    return genres[genreId] || genreId;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
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
    setActiveTab("search");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // ================= SKELETON LOADER =================
  const SkeletonCard = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800 rounded-xl overflow-hidden animate-pulse"
      style={{ width: '200px', height: '300px' }}
    >
      <div className="w-full h-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-loading"></div>
    </motion.div>
  );

  // ================= MOVIE CARD COMPONENT =================
  const MovieCard = ({ movie, index = 0 }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
      <motion.button
        type="button"
        className="relative group cursor-pointer overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-200 hover:bg-white/15 hover:scale-105"
        style={{ width: '220px', height: '340px' }}
        onClick={() => handleMovieClick(movie)}
        aria-label={`Open details for ${movie.title}`}
      >
        {/* LOADING SKELETON */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-loading rounded-xl z-20"></div>
        )}

        {/* POSTER IMAGE */}
        <motion.img
          src={movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/300x450/333/fff?text=No+Image'
          }
          alt={movie.title}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
          className="w-full h-full object-cover"
        />

        {/* GLASS INFO PANEL */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-black/60 backdrop-blur-2xl border-t border-white/10">
          <h4 className="text-white text-base font-bold mb-2 line-clamp-2">
            {movie.title}
          </h4>
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>{movie.release_date ? movie.release_date.split('-')[0] : 'Unknown'}</span>
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
          </div>
        </div>
      </motion.button>
    );
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-charcoal via-obsidian to-black text-white overflow-hidden relative">
      {/* ANIMATED BACKGROUND - Separate component prevents flickering */}
      <AnimatedBackground />

      {/* CONTENT */}
      <div className="relative z-10 pt-20">
        {/* ================= HERO SEARCH SECTION ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="px-6 py-16 text-center"
        >
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-electric-crimson to-red-400 bg-clip-text text-transparent drop-shadow-2xl"
          >
            Invade the verse
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl mb-12 text-gray-300 max-w-2xl mx-auto"
          >
            Find Your Next Obsession in the Watchverse
          </motion.p>

          {/* ================= SEARCH BAR ================= */}
          <motion.div
            ref={searchWrapperRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="relative max-w-4xl mx-auto"
          >
            <motion.div
              className="grid gap-3 md:grid-cols-[1.4fr_auto_auto] items-center"
              whileFocus={{ scale: 1.02 }}
            >
              {/* SEARCH INPUT WITH MIC */}
              <div className="flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 shadow-2xl">
                <motion.input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for movies, actors, directors..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchMovies()}
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-lg font-medium min-w-0"
                />
                <motion.button
                  onClick={voiceSearchActive ? stopVoiceSearch : startVoiceSearch}
                  className="px-4 py-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-300"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {voiceSearchActive ? "Stop" : "Mic"}
                </motion.button>
              </div>

              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-5 py-3 rounded-full border transition-all duration-300 backdrop-blur-sm ${
                  showFilters
                    ? 'border-electric-crimson bg-electric-crimson/20 text-white'
                    : 'border-white/30 bg-white/5 text-gray-300 hover:border-electric-crimson hover:bg-electric-crimson/10'
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Filters
              </motion.button>

              <motion.button
                onClick={() => searchMovies()}
                disabled={!query.trim() || isLoading}
                className={`px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300 ${
                  query.trim() && !isLoading
                    ? 'bg-electric-crimson text-white shadow-lg shadow-electric-crimson/30 hover:bg-red-600'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
                whileHover={query.trim() && !isLoading ? { scale: 1.03 } : {}}
                whileTap={query.trim() && !isLoading ? { scale: 0.97 } : {}}
              >
                {isLoading ? "..." : "Search"}
              </motion.button>
            </motion.div>

            {/* ================= ADVANCED FILTER DRAWER ================= */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-full left-0 right-0 mt-4 p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl z-50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* GENRE SELECT */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
                      <select
                        value={filters.genre}
                        onChange={(e) => setFilters({...filters, genre: e.target.value})}
                        className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white outline-none focus:border-electric-crimson transition-colors"
                      >
                        <option value="" className="bg-gray-800">All Genres</option>
                        <option value="28" className="bg-gray-800">Action</option>
                        <option value="12" className="bg-gray-800">Adventure</option>
                        <option value="16" className="bg-gray-800">Animation</option>
                        <option value="35" className="bg-gray-800">Comedy</option>
                        <option value="80" className="bg-gray-800">Crime</option>
                        <option value="99" className="bg-gray-800">Documentary</option>
                        <option value="18" className="bg-gray-800">Drama</option>
                        <option value="10751" className="bg-gray-800">Family</option>
                        <option value="14" className="bg-gray-800">Fantasy</option>
                        <option value="36" className="bg-gray-800">History</option>
                        <option value="27" className="bg-gray-800">Horror</option>
                        <option value="10402" className="bg-gray-800">Music</option>
                        <option value="9648" className="bg-gray-800">Mystery</option>
                        <option value="10749" className="bg-gray-800">Romance</option>
                        <option value="878" className="bg-gray-800">Science Fiction</option>
                        <option value="10770" className="bg-gray-800">TV Movie</option>
                        <option value="53" className="bg-gray-800">Thriller</option>
                        <option value="10752" className="bg-gray-800">War</option>
                        <option value="37" className="bg-gray-800">Western</option>
                      </select>
                    </div>

                    {/* RELEASE YEAR */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Release Year</label>
                      <input
                        type="number"
                        placeholder="e.g. 2023"
                        value={filters.year}
                        onChange={(e) => setFilters({...filters, year: e.target.value})}
                        className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white outline-none focus:border-electric-crimson transition-colors placeholder-gray-500"
                      />
                    </div>

                    {/* RATING RANGE */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Min Rating</label>
                      <select
                        value={filters.rating}
                        onChange={(e) => setFilters({...filters, rating: e.target.value})}
                        className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white outline-none focus:border-electric-crimson transition-colors"
                      >
                        <option value="" className="bg-gray-800">Any Rating</option>
                        <option value="9" className="bg-gray-800">9+ Stars</option>
                        <option value="8" className="bg-gray-800">8+ Stars</option>
                        <option value="7" className="bg-gray-800">7+ Stars</option>
                        <option value="6" className="bg-gray-800">6+ Stars</option>
                        <option value="5" className="bg-gray-800">5+ Stars</option>
                      </select>
                    </div>

                    {/* STREAMING PLATFORMS */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Platforms</label>
                      <div className="flex flex-wrap gap-2">
                        {['Netflix', 'Prime', 'Disney+', 'HBO', 'Hulu'].map(platform => (
                          <button
                            key={platform}
                            onClick={() => {
                              const newPlatforms = filters.platforms.includes(platform)
                                ? filters.platforms.filter(p => p !== platform)
                                : [...filters.platforms, platform];
                              setFilters({...filters, platforms: newPlatforms});
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              filters.platforms.includes(platform)
                                ? 'bg-electric-crimson text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                          >
                            {platform}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <motion.button
                      onClick={applyFilters}
                      className="px-6 py-2 bg-electric-crimson text-white rounded-full font-medium hover:bg-red-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Apply Filters
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </motion.div>

        {/* ================= ACTIVE FILTERS ================= */}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-6 mb-8"
            >
              <div className="flex flex-wrap gap-2 justify-center">
                {activeFilters.map((filter, index) => (
                  <motion.span
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-electric-crimson/20 border border-electric-crimson/30 rounded-full text-sm text-white"
                  >
                    {filter.label}
                    <button
                      onClick={() => removeFilter(filter)}
                      className="hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= TABS ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex justify-center flex-wrap gap-3 mb-12 px-6"
        >
          {[
            { id: "search", label: "Discover" },
            { id: "recommendations", label: "For You" },
            { id: "trending", label: "Trending" },
            { id: "history", label: "History" }
          ].map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 backdrop-blur-sm ${
                activeTab === tab.id
                  ? 'bg-electric-crimson text-white shadow-lg shadow-electric-crimson/30'
                  : 'bg-white/5 border border-white/20 text-gray-300 hover:border-electric-crimson hover:bg-electric-crimson/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* ================= CONTENT AREA ================= */}
        <div className="px-6 max-w-7xl mx-auto">
          {/* ================= SEARCH/DISCOVER TAB ================= */}
          {activeTab === "search" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {query.trim() || movies.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-electric-crimson to-red-400 bg-clip-text text-transparent">
                      {query.trim() ? `Results for "${query}"` : 'Search Results'}
                    </h2>
                    <span className="text-gray-400 text-sm">
                      {movies.length} results found
                    </span>
                  </div>

                  {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  ) : movies.length > 0 ? (
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: { duration: 0.3 }
                        }
                      }}
                    >
                      {movies.map((movie, index) => (
                        <MovieCard key={movie.id} movie={movie} index={index} />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16"
                    >
                      <h3 className="text-2xl font-bold text-white mb-4">No movies found</h3>
                      <p className="text-gray-400 mb-6">Try a different keyword or adjust your filters.</p>
                      <div className="flex flex-wrap justify-center gap-3">
                        {["Inception", "The Dark Knight", "Action Movies", "Sci-Fi"].map(suggestion => (
                          <motion.button
                            key={suggestion}
                            onClick={() => {
                              setQuery(suggestion);
                              searchMovies(suggestion);
                            }}
                            className="px-4 py-2 bg-white/10 hover:bg-electric-crimson/20 border border-white/20 hover:border-electric-crimson rounded-full text-sm transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {suggestion}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-20"
                >
                  <h2 className="text-3xl font-bold text-white mb-8">Start Discovering Movies</h2>
                  <p className="text-gray-400 text-lg mb-12">Search for movies or use filters to find the right title.</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ================= RECOMMENDATIONS ================= */}
          {activeTab === "recommendations" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-electric-crimson to-red-400 bg-clip-text text-transparent">
                  Recommended for You
                </h2>
                <motion.button
                  onClick={fetchRecommendations}
                  className="px-6 py-2 bg-electric-crimson/20 hover:bg-electric-crimson/30 border border-electric-crimson/30 rounded-full text-white transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Refresh
                </motion.button>
              </div>

              {recommendations.length > 0 ? (
                <motion.div
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { duration: 0.3 }
                    }
                  }}
                >
                  {recommendations.map((movie, index) => (
                    <MovieCard key={movie.id} movie={movie} index={index} />
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-2xl font-bold text-white mb-4">Loading recommendations...</h3>
                  <p className="text-gray-400">Watch some movies to get personalized suggestions.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ================= TRENDING ================= */}
          {activeTab === "trending" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-electric-crimson to-red-400 bg-clip-text text-transparent">
                  Trending Now
                </h2>
                <motion.button
                  onClick={fetchTrendingMovies}
                  className="px-6 py-2 bg-electric-crimson/20 hover:bg-electric-crimson/30 border border-electric-crimson/30 rounded-full text-white transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Refresh
                </motion.button>
              </div>

              {trendingLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : trendingMovies.length > 0 ? (
                <motion.div
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { duration: 0.3 }
                    }
                  }}
                >
                  {trendingMovies.map((movie, index) => (
                    <MovieCard key={movie.id || movie.title} movie={movie} index={index} />
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-2xl font-bold text-white mb-4">No trending movies available</h3>
                  <p className="text-gray-400">Please try refreshing or check your connection.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ================= SEARCH HISTORY ================= */}
          {activeTab === "history" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-electric-crimson to-red-400 bg-clip-text text-transparent">
                  Search History
                </h2>
                <motion.button
                  onClick={() => {
                    localStorage.removeItem("searchHistory");
                    setSearchHistory([]);
                  }}
                  className="px-6 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-full text-white transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear All
                </motion.button>
              </div>

              {searchHistory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchHistory.map((item, index) => (
                    <motion.button
                      key={index}
                      onClick={() => {
                        setQuery(item);
                        searchMovies(item);
                      }}
                      className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-electric-crimson/30 rounded-xl transition-all text-left"
                      whileHover={{ scale: 1.02, y: -2 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <span className="text-gray-300 font-medium">{item}</span>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-2xl font-bold text-white mb-4">No search history</h3>
                  <p className="text-gray-400">Start searching to build your history.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;