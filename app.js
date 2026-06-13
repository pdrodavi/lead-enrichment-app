const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const leadRoutes = require('./src/routes/leadRoutes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Servir a especificação OpenAPI para consulta
app.get('/openapi.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, 'openapi.yaml'));
});
app.get('/api-docs', (req, res) => {
  const yamlPath = path.join(__dirname, 'openapi.yaml');
  const spec = fs.readFileSync(yamlPath, 'utf-8');
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Lead Enrichment API - Docs</title>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>
  SwaggerUIBundle({ url: '/openapi.yaml', dom_id: '#swagger-ui', presets: [SwaggerUIBundle.presets.apis] });
</script>
</body>
</html>`);
});

app.use('/', leadRoutes);

// Middleware global de erro — captura erros inesperados
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.stack || err.message || err);
  // Se já houver headers enviados, delega ao Express
  if (res.headersSent) return next(err);
  // Se a requisição espera JSON, responde com formato compatível com a API
  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Ocorreu um erro interno. Tente novamente mais tarde.',
      timestamp: new Date().toISOString(),
    });
  }
  // Caso contrário, renderiza página de erro amigável
  res.status(500).render('pages/index', {
    leads: [],
    pagination: null,
    lead: null,
    error: 'Erro interno do servidor. Tente novamente.'
  });
});

// 404 — Rota não encontrada
app.use((req, res) => {
  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(404).json({ error: 'Not Found', message: `Rota ${req.originalUrl} não encontrada` });
  }
  res.status(404).render('pages/index', {
    leads: [],
    pagination: null,
    lead: null,
    error: `Página "${req.originalUrl}" não encontrada.`
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
