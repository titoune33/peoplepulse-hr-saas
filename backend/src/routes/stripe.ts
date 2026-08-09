import { Hono } from "hono";
import Stripe from "stripe";
import { db, schema } from "../db/index.js";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001";

const stripe = new Stripe(STRIPE_SECRET_KEY);

// Test price ID for Pro plan (replace with real price ID in production)
const PRO_PRICE_ID = "price_1TestTestTest";

export const stripeRoutes = new Hono();

stripeRoutes.post("/checkout", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId") as number;

    const user = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();

    if (!user) {
      return c.json({ success: false, error: "User not found" }, 404);
    }

    if (user.plan === "pro") {
      return c.json({ success: false, error: "User is already on the Pro plan" }, 400);
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: String(user.id) },
      });
      customerId = customer.id;

      db.update(schema.users)
        .set({ stripeCustomerId: customerId })
        .where(eq(schema.users.id, userId))
        .run();
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
      mode: "subscription",
      success_url: `${FRONTEND_URL}/dashboard?checkout=success`,
      cancel_url: `${FRONTEND_URL}/pricing?checkout=cancelled`,
      metadata: { userId: String(userId) },
    });

    return c.json({ success: true, data: { url: session.url } });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return c.json({ success: false, error: "Failed to create checkout session" }, 500);
  }
});

stripeRoutes.post("/webhook", async (c) => {
  try {
    const signature = c.req.header("stripe-signature");
    if (!signature) {
      return c.json({ success: false, error: "Missing signature" }, 400);
    }

    const body = await c.req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return c.json({ success: false, error: "Invalid signature" }, 400);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.userId;
        if (uid) {
          db.update(schema.users)
            .set({
              plan: "pro",
              stripeSubscriptionId:
                typeof session.subscription === "string"
                  ? session.subscription
                  : session.subscription?.id || null,
            })
            .where(eq(schema.users.id, parseInt(uid, 10)))
            .run();
          console.log(`User ${uid} upgraded to Pro plan via Stripe checkout`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

        const subUser = db
          .select()
          .from(schema.users)
          .where(eq(schema.users.stripeCustomerId, customer))
          .get();

        if (subUser) {
          db.update(schema.users)
            .set({ plan: "free", stripeSubscriptionId: null })
            .where(eq(schema.users.id, subUser.id))
            .run();
          console.log(`User ${subUser.id} downgraded to Free plan`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

        if (subscription.status === "active") {
          const subUser = db
            .select()
            .from(schema.users)
            .where(eq(schema.users.stripeCustomerId, customer))
            .get();

          if (subUser && subUser.plan !== "pro") {
            db.update(schema.users)
              .set({ plan: "pro" })
              .where(eq(schema.users.id, subUser.id))
              .run();
            console.log(`User ${subUser.id} subscription updated - keeping Pro`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return c.json({ success: true, data: { received: true } });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return c.json({ success: false, error: "Webhook processing failed" }, 500);
  }
});

export default stripeRoutes;
