#!/bin/sh

# Database migration script for Docker containers
set -e

echo "🔄 Starting database migrations..."

# Test connection with a simple query
echo "🔍 Testing database connection..."
node -e "
const { Client } = require('pg');

async function testConnection() {
  const client = new Client(process.env.POSTGRES_URL);
  try {
    await client.connect();
    await client.query('SELECT 1');
    console.log('✅ Database connection successful!');
    await client.end();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();
" || {
    echo "❌ Database connection test failed, exiting..."
    exit 1
}

# Run Drizzle migrations
echo "🚀 Running Drizzle migrations..."
pnpm run db:migrate

echo "✅ Database migrations completed successfully!"