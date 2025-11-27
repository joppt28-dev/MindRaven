## MindRaven

Plataforma web para ideación de innovación y emprendimiento que combina generación asistida por IA, validación con literatura académica y el evaluador “🧠 Evaluador de Oportunidades” para calificar el potencial de cada idea.

### Arquitectura

- **Backend (Node.js + Express)**  
  - Endpoint /api/auth/login con JWT para proteger la API.  
  - Endpoint /api/ideas que orquesta Gemini (o un fallback local), Semantic Scholar/CrossRef y el modelo de scoring.  
  - Endpoint /api/projects/bootstrap para orquestar el flujo Define/Locate/Prepare/Confirm segun proyecto.  
  - Integracion con Semantic Scholar (Graph /paper/search/bulk con fallback a /paper/search) y CrossRef para obtener articulos recientes (ultimos 6 anos) sin duplicados, resumenes y autores relevantes; fusiona ambas fuentes priorizando Semantic Scholar, limita la bibliografia a 8 articulos y genera una explicacion contextual por referencia.  Cumple el limite de 1 req/s exigido por Semantic Scholar.
  - Integracion con Semantic Scholar (Graph /paper/search/bulk con fallback a /paper/search) y CrossRef para obtener articulos recientes (ultimos 6 anos) sin duplicados, resumenes y autores relevantes; fusiona ambas fuentes priorizando Semantic Scholar, limita la bibliografia a 8 articulos y genera una explicacion contextual por referencia.  Cumple el limite de 1 req/s exigido por Semantic Scholar.
  - Evaluación de ideas mediante la rúbrica “🧠 Evaluador de Oportunidades” (popularidad, prioridad, insatisfacción, tangibilidad, inevitabilidad y desatención del mercado).

- **Frontend (React + Vite + Tailwind CSS)**  
  - Flujo guiado de autenticación, ingreso de retos y visualización de resultados.  
  - Presentación tipo “glassmorphism” con tarjetas para la idea, pasos accionables, puntajes y bibliografía.  
  - Configurable vía `VITE_API_URL` para apuntar al backend desplegado (Heroku/Vercel/etc.).

### Requerimientos previos

- Node.js 18+  
- NPM  
- Una API key de Gemini (Google AI Studio) o el fallback local en caso de pruebas básicas.  
- API key de Semantic Scholar (S2 Graph, rate limit 1 request/s) para habilitar los artículos prioritarios.  
- Semantic Scholar requiere `SEMANTIC_SCHOLAR_API_KEY` (1 request/s); CrossRef sigue siendo pública.

### Configuración del backend

```bash
cp .env.example .env
# Edita .env con GEMINI_API_KEY, JWT_SECRET, etc.
npm install
npm run dev   # o npm start para producción
```

Variables clave:

- `GEMINI_API_KEY` / `GEMINI_MODEL`: modelo por defecto `gemini-1.5-flash-latest` para generar ideas.
- `SEMANTIC_SCHOLAR_API_KEY`: se envía como header `x-api-key` al consumir Semantic Scholar.
- `JWT_SECRET`, `DEMO_EMAIL`, `DEMO_PASSWORD`: controlan la autenticación básica de la demo.

Endpoints principales:

- `POST /api/auth/login` → `{ email, password }` devuelve `{ token, user }`.  
- `POST /api/ideas` (requiere header `Authorization: Bearer <token>`) → `{ areaInteres }` devuelve idea, artículos y puntajes.

### Configuración del frontend

```bash
cd client
cp .env.example .env          # Define VITE_API_URL (por defecto http://localhost:4000)
npm install
npm run dev
```

Variables útiles en el frontend:

- `VITE_API_URL`: URL del backend (por defecto `http://localhost:4000`).
- `VITE_DEMO_EMAIL` y `VITE_DEMO_PASSWORD`: permiten sincronizar las credenciales sugeridas en el formulario con las del backend/JWT de demo.

El frontend consumirá el backend configurado y mostrará:

1. Pantalla de autenticación dedicada (`/login`) que guarda la sesión JWT y ofrece las credenciales demo.  
2. Panel del generador (`/ideas`) protegido: si no hay sesión activa redirige automáticamente al inicio.  
3. Tarjeta con la idea propuesta, pasos, validación sugerida y señales de tendencia.  
4. Puntajes calculados con la rúbrica “🧠 Evaluador de Oportunidades” y bibliografía con enlaces a las fuentes.

### Despliegue

- **Backend:** puede desplegarse en Heroku/Vercel/Render. Configura las variables de entorno (`PORT`, `GEMINI_API_KEY`, `JWT_SECRET`, etc.).  
- **Frontend:** build con `npm run build` y despliega en Vercel/Netlify. Ajusta `VITE_API_URL` para que apunte a la URL pública del backend.

### Próximos pasos sugeridos

- Conectar tu base de datos de usuarios/emprendimientos reales para reemplazar las credenciales demo.  
- Persistir ideas generadas y feedback de usuarios para refinar el modelo de scoring.  
- Añadir soporte multi-idioma y segmentar recomendaciones por industria o país.
