import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Auction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [newBid, setNewBid] = useState("");
  const [socket, setSocket] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // ⏰ Calcular tiempo restante
  const calculateTimeLeft = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    if (diff <= 0) return "00:00:00";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  // 📦 Cargar datos iniciales de la subasta
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:4000/api/auctions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuction(res.data);
        setBids(res.data.bids || []);
      } catch (err) {
        console.error("❌ Error al cargar subasta:", err);
      }
    };

    fetchAuction();

    // ⏱️ Actualizar tiempo restante cada segundo
    const interval = setInterval(() => {
      if (auction?.end_time) {
        setTimeLeft(calculateTimeLeft(auction.end_time));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [id, auction?.end_time]);


  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const res = await axios.get(
          "http://localhost:4000/api/users/information",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCurrentUser(res.data);

      } catch (err) {
        console.error("Error al obtener el usuario:", err);
      }
    };

    fetchCurrentUser();
  }, []);


  // ⚡ Conectar socket
  useEffect(() => {
    const token = localStorage.getItem("token");
    const newSocket = io("http://localhost:4000", { auth: { token } });
    setSocket(newSocket);

    // 📈 Cuando llega una actualización de pujas
    newSocket.on("updateBids", (data) => {
      if (data.id_auctions === parseInt(id)) {
        // 🔹 Actualiza los datos principales
        setAuction((prev) => ({
          ...prev,
          highestBid: data.highestBid,
          highestBidUser: data.highestBidUser,
        }));

        // 🔹 Agrega la nueva puja en tiempo real al historial
        setBids((prev) => {
          const exists = prev.some(
            (b) =>
              b.username === data.highestBidUser &&
              parseFloat(b.bid_amount) === parseFloat(data.highestBid)
          );
          if (exists) return prev;

          const newBid = {
            username: data.highestBidUser,
            bid_amount: data.highestBid,
          };

          return [newBid, ...prev];
        });
      }
    });

    // ⚠️ Cuando llega un error de puja
    newSocket.on("errorBid", (data) => {
      toast.error(data.message, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    });

    return () => newSocket.disconnect();
  }, [id]);

  // 🧮 Enviar nueva puja
  const handleBid = () => {
    if (!newBid || isNaN(newBid) || parseFloat(newBid) <= 0) {
      toast.warning("⚠️ Ingresa un monto válido.", { theme: "colored" });
      return;
    }

    socket.emit("newBid", {
      token: localStorage.getItem("token"),
      id_auctions: parseInt(id),
      bid_amount: parseFloat(newBid),
    });

    setNewBid("");
  };

  // ⏳ Pantalla de carga
  if (!auction)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 bg-black">
        Cargando detalles de la subasta...
      </div>
    );

  // 🎨 Render principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-[#0a0f25] to-gray-900 text-white py-8 px-6">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
      >
        ← Volver a subastas
      </button>

      <div className="max-w-6xl mx-auto bg-gray-900/80 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 📷 Imagen */}
          <div className="flex-1">
            <div className="relative rounded-xl overflow-hidden shadow-md">
              {auction.image_data ? (
                <img
                  src={auction.image_data}
                  alt={auction.title}
                  className="w-full h-[400px] object-cover"
                />
              ) : (
                <div className="h-[400px] flex items-center justify-center bg-gray-800 text-gray-400">
                  📷 Sin imagen
                </div>
              )}


              {/* Estado de la subasta */}
              {(() => {
                const ended = new Date(auction.end_time).getTime() <= Date.now();
                const status = ended
                  ? "closed"
                  : Number(auction.id_flags) === 3
                    ? "cancelled"
                    : Number(auction.id_flags) === 2
                      ? "closed"
                      : "active";

                const styles = {
                  active: "bg-green-500",
                  closed: "bg-gray-500",
                  cancelled: "bg-red-500",
                };

                const labels = {
                  active: "🟢 Subasta activa",
                  closed: "⚫ Subasta cerrada",
                  cancelled: "🔴 Subasta cancelada",
                };

                return (
                  <div
                    className={`absolute top-2 left-2 text-xs text-white px-3 py-1 rounded-full ${styles[status]}`}
                  >
                    {labels[status]}
                  </div>
                );
              })()}


              {/* Tiempo restante */}
              <div className="absolute top-2 right-2 bg-yellow-500 text-xs text-black px-3 py-1 rounded-full">
                ⏱️ Tiempo restante: {timeLeft}
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-4 text-blue-400">
              {auction.title}
            </h2>
            <p className="text-gray-400 italic">{auction.description}</p>
          </div>

          {/* 🧾 Detalles */}
          <div className="w-full lg:w-1/3 bg-gray-800/70 p-5 rounded-xl shadow-inner space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              ⚙️ Detalles de la Subasta
            </h3>
            <p><b>Marca:</b> {auction.brand}</p>
            <p><b>Modelo:</b> {auction.model}</p>
            <p><b>Año:</b> {auction.years}</p>
            <p>
              <b>Precio base:</b>{" "}
              <span className="text-yellow-400">
                ${parseFloat(auction.base_price).toLocaleString("en-US")}
              </span>
            </p>
            <p>
              <b>Mayor puja actual:</b>{" "}
              <span className="text-green-400">
                {auction.highestBidUser
                  ? `${auction.highestBidUser} - $${parseFloat(
                    auction.highestBid
                  ).toLocaleString("en-US")}`
                  : "Sin pujas aún"}
              </span>
            </p>

            <p className="text-xs text-gray-400 mt-2">
              🕒 Inicio: {new Date(auction.start_time).toLocaleString("es-GT")}
              <br />
              🔚 Fin: {new Date(auction.end_time).toLocaleString("es-GT")}
            </p>

            <input
              type="number"
              placeholder="Ingresa tu puja"
              value={newBid}
              onChange={(e) => setNewBid(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2 mt-4 outline-none focus:ring-2 focus:ring-blue-500"
            />


            {currentUser?.user?.id &&
              Number(currentUser.user.id) === Number(auction.id_users) &&
              Number(auction.id_flags) === 1 &&
              new Date(auction.end_time).getTime() > Date.now() && (
                <button
                  onClick={async () => {
                    const confirmed = window.confirm(
                      "¿Estás seguro de que deseas cancelar esta subasta?"
                    );

                    if (!confirmed) return;

                    try {
                      const token = localStorage.getItem("token");

                      await axios.patch(
                        `http://localhost:4000/api/auctions/${auction.id_auctions}/cancel`,
                        {},
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );

                      setAuction((prev) => ({
                        ...prev,
                        id_flags: 3,
                        flagname: "cancelled",
                      }));

                      toast.success("Subasta cancelada correctamente.");
                    } catch (err) {
                      toast.error(
                        err.response?.data?.error || "No se pudo cancelar la subasta."
                      );
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Cancelar subasta
                </button>
              )}


            <button
              onClick={handleBid}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-800 py-2 rounded-md hover:shadow-[0_0_10px_#2563eb] transition"
            >
              Pujar ahora
            </button>
          </div>
        </div>

        {/* 📜 Historial de pujas */}
        <div className="mt-8 bg-gray-900/60 rounded-xl p-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
            🏆 Historial de Pujas
          </h3>
          {bids.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin pujas registradas.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th>Usuario</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((b, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td>{b.username}</td>
                    <td className="text-yellow-400 font-semibold">
                      ${parseFloat(b.bid_amount).toLocaleString("en-US")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
