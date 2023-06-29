import { PrismaClient } from '@prisma/client'

const client = new PrismaClient()

async function run() {
  await client.pintura.deleteMany()
  await client.pintor.deleteMany()

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

  await Promise.all([
    client.pintor.create({
      data: {
        id: '137d9eb5-aae2-4aa2-958a-525ec830dde9',
        name: 'Lucas',
        cpf: '090.808.322-79',
        email: 'teste@gmail.com',
        description: 'Um pintor com amor',
        address: 'Angelo Manfron',
        city: 'Curitiba',
        state: 'PR',
        whatsappNumber: '(41)9 9562-0788',
        facebook: 'facebok.com.br',
        instagram: 'instagram.com.br',
        photo: 'dog',
        obra1: '30ab4c94-593c-4a5b-8249-54364ef77612',
        obra2: 'caramelinho.jpeg',
        obra3: 'caramelinho.jpeg',
        status: 'true',
      },
    }),
  ])
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
