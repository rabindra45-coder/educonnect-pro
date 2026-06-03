import { Helmet } from "react-helmet-async";
import MainLayout from "@/components/layout/MainLayout";

export default function Terms() {
  return (
    <MainLayout>
      <Helmet>
        <title>Terms & Conditions | Milestone International College</title>
        <meta
          name="description"
          content="Terms governing your use of the Milestone International College website and student portals."
        />
        <link rel="canonical" href="/terms" />
      </Helmet>
      <main className="container max-w-3xl py-12 prose prose-neutral dark:prose-invert">
        <h1>Terms & Conditions</h1>
        <p className="text-muted-foreground">Last updated: June 2026</p>

        <p>
          By accessing the Milestone International College website or any
          connected portal, you agree to these terms. If you do not agree,
          please do not use the service.
        </p>

        <h2>1. Eligibility & accounts</h2>
        <p>
          Accounts are issued by College administration. Self sign-up is not
          available. You are responsible for keeping your password and any
          biometric credentials confidential and for all activity under your
          account.
        </p>

        <h2>2. Acceptable use</h2>
        <ul>
          <li>No attempts to access data or portals outside your assigned role.</li>
          <li>No automated scraping, vulnerability probing, or denial-of-service activity.</li>
          <li>No upload of unlawful, harassing, or infringing content.</li>
          <li>No sharing of accounts or impersonation of staff, students, or guardians.</li>
        </ul>

        <h2>3. Academic & financial records</h2>
        <p>
          Marks, attendance, fee statements, and other records are managed by
          authorized College staff. Disputes must be raised through official
          channels; the platform's display of a record is not, by itself, a
          binding decision.
        </p>

        <h2>4. Payments</h2>
        <p>
          Online payments are processed through third-party gateways. The
          College is not responsible for failures, delays, or charges levied by
          those gateways. Always retain the receipt or transaction reference.
        </p>

        <h2>5. Content & intellectual property</h2>
        <p>
          The College retains all rights to its name, logo, course material,
          and platform content. User-submitted content remains yours, but you
          grant the College a license to host and display it as needed to
          operate the service.
        </p>

        <h2>6. Service availability</h2>
        <p>
          We aim for high availability but do not guarantee uninterrupted
          service. Maintenance, network issues, or events outside our control
          may cause downtime.
        </p>

        <h2>7. Termination</h2>
        <p>
          The College may suspend or terminate accounts that violate these
          terms or applicable law. You may request account closure through the
          administration.
        </p>

        <h2>8. Disclaimer & liability</h2>
        <p>
          The service is provided "as is". To the maximum extent permitted by
          law, the College is not liable for indirect or consequential damages
          arising from use of the platform.
        </p>

        <h2>9. Governing law</h2>
        <p>
          These terms are governed by the laws of Nepal. Disputes will be
          resolved in the competent courts of Kathmandu.
        </p>

        <h2>10. Changes</h2>
        <p>
          We may update these terms; material changes will be announced via
          notice on the portal. Continued use after changes constitutes
          acceptance.
        </p>
      </main>
    </MainLayout>
  );
}
