import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBell, FaCheckCircle, FaClock, FaCarSide } from "react-icons/fa";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("⚠️ Debes iniciar sesión para ver tus notificaciones.");
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:4000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setNotifications(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar notificaciones:", err);
        setError("No se pudieron obtener las notificaciones.");
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/90 text-white">
        <p className="text-gray-400 text-lg">Cargando notificaciones...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/90 text-white">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );

  return (
    <div
      className="min-h-screen bg-cover bg-center py-10 flex flex-col items-center"
      style={{
        backgroundImage: "url('/imagen/coche-fondo.jpg')",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="bg-black/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 p-6 w-11/12 max-w-3xl animate-fadeIn">
        <h2 className="text-3xl font-extrabold text-white mb-6 text-center flex items-center justify-center gap-2 uppercase tracking-wide">
          <FaBell className="text-yellow-400 text-3xl" /> Tus Notificaciones
        </h2>

        {notifications.length === 0 ? (
          <div className="bg-gray-800/70 text-gray-400 text-center py-8 rounded-lg shadow-inner">
            <FaClock className="text-4xl mx-auto mb-2 text-gray-500" />
            <p>No tienes notificaciones aún.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {notifications.map((n) => (
              <li
                key={n.id_notification}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-800/70 p-4 rounded-lg border-l-4 transition-all duration-300 ${
                  n.is_read ? "border-gray-600" : "border-blue-500 shadow-lg"
                } hover:scale-[1.02]`}
              >
                <div className="flex items-start gap-3">
                  <FaCarSide
                    className={`text-2xl ${
                      n.is_read ? "text-gray-500" : "text-blue-400"
                    }`}
                  />
                  <div>
                    <p
                      className={`${
                        n.is_read
                          ? "text-gray-400"
                          : "text-white font-semibold"
                      }`}
                    >
                      {n.message}
                    </p>
                    <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                      <FaClock className="text-blue-400" />
                      {new Date(n.created_at).toLocaleString("es-GT")}
                    </p>
                  </div>
                </div>

                {!n.is_read && (
                  <FaCheckCircle className="text-green-400 text-2xl mt-2 sm:mt-0" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
