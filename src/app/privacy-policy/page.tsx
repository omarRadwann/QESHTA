import type { Metadata } from "next";
import { PolicyPage, type PolicySectionData } from "@/components/policy-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the QESHTA privacy policy: how we collect, use, and protect your personal data under Egyptian law.",
  alternates: {
    canonical: "/privacy-policy/",
  },
};

const updatedAt = "25 May 2026";

const sections: PolicySectionData[] = [
  {
    title: "Overview",
    content: (
      <>
        <p>
          This policy explains how {siteConfig.legalName} collects, uses, and
          protects your personal data when you browse the store, create an
          account, save products, place an order, or contact us. It applies to
          all customers shopping with QESHTA in Egypt.
        </p>
        <p>
          We handle personal data in line with the Egyptian Personal Data
          Protection Law No. 151 of 2020 and the Consumer Protection Law No. 181
          of 2018, alongside widely accepted ecommerce privacy standards. By
          using the store you agree to the practices described in this policy.
        </p>
      </>
    ),
  },
  {
    title: "Information We Collect",
    content: (
      <>
        <ul>
          <li>Account details such as name, email address, phone number, and password.</li>
          <li>Order details including selected items, sizes, shipping address, and delivery notes.</li>
          <li>Wishlist and cart activity used to keep your shopping experience consistent.</li>
          <li>Technical information such as browser, device, page activity, and security logs.</li>
          <li>Marketing preferences when you choose to receive collection notes or newsletters.</li>
        </ul>
        <p>
          We do not collect or store full card numbers. Card payments are handled
          on the secure systems of the payment provider.
        </p>
      </>
    ),
  },
  {
    title: "How We Use Information",
    content: (
      <p>
        We use your data to create and manage accounts, confirm and fulfil
        orders, arrange delivery and cash-on-delivery collection, handle returns
        and refunds, prevent fraud, respond to support requests, improve the
        store, and send marketing only where you have opted in.
      </p>
    ),
  },
  {
    title: "Service Providers",
    content: (
      <p>
        QESHTA relies on trusted service providers for authentication, database
        hosting, product image storage, analytics, payment processing, delivery,
        and email. They may process your data only as needed to provide their
        service to the store and are expected to keep it secure.
      </p>
    ),
  },
  {
    title: "Cookies And Local Storage",
    content: (
      <p>
        The store keeps session tokens, cart contents, wishlist items, and
        preferences in your browser so the experience stays consistent. You can
        clear this data through your browser settings, but doing so may sign you
        out or remove saved shopping activity.
      </p>
    ),
  },
  {
    title: "International Data Transfer",
    content: (
      <p>
        Some of our service providers store and process data on secure servers
        located outside Egypt, including within the European Union. Where data is
        transferred internationally, we take reasonable steps to keep it
        protected to a standard consistent with Egyptian law.
      </p>
    ),
  },
  {
    title: "Data Retention",
    content: (
      <p>
        We keep personal data for as long as your account is active or as needed
        to provide our services, meet tax and commercial record-keeping
        obligations, resolve disputes, and enforce our agreements. When data is
        no longer required, we delete or anonymise it.
      </p>
    ),
  },
  {
    title: "Data Security",
    content: (
      <p>
        Access to customer data is restricted to authorised team members and
        protected by encryption in transit, role-based access controls, and
        audited administrative tooling. While no method of transmission or
        storage is completely secure, we work to protect your information and to
        notify you and the relevant authorities of any material breach as
        required by law.
      </p>
    ),
  },
  {
    title: "Your Choices",
    content: (
      <p>
        You can update your details from the account page, opt out of marketing
        at any time, request a copy of the personal data linked to your account,
        or ask us to delete your account. We respond to verified requests within
        a reasonable period.
      </p>
    ),
  },
  {
    title: "Your Rights Under Egyptian Law",
    content: (
      <p>
        Under the Personal Data Protection Law No. 151 of 2020 you have the right
        to access, correct, and request deletion of your personal data, and to
        withdraw consent to marketing. Under the Consumer Protection Law No. 181
        of 2018 you have the right to clear product information, fair pricing, and
        to return eligible online purchases. Unresolved consumer complaints may be
        escalated to the Egyptian Consumer Protection Agency.
      </p>
    ),
  },
  {
    id: "faq",
    title: "FAQ",
    content: (
      <>
        <p>
          <strong>I cannot sign in.</strong> Confirm the email linked to your
          account, then sign in again. If the problem continues, contact support
          with your account email.
        </p>
        <p>
          <strong>How do I track my order?</strong> Your order status and history
          are available on the account page once you are signed in.
        </p>
        <p>
          <strong>Do you offer Cash on Delivery?</strong> Yes. Cash on Delivery is
          available across Egypt, alongside card payment where supported.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: (
      <p>
        For privacy, order, return, or account requests, contact QESHTA support
        by email at support@qeshta.net or through our official Instagram and
        WhatsApp channels. Please include the email address connected to your
        account so we can verify and respond quickly. QESHTA is operated in Cairo,
        Egypt.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return <PolicyPage title="Privacy Policy" updatedAt={updatedAt} sections={sections} />;
}
