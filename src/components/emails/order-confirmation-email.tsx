import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { Order } from '@/lib/types';
import { format } from 'date-fns';

interface OrderConfirmationEmailProps {
  order: Order;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

export const OrderConfirmationEmail = ({ order }: OrderConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your Talha Luxe Order Confirmation</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logo}>
           <Heading style={heading}>Thanks for your order!</Heading>
        </Section>
        <Section style={box}>
          <Text style={paragraph}>
            Hi {order.shippingInfo.name}, we're getting your order ready to be shipped. We will notify you when it has been sent.
          </Text>
          <Text style={paragraph}>
            Order ID: {order.id}
          </Text>
          <Text style={paragraph}>
            Order Date: {format(new Date(order.createdAt), 'PPP')}
          </Text>
          
          <Hr style={hr} />

          <Heading as="h2" style={productTitle}>Items Ordered</Heading>
          {order.items.map((item) => (
            <Section key={item.productId}>
                <Text style={productItem}>{item.name} (x{item.quantity}) - PKR {(item.price * item.quantity).toFixed(2)}</Text>
            </Section>
          ))}

          <Hr style={hr} />

          <Section style={totals}>
            <Text style={totalText}>Subtotal: PKR {order.totalPrice.toFixed(2)}</Text>
            <Text style={totalText}>Shipping: Free</Text>
            <Text style={{...totalText, fontWeight: 'bold'}}>Total: PKR {order.totalPrice.toFixed(2)}</Text>
          </Section>
          
          <Hr style={hr} />

          <Section>
            <Heading as="h2" style={productTitle}>Shipping To</Heading>
            <Text style={addressText}>
                {order.shippingInfo.name}<br/>
                {order.shippingInfo.address}<br/>
                {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zip}<br/>
                {order.shippingInfo.country}
            </Text>
          </Section>
        </Section>
        <Text style={footer}>
          Talha Luxe, Your favorite store.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OrderConfirmationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const logo = {
    padding: '0 48px',
};

const heading = {
    fontSize: '28px',
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
};

const productTitle = {
    fontSize: '18px',
    fontWeight: 'bold' as const,
}

const productItem = {
    fontSize: '14px',
    lineHeight: '24px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};

const totals = {
    textAlign: 'right' as const,
}

const totalText = {
    ...paragraph,
    textAlign: 'right' as const,
}

const addressText = {
    ...paragraph,
    fontSize: '14px',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
};
