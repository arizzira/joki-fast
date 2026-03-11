import 'dotenv/config'; // Wajib di paling atas biar .env kebaca duluan!
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

// Bikin jalur koneksi pakai Driver PG
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Kasih tau Prisma buat pakai jalur tersebut
const prisma = new PrismaClient({ adapter });

export default prisma;