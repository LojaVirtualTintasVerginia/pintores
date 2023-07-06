import express from 'express'
import multer from 'multer'

import PintoresController from './controllers/PintoresControllers'
import PinturaController from './controllers/PinturaControllers'
import multerConfig from './config/multer'

const routes = express.Router()

const pinturasController = new PinturaController()
const pintoresController = new PintoresController()

const upload = multer(multerConfig)

routes.get('/pintura', pinturasController.list)
routes.post('/pintura', upload.single('photo'), pinturasController.create)
routes.delete('/pintura/:id', pinturasController.delete)

routes.delete('/pintor/:id', pintoresController.delete)
// routes.put('/pintor/:id', pintoresController.status)
routes.get('/pintor/:id', pintoresController.perfil)
routes.put('/pintor/:id', pintoresController.status)
routes.get('/pintores', pintoresController.list)
routes.get('/filter', pintoresController.filter)
// routes.put('/pintores/:id', pintoresController.status);
routes.post(
  '/pintor',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
  ]),
  pintoresController.create,
)

export default routes
