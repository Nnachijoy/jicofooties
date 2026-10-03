import {
  Html,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Row,
  Column,
  Hr,
  Preview,
} from '@react-email/components';

interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationProps {
  customerName: string;
  orderId: string;
  items: OrderItem[];
  total: number;
}

export function OrderConfirmationEmail({
  customerName,
  orderId,
  items,
  total,
}: OrderConfirmationProps) {
  return (
    <Html>
      <Preview>Your JICO FOOTIES order has been confirmed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Thank you, {customerName}.</Heading>
          <Text style={paragraph}>
            Your order <strong>#{orderId.slice(0, 8)}</strong> has been
            confirmed and is being prepared.
          </Text>

          <Hr style={hr} />

          {items.map((item, i) => (
            <Section key={i} style={itemRow}>
              <Row>
                <Column style={itemName}>
                  {item.name} (Size {item.size})
                </Column>
                <Column style={itemQty}>x{item.quantity}</Column>
                <Column style={itemPrice}>
                  ₦{(item.price * item.quantity).toLocaleString()}
                </Column>
              </Row>
            </Section>
          ))}

          <Hr style={hr} />

          <Row>
            <Column style={totalLabel}>Total</Column>
            <Column style={totalAmount}>
              ₦{total.toLocaleString()}
            </Column>
          </Row>

          <Text style={footer}>
            JICO FOOTIES · Lagos, Nigeria
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f5f3ee',
  fontFamily: 'Georgia, "Times New Roman", serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const h1 = {
  color: '#181917',
  fontSize: '24px',
  fontWeight: '500',
  lineHeight: '1.3',
  margin: '0 0 20px',
};

const paragraph = {
  color: '#3a3a38',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 20px',
};

const hr = {
  borderColor: '#d5d2ca',
  margin: '20px 0',
};

const itemRow = {
  marginBottom: '10px',
};

const itemName = {
  color: '#3a3a38',
  fontSize: '13px',
  width: '60%',
};

const itemQty = {
  color: '#77796f',
  fontSize: '13px',
  width: '15%',
  textAlign: 'center' as const,
};

const itemPrice = {
  color: '#3a3a38',
  fontSize: '13px',
  width: '25%',
  textAlign: 'right' as const,
};

const totalLabel = {
  color: '#181917',
  fontSize: '14px',
  fontWeight: 'bold' as const,
};

const totalAmount = {
  color: '#181917',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textAlign: 'right' as const,
};

const footer = {
  color: '#77796f',
  fontSize: '12px',
  marginTop: '30px',
};