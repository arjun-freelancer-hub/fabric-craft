#!/bin/bash
# Script to seed database with demo credentials in Docker

echo "🌱 Seeding database with demo credentials..."

# Check if containers are running
if ! docker-compose ps | grep -q "fabric-craft-backend.*Up"; then
    echo "❌ Backend container is not running. Please start containers first:"
    echo "   docker-compose up -d"
    exit 1
fi

# Run the seed command in the backend container using ts-node
docker-compose exec -T backend npx ts-node -r tsconfig-paths/register prisma/seed.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Demo credentials seeded successfully!"
    echo ""
    echo "📝 Demo Credentials:"
    echo "   Admin: admin@fabriccraft.com / admin123"
    echo "   Staff: staff@fabriccraft.com / staff123"
else
    echo "❌ Failed to seed database"
    exit 1
fi
