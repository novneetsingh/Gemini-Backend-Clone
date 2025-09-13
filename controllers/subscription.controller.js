import { stripe } from '../config/stripe.js';
import { prisma } from '../config/prisma.js';

// Define subscription plans - simplified for the assignment
const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic Plan',
    price: 'price_basic', // This would be your actual Stripe price ID
    requestsPerHour: 10,
    features: ['Access to Gemini AI', 'Limited to 10 requests per hour']
  },
  pro: {
    name: 'Pro Plan',
    price: 'price_pro', // This would be your actual Stripe price ID
    requestsPerHour: 50,
    features: ['Access to Gemini AI', 'Up to 50 requests per hour', 'Priority support']
  }
};

// Create checkout session for subscription - simplified for the assignment
export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const plan = 'pro'; // Always upgrade to Pro tier for this assignment

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: SUBSCRIPTION_PLANS[plan].price,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      client_reference_id: userId.toString(),
      metadata: {
        userId: userId.toString(),
        plan
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Handle webhook events from Stripe - simplified for the assignment
export const handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event - simplified to only handle checkout completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await handleCheckoutSessionCompleted(session);
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Handle successful checkout - simplified for the assignment
async function handleCheckoutSessionCompleted(session) {
  try {
    const userId = parseInt(session.metadata.userId);
    
    // Simply update user tier to Pro
    await prisma.user.update({
      where: { id: userId },
      data: { tier: 'Pro' },
    });
    
    console.log(`User ${userId} upgraded to Pro tier successfully`);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

// For this assignment, we're simplifying the subscription model
// No need for complex subscription management functions

// Get current subscription for user - simplified for the assignment
export const getCurrentSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user to include tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      tier: user.tier,
      plans: SUBSCRIPTION_PLANS
    });
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel subscription - simplified for the assignment
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    // Simply downgrade user to Basic tier
    await prisma.user.update({
      where: { id: userId },
      data: { tier: 'Basic' },
    });

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};