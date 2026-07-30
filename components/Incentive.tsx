import { eventConfig } from "@/lib/config";

/**
 * The reason to register, placed as the bridge between the event mark and the
 * button that opens the form — the last thing read before the first tap.
 *
 * Colour comes from the poster's golden hour rather than from the brand red:
 * the sentence is top-lit warm metal, the figure is the same light
 * concentrated. That keeps red reserved for action, and reads as expensive
 * rather than as marketing.
 */
export function Incentive() {
  const { before, highlight, after } = eventConfig.incentive;

  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Warmth around the statement, never colour inside the letters. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-full max-w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,color-mix(in_srgb,var(--color-ember)_16%,transparent)_0%,transparent_70%)] blur-2xl"
      />

      <p className="text-dusk relative max-w-[20rem] text-balance font-display text-[clamp(1.1875rem,4.2vw,1.625rem)] font-semibold leading-[1.45] tracking-[-0.015em] sm:max-w-[33rem]">
        {before}{" "}
        {/* The figure reads as lit metal: golden fill over its own small glow.
            No space before `after` — it carries the "-ийн" ending. */}
        <span className="relative inline-block align-baseline">
          <span
            aria-hidden="true"
            /* Painted first, so the glyph sits on top without needing z-index. */
            className="pointer-events-none absolute -inset-x-3 -inset-y-2 rounded-full bg-[radial-gradient(ellipse,color-mix(in_srgb,var(--color-ember-hi)_36%,transparent)_0%,transparent_72%)] blur-md"
          />
          <span className="text-ember-metal relative whitespace-nowrap text-[1.14em] font-bold tracking-[-0.02em] tabular-nums">
            {highlight}
          </span>
        </span>
        {after}
      </p>
    </div>
  );
}
