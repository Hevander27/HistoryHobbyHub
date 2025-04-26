import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { users, posts, comments } from '@shared/schema';

// Create a PostgreSQL connection
// For development, we use an in-memory SQLite database 
// Use environment variables for a real production database
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/historyhub';

// Client for migrations
const migrationClient = postgres(connectionString, { max: 1 });

// Create the client
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient);

// Run migrations (automatically creates/updates tables based on our schema)
export async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    // In a real production app, use migrate function
    // For now, we'll manually ensure tables exist
    await setupTables();
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

// Function to manually create tables if they don't exist
// In a real production app, use Drizzle's migrate() function instead
async function setupTables() {
  try {
    // This is a simplified version just to ensure tables exist
    // In production, use proper migrations
    await queryClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        image_url TEXT,
        upvotes INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        user_id TEXT
      );
      
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  } catch (error) {
    console.error('Error setting up tables:', error);
    throw error;
  }
}