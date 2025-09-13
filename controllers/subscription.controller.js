// import { stripe } from "../config/stripe.js";
import { prisma } from "../config/prisma.js";

// Create checkout session for subscription - simplified for the assignment
// export const createCheckoutSession = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const plan = 'pro'; // Always upgrade to Pro tier for this assignment

//     // Get user
//     const user = await prisma.user.findUnique({
//       where: { id: userId }
//     });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Create checkout session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price: SUBSCRIPTION_PLANS[plan].price,
//           quantity: 1,
//         },
//       ],
//       mode: 'subscription',
//       success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
//       client_reference_id: userId.toString(),
//       metadata: {
//         userId: userId.toString(),
//         plan
//       }
//     });

//     res.json({ url: session.url });
//   } catch (error) {
//     console.error('Create checkout session error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// Handle webhook events from Stripe - simplified for the assignment
// export const handleWebhook = async (req, res) => {
//   const signature = req.headers['stripe-signature'];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (error) {
//     console.error('Webhook signature verification failed:', error.message);
//     return res.status(400).send(`Webhook Error: ${error.message}`);
//   }

//   // Handle the event - simplified to only handle checkout completion
//   if (event.type === 'checkout.session.completed') {
//     const session = event.data.object;
//     await handleCheckoutSessionCompleted(session);
//   } else {
//     console.log(`Unhandled event type ${event.type}`);
//   }

//   res.json({ received: true });
// };

// Handle successful checkout - simplified for the assignment
// async function handleCheckoutSessionCompleted(session) {
//   try {
//     const userId = parseInt(session.metadata.userId);

//     // Simply update user tier to Pro
//     await prisma.user.update({
//       where: { id: userId },
//       data: { tier: 'Pro' },
//     });

//     console.log(`User ${userId} upgraded to Pro tier successfully`);
//   } catch (error) {
//     console.error('Error handling checkout session completed:', error);
//   }
// }

// Get current subscription for user
export const getCurrentSubscription = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    res.status(200).json({
      success: user ? true : false,
      message: user ? "Current subscription plan fetched" : "User not found",
      tier: user ? user.tier : null,
    });
  } catch (error) {
    console.error("Get current subscription error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
