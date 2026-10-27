import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaUserAlt, FaLock, FaCarSide } from "react-icons/fa";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos para continuar.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    try {
      const res = await axios.post("http://localhost:4000/api/users/login", {
        username,
        password,
      });

      if (res.data.message === "Login exitoso") {
        Swal.fire({
          icon: "success",
          title: "Bienvenido 🚘",
          text: `Hola ${res.data.user.username}, ¡listo para ganar la próxima subasta!`,
          timer: 2000,
          showConfirmButton: false,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        setTimeout(() => (window.location.href = "/"), 2000);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Credenciales incorrectas",
          text: "Verifica tu usuario o contraseña.",
          confirmButtonColor: "#ef4444",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor. Intenta más tarde.",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/imagen/coche-fondo.png')",
      }}
    >
      <div className="bg-black/70 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="flex justify-center text-5xl text-blue-400 mb-2">
            <FaCarSide />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide uppercase">
            Iniciar Sesión
          </h1>
          <p className="text-gray-400 text-sm">
            Bienvenido a <span className="text-blue-400">CarBid</span>, donde cada puja cuenta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <FaUserAlt className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2 rounded-md font-semibold uppercase tracking-wide hover:scale-105 transition-transform duration-200"
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = "/register")}
            className="w-full border border-gray-500 text-gray-300 py-2 rounded-md font-semibold uppercase tracking-wide hover:bg-gray-800 hover:text-white transition"
          >
            Registrarse
          </button>
        </form>

        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>
            Participa, puja y gana tu próximo vehículo de ensueño.
          </p>
        </div>
      </div>
    </div>
  );
}
