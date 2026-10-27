import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { FaFilter } from "react-icons/fa";

export default function ExploreAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [filters, setFilters] = useState({
    brand: "",
    year: "",
    price: "",
  });

  useEffect(() => {
    // 🔌 Conectar Socket.IO
    const socket = io("http://localhost:4000");
    socket.on("connect", () => console.log("✅ Conectado a Socket.IO en ExploreAuctions"));

    // 🆕 Escuchar nuevas subastas publicadas
    socket.on("newAuction", (newAuction) => {
      console.log("📢 Nueva subasta recibida:", newAuction);
      setAuctions((prev) => [newAuction, ...prev]); // Agrega al inicio
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/auctions");
        setAuctions(res.data);
      } catch (err) {
        console.error("Error al cargar subastas:", err);
      }
    };
    fetchAuctions();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredAuctions = auctions.filter((a) => {
    return (
      (!filters.brand ||
        a.brand.toLowerCase().includes(filters.brand.toLowerCase())) &&
      (!filters.year || a.years === parseInt(filters.year)) &&
      (!filters.price || a.base_price <= parseFloat(filters.price))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Sidebar de filtros */}
        <div className="lg:w-1/4">
          <div className="sticky top-20 bg-gray-900/80 border border-gray-700 p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaFilter className="text-blue-400" /> Filtros
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                name="brand"
                placeholder="Marca / Modelo"
                value={filters.brand}
                onChange={handleFilterChange}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
              />
              <input
                type="number"
                name="year"
                placeholder="Año del modelo"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
              />
              <input
                type="number"
                name="price"
                placeholder="Precio máximo"
                value={filters.price}
                onChange={handleFilterChange}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
              />
              <button
                onClick={() => setFilters({ brand: "", year: "", price: "" })}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md font-semibold transition"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Grid de subastas */}
        <div className="flex-1">
          {filteredAuctions.length === 0 ? (
            <div className="text-center text-gray-300 py-20">
              No hay subastas que coincidan con los filtros.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAuctions.map((auction) => (
                <div
                  key={auction.id_auctions}
                  className="bg-gray-900/70 border border-gray-700 rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300"
                >

                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={auction.image_data || "/imagen/default.jpg"}
                      alt={auction.title}
                      className="w-full h-full object-cover"
                    />

                    {(() => {
                      const ended =
                        new Date(auction.end_time).getTime() <= Date.now();


                      const flagname = String(auction.flagname || "").toLowerCase();

                      const status =
                        flagname === "cancelled"
                          ? "cancelled"
                          : flagname === "closed" || ended
                            ? "closed"
                            : "active";


                      const styles = {
                        active: "bg-green-600",
                        closed: "bg-gray-600",
                        cancelled: "bg-red-600",
                      };

                      const labels = {
                        active: "🟢 Activa",
                        closed: "⚫ Cerrada",
                        cancelled: "🔴 Cancelada",
                      };

                      return (
                        <span
                          className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold text-white ${styles[status]}`}
                        >
                          {labels[status]}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="p-5">
                    <h3 className="text-md font-bold text-blue-400 mb-1 truncate">
                      {auction.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2 truncate">
                      {auction.years} | {auction.brand} | {auction.model}
                    </p>
                    <p className="text-sm text-gray-300 mb-1">
                      💰 Precio base:{" "}
                      <span className="text-yellow-400 font-bold">
                        ${auction.base_price}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 flex flex-col mt-2">
                      <span>
                        🕒 Desde:{" "}
                        {new Date(auction.start_time).toLocaleString("es-GT")}
                      </span>
                      <span>
                        🔚 Hasta:{" "}
                        {new Date(auction.end_time).toLocaleString("es-GT")}
                      </span>
                    </p>
                    <button
                      onClick={() =>
                        (window.location.href = `/auction/${auction.id_auctions}`)
                      }
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-500 py-2 rounded-md font-semibold"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
