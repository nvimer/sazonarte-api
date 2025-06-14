# SazonArte Restaurant Management API

A robust backend API for managing restaurant operations, built with Node.js, Express, TypeScript, and Prisma.

## 🚀 Features

- RESTful API architecture
- JWT-based authentication
- TypeScript for type safety
- Prisma ORM for database management
- Express.js framework
- Environment configuration with validation
- Logging with Winston
- Security with Helmet and CORS
- Request validation with Zod

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm
- PostgreSQL database
- Git

## 🔧 Installation

1. Clone the repository:
```bash
git clone [https://github.com/niccommit/sazonarte-api]
cd sazonarteApp/server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory.

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Start the development server:
```bash
npm run dev
```

## 🛠️ Available Scripts

- `npm start` - Build and start the production server
- `npm run dev` - Start the development server with hot reload
- `npm run prisma:generate` - Generate Prisma client
- `npm run eslint-check-only` - Run ESLint without fixing
- `npm run eslint-fix` - Run ESLint and fix issues
- `npm run prettier` - Format code with Prettier

## 📁 Project Structure

```
src/
├── api/            # API routes and controllers
├── config/         # Configuration files
├── database/       # Database related files
├── interfaces/     # TypeScript interfaces
├── middlewares/    # Express middlewares
├── strategies/     # Authentication strategies
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── app.ts          # Express application setup
└── server.ts       # Server entry point
```

## 🔒 Security

- JWT-based authentication
- CORS protection
- Helmet security headers
- Environment variable validation
- Password hashing with bcrypt

## 📝 API Documentation

The API is versioned (v1) and follows RESTful principles. Base URL: `http://localhost:8080/api/v1`

### Authentication

All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## 🧪 Testing

Testing setup is pending. Will be implemented in future updates.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- NgCraftz
