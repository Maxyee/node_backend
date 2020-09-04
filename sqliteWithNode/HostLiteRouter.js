const Router = require('express-promise-router')
const HostLiteController = require('../controllers/HostLiteController')

const promiseRouter = new Router();

promiseRouter.get('/hostsLite', HostLiteController.getLiteHosts);

module.exports = promiseRouter;