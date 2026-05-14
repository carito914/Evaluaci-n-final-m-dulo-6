import express from "express";
import { engine } from "express-handlebars";
import fs from "fs/promises";  // CAMBIADO: usar fs.promises
import path from "path";

const app = express();
const __dirname = path.resolve();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Configurar Handlebars
app.engine(
  "handlebars",
  engine({
    extname: "handlebars",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
  })
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// ============ FUNCIONES PARA MANEJAR JSON ============

// Función para leer mascotas (con manejo de errores)
const leerMascotas = async () => {
  try {
    const data = await fs.readFile("mascotas.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    // Si el archivo no existe, retornar array vacío
    return [];
  }
};

// Función para guardar mascotas
const guardarMascotas = async (data) => {
  await fs.writeFile("mascotas.json", JSON.stringify(data, null, 2));
};

// Función para generar nuevo ID automáticamente
const generarNuevoId = (mascotas) => {
  if (mascotas.length === 0) return 1;
  const maxId = Math.max(...mascotas.map(m => m.id));
  return maxId + 1;
};

//  RUTAS DE VISTAS 

app.get("/", async (req, res) => {
  const mascotas = await leerMascotas();
  res.render("home", { mascotas });
});

app.get("/agregar", (req, res) => {
  res.render("agregar");
});

app.get("/buscar", (req, res) => {
  res.render("buscar");
});

app.get("/eliminar", (req, res) => {
  res.render("eliminar");
});

//  API REST 

// GET sin parámetros → todas las mascotas
// GET con parámetro nombre → mascota con ese nombre
// GET con parámetro rut → todas las mascotas de ese rut
app.get("/api/mascotas", async (req, res) => {
  const { nombre, rut } = req.query;
  const mascotas = await leerMascotas();

  // Buscar por nombre (query string)
  if (nombre) {
    const mascota = mascotas.find(
      (m) => m.nombre.toLowerCase() === nombre.toLowerCase()
    );
    if (!mascota) {
      return res.status(404).json({ error: "Mascota no encontrada" });
    }
    return res.json(mascota);
  }

  // Buscar por rut (query string)
  if (rut) {
    const filtradas = mascotas.filter((m) => m.rut === rut);
    return res.json(filtradas);
  }

  // Sin parámetros: devolver todas
  res.json(mascotas);
});

// POST agregar mascota (con ID automático)
app.post("/api/mascotas", async (req, res) => {
  const { nombre, rut } = req.body;

  if (!nombre || !rut) {
    return res.status(400).json({ error: "Faltan datos: nombre y rut son requeridos" });
  }

  const mascotas = await leerMascotas();
  
  // Verificar si ya existe la misma mascota para el mismo dueño
  const existe = mascotas.some(
    (m) => m.nombre.toLowerCase() === nombre.toLowerCase() && m.rut === rut
  );
  
  if (existe) {
    return res.status(400).json({ error: "Esta mascota ya está registrada para este dueño" });
  }

  // Crear nueva mascota con ID autoincremental
  const nuevaMascota = {
    id: generarNuevoId(mascotas),
    nombre,
    rut
  };
  
  mascotas.push(nuevaMascota);
  await guardarMascotas(mascotas);

  res.status(201).json({ 
    mensaje: "Mascota agregada correctamente",
    mascota: nuevaMascota 
  });
});

// DELETE con parámetro nombre → elimina la mascota con ese nombre
// DELETE con parámetro rut → elimina todas las mascotas de ese rut
app.delete("/api/mascotas", async (req, res) => {
  const { nombre, rut } = req.query;
  let mascotas = await leerMascotas();

  // Eliminar por nombre
  if (nombre) {
    const nuevas = mascotas.filter(
      (m) => m.nombre.toLowerCase() !== nombre.toLowerCase()
    );
    
    if (nuevas.length === mascotas.length) {
      return res.status(404).json({ error: "Mascota no encontrada" });
    }
    
    await guardarMascotas(nuevas);
    return res.json({ mensaje: "Mascota eliminada correctamente" });
  }

  // Eliminar por rut (todas las mascotas de ese dueño)
  if (rut) {
    const nuevas = mascotas.filter((m) => m.rut !== rut);
    const eliminadas = mascotas.length - nuevas.length;
    
    if (eliminadas === 0) {
      return res.status(404).json({ error: "No se encontraron mascotas con ese RUT" });
    }
    
    await guardarMascotas(nuevas);
    return res.json({ 
      mensaje: `Se eliminaron ${eliminadas} mascota(s) del dueño con RUT ${rut}`,
      eliminadas: eliminadas
    });
  }

  res.status(400).json({ error: "Se requiere nombre o RUT para eliminar" });
});

// Servidor
app.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
});
