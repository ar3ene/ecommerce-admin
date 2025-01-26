import Stripe from "stripe";
import { NextResponse } from "next/server";
import { CurrencyType, getExchangeRates, convertCurrency } from "@/lib/currency";

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
  
  const { items, currency = "CNY"}: { items: OrderItem[], currency: CurrencyType} = await req.json();
  

  if (!items || items.length === 0) {
    return new NextResponse("Items are required", { status: 400 });
  }

  const rates = await getExchangeRates("CNY");

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
    
    const priceInCNY = product.price.toNumber();
    const priceInTargetCurrency = convertCurrency(
      priceInCNY,
      "CNY",
      currency as CurrencyType,
      rates.rates
    );

    line_items.push({
      quantity: orderItem?.quantity || 1,
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: product.name,
        },
        unit_amount: Math.round(
          ["jpy", "krw"].includes(currency.toLowerCase()) 
            ? priceInTargetCurrency 
            : priceInTargetCurrency * 100
        ),
      }
    });
  });

  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId,
      isPaid: false,
      orderCurrency: currency,
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
      orderId: order.id,
      currency: currency
    },
  });

  return NextResponse.json({ url: session.url }, {
    headers: corsHeaders
  });
};
