import { Helmet } from "react-helmet-async";
import MainLayout from "@/components/layout/MainLayout";

export default function Privacy() {
  return (
    <MainLayout>
      <Helmet>
        <title>Privacy Policy | Milestone International College</title>
        <meta
          name="description"
          content="How Milestone International College collects, uses, and protects your personal data across our website and student portals."
        />
        <link rel="canonical" href="/privacy" />
      </Helmet>
      <main className="container max-w-3xl py-12 prose prose-neutral dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: June 2026</p>

        <p>
          Milestone International College ("we", "us", "the College") operates
          this website and the connected student, parent, teacher, accountant,
          librarian, and admin portals. This Privacy Policy explains what
          personal information we collect, why we collect it, and how we
          protect it.
        </p>

        <h2>1. Information we collect</h2>
        <ul>
          <li>
            <strong>Account data:</strong> name, email, role, phone, profile
            photo, and credentials used to sign in.
          </li>
          <li>
            <strong>Academic & administrative data:</strong> admission forms,
            registration numbers, class/section, attendance, exam marks,
            timetables, library issues, fee records, and payments.
          </li>
          <li>
            <strong>Communications:</strong> notices, chat messages, support
            requests, and contact form submissions.
          </li>
          <li>
            <strong>Device & usage data:</strong> browser type, pages viewed,
            and crash diagnostics required to keep the service reliable.
          </li>
        </ul>

        <h2>2. How we use information</h2>
        <ul>
          <li>To operate the College's academic and financial workflows.</li>
          <li>
            To authenticate users and enforce role-based access (students,
            parents, teachers, accountants, librarians, admins).
          </li>
          <li>To send notices, fee reminders, and account-related emails.</li>
          <li>To investigate abuse, debug crashes, and improve the service.</li>
        </ul>

        <h2>3. Legal basis</h2>
        <p>
          We process data to perform the educational contract between the
          student/guardian and the College, to comply with legal record-keeping
          obligations, and on the basis of legitimate interests in running a
          safe, functional platform.
        </p>

        <h2>4. Sharing</h2>
        <p>
          We do not sell personal data. We share data only with: (a) processors
          that host our backend, email, and payment services strictly to deliver
          this platform, and (b) authorities when required by Nepali law.
        </p>

        <h2>5. Security</h2>
        <p>
          Data is transmitted over HTTPS. Passwords are hashed by our identity
          provider. Access is restricted by row-level security policies and
          role-based access controls. Sensitive uploads (payment proofs) are
          kept in private storage.
        </p>

        <h2>6. Retention</h2>
        <p>
          Academic and financial records are retained for the period required
          by the College and applicable regulations. Account data is removed on
          request unless retention is legally required.
        </p>

        <h2>7. Your rights</h2>
        <p>
          You may request access, correction, or deletion of your personal data
          by contacting the College administration. Students under 18 should
          have a parent or guardian make such requests.
        </p>

        <h2>8. Cookies</h2>
        <p>
          We use strictly necessary cookies and local storage to keep you
          signed in, remember your theme, and cache offline content. We do not
          use third-party advertising cookies.
        </p>

        <h2>9. Contact</h2>
        <p>
          Questions about this policy can be sent through the{" "}
          <a href="/contact">Contact page</a>.
        </p>
      </main>
    </MainLayout>
  );
}
