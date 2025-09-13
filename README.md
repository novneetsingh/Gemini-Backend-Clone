# Gemini Backend Clone

A backend API for a Gemini AI chat application with user authentication, chat functionality, message queue processing, and subscription tiers.

## Features

- **User Authentication**: Register and login with mobile number and password
- **Gemini AI Chat**: Interact with Google's Gemini AI model
- **Message Queue**: Asynchronous processing of chat messages using BullMQ
- **Subscription Tiers**: Basic and Pro tiers with different rate limits
- **Payment Integration**: Stripe integration for subscription management
- **Rate Limiting**: Request limits based on user subscription tier
- **Chat History**: API endpoints to retrieve and manage chat history

## Tech Stack

- Node.js & Express.js
- PostgreSQL with Prisma ORM
- Redis for caching and rate limiting
- BullMQ for message queue
- Google Generative AI (Gemini)
- Stripe for payment processing
- JWT for authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Redis server
- Stripe account
- Google AI API key (Gemini)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables in `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/gemini_clone
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=your_redis_password
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   FRONTEND_URL=http://localhost:3000
   PORT=5000
   ```
4. Run Prisma migrations:
   ```
   npx prisma migrate dev
   ```
5. Start the server:
   ```
   npm start
   ```
6. Start the worker (in a separate terminal):
   ```
   node startWorker.js
   ```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Chat

- `POST /api/chat` - Create a new chat message
- `GET /api/chat/status/:jobId` - Check status of a chat job
- `GET /api/chat/history` - Get chat history for current user
- `DELETE /api/chat/:id` - Delete a chat message

### Subscription

- `POST /api/subscription/create-checkout-session` - Create Stripe checkout session
- `GET /api/subscription/current` - Get current subscription
- `POST /api/subscription/cancel` - Cancel subscription
- `POST /api/subscription/webhook` - Stripe webhook endpoint

## License

MIT