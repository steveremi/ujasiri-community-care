/**
 * Office hours, evaluated in Nairobi time.
 *
 * Used to decide whether to surface the national 24-hour helplines. When our
 * own lines are staffed we lead with them; when they are not, the numbers that
 * will actually be answered take their place.
 *
 * Two things this gets right on purpose:
 *
 *  - The timezone is pinned to Africa/Nairobi, not the visitor's device. A
 *    supporter checking the site from London at 11pm is looking at 2am in
 *    Nairobi, and the page must reflect whether our office is open — not
 *    whether theirs is.
 *
 *  - The fail-safe direction is OPEN. Anything that cannot determine the time
 *    is treated as out-of-hours, so the 24-hour numbers show. On a site
 *    covering HIV and gender-based violence, the cost of showing a national
 *    helpline unnecessarily is nil; the cost of hiding one from somebody in
 *    crisis is not.
 */

export const OFFICE = {
  timeZone: "Africa/Nairobi",
  /** 0 = Sunday. We are staffed Monday to Friday. */
  days: [1, 2, 3, 4, 5],
  openHour: 8,
  openMinute: 30,
  closeHour: 17,
  closeMinute: 0,
} as const;

/**
 * Is the UCC office staffed right now?
 *
 * Returns false if the time cannot be determined, so callers fall back to
 * showing the 24-hour lines.
 */
export function isOfficeOpen(now: Date = new Date()): boolean {
  try {
    // `en-GB` with an explicit timeZone gives a 24-hour clock in Nairobi time
    // regardless of where the code is running or how the device is configured.
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: OFFICE.timeZone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

    const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
      get("weekday"),
    );
    if (weekdayIndex === -1) return false;
    if (!(OFFICE.days as readonly number[]).includes(weekdayIndex)) return false;

    const hour = Number.parseInt(get("hour"), 10);
    const minute = Number.parseInt(get("minute"), 10);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return false;

    const minutes = hour * 60 + minute;
    const open = OFFICE.openHour * 60 + OFFICE.openMinute;
    const close = OFFICE.closeHour * 60 + OFFICE.closeMinute;

    return minutes >= open && minutes < close;
  } catch {
    // Unknown time — assume closed, so the 24-hour numbers are shown.
    return false;
  }
}

/**
 * National services that answer around the clock.
 *
 * These are public emergency numbers operated by other organisations. We
 * surface them when our own lines are closed, because a person in danger needs
 * a number that will be picked up — not ours specifically.
 */
export const nationalLines = [
  {
    label: "GBV national helpline",
    number: "1195",
    note: "Free, 24 hours, confidential",
  },
  {
    label: "Childline Kenya",
    number: "116",
    note: "Free, 24 hours, for and about children",
  },
  {
    label: "Police emergency",
    number: "999",
    note: "24 hours",
  },
] as const;
