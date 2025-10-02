import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const { Client } = pg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const connectionString = process.env.DIRECT_URL

async function main() {
  const client = new Client({ connectionString })

  try {
    console.log('Connecting to database...')
    await client.connect()
    console.log('Connected!')

    const sqlFile = path.join(__dirname, 'seed-supabase-fixed.sql')
    const sql = fs.readFileSync(sqlFile, 'utf8')

    console.log('Executing seed SQL...')
    await client.query(sql)
    console.log('Seed data inserted successfully!')

  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  } finally {
    await client.end()
    console.log('Database connection closed.')
  }
}

main()
