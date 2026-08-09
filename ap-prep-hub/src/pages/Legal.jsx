/**
 * Legal pages — Privacy Policy and Terms of Service.
 *
 * These were a modal buried in the account menu, which meant they had no URL:
 * nothing to link to from a footer, an app-store listing, an OAuth consent
 * screen, or an email, and nothing for a crawler to index. They are now real
 * routes (/privacy and /terms) rendered outside GuestGate, because legal
 * documents must be readable without an account.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, FileText } from 'lucide-react';
import { createPageUrl } from '../utils/helpers';
import { CONTACT_EMAIL } from '../constants/contact';

const LAST_UPDATED = 'July 28, 2026';

const Section = ({ title, children }) => (
  <section className="space-y-2">
    <h2 className="text-h4 font-display text-content-primary">{title}</h2>
    <div className="text-body-sm text-content-secondary space-y-2 leading-relaxed">{children}</div>
  </section>
);

const Bullets = ({ items }) => (
  <ul className="space-y-1">
    {items.map((t, i) => (
      <li key={i}>• {t}</li>
    ))}
  </ul>
);

function PrivacyPolicy() {
  return (
    <>
      <Section title="Information We Collect">
        <p>We collect information you provide directly to us when you create an account and use our services. This includes:</p>
        <Bullets
          items={[
            <><strong>Account information:</strong> name and email address via Google Sign-In</>,
            <><strong>Study data:</strong> subject selections, study preferences, blackout schedules, and academic progress</>,
            <><strong>Conversation history:</strong> messages exchanged with AI tutors to maintain session context</>,
            <><strong>Test results:</strong> practice test scores and performance analytics</>,
            <><strong>User-generated content:</strong> flashcards, uploaded files, and feedback submissions</>,
          ]}
        />
      </Section>

      <Section title="How We Use Your Information">
        <Bullets
          items={[
            'Provide and improve our AI tutoring, practice tests, and study tools',
            'Personalize your learning experience and generate study schedules',
            'Track your progress across subjects and exams',
            'Process AI requests through our AI service providers',
            'Ensure the security and reliability of our platform',
          ]}
        />
      </Section>

      <Section title="Third-Party Services">
        <p>Apex Scholar integrates with the following third-party services, each with their own privacy policies:</p>
        <Bullets
          items={[
            <><strong>Firebase (Google):</strong> authentication and database storage</>,
            <><strong>Google Gemini API:</strong> AI service for generating tutoring responses, practice questions, and grading</>,
            <><strong>Puter.js:</strong> optional, opt-in access to additional AI models — only used if you connect it</>,
            <><strong>Netlify and Cloudflare:</strong> website hosting, serverless functions, and email routing</>,
            <><strong>Google Analytics 4:</strong> anonymised usage measurement — see below</>,
            <><strong>SMTP2GO:</strong> delivery of emails, only if you opt in to receiving them</>,
          ]}
        />
        <p>We encourage you to review their respective privacy practices.</p>
      </Section>

      <Section title="Analytics">
        <p>
          We use Google Analytics 4 to understand which parts of Apex Scholar are actually used, so we know what to
          improve. It records page views and general usage patterns. Because our users are mostly students under 18,
          we have deliberately restricted it:
        </p>
        <Bullets
          items={[
            'IP addresses are anonymised',
            'Google Signals is disabled, so no demographic profiling and no advertising audiences',
            'Ad personalisation is disabled — your activity is never used to target ads',
            'Data is retained for 14 months, then deleted automatically',
            <>We honour your browser's <strong>Do Not Track</strong> setting: with it enabled, no analytics load at all</>,
          ]}
        />
        <p>
          We never send your name, email address, chat messages, practice answers, or scores to Google Analytics.
        </p>
      </Section>

      <Section title="Email">
        <p>
          We only send marketing or study-reminder emails if you explicitly opt in — at sign-up, or from the Email
          section of Settings. The box is never ticked for you, and we do not sell, rent, or share your address.
        </p>
        <p>
          Every such email includes a one-click unsubscribe link that works without signing in, and you can turn
          emails off at any time in Settings. Account and security messages (for example a password reset) are sent
          regardless, because they concern your account rather than marketing.
        </p>
      </Section>

      <Section title="Data Security">
        <p>
          We implement appropriate technical measures to protect your personal information, including encrypted
          connections (HTTPS), Firebase security rules, and server-side handling of API keys. Your data is stored in
          Google Cloud infrastructure via Firebase.
        </p>
      </Section>

      <Section title="Data Retention">
        <p>
          Your data is retained for as long as your account is active. Conversation histories and study data persist to
          support your ongoing learning. You may request deletion of your data at any time.
        </p>
      </Section>

      <Section title="Your Rights">
        <Bullets
          items={[
            'Access and review your personal information',
            'Correct inaccurate data through Settings',
            'Request deletion of your account and all associated data',
            'Export your study data and progress',
            'Disconnect third-party services (Puter, Schoology)',
            'Opt out of emails at any time, from Settings or any unsubscribe link',
          ]}
        />
      </Section>

      <Section title="Children's Privacy">
        <p>
          Apex Scholar is designed for high school students preparing for AP exams. We do not knowingly collect personal
          information from children under 13 without parental consent.
        </p>
      </Section>

      <Section title="Contact Us">
        <p>
          If you have any questions about this Privacy Policy or wish to exercise your data rights, email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-400 underline">{CONTACT_EMAIL}</a>{' '}
          or use the Feedback option in the account menu.
        </p>
      </Section>
    </>
  );
}

function TermsOfService() {
  return (
    <>
      <Section title="Contact">
        <p>
          Questions about these terms? Email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-400 underline">{CONTACT_EMAIL}</a>.
        </p>
      </Section>
      <Section title="Agreement">
        <p>
          By using Apex Scholar you agree to these terms. If you do not agree, please do not use the service. We may
          update these terms as the product changes; continuing to use Apex Scholar after an update means you accept the
          revised terms.
        </p>
      </Section>

      <Section title="What Apex Scholar Is">
        <p>
          Apex Scholar is a free study tool for AP exam preparation. It provides AI tutoring, practice questions,
          practice tests with AI scoring, flashcards, spaced-repetition review, a problem solver, and study scheduling.
          The service is provided free of charge and we may change or discontinue features at any time.
        </p>
      </Section>

      <Section title="Not Affiliated With the College Board">
        <p>
          <strong>
            AP® and Advanced Placement® are registered trademarks of the College Board, which is not affiliated with and
            does not endorse Apex Scholar.
          </strong>{' '}
          All practice material on this site is independently produced. Referring to AP courses and exams is
          descriptive only and does not imply any partnership, sponsorship, or approval.
        </p>
      </Section>

      <Section title="AI-Generated Content">
        <p>
          Explanations, practice questions, answer keys, scores, and predicted AP scores on Apex Scholar are generated by
          AI systems. <strong>They can be wrong.</strong> Predicted scores are rough estimates, not a forecast of your
          real exam result, and AI grading is not equivalent to official College Board scoring.
        </p>
        <p>
          Always check important material against your teacher, your textbook, and official College Board resources.
          Do not rely on Apex Scholar as your only source of preparation.
        </p>
      </Section>

      <Section title="Eligibility and Accounts">
        <p>
          You must be at least 13 years old to create an account. If you are under 18, you should have a parent or
          guardian&apos;s permission. You are responsible for activity under your account and for keeping access to it
          secure. Guest mode is available for most features without an account.
        </p>
      </Section>

      <Section title="Acceptable Use">
        <p>You agree not to:</p>
        <Bullets
          items={[
            'Use the service to cheat on any exam, assignment, or assessment, or in any way that violates your school\'s academic integrity policy',
            'Upload secure or copyrighted exam material you are not permitted to share',
            'Attempt to disrupt, overload, scrape, or reverse-engineer the service or its AI providers',
            'Abuse the shared AI capacity, including automating requests or circumventing usage limits',
            'Submit content that is unlawful, harassing, or harmful to others',
          ]}
        />
        <p>We may suspend or remove access that harms the service or other students.</p>
      </Section>

      <Section title="Your Content">
        <p>
          You keep ownership of the flashcards, notes, uploads, and other content you create. By making a deck public you
          allow other users to view and copy it within Apex Scholar. You are responsible for having the right to upload
          whatever you submit.
        </p>
      </Section>

      <Section title="Availability and Warranties">
        <p>
          Apex Scholar is provided &quot;as is&quot; and &quot;as available&quot;, without warranties of any kind. We do
          not guarantee that the service will be uninterrupted, error-free, or that any particular result — including any
          exam score — will be achieved. Free third-party AI capacity may be rate-limited or unavailable at times.
        </p>
      </Section>

      <Section title="Limitation of Liability">
        <p>
          To the maximum extent permitted by law, Apex Scholar and its maintainers are not liable for any indirect,
          incidental, or consequential damages arising from your use of the service, including academic outcomes, lost
          study time, or loss of data.
        </p>
      </Section>

      <Section title="Termination">
        <p>
          You may stop using Apex Scholar and request deletion of your account at any time. We may suspend or terminate
          access that violates these terms or endangers the service.
        </p>
      </Section>

      <Section title="Contact">
        <p>Questions about these terms can be sent through the Feedback option in the account menu.</p>
      </Section>
    </>
  );
}

export default function Legal() {
  const { pathname } = useLocation();
  const isTerms = pathname.startsWith(createPageUrl('Terms'));

  const Icon = isTerms ? FileText : Shield;
  const title = isTerms ? 'Terms of Service' : 'Privacy Policy';

  return (
    <div className="min-h-screen bg-base-950 text-content-primary">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="flex items-center gap-3 mb-2">
          <Icon className="w-6 h-6 text-content-primary" strokeWidth={1.5} />
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-content-primary">{title}</h1>
        </div>
        <p className="text-caption text-content-muted mb-6">Last updated {LAST_UPDATED}</p>

        <div className="space-y-6">{isTerms ? <TermsOfService /> : <PrivacyPolicy />}</div>

        <div className="mt-10 pt-5 border-t border-border flex flex-wrap gap-4 text-body-sm">
          <Link
            to={isTerms ? createPageUrl('Privacy') : createPageUrl('Terms')}
            className="text-content-secondary hover:text-content-primary underline underline-offset-4"
          >
            {isTerms ? 'Read the Privacy Policy' : 'Read the Terms of Service'}
          </Link>
          <Link
            to={createPageUrl('AITutors')}
            className="text-content-muted hover:text-content-primary underline underline-offset-4"
          >
            Back to Apex Scholar
          </Link>
        </div>
      </div>
    </div>
  );
}
