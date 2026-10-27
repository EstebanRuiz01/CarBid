import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaUserPlus, FaLock, FaUserAlt, FaCarSide } from "react-icons/fa";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password || !confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, llena todos los campos para continuar.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Contraseñas no coinciden",
        text: "Asegúrate de que ambas contraseñas sean iguales.",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    try {
      await axios.post("http://localhost:4000/api/users/register", {
        username,
        password,
      });

      Swal.fire({
        icon: "success",
        title: "¡Registro exitoso! 🎉",
        text: "Tu cuenta ha sido creada correctamente.",
        showConfirmButton: false,
        timer: 2000,
      });

      setTimeout(() => (window.location.href = "/login"), 2000);
    } catch (error) {
      console.error("Error al registrar:", error);
      Swal.fire({
        icon: "error",
        title: "Error al registrar",
        text: "Ocurrió un problema al registrar tu usuario. Intenta nuevamente.",
        confirmButtonColor: "#ef4444",
      });
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
            Registro
          </h1>
          <p className="text-gray-400 text-sm">
            Únete a <span className="text-blue-400">CarBid</span> y comienza a pujar.
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

          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2 rounded-md font-semibold uppercase tracking-wide hover:scale-105 transition-transform duration-200"
          >
            Registrar
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = "/login")}
            className="w-full border border-gray-500 text-gray-300 py-2 rounded-md font-semibold uppercase tracking-wide hover:bg-gray-800 hover:text-white transition"
          >
            Iniciar sesión
          </button>
        </form>

        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>🚗 Pujar nunca fue tan emocionante. ¡Bienvenido a CarBid!</p>
        </div>
      </div>
    </div>
  );
}
