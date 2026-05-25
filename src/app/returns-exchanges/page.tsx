import type { Metadata } from "next";
import { PolicyPage, type PolicySectionData } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description:
    "QESHTA returns and exchanges policy: 14-day return window, condition requirements, refunds, and faulty item handling under Egyptian law.",
  alternates: {
    canonical: "/returns-exchanges/",
  },
};

const updatedAt = "25 May 2026";

const sections: PolicySectionData[] = [
  {
    title: "Return Window",
    content: (
      <p>
        In line with the Egyptian Consumer Protection Law No. 181 of 2018, you may
        request a return or exchange within 14 days of receiving your order. The
        request should be made within this window, with the item returned promptly
        afterwards.
      </p>
    ),
  },
  {
    title: "Condition Requirements",
    content: (
      <p>
        Items must be unworn, unwashed, and undamaged, with all original tags and
        packaging intact. Items showing signs of wear, alteration, or damage not
        present on delivery may not be accepted, or may be subject to a partial
        refund.
      </p>
    ),
  },
  {
    title: "How To Start A Return",
    content: (
      <>
        <p>
          To start a return or exchange, contact support at support@qeshta.com or
          through our official Instagram and WhatsApp channels with your order
          number and the item you wish to return, and tell us whether you would
          like a refund or an exchange.
        </p>
        <p>
          We will confirm the next steps, including how to hand the item to our
          courier. Please keep the item in its original packaging until the return
          is arranged.
        </p>
      </>
    ),
  },
  {
    title: "Refunds",
    content: (
      <p>
        Approved refunds are issued to the original payment method, or by bank
        transfer or mobile wallet for Cash on Delivery orders, usually within 7 to
        14 business days after we receive and inspect the item. Original delivery
        fees are non-refundable unless the return is due to a confirmed defect or
        an error on our side.
      </p>
    ),
  },
  {
    title: "Exchanges",
    content: (
      <p>
        Exchanges are subject to availability. If the requested size or piece is
        unavailable, we will offer an alternative or process a refund. Any price
        difference will be settled before the exchange is dispatched.
      </p>
    ),
  },
  {
    title: "Non-Returnable Items",
    content: (
      <p>
        For hygiene reasons, pierced jewellery such as earrings, and items marked
        final sale, cannot be returned unless they arrive defective. Any
        exceptions required by law are always honoured.
      </p>
    ),
  },
  {
    title: "Faulty Or Incorrect Items",
    content: (
      <p>
        If an item arrives faulty, damaged, or different from what you ordered,
        contact us within the return window and we will arrange a replacement or a
        full refund, including return shipping, at no cost to you.
      </p>
    ),
  },
  {
    title: "Contact",
    content: (
      <p>
        For returns and exchanges, contact QESHTA support at support@qeshta.com or
        through our official Instagram and WhatsApp channels. Please include your
        order number so we can verify and respond quickly.
      </p>
    ),
  },
];

export default function ReturnsExchangesPage() {
  return <PolicyPage title="Returns & Exchanges" updatedAt={updatedAt} sections={sections} />;
}
