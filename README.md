<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Logistics Email-to-File

Efficiently parses shipment emails into standardized Word, Excel, and PDF documents with authentication and authorization.

## Features

- 🔐 JWT-based authentication and authorization
- 📧 AI-powered email text extraction using Google Gemini
- 📄 Generate Word, Excel, and PDF documents
- 🐳 Docker containerization with MongoDB
- 🎨 Modern, responsive UI

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Google Gemini AI

### Backend
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Prerequisites

- Node.js (v20 or higher)
- Docker and Docker Compose
- Google Gemini API Key

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd logistics-email-to-file
   ```

2. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your-gemini-api-key-here
   JWT_SECRET=your-super-secret-jwt-key-change-this
   ```

   **Important:** You also need to set the `GEMINI_API_KEY` environment variable for the frontend build. You can either:
   
   - Create a `.env` file in the root directory with:
     ```env
     GEMINI_API_KEY=your-gemini-api-key-here
     VITE_API_URL=http://localhost:5000/api
     ```
   
   - Or export it before running docker-compose:
     ```bash
     export GEMINI_API_KEY=your-gemini-api-key-here
     docker-compose up --build -d
     ```
   
   Create a `backend/.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/logistics
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRE=7d
   NODE_ENV=development
   
   # Email Configuration (for Send to Pricing feature)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@gmail.com
   PRICING_EMAIL=pricing@example.com
   ```
   
   **Important for Docker:** The `backend/.env` file will be automatically loaded by docker-compose. Make sure `PRICING_EMAIL` is set in this file.
   
   **Note:** For Docker, use `mongodb://mongodb:27017/logistics`. For local development, use `mongodb://localhost:27017/logistics`.
   
   **Email Setup (Gmail):**
   1. Enable 2-Step Verification on your Google Account
   2. Go to Google Account Settings > Security > 2-Step Verification
   3. Scroll down to "App passwords"
   4. Generate a new app password (select "Mail" and "Other" device)
   5. Copy the 16-character password (no spaces)
   6. In your `.env` file:
      ```env
      SMTP_USER=your-email@gmail.com
      SMTP_PASS=your-16-char-app-password
      ```
   **Important:** Use the full email address for SMTP_USER and the 16-character app password (not your regular password).
   
   For other email providers: Adjust SMTP_HOST, SMTP_PORT, and SMTP_SECURE accordingly.

3. **Set up backend environment file**
   
   Create `backend/.env` file with all required variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://mongodb:27017/logistics
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRE=7d
   NODE_ENV=production
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   SMTP_FROM=your-email@gmail.com
   PRICING_EMAIL=pricing@example.com
   ```

4. **Build and run with Docker Compose**
   
   **Run in foreground (see logs):**
   ```bash
   docker-compose up --build
   ```
   
   **Run in background (detached mode):**
   ```bash
   docker-compose up --build -d
   ```
   
   **Or for production:**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

   This will:
   - Start MongoDB container
   - Build and start the backend server
   - Build and start the frontend (with Nginx)

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

## Development Setup (Without Docker)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   # IMPORTANT: Set JWT_SECRET to a strong, random string
   ```

4. **Start MongoDB** (if not using Docker)
   ```bash
   # Option 1: Using Docker (recommended for local dev)
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   
   # Option 2: Install MongoDB locally and start the service
   # macOS: brew services start mongodb-community
   # Linux: sudo systemctl start mongod
   # Windows: Start MongoDB service from Services
   ```

5. **Create an admin user**
   ```bash
   npm run create-admin
   ```
   
   Or with custom credentials:
   ```bash
   npm run create-admin <username> <password> <email>
   ```
   
   Example:
   ```bash
   npm run create-admin admin mypassword123 admin@example.com
   ```

6. **Run the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

## Creating Admin User

### Option 1: Automatic (Docker only)

When using Docker, you can automatically create an admin user on first startup by setting environment variables:

```bash
# In docker-compose.yml or as environment variables
CREATE_ADMIN=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@logistics.com
```

Or add to your `docker-compose.yml`:
```yaml
environment:
  - CREATE_ADMIN=true
  - ADMIN_USERNAME=myadmin
  - ADMIN_PASSWORD=securepassword123
  - ADMIN_EMAIL=admin@example.com
```

### Option 2: Manual (Local Development)

To create an admin user manually, run the following command from the `backend` directory:

```bash
cd backend
npm run create-admin
```

This will create an admin user with default credentials:
- Username: `admin`
- Password: `admin123`
- Email: `admin@logistics.com`

You can also specify custom credentials:
```bash
npm run create-admin <username> <password> <email>
```

Example:
```bash
npm run create-admin myadmin securepass123 admin@mycompany.com
```

**Important:** Save the credentials securely. The password is hashed in the database and cannot be retrieved later.

### Option 3: Manual (Docker Container)

To create an admin user in a running Docker container:

```bash
# Execute the create-admin script inside the container
docker-compose exec backend npm run create-admin

# Or with custom credentials
docker-compose exec backend npm run create-admin myadmin securepass123 admin@example.com
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "username": "user123",
    "password": "password123",
    "email": "user@example.com" // optional
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "username": "user123",
    "password": "password123"
  }
  ```

- `GET /api/auth/me` - Get current user (requires authentication)

### Shipment

- `POST /api/shipment/extract` - Extract shipment data (requires authentication)
  ```json
  {
    "emailText": "Pickup in Miami, FL, deliver to Austin, TX..."
  }
  ```

### Admin (Requires Admin Role)

- `GET /api/admin/users` - Get all users (requires admin)
- `POST /api/admin/users` - Create a new user with random credentials (requires admin)
- `DELETE /api/admin/users/:id` - Delete a user (requires admin)
- `PUT /api/admin/users/:id` - Update a user (requires admin)

## Docker Commands

### Development
```bash
# Build and start all services (foreground - see logs)
docker-compose up --build

# Build and start in background (detached mode)
docker-compose up --build -d

# Start existing containers in background
docker-compose up -d

# View logs (all services)
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Rebuild specific service
docker-compose up --build backend
```

### Production
```bash
# Build and start in production mode
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production services
docker-compose -f docker-compose.prod.yml down

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up --build -d --force-recreate
```

### General
```bash
# Stop all services
docker-compose down

# Remove volumes (clean MongoDB data)
docker-compose down -v

# View container status
docker-compose ps

# Execute command in container
docker-compose exec backend npm run create-admin
```

## Project Structure

```
logistics-email-to-file/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── shipment.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── components/
│   ├── Login.tsx
│   ├── InputForm.tsx
│   └── ExtractionResult.tsx
├── services/
│   ├── apiService.ts
│   ├── geminiService.ts
│   ├── wordService.ts
│   ├── excelService.ts
│   └── pdfService.ts
├── docker-compose.yml
├── Dockerfile.frontend
├── nginx.conf
└── package.json
```

## Security Notes

- Change `JWT_SECRET` to a strong, random string in production
- Use environment variables for all sensitive data
- Ensure MongoDB is not exposed to the internet in production
- Consider adding rate limiting for API endpoints
- Use HTTPS in production

## License

MIT
