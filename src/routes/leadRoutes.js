const express = require('express');
const router = express.Router();
const controller = require('../controllers/leadController');

router.get('/', controller.getIndex);
router.post('/enrich', controller.postEnrich);
router.delete('/:id', controller.deleteEnrich);
router.put('/:id', controller.putUpdate);

module.exports = router;
