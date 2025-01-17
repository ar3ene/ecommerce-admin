import Stripe from "stripe";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface OrderItem {
  productId: string;
  quantity: number;
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// app/api/[storeId]/checkout/route.ts
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  // Change the request body type
  const { items }: { items: OrderItem[] } = await req.json();
  // items should be an array of { productId: string, quantity: number }

  if (!items || items.length === 0) {
    return new NextResponse("Items are required", { status: 400 });
  }

  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: items.map(item => item.productId)
      }
    }
  });

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  products.forEach((product) => {
    const orderItem = items.find(item => item.productId === product.id);
    line_items.push({
      quantity: orderItem?.quantity || 1,
      price_data: {
        currency: 'JPY',
        product_data: {
          name: product.name,
        },
        // unit_amount: product.price.toNumber() * 100,
        unit_amount: product.price.toNumber(), // JPY is a zero-decimal currency
      }
    });
  });

  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId,
      isPaid: false,
      orderItems: {
        create: items.map((item) => ({
          product: {
            connect: {
              id: item.productId
            }
          },
          quantity: item.quantity
        }))
      }
    }
  });

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: 'payment',
    billing_address_collection: 'required',
    phone_number_collection: {
      enabled: true,
    },
    success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
    cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
    metadata: {
      orderId: order.id
    },
  });

  return NextResponse.json({ url: session.url }, {
    headers: corsHeaders
  });
};
