import { describe, expect, it } from "vitest";
import { localCalendarDate, shiftCalendarDate } from "./calendarDate";

describe("localCalendarDate", () => {
  it("uses the local calendar day, including the hour where UTC is still yesterday", () => {
    const localOneAm = new Date(2026, 8, 26, 1, 0, 0);
    expect(localCalendarDate(localOneAm)).toBe("2026-09-26");
  });
});

describe("shiftCalendarDate", () => {
  it("moves a day backward and forward without skipping", () => {
    expect(shiftCalendarDate("2026-09-26", -1)).toBe("2026-09-25");
    expect(shiftCalendarDate("2026-09-26", 1)).toBe("2026-09-27");
  });

  it("crosses month boundaries on the local calendar", () => {
    expect(shiftCalendarDate("2026-03-01", -1)).toBe("2026-02-28");
    expect(shiftCalendarDate("2024-03-01", -1)).toBe("2024-02-29");
  });
});
