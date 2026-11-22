import { describe, expect, it } from "vitest";
import { readCv, targetTitle, teamFrom, titlesFrom, yearsFrom } from "@/lib/grow/cv";
import { WORLDS } from "@/lib/itembank";

const CV = `Sara Mansour
Operations Coordinator, Gulf Freight Logistics | 2022 – present
- Coordinate daily dispatch across two warehouses and the courier schedule.
- Analysed delivery data to find the root cause of late shipments; cut misses by 18%.
- Work with customers and carriers on delays; write the weekly service report.
Warehouse Supervisor at Al Noor Distribution, 2019–2022
- Led a team of 12 pickers and packers on the afternoon shift.
- Planned rotas and prioritised orders against courier cut-offs.
Logistics Assistant, 2017 - 2019`;

describe("CV reader", () => {
  const now = new Date("2026-11-22T00:00:00Z");

  it("finds recent titles, latest first", () => {
    expect(titlesFrom(CV).slice(0, 2)).toEqual(["Operations Coordinator", "Warehouse Supervisor"]);
    expect(titlesFrom(CV)[0]).toBe("Operations Coordinator");
  });

  it("adds up years from date ranges, merging overlaps", () => {
    expect(yearsFrom(CV, now)).toBe(9);
    expect(yearsFrom("Over 6 years in retail", now)).toBe(6);
    expect(yearsFrom("خبرة 7 سنوات في المبيعات", now)).toBe(7);
  });

  it("notices managing people and team size", () => {
    expect(teamFrom(CV)).toEqual({ managesPeople: true, teamSize: 12 });
    expect(teamFrom("Individual contributor on the data team.").managesPeople).toBe(false);
    expect(teamFrom("أدرت فريقًا من 8 موظفين").teamSize).toBe(8);
  });

  it("matches the industry to a scene world, the family and what the CV shows", () => {
    const c = readCv(CV, WORLDS, now);
    expect(c.worldId).toBe("northwind-logistics");
    expect(c.family).toBe("operations");
    expect(c.shows.length).toBeGreaterThan(0);
  });

  it("reads the role someone is aiming for", () => {
    expect(targetTitle("Become a team lead within a year", "Coordinator")).toBe("Team lead");
    expect(targetTitle("Move into product management", "Analyst")).toBe("Analyst");
    expect(targetTitle("Head of operations by 2028", "x")).toBe("Head of operations");
    expect(targetTitle("Move from engineer to team lead", "x")).toBe("Team lead");
    expect(targetTitle("Get promoted to senior product manager", "x")).toBe("Senior product manager");
    expect(targetTitle("أن أصبح مدير عمليات خلال سنتين", "منسق")).toBe("مدير عمليات");
  });
});
