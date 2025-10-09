#!/bin/bash

echo "Setting up FabricCraft Billing Frontend..."

# Navigate to frontend directory
cd frontend

# Create environment file
cat > .env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Environment
NODE_ENV=development

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=fabriccraft-billing-secret-key-2024
EOF

echo "Environment file created successfully!"

# Install dependencies
echo "Installing dependencies..."
npm install

echo "Frontend setup completed!"
echo ""
echo "To start the development server:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "The application will be available at: http://localhost:3000"
echo ""
echo "Demo credentials:"
echo "  Admin: admin@fabriccraft.com / admin123"
echo "  Staff: staff@fabriccraft.com / staff123"
