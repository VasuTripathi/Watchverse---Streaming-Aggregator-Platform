import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const auth = useContext(AuthContext);
  const token = auth?.token || localStorage.getItem("token");
  const [providers, setProviders] = useState([]);
  const [watchLink, setWatchLink] = useState("");
  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const recommendationsRef = useRef(null);

  const scrollRecommendations = (direction) => {
    if (recommendationsRef.current) {
      recommendationsRef.current.scrollBy({
        left: direction === "left" ? -420 : 420,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    axios
      .get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=c3eb192bb06b83bf9707742f3f5d851a`
      )
      .then((res) => setMovie(res.data))
      .catch((err) => console.log(err));

    axios
      .get(
        `https://api.themoviedb.org/3/movie/${id}/videos?api_key=c3eb192bb06b83bf9707742f3f5d851a`
      )
      .then((res) => {
        const video = res.data.results.find((vid) => vid.type === "Trailer");
        if (video) setTrailer(video.key);
      });

    axios
      .get(
        `https://api.themoviedb.org/3/movie/${id}/similar?api_key=c3eb192bb06b83bf9707742f3f5d851a`
      )
      .then((res) => setRecommendations(res.data.results));
      axios.get(
  `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=c3eb192bb06b83bf9707742f3f5d851a`
)
.then(res => {
  const data = res.data.results?.IN; // 🇮🇳 India

  if (data) {
    setProviders(data.flatrate || []);
    setWatchLink(data.link);
  }
})
.catch(err => console.log(err));
  }, [id]);

  const addToWatchlist = async () => {
    try {
      if (!token) {
        toast.warning("Please login first to add to watchlist");
        navigate("/login");
        return;
      }

      if (!movie || !movie.id) {
        toast.info("Movie data is loading, please wait a moment...");
        return;
      }

      const movieId = String(movie.id);
      console.log("🎬 Adding to watchlist - MovieID:", movieId, "Token exists:", !!token);

      const payload = {
        movieId: movieId,
        title: movie.title,
        poster: movie.poster_path,
      };

      console.log("📤 Sending payload:", payload);

      const res = await API.post(
        "/watchlist/add",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ SUCCESS response:", res.data);
      if (res.data?.message?.toLowerCase().includes("already in watchlist")) {
        toast.info("This movie is already in your watchlist.");
      } else {
        toast.success("Added to Watchlist");
      }

    } catch (error) {
      console.error("❌ ERROR full object:", error);
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);

      const message = error.response?.data?.message || error.message || "Unknown error";

      // ✅ FIX: If token is stale/invalid, auto logout and redirect to login
      if (
        error.response?.status === 401 ||
        message.toLowerCase().includes("invalid token") ||
        message.toLowerCase().includes("not authorized") ||
        message.toLowerCase().includes("no token")
      ) {
        toast.error("Your session has expired. Please log in again.");
        // Clear the bad token
        if (auth?.logout) {
          auth.logout();
        } else {
          localStorage.removeItem("token");
        }
        navigate("/login");
        return;
      }

      toast.error(message || "Failed to add to watchlist");
    }
  };

  if (!movie) return <h2 style={{ padding: "20px", color: "white" }}>Loading...</h2>;

  return (
    <div style={{ color: "white" }}>
      {/* HERO */}
      <div
        style={{
          minHeight: "60vh",
          height: "auto",
          backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
          backgroundSize: "cover",
          display: "flex",
          alignItems: "center",
          padding: "30px 20px",
          backgroundBlendMode: "darken",
          backgroundColor: "rgba(0,0,0,0.7)",
        }}
      >
        <div
          style={{
            background: "rgba(0,0,0,0.6)",
            padding: "20px",
            borderRadius: "15px",
            maxWidth: "500px",
          }}
        >
          <h1>{movie.title}</h1>
          <p>{movie.vote_average}</p>
          <p>{movie.overview}</p>

          <button
            onClick={addToWatchlist}
            style={{
              marginTop: "10px",
              padding: "12px 22px",
              background: "#e50914",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              color: "white",
              fontWeight: "bold",
              touchAction: 'manipulation'
            }}
          >
            Add to Watchlist
          </button>
        </div>
      </div>
{/* 🎬 WHERE TO WATCH */}
<div style={{
  marginTop: "30px",
  textAlign: "center"
}}>

  <h2 style={{
    marginBottom: "15px",
    fontWeight: "600"
  }}>
     Where to Watch
  </h2>

  {providers.length > 0 ? (
    <div style={{
      display: "flex",
      gap: "15px",
      flexWrap: "wrap",
      justifyContent: "center"
    }}>

      {providers.map((p, i) => (
        <div
          key={i}
          onClick={() => {
            const name = encodeURIComponent(movie.title);

            let url = "";

            if (p.provider_name.includes("Netflix")) {
              url = `https://www.netflix.com/search?q=${name}`;
            } 
            else if (p.provider_name.includes("Amazon")) {
              url = `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${name}`;
            } 
            else if (p.provider_name.includes("Hotstar") || p.provider_name.includes("Jio")) {
              url = `https://www.hotstar.com/in/search?q=${name}+on+Hotstar`;
            } 
            else {
              url = watchLink;
            }

            window.open(url, "_blank");
          }}

          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            borderRadius: "14px",
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "1px solid rgba(255,255,255,0.15)",
            touchAction: 'manipulation'
          }}

          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.08)";
            e.currentTarget.style.background = "rgba(255,255,255,0.15)";
          }}

          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = "scale(1.08)";
            e.currentTarget.style.background = "rgba(255,255,255,0.15)";
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          }}
        >

          <img
            src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
            alt={p.provider_name}
            style={{
              width: "40px",
              borderRadius: "6px"
            }}
          />

          <span style={{
            fontSize: "14px",
            fontWeight: "500"
          }}>
            {p.provider_name}
          </span>

        </div>
      ))}

    </div>
  ) : (
    <p style={{ color: "#aaa" }}>
      Not available on streaming platforms
    </p>
  )}

</div>
      {/* TRAILER */}
      {trailer && (
        <div style={{ padding: "20px" }}>
          <h2>Trailer</h2>
          <iframe
            width="100%"
            height="min(400px, 40vh)"
            src={`https://www.youtube.com/embed/${trailer}`}
            title="Trailer"
            style={{ borderRadius: "10px", minHeight: "260px" }}
          ></iframe>
        </div>
      )}

      {/* RECOMMENDATIONS */}
      <div style={{ padding: "20px", position: "relative" }}>
        <h2>Recommended Movies</h2>
        <div style={{ position: "relative", marginTop: "15px" }}>
          <button
            onClick={() => scrollRecommendations("left")}
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              border: "none",
              background: "rgba(0,0,0,0.65)",
              color: "white",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              touchAction: 'manipulation'
            }}
          >
            ‹
          </button>

          <button
            onClick={() => scrollRecommendations("right")}
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              border: "none",
              background: "rgba(0,0,0,0.65)",
              color: "white",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              touchAction: 'manipulation'
            }}
          >
            ›
          </button>

          <div
            ref={recommendationsRef}
            style={{
              display: "flex",
              overflowX: "auto",
              gap: "20px",
              padding: "10px 16px",
              scrollBehavior: "smooth",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              touchAction: "pan-x"
            }}
          >
            {recommendations.slice(0, 10).map((rec) => (
              <div
                key={rec.id}
                onClick={() => navigate(`/movie/${rec.id}`)}
                style={{
                  minWidth: "180px",
                  cursor: "pointer",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  background: "#111",
                  touchAction: 'manipulation'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px) scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(255, 255, 255, 0.35)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.25)";
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px) scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(255, 255, 255, 0.35)";
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.25)";
                }}
              >
                <img
                  src={rec.poster_path ? `https://image.tmdb.org/t/p/w300${rec.poster_path}` : "https://via.placeholder.com/300x450/111/fff?text=No+Image"}
                  alt={rec.title}
                  style={{ width: "100%", display: "block" }}
                />
                <div style={{ padding: "10px", color: "#fff" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "5px", lineHeight: 1.2 }}>{rec.title}</div>
                  <div style={{ fontSize: "0.85rem", color: "#bbb" }}>{rec.release_date?.split("-")[0] || "Unknown"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;