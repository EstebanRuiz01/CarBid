import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const [socket, setSocket] = useState(null);
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      return;
    }

    const newSocket = io("http://localhost:4000", {
      auth: { token },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🔌 Conectado al servidor de notificaciones");
    });

    newSocket.on("newNotification", (data) => {
      const message = data.message || "";
      let backgroundColor = "#2563eb";
      let icon = "🔔";
      let toastType = "info";

      if (message.includes("🎉")) {
        backgroundColor = "#16a34a";
        icon = "🏆";
        toastType = "success";
      } else if (message.includes("😢")) {
        backgroundColor = "#dc2626";
        icon = "💔";
        toastType = "error";
      }

      toast[toastType](`${icon} ${message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        style: {
          backgroundColor,
          color: "#fff",
          fontWeight: "bold",
          fontSize: "0.95rem",
        },
      });

      setUnread((prev) => prev + 1);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [token]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleCreateAuction = () => {
    closeMenu();
    navigate("/create-auction");
  };

  const handleNotifications = () => {
    setUnread(0);
    closeMenu();
    navigate("/notifications");
  };

  const handleHome = () => {
    closeMenu();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `block rounded-lg px-4 py-3 md:px-0 md:py-2 font-medium transition-colors ${isActive
      ? "bg-blue-800 text-yellow-300 md:bg-transparent md:text-yellow-300"
      : "text-white hover:bg-blue-800 hover:text-yellow-300 md:hover:bg-transparent"
    }`;

  return (
    <>
      <nav className="relative z-50 bg-blue-900 shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Barra principal */}
          <div className="flex min-h-16 items-center justify-between gap-4">
            {/* Logo */}
            <button
              type="button"
              onClick={handleHome}
              className="shrink-0 text-2xl font-bold text-white transition-colors hover:text-yellow-300"
              aria-label="Ir al inicio de CarBid"
            >
              CarBid
            </button>

            {/* Opciones para escritorio */}
            <div className="hidden md:flex md:items-center md:gap-5 lg:gap-7">
              {isLoggedIn ? (
                <>
                  <button
                    type="button"
                    onClick={handleCreateAuction}
                    className="whitespace-nowrap rounded-lg px-4 py-2 font-medium text-white transition-colors hover"
                  >
                    Publicar Subasta
                  </button>

                  <NavLink to="/history" className={linkClass}>
                    Historial
                  </NavLink>

                  <button
                    type="button"
                    onClick={handleNotifications}
                    className="relative rounded-lg p-2 text-xl text-white transition-colors hover:bg-blue-800 hover:text-yellow-300"
                    aria-label={`Notificaciones${unread > 0 ? `, ${unread} sin leer` : ""
                      }`}
                  >
                    🔔
                    {unread > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="whitespace-nowrap rounded-lg px-3 py-2 font-medium text-white transition-colors hover:bg-blue-800 hover:text-yellow-300"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <NavLink to="/login" className={linkClass}>
                  Iniciar sesión
                </NavLink>
              )}
            </div>

            {/* Botón hamburguesa para móvil */}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-white transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-yellow-300 md:hidden"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              {menuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Menú desplegable para móvil */}
          {menuOpen && (
            <div
              id="mobile-navigation"
              className="border-t border-blue-800 py-3 md:hidden"
            >
              <ul className="flex flex-col gap-2">
                {isLoggedIn ? (
                  <>
                    <li>
                      <button
                        type="button"
                        onClick={handleCreateAuction}
                        className="w-full rounded-lg px-4 py-3 text-left font-medium text-white transition-colors hover"
                      >
                        Publicar Subasta
                      </button>
                    </li>

                    <li>
                      <NavLink
                        to="/history"
                        onClick={closeMenu}
                        className={linkClass}
                      >
                        Historial
                      </NavLink>
                    </li>

                    <li>
                      <button
                        type="button"
                        onClick={handleNotifications}
                        className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-medium text-white transition-colors hover:bg-blue-800 hover:text-yellow-300"
                      >
                        <span>Notificaciones 🔔</span>
                        {unread > 0 && (
                          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs text-white">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                      </button>
                    </li>

                    <li>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded-lg px-4 py-3 text-left font-medium text-white transition-colors hover:bg-blue-800 hover:text-yellow-300"
                      >
                        Cerrar sesión
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <NavLink
                      to="/login"
                      onClick={closeMenu}
                      className={linkClass}
                    >
                      Iniciar sesión
                    </NavLink>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Notificaciones emergentes */}
      <ToastContainer />
    </>
  );
};

export default Navbar;