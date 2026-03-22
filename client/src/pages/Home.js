import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {

  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [popular, setPopular] = useState([]);

  const [heroIndex, setHeroIndex] = useState(0);

  const navigate = useNavigate();

  // 🎬 Fetch Movies
  useEffect(() => {

    axios.get(`https://api.themoviedb.org/3/trending/movie/day?api_key=c3eb192bb06b83bf9707742f3f5d851a`)
      .then(res => setTrending(res.data.results));

    axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=c3eb192bb06b83bf9707742f3f5d851a`)
      .then(res => setTopRated(res.data.results));

    axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=c3eb192bb06b83bf9707742f3f5d851a`)
      .then(res => setPopular(res.data.results));

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
 const MovieRow = ({ title, movies }) => (
  <div style={{ marginBottom: "40px" }}>

    {/* 🎬 SECTION TITLE */}
    <h2
      style={{
        margin: "20px",
        fontSize: "1.5rem",
        fontWeight: "600"
      }}
    >
      {title}
    </h2>

    {/* 🎞 MOVIE ROW */}
    <div
      style={{
        display: "flex",
        overflowX: "scroll",
        gap: "20px",
        padding: "0 20px",
        scrollBehavior: "smooth"
      }}
      className="movie-row"
    >
      {movies.map((movie) => (
        <div
          key={movie.id}
          style={{
            minWidth: "180px",
            position: "relative",
            cursor: "pointer",
            transition: "transform 0.3s"
          }}
          onClick={() => navigate(`/movie/${movie.id}`)}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.15)";
            e.currentTarget.style.zIndex = "10";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.zIndex = "1";
          }}
        >

          {/* 🎬 POSTER */}
          <img
            src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
            alt={movie.title}
            style={{
              width: "100%",
              borderRadius: "12px"
            }}
          />

          {/* 🌑 OVERLAY */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "10px",
              borderRadius: "0 0 12px 12px",
              background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
              opacity: 0,
              transition: "0.3s"
            }}
            className="overlay"
          >
            <p style={{ fontSize: "14px", fontWeight: "bold" }}>
              {movie.title}
            </p>
            <p style={{ fontSize: "12px", color: "#ccc" }}>
              ⭐ {movie.vote_average}
            </p>
          </div>

        </div>
      ))}
    </div>

  </div>
);
  return (
    <div>

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
      <MovieRow title=" Trending Now" movies={trending} />
      <MovieRow title=" Top Rated" movies={topRated} />
      <MovieRow title=" Popular" movies={popular} />

    </div>
  );
}

export default Home;