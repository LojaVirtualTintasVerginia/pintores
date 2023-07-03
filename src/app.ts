import express from 'express'
import cors from 'cors'
import path from 'path'
import routes from './routes'

export const app = express()
const uploadsPath = path.join(__dirname, '..', 'uploads')
app.use('/uploads', express.static(uploadsPath))
app.use(cors())
app.use(express.json())
app.use(routes)
