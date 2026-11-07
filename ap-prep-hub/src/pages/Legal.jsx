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

const LAST_UPDATED = 'November 7, 2026';

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
            <><strong>Account information:</strong> your name and email address, from Google Sign-In or the sign-up form. Passwords are handled by Firebase Authentication; we never see them.</>,
            <><strong>Study data:</strong> subject selections, study preferences, blackout schedules, tasks, answers to practice questions, and academic progress</>,
            <><strong>Conversation history:</strong> messages exchanged with AI tutors to maintain session context</>,
            <><strong>Test results:</strong> practice test answers, scores, and performance analytics</>,
            <><strong>Your content:</strong> flashcards, highlights, and feedback or bug reports. Bug reports include your browser, screen size, app version, and recent errors.</>,
            <><strong>Technical information:</strong> your IP address, which reaches our hosting providers, and browser and device details, which also reach our error-monitoring provider</>,
          ]}
        />
        <p>
          Without an account, most of what you do stays in your browser&apos;s storage on your device. Our AI service
          also uses a random ID kept in your browser and your IP address to apply usage limits.
        </p>
        <p>
          To set AI usage limits, each open tab also tells our AI service every few minutes that it is open, using a
          random ID. That ID isn&apos;t tied to your account, is kept in memory only, and is used only to count how many
          people are on the site.
        </p>
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

      <Section title="How AI Requests Are Handled">
        <p>
          When you use an AI feature, what you submit goes through our servers to Google&apos;s Gemini API, or to Puter
          if you connected it. That includes your messages, answers, and any file or photo you attach, along with the
          context the feature needs, such as your subject, your tutor preferences, and the display name the tutor calls you by.
        </p>
        <p>
          <strong>
            We use Gemini&apos;s free tier. Under Google&apos;s terms for that tier, Google may use what is submitted and
            the responses to improve its products and machine learning technologies, and human reviewers may read them.
          </strong>{' '}
          Google says it disconnects this data from the API account before reviewers see it, but we do not control what
          happens to it. <strong>Do not put personal or sensitive information in anything you send to the AI.</strong>
        </p>
        <p>
          Our AI service, which runs on Cloudflare, stores some AI answers for up to 30 days so a repeated question
          doesn&apos;t need the AI again. This covers tutor conversations of a single message and some study explanations,
          and a stored answer can be served to anyone who asks the same thing.
        </p>
      </Section>

      <Section title="Third-Party Services">
        <p>Apex Scholar integrates with the following third-party services, each with their own privacy policies:</p>
        <Bullets
          items={[
            <><strong>Firebase (Google):</strong> authentication and database storage</>,
            <><strong>Google Gemini API:</strong> AI service for generating tutoring responses, practice questions, and grading (see above)</>,
            <><strong>Puter.js:</strong> optional, opt-in access to additional AI models — only used if you connect it</>,
            <><strong>Netlify and Cloudflare:</strong> website hosting, serverless functions, our AI service, and email routing</>,
            <><strong>Google Analytics 4:</strong> anonymised usage measurement — see below</>,
            <><strong>Sentry:</strong> error and performance monitoring — see below</>,
            <><strong>EmailJS:</strong> delivers a copy of feedback and bug reports to us, including your email address if you are signed in</>,
            <><strong>SMTP2GO:</strong> delivery of study-reminder and announcement emails — see below</>,
          ]}
        />
        <p>We encourage you to review their respective privacy practices.</p>
      </Section>

      <Section title="Schoology and Canvas">
        <p>Connecting a class calendar or a Schoology account is optional. If you do:</p>
        <Bullets
          items={[
            <><strong>Calendar feed:</strong> we store the feed link you paste and read assignment titles, due dates, course names and links from it to build your study plan.</>,
            <><strong>Schoology sign-in:</strong> we store your Schoology name, user ID, school domain and an access token. The token is kept server-side and is never sent to your browser.</>,
            'Access is read-only: Apex Scholar never posts, submits, edits or deletes anything in Schoology or Canvas.',
            'We read only your own data, use it only to plan your studying, and never sell it or use it for advertising. It is shared only with the hosting and database providers listed above.',
            'Disconnecting in Settings stops access and deletes the stored token. Tasks already imported stay until you delete them.',
          ]}
        />
      </Section>

      <Section title="What Other Students Can See">
        <Bullets
          items={[
            <><strong>Classes:</strong> if you join a class, its members can see your display name, questions answered, accuracy, and tests taken on the class leaderboard.</>,
            <><strong>Public flashcard decks:</strong> if you make a deck public, anyone using Apex Scholar can see and copy it, along with your display name.</>,
          ]}
        />
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
          We never send your name, email address, chat messages, or individual answers to Google Analytics. It does
          receive events such as signing up, starting a study pack, or finishing a test, with the subject. When you
          finish the first-run check, it also receives how many questions you got right. Google Analytics sets cookies
          in your browser.
        </p>
      </Section>

      <Section title="Error Monitoring">
        <p>
          We use Sentry to find and fix bugs. It receives error details, performance timings, your browser and device
          details, and, if you are signed in, your account ID. We don&apos;t send it your name or email address, and we have
          set it not to store IP addresses. It also records about 10% of sessions and every
          session where an error occurs, as a replay of what happened on screen. All text is masked and all images and
          media are blocked in those replays. The Do Not Track setting above applies to analytics only, not to Sentry.
        </p>
      </Section>

      <Section title="Email">
        <p>
          New accounts only get study-reminder and announcement emails if they opt in, at sign-up or from the Email
          section of Settings. The box is never ticked for you. Accounts created before that box existed receive these
          emails unless they turn them off. We do not sell or rent your address, and we share it only with the email
          providers listed above.
        </p>
        <p>
          Every such email includes an unsubscribe link that works without signing in, and you can turn emails off at any
          time in Settings. These emails use open and click tracking, so we can see whether one was opened and which
          links were clicked. Account and security messages (for example a password reset) are sent regardless, because
          they concern your account rather than marketing.
        </p>
      </Section>

      <Section title="Data Security">
        <p>
          We implement appropriate technical measures to protect your personal information, including encrypted
          connections (HTTPS), Firebase security rules, and server-side handling of API keys. Your account data is stored
          in Google Cloud infrastructure via Firebase, in the United States.
        </p>
      </Section>

      <Section title="Data Retention">
        <p>
          Your data is kept until you ask us to delete it; accounts are not deleted automatically. Conversation histories
          and study data persist to support your ongoing learning. You may request deletion of your data at any time by
          email. We can&apos;t recall what has already been sent to Google or our other providers, and their own retention
          rules apply to it.
        </p>
      </Section>

      <Section title="Your Rights">
        <Bullets
          items={[
            'Ask us for a copy of your personal information by email',
            'Correct your name and preferences through Settings',
            'Request deletion of your account and the data we store, by email',
            'Disconnect third-party services (Puter, Schoology, your calendar feed)',
            'Opt out of emails at any time, from Settings or any unsubscribe link',
          ]}
        />
      </Section>

      <Section title="Children's Privacy">
        <p>
          Apex Scholar is designed for high school students preparing for AP exams, and you must be at least 13 to create
          an account. We do not knowingly collect personal information from children under 13. If you believe a child
          under 13 has given us information, email us and we will delete it.
        </p>
      </Section>

      <Section title="Contact Us">
        <p>
          If you have any questions about this Privacy Policy or wish to exercise your data rights, email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-400 underline">{CONTACT_EMAIL}</a>{' '}
          or use the Feedback option on the site.
        </p>
      </Section>
    </>
  );
}

function TermsOfService() {
  return (
    <>
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
          practice tests with AI scoring, study packs, score calculators, flashcards, spaced-repetition review, a problem
          solver, classes, and study scheduling.
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
          Much of the content on Apex Scholar, including explanations, practice questions, answer keys, and grading, is
          generated by AI systems. Predicted AP scores are calculated from estimated score curves, because the College
          Board does not publish its cut points. <strong>All of this can be wrong.</strong> Predicted scores are rough
          estimates, not a forecast of your real exam result, and AI grading is not equivalent to official College Board
          scoring.
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
          secure. Some features work without an account, including the AI tutors, study packs, score calculators, and the
          first-run check. The rest need a free account.
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
          allow other users to view and copy it within Apex Scholar, and they will see your display name. What you submit
          to AI features is handled as described in the Privacy Policy. You are responsible for having the right to upload
          whatever you submit.
        </p>
      </Section>

      <Section title="Availability and Warranties">
        <p>
          Apex Scholar is provided &quot;as is&quot; and &quot;as available&quot;, without warranties of any kind. We do
          not guarantee that the service will be uninterrupted, error-free, or that any particular result — including any
          exam score — will be achieved. Free third-party AI capacity may be rate-limited or unavailable at times. AI
          features have usage limits, and what each action counts toward them changes with how busy the site is.
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
        <p>
          Questions about these terms? Email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-400 underline">{CONTACT_EMAIL}</a> or use the
          Feedback option on the site.
        </p>
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
