import { describe, expect, it } from "vitest";
import { rankProductsByQuery } from "./rankProductsByQuery";

describe("rankProductsByQuery", () => {
  it("lifts the matching fat-content name above other variants", () => {
    const ranked = rankProductsByQuery(
      [{ name: "Творог обезжиренный" }, { name: "Творог 5%" }, { name: "Творог 9%" }],
      "творог 9%",
    );
    expect(ranked.map((item) => item.name)).toEqual([
      "Творог 9%",
      "Творог обезжиренный",
      "Творог 5%",
    ]);
  });

  it("does not treat 19% as 9%", () => {
    const ranked = rankProductsByQuery(
      [{ name: "Продукт 19%" }, { name: "Продукт 9%" }],
      "продукт 9%",
    );
    expect(ranked[0]?.name).toBe("Продукт 9%");
  });
});
