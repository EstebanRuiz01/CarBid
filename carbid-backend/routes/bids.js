import express from "express";
import { db } from "../db.js";
import { verifyToken } from "./users.js"; // ✅ Importación correcta

const router = express.Router();

// ============================================================
// 🟢 Crear una nueva puja (validada, segura y atómica)
// ============================================================
router.post("/", verifyToken, async (req, res) => {
  const { id_auctions, bid_amount } = req.body;
  const userId = req.user.id; // ✅ viene del token JWT

  try {
    // 1️⃣ Verificar si la subasta existe y está activa
    const [auction] = await db.query(
      `SELECT end_time, base_price FROM auctions WHERE id_auctions = ?`,
      [id_auctions]
    );

    if (auction.length === 0) {
      return res.status(404).json({ message: "Subasta no encontrada." });
    }

    const endTime = new Date(auction[0].end_time);
    const now = new Date();

    if (now >= endTime) {
      return res.status(400).json({
        message: "⛔ La subasta ya ha finalizado. No se pueden realizar más pujas.",
      });
    }

    // 2️⃣ Registrar la puja si es válida (mayor que la actual)
    const [result] = await db.query(
      `
      INSERT INTO bids (id_auctions, id_users, bid_amount)
      SELECT ?, ?, ?
      FROM auctions a
      WHERE a.id_auctions = ?
        AND UTC_TIMESTAMP() < a.end_time
        AND ? > GREATEST(
              a.base_price,
              COALESCE((SELECT MAX(bid_amount) FROM bids WHERE id_auctions = a.id_auctions), 0)
            );
      `,
      [id_auctions, userId, bid_amount, id_auctions, bid_amount]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "⛔ Puja inválida: monto menor o igual a la actual, o subasta cerrada.",
      });
    }

    res.status(201).json({
      message: "✅ Puja registrada correctamente",
      id: result.insertId,
    });
  } catch (err) {
    console.error("❌ Error al crear puja:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// 📜 Historial de pujas del usuario autenticado
// ============================================================

router.get("/history", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT
        a.id_auctions,
        a.id_users AS owner_id,
        a.title,
        a.brand,
        a.model,
        a.years,
        a.image_data,
        MAX(b.bid_amount) AS bid_amount,
        a.start_time,
        a.end_time,
        f.flagname,
        CASE
          WHEN a.id_users = ? THEN 'Creada'
          ELSE 'Puja realizada'
        END AS history_type,
        CASE
          WHEN f.flagname = 'cancelled' THEN 'Cancelada'
          WHEN f.flagname = 'closed' OR NOW() >= a.end_time THEN 'Finalizada'
          ELSE 'Activa'
        END AS status
      FROM auctions a
      LEFT JOIN bids b
        ON b.id_auctions = a.id_auctions
        AND b.id_users = ?
      LEFT JOIN flags f
        ON f.id_flags = a.id_flags
      WHERE
        a.id_users = ?
        OR EXISTS (
          SELECT 1
          FROM bids user_bids
          WHERE user_bids.id_auctions = a.id_auctions
            AND user_bids.id_users = ?
        )
      GROUP BY
        a.id_auctions,
        a.id_users,
        a.title,
        a.brand,
        a.model,
        a.years,
        a.image_data,
        a.start_time,
        a.end_time,
        f.flagname,
        a.id_flags
      ORDER BY a.end_time DESC
      `,
      [userId, userId, userId, userId]
    );

    const history = rows.map((auction) => ({
      ...auction,
      image_data: Buffer.isBuffer(auction.image_data)
        ? `data:image/jpeg;base64,${auction.image_data.toString("base64")}`
        : auction.image_data,
    }));

    res.json(history);
  } catch (err) {
    console.error("Error al obtener historial:", err);
    res.status(500).json({
      message: "Error al obtener historial de subastas",
    });
  }
});


export default router;
