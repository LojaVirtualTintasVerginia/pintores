import { Request, Response } from 'express'

import { PrismaClient } from '@prisma/client'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

const prisma = new PrismaClient()

const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

class PinturaController {
  async list(_request: Request, response: Response) {
    try {
      const pinturas = await prisma.pintura.findMany()

      const serializedPinturas = pinturas.map((pintura) => ({
        id: pintura.id,
        title: pintura.name,
        photo: pintura.photo,
      }))

      return response.json(serializedPinturas)
    } catch (error) {
      console.error(error)
      response.status(500).json({ error: 'Error fetching pinturas' })
    }
  }

  async create(request: Request, response: Response) {
    try {
      const { name } = request.body
      const photo = request.file.location

      const pintura = await prisma.pintura.create({
        data: { name, photo },
      })

      return response.json(pintura)
    } catch (error) {
      console.error(error)
      response.status(500).json({ error: 'Error creating pintura' })
    }
  }

  async delete(request: Request, response: Response) {
    try {
      const { id } = request.params

      const pintura = await prisma.pintura.findUnique({
        where: { id },
      })

      if (!pintura) {
        return response.status(404).json({ error: 'Pintura not found' })
      }

      await prisma.pintura.delete({
        where: { id },
      })

      const key = pintura.photo.split('/').pop()

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.BUCKET_NAME || '', // Add default value or handle missing value
          Key: key,
        }),
      )

      return response.json({ message: 'Pintura deleted successfully' })
    } catch (error) {
      console.error(error)
      response.status(500).json({ error: 'Error deleting pintura' })
    }
  }
}

export default PinturaController
