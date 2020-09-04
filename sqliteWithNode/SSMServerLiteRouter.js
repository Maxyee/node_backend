const express = require('express');

const SSMServerLiteController = require('../controllers/SSMServerLiteController');

const router = express.Router();

router.get('/SSMServersLite', SSMServerLiteController.getSSMServersLite);
// router.post('/addSSMServerLite', SSMServerLiteController.addSSMServerLite);
// router.delete('/removeSSMServerLite', SSMServerLiteController.removeSSMServerLite);

module.exports = router;