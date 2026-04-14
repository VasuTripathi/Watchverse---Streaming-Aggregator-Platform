import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import MovieDetails from "./pages/MovieDetails";
import Watchlist from "./pages/Watchlist";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import "react-toastify/dist/ReactToastify.css";
import AIChat from "./pages/AIChat";


function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL || '/'}>
      <Navbar />
      <Routes>
        <Route path="/ai" element={<AIChat />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/watchlist" element={<Watchlist />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;