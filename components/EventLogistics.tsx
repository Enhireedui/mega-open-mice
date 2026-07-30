import { eventConfig, eventDateLabel, hasEventDetails } from "@/lib/config";

/**
 * When and where, sitting under the form as the closing confirmation.
 *
 * Renders nothing until `schedule` / `venue` are filled in in lib/config.ts —
 * an unconfirmed date is worse than no date on a page people register from, so
 * the block stays silent rather than showing a placeholder.
 */
export function EventLogistics() {
  if (!hasEventDetails()) return null;

  const dateLabel = eventDateLabel();
  const { name } = eventConfig.venue;
  const { startTime } = eventConfig.schedule;

  return (
    <div className="flex w-full flex-col items-center text-center">
      {dateLabel ? (
        <p className="font-display text-[1.0625rem] font-semibold leading-none tracking-[0.05em] tabular-nums text-white/92 sm:text-[1.1875rem]">
          {dateLabel}
        </p>
      ) : null}

      {startTime || name ? (
        <p className="mt-2 text-[0.75rem] leading-none text-white/50 sm:text-[0.8125rem]">
          {startTime ? <span className="tabular-nums">{startTime}</span> : null}
          {startTime && name ? (
            <span aria-hidden="true" className="mx-1.5 text-white/25">
              ·
            </span>
          ) : null}
          {name}
        </p>
      ) : null}
    </div>
  );
}
