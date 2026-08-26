import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "Privacy policy",
  description: "How EshSpeaks handles your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      kicker="Legal"
      title="Privacy policy"
      intro="What we collect, why, and how it's stored. Last updated August 2026."
    >
      <LegalSection title="Account information">
        <p>
          Creating an account only requires an email address. We verify it with a one-time code — we
          never ask for or store a password. Once verified, you choose a username; a display name
          and profile photo are optional and can be changed or removed at any time from your account
          page.
        </p>
      </LegalSection>

      <LegalSection title="How sign-in works">
        <p>
          EshSpeaks uses short-lived access tokens and a longer-lived refresh token instead of
          server-side session cookies. The access token lives only in your browser's memory for the
          length of your visit; the refresh token is stored in your browser's local storage so you
          don't have to re-verify your email every time you return. Signing out clears both.
        </p>
      </LegalSection>

      <LegalSection title="What we don't do">
        <p>
          We don't sell your data to third parties. We don't run a payment processor through this
          site today, so we don't hold or process card details — subscription billing isn't live
          yet, and this page will be updated with the specifics before it is.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and similar technology">
        <p>
          We use a small number of strictly necessary cookies/local storage entries to keep you
          signed in and to remember your cookie preferences. Anything beyond that — analytics,
          personalization, advertising — only runs if you opt in through the cookie banner or the
          cookie settings link in the footer. See our{" "}
          <a href="/cookies" className="font-medium text-brand-orange hover:underline">
            cookie policy
          </a>{" "}
          for the full breakdown.
        </p>
      </LegalSection>

      <LegalSection title="Content from other sites">
        <p>
          Some articles embed content from other platforms (for example, a tweet or a video). When
          an embed loads, the platform it comes from may set its own cookies or collect data under
          its own privacy policy — that's between you and that platform, not something EshSpeaks
          controls.
        </p>
      </LegalSection>

      <LegalSection title="Your data, your control">
        <p>
          You can update your username, display name and photo at any time from your account page.
          To request a copy of your data or ask us to delete your account, email{" "}
          <a
            href="mailto:hello@eshspeaks.com"
            className="font-medium text-brand-orange hover:underline"
          >
            hello@eshspeaks.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
