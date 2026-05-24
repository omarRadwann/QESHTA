import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the QESHTA privacy policy, customer data practices, order terms, delivery notes, and returns policy.",
  alternates: {
    canonical: "/privacy-policy/",
  },
};

const updatedAt = "24 May 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.page}>
      <SiteHeader variant="light" />

      <section className={styles.hero} aria-labelledby="privacy-title">
        <p>Legal</p>
        <h1 id="privacy-title">Privacy Policy</h1>
        <span>Last updated {updatedAt}</span>
      </section>

      <div className={styles.content}>
        <PolicySection title="Overview">
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
        </PolicySection>

        <PolicySection title="Information We Collect">
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
        </PolicySection>

        <PolicySection title="How We Use Information">
          <p>
            We use your data to create and manage accounts, confirm and fulfil
            orders, arrange delivery and cash-on-delivery collection, handle returns
            and refunds, prevent fraud, respond to support requests, improve the
            store, and send marketing only where you have opted in.
          </p>
        </PolicySection>

        <PolicySection title="Service Providers">
          <p>
            QESHTA relies on trusted service providers for authentication, database
            hosting, product image storage, analytics, payment processing, delivery,
            and email. They may process your data only as needed to provide their
            service to the store and are expected to keep it secure.
          </p>
        </PolicySection>

        <PolicySection title="Cookies And Local Storage">
          <p>
            The store keeps session tokens, cart contents, wishlist items, and
            preferences in your browser so the experience stays consistent. You can
            clear this data through your browser settings, but doing so may sign you
            out or remove saved shopping activity.
          </p>
        </PolicySection>

        <PolicySection title="International Data Transfer">
          <p>
            Some of our service providers store and process data on secure servers
            located outside Egypt, including within the European Union. Where data
            is transferred internationally, we take reasonable steps to keep it
            protected to a standard consistent with Egyptian law.
          </p>
        </PolicySection>

        <PolicySection title="Data Retention">
          <p>
            We keep personal data for as long as your account is active or as needed
            to provide our services, meet tax and commercial record-keeping
            obligations, resolve disputes, and enforce our agreements. When data is
            no longer required, we delete or anonymise it.
          </p>
        </PolicySection>

        <PolicySection title="Your Choices">
          <p>
            You can update your details from the account page, opt out of marketing
            at any time, request a copy of the personal data linked to your account,
            or ask us to delete your account. We respond to verified requests within
            a reasonable period.
          </p>
        </PolicySection>

        <PolicySection title="Your Rights Under Egyptian Law">
          <p>
            Under the Personal Data Protection Law No. 151 of 2020 you have the
            right to access, correct, and request deletion of your personal data,
            and to withdraw consent to marketing. Under the Consumer Protection Law
            No. 181 of 2018 you have the right to clear product information, fair
            pricing, and to return eligible online purchases. Unresolved consumer
            complaints may be escalated to the Egyptian Consumer Protection Agency.
          </p>
        </PolicySection>

        <PolicySection id="orders" title="Payment And Delivery">
          <p>
            All prices are shown in Egyptian Pounds (EGP) and include applicable
            value added tax unless stated otherwise. We accept Cash on Delivery
            across Egypt and card payment where available. Card details are entered
            and processed only on the secure platform of the payment provider.
          </p>
          <p>
            Orders are usually prepared within 1 to 2 business days. Delivery
            typically takes 2 to 4 business days within Greater Cairo and 3 to 7
            business days to other governorates, with delivery fees shown at checkout
            before you confirm. If delivery cannot be completed after reasonable
            attempts, the order may be returned to us and we will contact you to
            arrange a resolution.
          </p>
        </PolicySection>

        <PolicySection id="returns" title="Returns And Exchanges">
          <p>
            In line with the Egyptian Consumer Protection Law, you may request a
            return or exchange within 14 days of receiving your order. Items must be
            unworn, unwashed, undamaged, and returned with original tags and
            packaging.
          </p>
          <p>
            For hygiene reasons, pierced jewellery such as earrings, and items marked
            final sale, cannot be returned unless they arrive defective. Approved
            refunds are issued to the original payment method, or by bank transfer or
            mobile wallet for Cash on Delivery orders, usually within 7 to 14 business
            days after we receive and inspect the item. Where the issue is a confirmed
            defect or an error on our side, we cover return shipping.
          </p>
        </PolicySection>

        <PolicySection id="terms" title="Terms And Conditions">
          <p>
            Product availability, prices, campaigns, and delivery times may change
            without notice. Placing an order is an offer to buy, and the order is
            confirmed once we accept and prepare it. By ordering, you confirm that the
            details you submitted are accurate and that you are authorised to use the
            selected payment method. We may cancel orders affected by pricing errors,
            suspected fraud, or stock issues, and will refund any amount already paid.
          </p>
        </PolicySection>

        <PolicySection id="faq" title="FAQ">
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
        </PolicySection>

        <PolicySection id="contact" title="Contact">
          <p>
            For privacy, order, return, or account requests, contact QESHTA support
            by email at support@qeshta.com or through our official Instagram and
            WhatsApp channels. Please include the email address connected to your
            account so we can verify and respond quickly. QESHTA is operated in
            Cairo, Egypt.
          </p>
        </PolicySection>
      </div>
    </main>
  );
}

function PolicySection({
  children,
  id,
  title,
}: {
  children: React.ReactNode;
  id?: string;
  title: string;
}) {
  return (
    <section id={id} className={styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
