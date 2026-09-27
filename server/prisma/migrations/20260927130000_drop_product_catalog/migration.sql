-- Postgres Product was a global catalog keyed by name.
-- Diary rows keep their own snapshot. Open Food Facts is proxied without this table.
DROP TABLE "Product";
DROP SEQUENCE IF EXISTS "Product_id_seq";
