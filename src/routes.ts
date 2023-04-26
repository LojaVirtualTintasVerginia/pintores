import express from 'express'
import multer from 'multer'
import PinturasController from './controllers/PinturaControlers'
import multerConfig from './config/multer'
const routes = express.Router()

const pinturasController = new PinturasController()

const upload = multer(multerConfig)

routes.get('/pintura', pinturasController.list)
routes.post('/pintura', upload.single('photo'), pinturasController.create)
routes.delete('/pintura/:id', pinturasController.delete)
export default routes
