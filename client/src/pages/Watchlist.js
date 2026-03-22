import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

function Watchlist() {

  const [movies, setMovies] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    API.get("/watchlist", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => setMovies(res.data))
    .catch(err => console.log(err));
  }, []);

  //  Remove movie
  const removeMovie = async (movieId) => {
    try {
      await API.post(
        "/watchlist/remove",
        { movieId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // update UI instantly
      setMovies(movies.filter((m) => m.movieId !== movieId));

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1 style={{ marginBottom: "20px" }}>
         My Watchlist
      </h1>

      {/* EMPTY STATE */}
      {movies.length === 0 && (
        <p style={{ color: "#aaa" }}>
          No movies added yet. Start exploring and add some to your watchlist!
        </p>
      )}

      {/* GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "20px"
      }}>

        {movies.map((movie, index) => (
          <div
            key={index}
            style={{
              background: "rgba(255,255,255,0.05)",
              padding: "10px",
              borderRadius: "12px",
              backdropFilter: "blur(10px)",
              transition: "transform 0.3s"
            }}
            onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
          >

            <img
              src={`https://image.tmdb.org/t/p/w200${movie.poster}`}
              alt={movie.title}
              style={{
                width: "100%",
                borderRadius: "10px"
              }}
            />

            <h4 style={{ marginTop: "8px" }}>
              {movie.title}
            </h4>

            <button
              onClick={() => removeMovie(movie.movieId)}
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "8px",
                background: "#e50914",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Remove 
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Watchlist;