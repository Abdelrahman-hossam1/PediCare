import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Seeding database...')

    // Clear existing users
    await prisma.user.deleteMany()

    const adminHash = await bcrypt.hash('admin123', 10)
    const doctorHash = await bcrypt.hash('doctor123', 10)
    const receptionistHash = await bcrypt.hash('receptionist123', 10)

    // Create Admin
    await prisma.user.create({
        data: {
            email: 'admin@clinic.com',
            passwordHash: adminHash,
            role: Role.ADMIN,
        },
    })

    // Create Doctor
    await prisma.user.create({
        data: {
            email: 'doctor@clinic.com',
            passwordHash: doctorHash,
            role: Role.DOCTOR,
        },
    })

    // Create Receptionist
    await prisma.user.create({
        data: {
            email: 'receptionist@clinic.com',
            passwordHash: receptionistHash,
            role: Role.RECEPTIONIST,
        },
    })

    console.log('Seed completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
