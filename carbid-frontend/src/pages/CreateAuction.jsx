import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaCarSide, FaCalendarAlt, FaImage } from "react-icons/fa";

export default function CreateAuction() {
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    model: "",
    years: "",
    descriptions: "",
    base_price: "",
    start_time: "",
    end_time: "",
    image: null,
  });

  const navigate = useNavigate(); // ✅ para redirigir después de publicar

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Sesión requerida",
        text: "Debes iniciar sesión para publicar una subasta.",
        confirmButtonColor: "#2563eb",
        background: "#111827",
        color: "#fff",
      });
      return;
    }

    try {
      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }

      const res = await axios.post("http://localhost:4000/api/auctions", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 201 || res.data.message?.includes("Subasta")) {
        // ✅ Notificación moderna de éxito
        Swal.fire({
          icon: "success",
          title: "¡Subasta publicada con éxito! 🚗",
          text: "Tu vehículo ya está disponible para recibir ofertas.",
          background: "#111827",
          color: "#fff",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });

        // 🔄 Limpia el formulario
        setFormData({
          title: "",
          brand: "",
          model: "",
          years: "",
          descriptions: "",
          base_price: "",
          start_time: "",
          end_time: "",
          image: null,
        });

        // ⏳ Redirige automáticamente a Explore
        setTimeout(() => {
          navigate("/"); // usa react-router-dom
        }, 2000);
      }
    } catch (error) {
      console.error("❌ Error al crear subasta:", error);
      Swal.fire({
        icon: "error",
        title: "Error al publicar",
        text: "No se pudo crear la subasta. Intenta nuevamente.",
        confirmButtonColor: "#ef4444",
        background: "#111827",
        color: "#fff",
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage: "url('/imagen/GTR.jpg')", // 🎯 mismo fondo que login/register
      }}
    >
      <div className="bg-black/70 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="flex justify-center text-5xl text-blue-400 mb-2">
            <FaCarSide />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide uppercase">
            Publicar Subasta
          </h1>
          <p className="text-gray-400 text-sm">
            Completa los detalles de tu vehículo para comenzar la puja.
          </p>
        </div>

        {/* Formulario principal */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Título"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="brand"
              placeholder="Marca"
              value={formData.brand}
              onChange={handleChange}
              className="p-2 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
              required
            />
            <input
              type="text"
              name="model"
              placeholder="Modelo"
              value={formData.model}
              onChange={handleChange}
              className="p-2 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="years"
              placeholder="Año"
              value={formData.years}
              onChange={handleChange}
              className="p-2 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
              required
            />
            <input
              type="number"
              name="base_price"
              placeholder="Precio base"
              value={formData.base_price}
              onChange={handleChange}
              className="p-2 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
              required
            />
          </div>

          <textarea
            name="descriptions"
            placeholder="Descripción"
            value={formData.descriptions}
            onChange={handleChange}
            className="w-full p-2 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
            rows="3"
          ></textarea>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm flex items-center gap-2">
                <FaCalendarAlt /> Inicio
              </label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full p-2 mt-1 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm flex items-center gap-2">
                <FaCalendarAlt /> Fin
              </label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="w-full p-2 mt-1 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm flex items-center gap-2 mb-1">
              <FaImage /> Imagen del vehículo
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full bg-gray-800 text-gray-300 p-2 rounded-md cursor-pointer focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2 rounded-md font-semibold uppercase tracking-wide hover:shadow-[0_0_10px_#2563eb] transition"
          >
            Publicar Subasta
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs mt-6">
          🚘 Tu vehículo podría ser el próximo en hacer historia en CarBid.
        </p>
      </div>
    </div>
  );
}
