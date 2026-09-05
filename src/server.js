import app from "./app.js";
import { config } from "./config/env.js";

app.listen(config.port, () => {
  console.log(`API de administracion en http://localhost:${config.port}`);
});
