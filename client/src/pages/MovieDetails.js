import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

function MovieDetails() {

  const { id } = useParams();

  // ✅ Safe auth handling
  const auth = useContext(AuthContext);
  const token = auth?.token || localStorage.getItem("token");

  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {

    // 🎬 Fetch movie details
    axios.get(
      `https://api.themoviedb.org/3/movie/${id}?api_key=c3eb192bb06b83bf9707742f3f5d851a`
    )
    .then(res => setMovie(res.data))
    .catch(err => console.log(err));

    // 🎥 Fetch trailer
    axios.get(
      `https://api.themoviedb.org/3/movie/${id}/videos?api_key=c3eb192bb06b83bf9707742f3f5d851a`
    )
    .then(res => {
      const video = res.data.results.find(
        vid => vid.type === "Trailer"
      );
      if (video) setTrailer(video.key);
    });

    // 🤖 Fetch recommendations
    axios.get(
      `https://api.themoviedb.org/3/movie/${id}/similar?api_key=c3eb192bb06b83bf9707742f3f5d851a`
    )
    .then(res => setRecommendations(res.data.results));

  }, [id]);

  // ⭐ Add to Watchlist
  const addToWatchlist = async () => {
    try {

      if (!token) {
        alert("Please login first ❗");
        return;
      }

      const res = await API.post(
        "/watchlist/add",
        {
          movieId: movie.id,
          title: movie.title,
          poster: movie.poster_path
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("SUCCESS:", res.data);

      alert("Added to Watchlist ");

    } catch (error) {
      console.log("ERROR:", error.response || error);
      alert(error.response?.data?.message || "Error adding to watchlist");
    }
  };

  if (!movie) return <h2 style={{ padding: "20px" }}>Loading...</h2>;

  return (
    <div style={{ color: "white" }}>

      {/* 🎬 HERO */}
      <div style={{
        height: "80vh",
        backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
        backgroundSize: "cover",
        display: "flex",
        alignItems: "center",
        padding: "40px",
        backgroundBlendMode: "darken",
        backgroundColor: "rgba(0,0,0,0.7)"
      }}>

        <div style={{
          background: "rgba(0,0,0,0.6)",
          padding: "20px",
          borderRadius: "15px",
          maxWidth: "500px"
        }}>

          <h1>{movie.title}</h1>

          <p>⭐ {movie.vote_average}</p>

          <p>{movie.overview}</p>

          {/* ⭐ BUTTON */}
          <button
            onClick={addToWatchlist}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              background: "#e50914",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Add to Watchlist 
          </button>

        </div>

      </div>

      {/* 🎥 TRAILER */}
      {trailer && (
        <div style={{ padding: "20px" }}>
          <h2> Trailer</h2>

          <iframe
            width="100%"
            height="400"
            src={`https://www.youtube.com/embed/${trailer}`}
            title="Trailer"
            style={{ borderRadius: "10px" }}
          ></iframe>
        </div>
      )}

      {/*  RECOMMENDATIONS */}
      <div style={{ padding: "20px" }}>
        <h2>Recommended Movies</h2>

        <div style={{
          display: "flex",
          overflowX: "scroll",
          gap: "15px"
        }}>
          {recommendations.slice(0, 10).map((rec) => (
            <img
              key={rec.id}
              src={`https://image.tmdb.org/t/p/w200${rec.poster_path}`}
              alt={rec.title}
              style={{
                borderRadius: "10px",
                cursor: "pointer",
                transition: "transform 0.3s"
              }}
              onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
            />
          ))}
        </div>
      </div>

    </div>
  );
}

export default MovieDetails;