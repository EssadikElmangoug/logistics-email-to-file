#!/bin/sh
set -e

# Wait for MongoDB to be ready (simple check)
echo "Waiting for MongoDB to be ready..."
for i in 1 2 3 4 5 6 7 8 9 10; do
  if node -e "import('mongoose').then(m => m.default.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/logistics').then(() => { console.log('MongoDB ready'); process.exit(0); }).catch(() => process.exit(1)));" 2>/dev/null; then
    break
  fi
  echo "Attempt $i/10: MongoDB not ready, waiting..."
  sleep 2
done

# Create admin user if CREATE_ADMIN is set
if [ "$CREATE_ADMIN" = "true" ]; then
  echo "Attempting to create admin user..."
  ADMIN_USERNAME=${ADMIN_USERNAME:-admin}
  ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
  ADMIN_EMAIL=${ADMIN_EMAIL:-admin@logistics.com}
  
  # Use the create-admin script (it will check if admin exists)
  node scripts/createAdmin.js "$ADMIN_USERNAME" "$ADMIN_PASSWORD" "$ADMIN_EMAIL" 2>/dev/null || echo "ℹ️  Admin user already exists or could not be created"
fi

# Start the server
exec node server.js
