import { Routes, Route, useNavigate } from 'react-router-dom';
import Auction from './pages/Auction.jsx';
import ExploreAuctions from './pages/ExploreAuctions.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Layout from './components/Layout.jsx';
import History from './pages/History.jsx';
import CreateAuction from './pages/CreateAuction.jsx';
import Notifications from './pages/Notifications.jsx';
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "./styles/index.css";

function ProtectedLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        console.warn("Token expirado");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } catch (err) {
      console.error("Token inválido:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  return <Layout />;
}

function App() {
  return (
    <Routes>
      {/* Rutas protegidas */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<ExploreAuctions />} />
        <Route path="/auction/:id" element={<Auction />} />
        <Route path="/create-auction" element={<CreateAuction />} />
        <Route path="/history" element={<History />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Ruta por defecto */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;
