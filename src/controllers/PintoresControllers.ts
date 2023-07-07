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
async function deleteS3Object(key: string) {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
    }),
  )
}

async function deleteUploadedFiles(files: any) {
  try {
    const fileUrls = Object.values(files).flatMap((file: any) =>
      file.map((f: any) => f.location),
    )

    await Promise.all(
      fileUrls.map((fileUrl: string) => deleteFileFromS3(fileUrl)),
    )

    console.log('Arquivos excluídos com sucesso.')
  } catch (error) {
    console.error('Erro ao excluir os arquivos:', error)
    throw error
  }
}

async function deleteFileFromS3(fileUrl: string) {
  const fileName = fileUrl.split('/').pop()

  if (!fileName) {
    throw new Error('Nome do arquivo inválido')
  }

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
  }

  await s3Client.send(new DeleteObjectCommand(params))
}

class PintoresController {
  async list(request: Request, response: Response) {
    const pintores = await prisma.pintor.findMany()

    const serializedPintores = pintores.map((pintor) => {
      return {
        ...pintor,
        image_url: `${pintor.photo}`,
      }
    })

    return response.json(serializedPintores)
  }

  async status(request: Request, response: Response) {
    try {
      const { id } = request.params
      const { status: newStatus } = request.body

      await prisma.pintor.update({
        where: { id },
        data: { status: newStatus },
      })

      return response.status(204).send()
    } catch (error) {
      console.error(error)
      return response
        .status(500)
        .json({ error: 'Erro ao atualizar o status do pintor' })
    }
  }

  async filter(request: Request, response: Response) {
    const { pintura, state, city } = request.query

    // Obtém os IDs dos pintores que possuem a pintura desejada
    const pintoresComPintura = await prisma.pintor.findMany({
      where: {
        PintoresPintura: {
          some: {
            pinturaId: pintura,
          },
        },
      },
      select: {
        id: true,
      },
    })
  }

  async perfil(request: Request, response: Response) {
    try {
      const { id } = request.params

      const pintor = await prisma.pintor.findUnique({
        where: { id },
      })

      if (!pintor) {
        return response.status(404).json({ error: 'Pintor não encontrado' })
      }

      const serializedPintor = {
        ...pintor,
        photo: `${pintor.photo}`,
        obra1: `${pintor.obra1}`,
        obra2: `${pintor.obra2}`,
        obra3: `${pintor.obra3}`,
      }

      const pinturas = await prisma.pintura.findMany({
        where: {
          PintoresPintura: {
            some: {
              pintorId: pintor.id,
            },
          },
        },
        select: {
          name: true,
        },
      })

      return response.json({ pintor: serializedPintor, pintura: pinturas })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: 'Erro ao buscar o pintor' })
    }
  }

  async create(request: Request, response: Response) {
    const {
      name,
      cpf,
      email,
      description,
      address,
      city,
      state,
      whatsappNumber,
      facebook,
      instagram,
      pinturas,
      status,
    } = request.body

    try {
      // Verifica se já existe um pintor com o mesmo CPF
      const existingPintor = await prisma.pintor.findUnique({
        where: { cpf },
      })

      if (existingPintor) {
        await deleteUploadedFiles(request.files)
        return response.status(400).json({ error: 'CPF já está em uso' })
      }

      // Validação do campo CPF
      if (!cpf) {
        await deleteUploadedFiles(request.files)
        return response.status(400).json({ error: 'CPF é obrigatório' })
      }

      const pintorData: Pintor = {
        name,
        cpf,
        email,
        description,
        address,
        city,
        state,
        whatsappNumber,
        facebook,
        instagram,
        status,
        photo: request.files.image[0].location,
        obra1: request.files.image1[0].location,
        obra2: request.files.image2[0].location,
        obra3: request.files.image3[0].location,
      }

      const pintorRecord = await prisma.pintor.create({ data: pintorData })

      const pinturasArray = pinturas.split(',').map((pintura) => pintura.trim())

      const pintorPinturaRecords = await prisma.pintoresPintura.createMany({
        data: pinturasArray.map((pinturaId) => ({
          pinturaId,
          pintorId: pintorRecord.id,
        })),
      })

      return response.json({
        id: pintorRecord.id,
        ...pintorRecord,
      })
    } catch (error) {
      console.error('Error creating pintor:', error)
      await deleteUploadedFiles(request.files)
      return response.status(500).json({ error: 'Erro ao criar o pintor' })
    }
  }

  async delete(request: Request, response: Response) {
    try {
      const { id } = request.params

      // Busca o pintor pelo ID
      const pintor = await prisma.pintor.findUnique({
        where: { id },
      })

      if (!pintor) {
        return response.status(404).json({ error: 'Pintor não encontrado' })
      }

      // Deleta as pinturas relacionadas ao pintor
      await prisma.pintoresPintura.deleteMany({
        where: { pintorId: pintor.id },
      })

      // Deleta o pintor
      await prisma.pintor.delete({
        where: { id },
      })

      const key = pintor.photo.split('/').pop()
      const key1 = pintor.obra1.split('/').pop()
      const key2 = pintor.obra2.split('/').pop()
      const key3 = pintor.obra3.split('/').pop()

      // Deleta os arquivos do S3
      await Promise.all([
        deleteS3Object(key),
        deleteS3Object(key1),
        deleteS3Object(key2),
        deleteS3Object(key3),
      ])

      return response.status(204).send()
    } catch (error) {
      console.error('Error deleting pintor:', error)
      return response.status(500).json({ error: 'Erro ao excluir o pintor' })
    }
  }
}

export default PintoresController
