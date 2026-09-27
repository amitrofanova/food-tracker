import { describe, expect, it } from "vitest";
import { formatUtcCalendarDate, parseCalendarDate } from "./calendarDate";

describe("parseCalendarDate", () => {
  it("returns UTC midnight of the calendar day", () => {
    expect(parseCalendarDate("2026-09-26")?.toISOString()).toBe("2026-09-26T00:00:00.000Z");
  });

  it("rejects a timestamp and an impossible day", () => {
    expect(parseCalendarDate("2026-09-26T00:00:00.000Z")).toBeNull();
    expect(parseCalendarDate("2026-02-31")).toBeNull();
    expect(parseCalendarDate("2026-9-26")).toBeNull();
  });
});

describe("formatUtcCalendarDate", () => {
  it("reads UTC components so a +5 offset does not turn UTC midnight into the previous day", () => {
    const utcMidnight = new Date(Date.UTC(2026, 8, 26));
    expect(formatUtcCalendarDate(utcMidnight)).toBe("2026-09-26");
  });
});
