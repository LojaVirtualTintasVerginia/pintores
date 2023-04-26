import { PrismaClient } from '@prisma/client'

const client = new PrismaClient()

async function run() {
  await client.pintura.deleteMany()

  await Promise.all([
    client.pintura.create({
      data: {
        id: '30ab4c94-593c-4a5b-8249-54364ef77612',
        name: 'Básica (parede interna e externa)',
        photo: 'basica.jpg',
      },
    }),
    client.pintura.create({
      data: {
        id: '24c7192d-1e26-4ced-bc65-2ae3a942d126',
        name: 'Textura, Grafiato e Projetado',
        photo: 'grafiato.jpg',
      },
    }),
  ])

  /**
   * Criar pets
   */
}
run()
  .then(async () => {
    await client.$disconnect()
  })
  .catch(async (e) => {
    console.log(e)
    await client.$disconnect()
    process.exit(1)
  })
