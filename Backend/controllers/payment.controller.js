import Stripe from 'stripe';
import dotenv from 'dotenv';
import Order from '../models/order.js';

dotenv.config();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_KEY);

// Create a Stripe checkout session
export const createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Make sure the order belongs to the customer
    if (order.customer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to access this order' });
    }

    // Create line items for Stripe checkout
    const lineItems = order.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add delivery fee
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Delivery Fee',
        },
        unit_amount: 299, // $2.99 in cents
      },
      quantity: 1,
    });

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-success/${order._id}?payment_success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout?payment_cancelled=true`,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    // Update order with session ID
    order.stripeSessionId = session.id;
    order.paymentMethod = 'card';
    await order.save();

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ message: 'Payment processing failed', error: error.message });
  }
};

// Handle Stripe webhook events
export const handleWebhookEvent = async (req, res) => {
  const payload = req.rawBody || req.body;
  const sig = req.headers['stripe-signature'];
  
  let event;

  try {
    // Verify webhook signature
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } else {
      // For development when no signature is available
      event = typeof payload === 'string' ? JSON.parse(payload) : payload;
    }
    
    // Handle specific webhook events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Find the order using metadata
      const order = await Order.findById(session.metadata.orderId);
      if (order) {
        // Update payment status
        order.paymentStatus = 'completed';
        await order.save();
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ message: `Webhook Error: ${error.message}` });
  }
}; 