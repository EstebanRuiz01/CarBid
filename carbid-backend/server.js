import express from "express";
import cors from "cors";
import { db } from "./db.js";
import userRoutes from "./routes/users.js";
import auctionRoutes from "./routes/auctions.js";
import bidRoutes from "./routes/bids.js";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cron from "node-cron"
import notificationRoutes from "./routes/notifications.js";

// ======================
//  Verificar subastas finalizadas cada minuto
// ======================
cron.schedule("* * * * *", async () => {
  try {
    console.log("⏱️ Ejecutando cron de verificación de subastas...");

    // 1️⃣ Buscar subastas finalizadas que aún no tengan notificaciones registradas
    const [endedAuctions] = await db.query(`
      SELECT a.id_auctions
      FROM auctions a
      WHERE a.end_time <= NOW()
      AND a.id_auctions NOT IN (
        SELECT n.id_auction FROM notifications n
      )
    `);

    if (endedAuctions.length === 0) {
      console.log("ℹ️ No hay subastas finalizadas pendientes de notificación.");
      return;
    }

    for (const auction of endedAuctions) {
      console.log(`⚙️ Procesando subasta #${auction.id_auctions}...`);

      // Obtener ganador
      const [winner] = await db.query(`
        SELECT b.id_users, u.username, b.bid_amount
        FROM bids b
        JOIN users u ON b.id_users = u.id_users
        WHERE b.id_auctions = ?
        ORDER BY b.bid_amount DESC, b.bid_time ASC
        LIMIT 1
      `, [auction.id_auctions]);

      if (winner.length === 0) {
        console.log(`⚠️ Subasta #${auction.id_auctions} no tiene pujas.`);
        continue;
      }

      const userIdWinner = winner[0].id_users;
      const usernameWinner = winner[0].username;
      const bidAmountWinner = winner[0].bid_amount;

      // Crear notificación para el ganador
      const messageWinner = `🎉 ¡Felicidades ${usernameWinner}! Ganaste la subasta #${auction.id_auctions} con una puja de $${bidAmountWinner}.`;

      await db.query(
        "INSERT INTO notifications (id_user, id_auction, message) VALUES (?, ?, ?)",
        [userIdWinner, auction.id_auctions, messageWinner]
      );

      io.to(`user_${userIdWinner}`).emit("newNotification", {
        message: messageWinner,
        auctionId: auction.id_auctions,
      });

      console.log(`✅ Notificación enviada al ganador: ${usernameWinner}`);

      // Obtener perdedores
      const [losers] = await db.query(`
        SELECT DISTINCT b.id_users, u.username
        FROM bids b
        JOIN users u ON b.id_users = u.id_users
        WHERE b.id_auctions = ? AND b.id_users != ?
      `, [auction.id_auctions, userIdWinner]);

      if (losers.length === 0) {
        console.log(`ℹ️ No hay perdedores en la subasta #${auction.id_auctions}`);
        continue;
      }

      // Enviar notificación a perdedores
      for (const loser of losers) {
        const messageLoser = `😢 Hola ${loser.username}, la subasta #${auction.id_auctions} finalizó. 
        El ganador fue ${usernameWinner} con una puja de $${bidAmountWinner}. ¡Mejor suerte en la próxima!`;

        await db.query(
          "INSERT INTO notifications (id_user, id_auction, message) VALUES (?, ?, ?)",
          [loser.id_users, auction.id_auctions, messageLoser]
        );

        io.to(`user_${loser.id_users}`).emit("newNotification", {
          message: messageLoser,
          auctionId: auction.id_auctions,
        });

        console.log(`📩 Notificación enviada al perdedor: ${loser.username}`);
      }
    }
  } catch (err) {
    console.error("❌ Error en cron de verificación:", err.message);
  }
});



dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;
const secret = process.env.JWT_SECRET;

// ======================
//  Configuración base
// ======================
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ======================
//  Inicializar Socket.IO
// ======================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// ======================
//  Rutas API
// ======================
app.use("/api/users", userRoutes);
app.use("/api/auctions", auctionRoutes(io));
app.use("/api/bids", bidRoutes);
app.use("/api/notifications", notificationRoutes);

const [rows] = await db.query("SELECT NOW() AS hora_servidor");
console.log("🕒 Hora actual en MySQL:", rows[0].hora_servidor);
// ======================
//  Probar conexión a la BD
// ======================
app.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT NOW() AS time");
    res.json({ status: "Servidor funcionando", db_time: rows[0].time });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================
//  Middleware de autenticación de Socket.IO
// ======================
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    // Si no hay token, permitimos conexión como visitante
    if (!token) {
      console.log("⚠️ Cliente conectado sin token (modo visitante)");
      socket.username = "visitante";
      return next();
    }

    // Validar token
    const decoded = jwt.verify(token, secret);
    socket.userId = decoded.id;
    socket.username = decoded.username;
    socket.join(`user_${decoded.id}`);
    console.log(`✅ Usuario autenticado en WebSocket: ${socket.username}`);
    next();
  } catch (err) {
    console.error("❌ Token inválido:", err.message);
    return next(new Error("Token inválido"));
  }
});


// ======================
//  Conexión de WebSocket
// ======================
io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado:", socket.id, "| Usuario:", socket.username);

  socket.on("newBid", async (bidData) => {
    console.log("📩 NUEVA PUJA RECIBIDA:", bidData);
    try {
      const { token, id_auctions, bid_amount } = bidData;

      if (!token) {
        socket.emit("errorBid", { message: "Token requerido" });
        return;
      }

      let decoded;
      try {
        decoded = jwt.verify(token, secret);
      } catch {
        socket.emit("errorBid", { message: "Token inválido o expirado" });
        return;
      }

      const userId = decoded.id;
      const auctionId = parseInt(id_auctions); // 👈 fuerza el tipo número
      const amount = parseFloat(bid_amount);

      if (!auctionId || isNaN(amount) || amount <= 0) {
        socket.emit("errorBid", { message: "Datos de puja inválidos." });
        return;
      }


      console.log(`💬 Puja recibida: usuario ${decoded.username}, subasta ${auctionId}, monto $${amount}`);

      // 🔒 Verificar que la subasta exista y no haya terminado
      const [auctions] = await db.query(
        `SELECT end_time, id_flags, id_users
        FROM auctions
        WHERE id_auctions = ?`,
        [auctionId]
      );

      if (auctions.length === 0) {
        socket.emit("errorBid", {
          message: "La subasta no existe.",
        });
        return;
      }

      const auction = auctions[0];

      if (new Date(auction.end_time).getTime() <= Date.now()) {
        socket.emit("errorBid", {
          message: "Esta subasta ya ha terminado. No se aceptan más pujas.",
        });
        return;
      }

      if (Number(auction.id_flags) !== 1) {
        socket.emit("errorBid", {
          message: "Esta subasta no está activa y no acepta pujas.",
        });
        return;
      }

      // El propietario no puede pujar por su propia subasta
      if (Number(auction.id_users) === Number(userId)) {
        socket.emit("errorBid", {
          message: "No puedes pujar por tu propia subasta.",
        });
        return;
      }


      // 🔍 Obtener la puja más alta actual
      const [currentHighest] = await db.query(
        `SELECT bid_amount
      FROM bids
      WHERE id_auctions = ?
      ORDER BY bid_amount DESC
      LIMIT 1`,
        [auctionId]
      );


      // ⚠️ Validación: si ya hay pujas, no permitir menor o igual
      if (currentHighest.length > 0 && amount <= currentHighest[0].bid_amount) {
        socket.emit("errorBid", {
          message: `Tu puja debe ser mayor a $${currentHighest[0].bid_amount}`,
        });
        return;
      }

      // 💾 Insertar nueva puja
      await db.query("INSERT INTO bids (id_auctions, id_users, bid_amount) VALUES (?, ?, ?)",
        [auctionId, userId, amount]
      );

      console.log(`✅ Puja registrada correctamente en la subasta #${auctionId}`);

      // 📈 Obtener la nueva puja más alta
      const [highest] = await db.query(
        `SELECT b.bid_amount, u.username 
       FROM bids b
       JOIN users u ON b.id_users = u.id_users
       WHERE b.id_auctions = ?
       ORDER BY b.bid_amount DESC, b.bid_time ASC
       LIMIT 1`,
        [auctionId]
      );

      const newHighest = {
        id_auctions: auctionId,
        highestBid: highest[0]?.bid_amount || amount,
        highestBidUser: highest[0]?.username || decoded.username,
      };

      // 🔄 Emitir actualización
      io.emit("updateBids", newHighest);
    } catch (error) {
      console.error("❌ Error al registrar la puja:", error);
      socket.emit("errorBid", { message: "Error interno al registrar la puja" });
    }
  });


  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });
});

// ======================
//  Iniciar servidor
// ======================
server.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
