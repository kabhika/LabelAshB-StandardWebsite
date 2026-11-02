export interface OrderForNotify {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  shipping_address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  total: number;
  currency: string;
  razorpay_payment_id: string | null;
  created_at: string;
  items: { product_title: string; variant_title: string; quantity: number; line_total: number }[];
}

export type ChannelResult =
  | { status: "sent" }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string };

export interface ChannelOutcome {
  channel: "email" | "sms" | "whatsapp";
  recipient: string;
  result: ChannelResult;
}
