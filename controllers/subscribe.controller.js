import { stripe } from "../config/stripe.js";
import { prisma } from "../config/prisma.js";

// Create checkout session for subscription - simplified for the assignment
export const createSubscribeSession = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: "Pro Subscription" },
            unit_amount: 49900, // ₹499.00 (in paise)
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
      metadata: { userId },
    });

    res.status(200).json({
      success: session ? true : false,
      message: session
        ? "Checkout session created"
        : "Payment intent creation failed",
      data: session ? session.url : null,
    });
  } catch (error) {
    console.error("Create checkout session error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Handle webhook events from Stripe - simplified for the assignment
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = parseInt(session.metadata.userId);

      await prisma.user.update({
        where: { id: userId },
        data: { tier: "Pro" },
      });

      console.log(`✅ User with user id ${userId} upgraded to Pro`);

      res.json({ received: true });
    }
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
