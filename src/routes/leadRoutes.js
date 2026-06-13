const express = require('express');
const router = express.Router();
const controller = require('../controllers/leadController');

// Página principal
router.get('/', controller.getIndex);

// Enriquecimento de lead
router.post('/enrich', controller.postEnrich);

// Busca por domínio (deve vir ANTES de /:id para não conflitar)
router.get('/domain/:domain', controller.getByDomain);

// CRUD por ID
router.get('/:id', controller.getLead);
router.put('/:id', controller.putUpdate);
router.delete('/:id', controller.deleteEnrich);

module.exports = router;
