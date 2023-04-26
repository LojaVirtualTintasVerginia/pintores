import { Request, Response } from 'express'
import fs from 'fs'
import multer from 'multer'

import multerConfig from '../config/multer'

import { PrismaClient } from '@prisma/client'

import { z } from 'zod'

const prisma = new PrismaClient()
const upload = multer(multerConfig).single('photo')

class PinturasController {
  async list(request: Request, response: Response) {
    const pinturas = await prisma.pintura.findMany()

    return response.send({
      pinturas: pinturas.map((pintura) => ({
        ...pintura,
      })),
    })
  }

  async create(request: Request, response: Response) {
    try {
      const { name } = request.body
      const pintura = await prisma.pintura.create({
        data: { name, photo: request.file.filename },
      })
      return response.json({
        ...pintura,
      })
    } catch (error) {
      response.status(500).send({ error: 'Error creating pintura' })
    }
  }

  async delete(request: Request, response: Response) {
    try {
      const { id } = request.params

      const pintura = await prisma.pintura.findUnique({
        where: { id },
        select: { photo: true },
      })

      if (!pintura) {
        return response.status(404).send({ error: 'Pintura not found' })
      }
      const imagePath = `uploads/${pintura.photo}`
      fs.unlinkSync(imagePath)

      await prisma.pintura.delete({
        where: { id },
      })

      return response.status(204).send(pintura)
    } catch (error) {
      response.status(500).send({ error: 'Error deleting pintura' })
    }
  }
}

export default PinturasController
