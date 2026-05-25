import type { Metadata } from "next";
import { PolicyPage, type PolicySectionData } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description:
    "QESHTA shipping and delivery: processing times, delivery areas across Egypt, fees, Cash on Delivery, and order tracking.",
  alternates: {
    canonical: "/shipping-delivery/",
  },
};

const updatedAt = "25 May 2026";

const sections: PolicySectionData[] = [
  {
    title: "Order Processing",
    content: (
      <p>
        Orders are usually prepared within 1 to 2 business days. Once your order
        is confirmed, you will receive an email to the address linked to your
        account, and the order status is available on your account page.
      </p>
    ),
  },
  {
    title: "Delivery Areas And Times",
    content: (
      <>
        <p>
          We deliver across all governorates of Egypt. Delivery typically takes 2
          to 4 business days within Greater Cairo and 3 to 7 business days to other
          governorates, depending on the courier and your location.
        </p>
        <p>
          Delivery times are estimates and may vary during sale periods, public
          holidays, or due to circumstances outside our control.
        </p>
      </>
    ),
  },
  {
    title: "Delivery Fees",
    content: (
      <p>
        Delivery fees are calculated based on your destination and are shown
        clearly at checkout before you confirm your order. Any free-delivery
        thresholds or promotions will be reflected automatically at checkout.
      </p>
    ),
  },
  {
    title: "Cash On Delivery",
    content: (
      <p>
        Cash on Delivery is available across Egypt. Please have the exact order
        total ready in Egyptian Pounds (EGP) for the courier. Card payment is also
        available where supported, processed securely by our payment provider.
      </p>
    ),
  },
  {
    title: "Tracking Your Order",
    content: (
      <p>
        You can follow your order status and history on the account page once you
        are signed in. If you need an update, contact support with your order
        number and we will help.
      </p>
    ),
  },
  {
    title: "Failed Deliveries",
    content: (
      <p>
        Our courier will attempt delivery to the address you provided. If delivery
        cannot be completed after reasonable attempts, or the address is
        incomplete, the order may be returned to us. We will then contact you to
        arrange redelivery or a resolution.
      </p>
    ),
  },
  {
    title: "Contact",
    content: (
      <p>
        For delivery questions, contact QESHTA support at support@qeshta.com or
        through our official Instagram and WhatsApp channels. Please include your
        order number so we can respond quickly.
      </p>
    ),
  },
];

export default function ShippingDeliveryPage() {
  return <PolicyPage title="Shipping & Delivery" updatedAt={updatedAt} sections={sections} />;
}
