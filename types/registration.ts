/**
 * Domain types for the MEGA OPEN MIC registration flow.
 * Shared by the client form, the server action and the event config.
 */

/** The day the event runs. Every field may be empty, which hides the output. */
export interface EventSchedule {
  /** Display label, e.g. "2026.08.15". Empty string hides date output entirely. */
  readonly label: string;
  /** Mongolian weekday label, e.g. "Бямба". */
  readonly weekday: string;
  /** ISO calendar date used for structured data, e.g. "2026-08-15". */
  readonly iso: string;
  /** Doors / start time, e.g. "18:00". */
  readonly startTime: string;
}

export interface EventVenue {
  readonly name: string;
  readonly hint: string;
  /** External map URL. Empty string hides the link. */
  readonly mapUrl: string;
}

export interface EventContact {
  /** Display form, e.g. "7777 0000". Empty string hides the row. */
  readonly phone: string;
  readonly facebookUrl: string;
  readonly instagramUrl: string;
}

/**
 * The reason to register, set as the bridge between the title block and the
 * form. Split so the figure can carry the emphasis on its own.
 *
 * `after` is joined to `highlight` with no space, so it can start with a
 * Mongolian case ending such as "-ийн".
 */
export interface EventIncentiveCopy {
  readonly before: string;
  /** The figure that does the persuading, e.g. "400,000₮". */
  readonly highlight: string;
  readonly after: string;
}

export interface EventConfig {
  readonly edition: number;
  readonly title: string;
  readonly distributor: string;
  readonly distributorNote: string;
  readonly siteUrl: string;
  /** UTC offset of the venue, in hours (Ulaanbaatar = +8). */
  readonly utcOffsetHours: number;
  readonly schedule: EventSchedule;
  readonly venue: EventVenue;
  readonly contact: EventContact;
  readonly incentive: EventIncentiveCopy;
}

/** Raw values held by the form. `honeypot` must stay empty for humans. */
export interface RegistrationFormValues {
  fullName: string;
  phone: string;
  songName: string;
  honeypot: string;
}

export type RegistrationErrorCode =
  | "VALIDATION"
  | "DUPLICATE"
  | "TIMEOUT"
  | "NETWORK"
  | "UPSTREAM"
  | "CONFIG"
  | "UNKNOWN";

export type RegistrationResult =
  | { readonly status: "success" }
  | {
      readonly status: "error";
      readonly code: RegistrationErrorCode;
      /** Field to focus when the failure is attributable to one. */
      readonly field?: keyof RegistrationFormValues;
    };

/** Payload contract shared with the Google Apps Script endpoint. */
export interface RegistrationPayload {
  readonly timestamp: string;
  readonly fullName: string;
  readonly phone: string;
  readonly songName: string;
}
