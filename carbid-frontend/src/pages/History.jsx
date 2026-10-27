import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function History() {
  const [auctions, setAuctions] = useState([]);
  const navigate = useNavigate(); // ✅ useNavigate debe ir dentro del componente

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:4000/api/bids/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuctions(res.data || []);
      } catch (err) {
        console.error("Error al cargar historial:", err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-[#0a0f25] to-gray-900 text-white py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* 🔹 Encabezado */}
        <h1 className="text-3xl font-extrabold mb-10 flex items-center gap-2 text-white drop-shadow-md">
          🏁 Historial de Subastas
        </h1>

        {/* 🔸 Contenido */}
        {auctions.length === 0 ? (
          <p className="text-gray-400 italic text-center mt-10">
            No tienes subastas en tu historial.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-center">
            {auctions.map((auction) => {
              const formattedDate = auction.end_time
                ? new Date(auction.end_time).toLocaleString("es-GT", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
                : "Fecha no disponible";

              // Verificar si la subasta está activa o finalizada
              const isActive =
                auction.end_time &&
                new Date(auction.end_time).getTime() > Date.now();

              return (
                <div
                  key={auction.id_auctions}
                  className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300"
                >
                  {/* Imagen */}
                  <div className="h-44 bg-gray-800 flex items-center justify-center rounded-t-2xl overflow-hidden relative">
                    {auction.image_data ? (
                      <img
                        src={auction.image_data}
                        alt={auction.title || "Subasta"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm flex flex-col items-center">
                        📷 Sin imagen
                      </span>
                    )}
                    <span
                      className={`absolute top-2 left-2 text-xs font-semibold px-3 py-1 rounded-full ${auction.status === "Activa"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        }`}
                    >
                      {auction.status}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="p-5 space-y-2">
                    <h2 className="font-bold text-lg text-blue-400 truncate">
                      {auction.title || `${auction.brand} ${auction.model} ${auction.years}`}
                    </h2>


                    {auction.history_type === "Creada" ? (
                      <p className="text-green-400 font-bold">
                        🚗 Subasta creada por ti
                      </p>
                    ) : (
                      <p className="text-yellow-400 font-bold">
                        💰 Tu puja más alta: ${
                          Number(auction.bid_amount).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        }
                      </p>
                    )}


                    <button
                      onClick={() => navigate(`/auction/${auction.id_auctions}`)}
                      className="mt-3 w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-2 rounded-md hover:shadow-[0_0_10px_#2563eb] transition"
                    >
                      Ver subasta
                    </button>

                    <div className="text-xs text-gray-400 mt-3 border-t border-gray-700 pt-2 flex items-center gap-1">
                      📅 {new Date(auction.end_time).toLocaleString("es-GT")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
