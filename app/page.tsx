import type { Metadata } from "next";

import { EventLogistics } from "@/components/EventLogistics";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { RegistrationCard } from "@/components/RegistrationCard";
import {
  eventConfig,
  eventStartTimestamp,
  hasEventDetails,
  incentiveSentence,
} from "@/lib/config";

export const metadata: Metadata = {
  title: "Бүртгэл",
};

function EventStructuredData() {
  const start = eventStartTimestamp();
  const startDate = start === undefined ? undefined : new Date(start).toISOString();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: eventConfig.title,
    description: incentiveSentence(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(startDate ? { startDate } : {}),
    ...(eventConfig.venue.name
      ? {
          location: {
            "@type": "Place",
            name: eventConfig.venue.name,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Улаанбаатар",
              addressCountry: "MN",
              ...(eventConfig.venue.hint ? { description: eventConfig.venue.hint } : {}),
            },
          },
        }
      : {}),
    organizer: {
      "@type": "Organization",
      name: eventConfig.distributor,
      url: eventConfig.siteUrl,
    },
    image: [`${eventConfig.siteUrl}/event/open-mic-poster.jpg`],
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "MNT",
      availability: "https://schema.org/InStock",
      url: `${eventConfig.siteUrl}/#register`,
    },
  };

  return (
    <script
      type="application/ld+json"
      // Values come from the local config only — no user input reaches this.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function Page() {
  return (
    <>
      <EventStructuredData />
      <main className="mx-auto flex w-full max-w-[38rem] flex-col items-center px-5 pb-14 pt-10 sm:px-8 sm:pb-16 sm:pt-14">
        <PageHeader />

        {/* The incentive above hands off to the button here. */}
        <div className="mt-11 w-full sm:mt-13">
          <RegistrationCard />
        </div>

        {/* When and where. Silent until the schedule is confirmed in
            lib/config.ts. */}
        {hasEventDetails() ? (
          <div className="mt-11 w-full sm:mt-12">
            <EventLogistics />
          </div>
        ) : null}

        <Footer />
      </main>
    </>
  );
}
