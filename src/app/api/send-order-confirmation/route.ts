'use server';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import OrderConfirmationEmail from '@/components/emails/order-confirmation-email';
import { Order } from '@/lib/types';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const order = await req.json() as Order;

    if (!order || !order.id || !order.shippingInfo.email) {
      return NextResponse.json({ error: 'Missing order details' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Talha Luxe <noreply@talhaluxe.com>',
      to: [order.shippingInfo.email],
      subject: `Your Talha Luxe Order Confirmation #${order.id.substring(0,8)}`,
      react: OrderConfirmationEmail({ order }),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
