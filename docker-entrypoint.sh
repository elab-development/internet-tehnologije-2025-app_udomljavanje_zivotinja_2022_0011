#!/bin/sh
set -e

echo "Running migrations..."
npx prisma migrate deploy

echo "Seeding (safe)..."
npm run seed

echo "Starting app..."
npm run start