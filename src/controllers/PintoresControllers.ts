import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'

const prisma = new PrismaClient()

class PintoresController {
  async list(request: Request, response: Response) {
    const pintores = await prisma.pintor.findMany()

    const serializedPintores = pintores.map((pintor) => {
      return {
        ...pintor,
        image_url: `192.168.1.115/uploads/${pintor.photo}`,
      }
    })

    return response.json(serializedPintores)
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

    const pintorIds = pintoresComPintura.map((pintor) => pintor.id)

    // Filtra os pintores com base nos IDs obtidos e nos campos state e city
    const pintoresFiltrados = await prisma.pintor.findMany({
      where: {
        id: {
          in: pintorIds,
        },
        state: String(state),
        city: String(city),
      },
    })

    const serializedPintores = pintoresFiltrados.map((pintor) => {
      return {
        ...pintor,
        image_url: `https://192.168.1.115/uploads/${pintor.photo}`,
      }
    })

    return response.json(serializedPintores)
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
        image_url: `http://192.168.1.115:3333/uploads/${pintor.photo}`,
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

  async delete(request: Request, response: Response) {
    try {
      const { id } = request.params

      const pintor = await prisma.pintor.findUnique({
        where: { id },
        select: {
          id: true,
          photo: true,
          obra1: true,
          obra2: true,
          obra3: true,
          PintoresPintura: {
            select: { id: true },
          },
        },
      })

      if (!pintor) {
        return response.status(404).json({ error: 'Pintor não encontrado' })
      }

      const { photo, obra1, obra2, obra3, pinturas } = pintor

      // Exclui os registros associados na tabela pintores_pintura
      await prisma.pintoresPintura.deleteMany({
        where: { pintorId: id },
      })

      const imagePath = `uploads/${pintor.photo}`
      const imagePathobra1 = `uploads/${pintor.obra1}`
      const imagePathobra2 = `uploads/${pintor.obra2}`
      const imagePathobra3 = `uploads/${pintor.obra3}`

      // Exclui as imagens do pintor
      await fs.unlink(imagePath)
      await fs.unlink(imagePathobra1)
      await fs.unlink(imagePathobra2)
      await fs.unlink(imagePathobra3)

      // Exclui o pintor
      await prisma.pintor.delete({
        where: { id },
      })

      return response.status(204).send()
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: 'Erro ao excluir o pintor' })
    }
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

    console.log(request.body, 'aqui')

    const pintor = {
      photo: request.files.image[0].filename,
      obra1: request.files.image1[0].filename,
      obra2: request.files.image2[0].filename,
      obra3: request.files.image3[0].filename,
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
    }

    const pintorRecord = await prisma.pintor.create({ data: pintor })

    const pintoresPintura = pinturas
      .split(',')
      .map((pintura) => pintura.trim())
      .map((pinturaId) => {
        return {
          pinturaId,
          pintorId: pintorRecord.id,
        }
      })

    const pintorPinturaRecords = await prisma.pintoresPintura.createMany({
      data: pintoresPintura,
    })

    return response.json({
      id: pintorRecord.id,
      ...pintorRecord,
    })
  }
}

export default PintoresController
