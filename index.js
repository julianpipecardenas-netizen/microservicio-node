const express = require("express");
const fetch = require("node-fetch");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

function headersBase() {
    return {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
    };
}

/**
 * @openapi
 * /comentarios:
 *   post:
 *     summary: Insertar un comentario
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_cliente:
 *                 type: string
 *               comentario:
 *                 type: string
 *               calificacion:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Comentario creado
 *       400:
 *         description: Faltan datos obligatorios
 */
app.post("/comentarios", async (req, res) => {
    const { nombre_cliente, comentario, calificacion } = req.body;
    if (!nombre_cliente || !comentario) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
    }
    const r = await fetch(`${SUPABASE_URL}/rest/v1/comentarios`, {
        method: "POST",
        headers: headersBase(),
        body: JSON.stringify({ nombre_cliente, comentario, calificacion: calificacion || 5 }),
    });
    const data = await r.json();
    res.status(201).json(data);
});

/**
 * @openapi
 * /comentarios/{id}:
 *   put:
 *     summary: Actualizar un comentario
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comentario actualizado
 */
app.put("/comentarios/:id", async (req, res) => {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/comentarios?id=eq.${req.params.id}`, {
        method: "PATCH",
        headers: headersBase(),
        body: JSON.stringify(req.body),
    });
    const data = await r.json();
    res.json(data);
});

/**
 * @openapi
 * /comentarios/{id}:
 *   delete:
 *     summary: Eliminar un comentario
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Comentario eliminado
 */
app.delete("/comentarios/:id", async (req, res) => {
    await fetch(`${SUPABASE_URL}/rest/v1/comentarios?id=eq.${req.params.id}`, {
        method: "DELETE",
        headers: headersBase(),
    });
    res.status(204).send();
});

const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: { title: "Microservicio Node - Comentarios", version: "1.0.0" },
    },
    apis: ["./index.js"],
});
app.use("/apidocs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Corriendo en puerto ${PORT}`));