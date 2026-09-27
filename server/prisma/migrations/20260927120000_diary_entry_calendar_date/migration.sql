-- DiaryEntry.date is a calendar day, not a timestamp.
-- Rows written before this migration stored UTC midnight of YYYY-MM-DD.
-- Confirm existing values are 00:00:00 before applying on production.
ALTER TABLE "DiaryEntry" ALTER COLUMN "date" TYPE DATE USING ("date"::date);
