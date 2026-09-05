export function notFound(_req, res) {
  res.status(404).json({
    success: false,
    error: "Ruta no encontrada",
  });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(500).json({
    success: false,
    error: "Error interno del servidor",
  });
}
