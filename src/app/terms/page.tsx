import type { Metadata } from "next";
import { PolicyPage, type PolicySectionData } from "@/components/policy-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms and conditions for shopping with QESHTA: orders, pricing, payment, cancellations, and your rights under Egyptian law.",
  alternates: {
    canonical: "/terms/",
  },
};

const updatedAt = "25 May 2026";

const sections: PolicySectionData[] = [
  {
    title: "Acceptance",
    content: (
      <p>
        These terms govern your use of the QESHTA online store and your purchase
        of products from {siteConfig.legalName}. By browsing the store, creating
        an account, or placing an order you agree to these terms. If you do not
        agree, please do not use the store.
      </p>
    ),
  },
  {
    title: "Orders And Acceptance",
    content: (
      <>
        <p>
          Placing an order is an offer to buy. The order is confirmed only once we
          accept it and begin preparing it, at which point a confirmation is sent
          to your account email. By ordering, you confirm that the details you
          submitted are accurate and that you are authorised to use the selected
          payment method.
        </p>
        <p>
          We may decline or cancel an order affected by a pricing or description
          error, suspected fraud, payment issues, or stock that is no longer
          available, and we will refund any amount already paid.
        </p>
      </>
    ),
  },
  {
    title: "Pricing And Payment",
    content: (
      <p>
        All prices are shown in Egyptian Pounds (EGP) and include applicable value
        added tax unless stated otherwise. Delivery fees, where they apply, are
        shown at checkout before you confirm. We accept Cash on Delivery across
        Egypt and card payment where available. Card details are entered and
        processed only on the secure platform of the payment provider.
      </p>
    ),
  },
  {
    title: "Availability And Changes",
    content: (
      <p>
        Product availability, prices, campaigns, and delivery times may change
        without notice. Colours and finishes may vary slightly from screen images
        due to photography and display differences. We aim to keep product
        information accurate and to correct errors as soon as we become aware of
        them.
      </p>
    ),
  },
  {
    title: "Cancellations",
    content: (
      <p>
        If you need to change or cancel an order, contact support as soon as
        possible with your order number. We can usually amend an order before it
        is dispatched. Once an order is on its way, the returns and exchanges
        policy applies.
      </p>
    ),
  },
  {
    title: "Intellectual Property",
    content: (
      <p>
        All content on the store, including the QESHTA name, logo, product images,
        text, and design, is owned by {siteConfig.legalName} or its licensors and
        is protected by law. You may not copy, reproduce, or use this content for
        commercial purposes without our written permission.
      </p>
    ),
  },
  {
    title: "Acceptable Use",
    content: (
      <p>
        You agree to use the store lawfully and not to attempt to disrupt it,
        access it without authorisation, submit false information, or use it in a
        way that infringes the rights of others. We may suspend accounts that
        breach these terms or applicable law.
      </p>
    ),
  },
  {
    title: "Limitation Of Liability",
    content: (
      <p>
        To the extent permitted by Egyptian law, QESHTA is not liable for indirect
        or consequential losses arising from use of the store. Nothing in these
        terms limits your statutory rights as a consumer under the Consumer
        Protection Law No. 181 of 2018.
      </p>
    ),
  },
  {
    title: "Governing Law",
    content: (
      <p>
        These terms are governed by the laws of the Arab Republic of Egypt. Any
        dispute that cannot be resolved amicably will be subject to the competent
        Egyptian courts. Unresolved consumer complaints may also be escalated to
        the Egyptian Consumer Protection Agency.
      </p>
    ),
  },
  {
    title: "Contact",
    content: (
      <p>
        Questions about these terms can be sent to support@qeshta.net or through
        our official Instagram and WhatsApp channels. QESHTA is operated in Cairo,
        Egypt.
      </p>
    ),
  },
];

export default function TermsPage() {
  return <PolicyPage title="Terms & Conditions" updatedAt={updatedAt} sections={sections} />;
}
