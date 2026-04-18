import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {

  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [popular, setPopular] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [thrillerMovies, setThrillerMovies] = useState([]);
  const [horrorMovies, setHorrorMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [heroIndex, setHeroIndex] = useState(0);

  const navigate = useNavigate();

  const handleMovieClick = (movie) => {
    const userId = localStorage.getItem("userId"); // or from auth

    fetch("http://localhost:5000/api/activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: userId,
        movie: movie
      })
    })
    .then(res => res.json())
    .then(data => console.log("Activity saved"))
    .catch(err => console.error(err));
  };

  // 🎬 Fetch Movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const userId = localStorage.getItem("userId");
        const [trendingRes, topRatedRes, popularRes, actionRes, thrillerRes, horrorRes, comedyRes, recRes] = await Promise.all([
          axios.get(`https://api.themoviedb.org/3/trending/movie/day?api_key=c3eb192bb06b83bf9707742f3f5d851a`),
          axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=c3eb192bb06b83bf9707742f3f5d851a`),
          axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=c3eb192bb06b83bf9707742f3f5d851a`),
          axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=c3eb192bb06b83bf9707742f3f5d851a&with_genres=28&sort_by=popularity.desc`),
          axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=c3eb192bb06b83bf9707742f3f5d851a&with_genres=53&sort_by=popularity.desc`),
          axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=c3eb192bb06b83bf9707742f3f5d851a&with_genres=27&sort_by=popularity.desc`),
          axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=c3eb192bb06b83bf9707742f3f5d851a&with_genres=35&sort_by=popularity.desc`),
          userId ? axios.get(`http://localhost:5000/api/recommendations?user_id=${userId}`) : Promise.resolve({ data: { recommendations: [] } })
        ]);
        setTrending(trendingRes.data.results);
        setTopRated(topRatedRes.data.results);
        setPopular(popularRes.data.results);
        setActionMovies(actionRes.data.results);
        setThrillerMovies(thrillerRes.data.results);
        setHorrorMovies(horrorRes.data.results);
        setComedyMovies(comedyRes.data.results);
        setRecommendations(recRes.data.recommendations || []);
      } catch (err) {
        setError('Failed to load movies. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // 🔄 Auto Slider
  useEffect(() => {
    if (trending.length === 0) return;

    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % trending.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [trending]);

  const heroMovie = trending[heroIndex];

  // 🎬 Movie Row Component
 const MovieRow = ({ title, movies }) => {
  const rowRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isScrolling = useRef(false);

  const scrollRow = (direction) => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({
      left: direction === "left" ? -420 : 420,
      behavior: "smooth"
    });
  };

  const handleScroll = () => {
    if (!rowRef.current) return;
    setShowLeftArrow(rowRef.current.scrollLeft > 30);
  };

  return (
    <div style={{ marginBottom: "40px", position: "relative" }}>

      {/* 🎬 SECTION TITLE */}
      <h2
        style={{
          margin: "20px",
          fontSize: "1.7rem",
          fontWeight: "700",
          letterSpacing: "0.5px"
        }}
      >
        {title}
      </h2>

      {/* 🎞 MOVIE ROW */}
      <div style={{ position: "relative" }}>
        <div
          ref={rowRef}
          onScroll={handleScroll}
          style={{
            display: "flex",
            overflowX: "auto",
            gap: "20px",
            padding: "0 16px",
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            touchAction: "pan-x"
          }}
          className="movie-row"
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              style={{
                minWidth: "200px",
                position: "relative",
                cursor: "pointer",
                transition: "transform 0.3s, box-shadow 0.3s",
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
                background: "#111",
                touchAction: 'manipulation'
              }}
              onClick={() => { 
                if (isScrolling.current) return; // Prevent click if scrolling
                handleMovieClick(movie); 
                navigate(`/movie/${movie.id}`); 
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-6px) scale(1.03)";
                e.currentTarget.style.zIndex = "2";
                const overlay = e.currentTarget.querySelector('.overlay');
                if (overlay) {
                  overlay.style.opacity = '1';
                  overlay.style.transform = 'translateY(0px)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.zIndex = "1";
                const overlay = e.currentTarget.querySelector('.overlay');
                if (overlay) {
                  overlay.style.opacity = '0';
                  overlay.style.transform = 'translateY(20px)';
                }
              }}
              onTouchStart={(e) => {
                touchStartX.current = e.touches[0].clientX;
                touchStartY.current = e.touches[0].clientY;
                isScrolling.current = false;
                e.currentTarget.style.transform = "translateY(-6px) scale(1.03)";
                e.currentTarget.style.zIndex = "2";
                const overlay = e.currentTarget.querySelector('.overlay');
                if (overlay) {
                  overlay.style.opacity = '1';
                  overlay.style.transform = 'translateY(0px)';
                }
              }}
              onTouchMove={(e) => {
                const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
                const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
                if (deltaX > 10 || deltaY > 10) {
                  isScrolling.current = true;
                }
              }}
              onTouchEnd={(e) => {
                setTimeout(() => {
                  isScrolling.current = false;
                }, 100); // Reset after click would fire
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.zIndex = "1";
                const overlay = e.currentTarget.querySelector('.overlay');
                if (overlay) {
                  overlay.style.opacity = '0';
                  overlay.style.transform = 'translateY(20px)';
                }
              }}
            >

              {/* 🎬 POSTER */}
              <img
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.title}
                style={{
                  width: "100%",
                  height: "300px",
                  objectFit: "cover"
                }}
              />

              {/* 🌑 OVERLAY */}
              <div
                className="overlay"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "12px",
                  background: "linear-gradient(to top, rgba(0,0,0,0.95), transparent)",
                  opacity: 0,
                  transform: "translateY(20px)",
                  transition: "all 0.25s ease"
                }}
              >
                <p style={{ fontSize: "14px", fontWeight: "700", margin: 0, lineHeight: 1.2, color: "#fff" }}>
                  {movie.title}
                </p>
                <p style={{ fontSize: "12px", color: "#ccc", margin: "6px 0 0" }}>
                  {movie.release_date?.split('-')[0] || 'Unknown'} • {movie.vote_average?.toFixed(1)}
                </p>
              </div>

            </div>
          ))}
        </div>

        <button
          onClick={() => scrollRow("left")}
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            cursor: "pointer",
            fontSize: "1.2rem",
            display: showLeftArrow ? "flex" : "none",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
            zIndex: 20
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-50%) scale(1.05)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "translateY(-50%) scale(1)"}
        >
          ‹
        </button>

        <button
          onClick={() => scrollRow("right")}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            cursor: "pointer",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
            zIndex: 20
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-50%) scale(1.05)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "translateY(-50%) scale(1)"}
        >
          ›
        </button>
      </div>
    </div>
  );
};
  return (
    <div>
      {loading && <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading movies...</p>}
      {error && <p style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</p>}

      {/* 🎬 HERO SLIDER */}
      {heroMovie && (
  <div
    style={{
      height: "80vh",
      backgroundImage: `url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "40px",
      backgroundBlendMode: "darken",
      backgroundColor: "rgba(0,0,0,0.6)",
      transition: "all 0.8s ease-in-out"
    }}
  >

    {/* 🎬 TITLE */}
    <h1 style={{ fontSize: "3rem" }}>{heroMovie.title}</h1>

    {/* 📖 DESCRIPTION */}
    <p style={{ maxWidth: "500px", marginTop: "10px" }}>
      {heroMovie.overview}
    </p>

    {/* ▶ WATCH BUTTON (SMALL) */}
    <button
      onClick={() => navigate(`/movie/${heroMovie.id}`)}
      style={{
        marginTop: "15px",
        padding: "8px 16px",
        width: "fit-content",
        background: "#e50914",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "14px"
      }}
    >
      ▶ Watch Now
    </button>

    {/* 🔵 DOT INDICATORS */}
    <div style={{ marginTop: "20px", display: "flex", gap: "8px" }}>
      {trending.slice(0, 8).map((_, index) => (
        <div
          key={index}
          onClick={() => setHeroIndex(index)}
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: index === heroIndex ? "#e50914" : "#bbb",
            cursor: "pointer",
            transition: "0.3s"
          }}
        />
      ))}
    </div>

  </div>
)}

      {/* 🎬 MOVIE ROWS */}
      {recommendations.length > 0 && <MovieRow title=" Recommended for You" movies={recommendations} />}
      <MovieRow title=" Trending Now" movies={trending} />
      <MovieRow title=" Top Rated" movies={topRated} />
      <MovieRow title=" Popular" movies={popular} />
      <MovieRow title=" Action" movies={actionMovies} />
      <MovieRow title=" Thriller" movies={thrillerMovies} />
      <MovieRow title=" Horror" movies={horrorMovies} />
      <MovieRow title=" Comedy" movies={comedyMovies} />
      <style>{`
        .movie-row::-webkit-scrollbar { display: none; }
        .movie-row { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>    </div>
  );
}

export default Home;