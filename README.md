# Gemini Backend Clone

A backend API for a Gemini AI chat application with user authentication, chat functionality, message queue processing, and subscription tiers.

## Live Demo

Check out the live demo of the application: https://gemini-backend-clone-b7gb.onrender.com

## API Documentation

For detailed API documentation, please refer to the Postman collection: https://documenter.getpostman.com/view/32416134/2sB3HqGHr8

## Features

- **User Authentication**: Register and login with mobile number and OTP
- **Gemini AI Chat**: Interact with Google's Gemini AI model
- **Message Queue**: Asynchronous processing of chat messages using BullMQ
- **Subscription Tiers**: Basic and Pro tiers with different rate limits
- **Payment Integration**: Stripe integration for subscription management
- **Rate Limiting**: Request limits based on user subscription tier

## Tech Stack

- Node.js & Express.js
- PostgreSQL with Prisma ORM
- Redis for caching and rate limiting
- BullMQ for message queue
- Google Generative AI (Gemini)
- Stripe for payment processing
- JWT for authentication

## Project Structure

```
├── config/                  # Configuration files
│   ├── bullmq.js           # BullMQ queue configuration
│   ├── geminiAI.js         # Google Generative AI setup
│   ├── prisma.js           # Prisma client configuration
│   ├── redis.js            # Redis connection setup
│   └── stripe.js           # Stripe payment configuration
├── controllers/            # Request handlers
│   ├── auth.controller.js  # Authentication logic
│   ├── chat.controller.js  # Chat functionality
│   ├── subscribe.controller.js # Subscription payment
│   ├── subscription.controller.js # Subscription status
│   └── user.controller.js  # User profile management
├── middlewares/            # Express middlewares
│   └── auth.js             # JWT authentication middleware
├── prisma/                 # Database schema and migrations
│   ├── migrations/         # Database migration files
│   └── schema.prisma       # Prisma schema definition
├── routes/                 # API route definitions
│   ├── auth.route.js       # Authentication routes
│   ├── chatroom.route.js   # Chat functionality routes
│   ├── subscribe.route.js  # Subscription payment routes
│   ├── subscription.route.js # Subscription status routes
│   └── user.route.js       # User profile routes
├── workers/                # Background job workers
│   └── chatWorker.js       # BullMQ worker for processing chat messages
├── index.js                # Application entry point
└── package.json            # Project dependencies and scripts
```

## API Endpoints

### Authentication

- **POST /auth/signup** - Register a new user
- **POST /auth/send-otp** - Send OTP for verification
- **POST /auth/verify-otp** - Verify OTP and generate JWT token
- **POST /auth/forgot-password** - Reset forgotten password
- **POST /auth/change-password** - Change password (requires authentication)

### User

- **GET /user/me** - Get current user profile details (requires authentication)

### Chat

- **POST /chatroom** - Create a new chat room (requires authentication)
- **GET /chatroom** - Get all chat rooms for current user (requires authentication)
- **GET /chatroom/:id** - Get a specific chat room by ID (requires authentication)
- **POST /chatroom/:id/message** - Send a message to chat with AI (requires authentication)

### Subscription

- **GET /subscription/status** - Get current subscription status (requires authentication)
- **POST /subscribe/pro** - Create a checkout session for Pro subscription (requires authentication)
- **POST /webhook/stripe** - Webhook endpoint for Stripe events

## Database Schema

### User Model

```prisma
model User {
  id           Int        @id @default(autoincrement())
  mobileNumber String     @unique
  name         String
  password     String
  tier         Tier       @default(Basic) // Basic or Pro tier
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  chatrooms    Chatroom[]
}
```

### Chatroom Model

```prisma
model Chatroom {
  id        Int      @id @default(autoincrement())
  userId    Int // Foreign key to reference User
  user      User     @relation(fields: [userId], references: [id])
  messages  Json[]   @default([]) // Store messages as JSON array
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Tier Enum

```prisma
enum Tier {
  Basic
  Pro
}
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Redis server (v5.0.0 or higher)
- Stripe account
- Google AI API key (Gemini)

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/novneetsingh/Gemini-Backend-Clone.git
   cd Gemini-Backend-Clone
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables in `.env` file

   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/gemini_clone
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=your_redis_password
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   ```

4. Run database migrations

   ```bash
   npm run migrate
   ```

5. Start the development server

   ```bash
   npm run dev
   ```

6. For production deployment
   ```bash
   npm start
   ```

## Configuration Details

### Database Configuration

The application uses PostgreSQL with Prisma ORM. The database connection is configured in the `.env` file with the `DATABASE_URL` variable.

### Redis Configuration

Redis is used for caching and as a backend for BullMQ. Configure Redis connection in the `.env` file with the following variables:

- `REDIS_HOST`: Redis server hostname
- `REDIS_PORT`: Redis server port
- `REDIS_PASSWORD`: Redis server password

### Gemini AI Configuration

The application uses Google's Gemini AI model for chat responses. Configure the API key in the `.env` file with the `GEMINI_API_KEY` variable.

### Stripe Configuration

Stripe is used for payment processing. Configure Stripe in the `.env` file with the following variables:

- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Secret for verifying Stripe webhook events

### JWT Configuration

JWT is used for authentication. Configure the JWT secret in the `.env` file with the `JWT_SECRET` variable.

## License

This project is licensed under the ISC License - see the package.json file for details.
