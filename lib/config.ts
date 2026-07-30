import type { EventConfig } from "@/types/registration";

/**
 * SINGLE SOURCE OF TRUTH for the event.
 *
 * Running the next edition should only require edits in this file: prize
 * amounts, date, venue, contact channels and headline copy. Nothing below is
 * duplicated anywhere else in the app.
 */
export const eventConfig: EventConfig = {
  edition: 4,
  title: "MEGA OPEN MIC",
  distributor: "SAIN MOTORS",
  distributorNote: "АЛБАН ЁСНЫ ДИСТРИБЬЮТЕР",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://megaopenmic.sainmotors.mn",

  // Ulaanbaatar is UTC+8 year round.
  utcOffsetHours: 8,

  /*
   * TODO before launch: fill in the event day and start time.
   *
   * Empty strings are deliberate — the date line under the form and the
   * structured data hide themselves rather than announce a date nobody has
   * confirmed. Set `label`, `weekday`, `iso` and `startTime` together.
   */
  schedule: {
    label: "",
    weekday: "",
    iso: "",
    startTime: "",
  },

  // TODO before launch: confirm the stage.
  venue: {
    name: "",
    hint: "",
    mapUrl: "",
  },

  // TODO before launch: fill in the official contact channels.
  // Empty strings intentionally hide the corresponding rows rather than
  // shipping placeholder data.
  contact: {
    phone: "",
    facebookUrl: "",
    instagramUrl: "",
  },

  // Split so the figure can be set as the graphic accent without repeating the
  // sentence around it. `after` carries its own case ending, so it is joined to
  // the figure with no space.
  incentive: {
    before: "Гэр бүл, найз нөхдийн хамт хүрэлцэн ирж, дуулах авьяасаа сорин, нийт",
    highlight: "400,000₮",
    after: "-ийн шатахууны эрхийн эзэн болоорой!",
  },
} as const;

/** The whole incentive sentence, for metadata and structured data. */
export function incentiveSentence(): string {
  const { before, highlight, after } = eventConfig.incentive;
  return `${before} ${highlight}${after}`;
}

/** "2026.08.15 · Бямба", dropping whichever half is not configured yet. */
export function eventDateLabel(): string {
  const { label, weekday } = eventConfig.schedule;
  return [label, weekday].filter(Boolean).join(" · ");
}

/** True once there is enough of a schedule or venue to be worth showing. */
export function hasEventDetails(): boolean {
  return Boolean(eventDateLabel() || eventConfig.venue.name);
}

/**
 * Epoch milliseconds for the opening moment, or `undefined` while the schedule
 * is still blank. Pure — no reference to the current time, so it is
 * hydration-safe.
 */
export function eventStartTimestamp(): number | undefined {
  const { iso, startTime } = eventConfig.schedule;
  if (!iso) return undefined;

  const offset = eventConfig.utcOffsetHours;
  const sign = offset < 0 ? "-" : "+";
  const zone = `${sign}${String(Math.abs(offset)).padStart(2, "0")}:00`;
  const parsed = Date.parse(`${iso}T${startTime || "00:00"}:00${zone}`);

  return Number.isFinite(parsed) ? parsed : undefined;
}
