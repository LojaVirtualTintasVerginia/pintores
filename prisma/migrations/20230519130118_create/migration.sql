-- CreateTable
CREATE TABLE "pintor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "facebook" TEXT NOT NULL,
    "instagram" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "obra1" TEXT NOT NULL,
    "obra2" TEXT NOT NULL,
    "obra3" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "pintor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pintura" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT NOT NULL,

    CONSTRAINT "pintura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pintores_pintura" (
    "id" TEXT NOT NULL,
    "pintorId" TEXT NOT NULL,
    "pinturaId" TEXT NOT NULL,

    CONSTRAINT "pintores_pintura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pintor_cpf_key" ON "pintor"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "pintor_email_key" ON "pintor"("email");

-- AddForeignKey
ALTER TABLE "pintores_pintura" ADD CONSTRAINT "pintores_pintura_pintorId_fkey" FOREIGN KEY ("pintorId") REFERENCES "pintor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pintores_pintura" ADD CONSTRAINT "pintores_pintura_pinturaId_fkey" FOREIGN KEY ("pinturaId") REFERENCES "pintura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
