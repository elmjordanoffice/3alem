import { describe, expect, it } from "vitest";
import { PERMISSIONS, can, permissionsFor, wouldRemoveLastAdmin } from "@/lib/auth/roles";

describe("roles and permissions", () => {
  it("gives org admins every permission", () => {
    expect(permissionsFor(["ORG_ADMIN"]).size).toBe(PERMISSIONS.length);
  });

  it("lets recruiters create assessments but not manage members", () => {
    const ctx = { isPlatformAdmin: false, roles: ["RECRUITER"] as const };
    expect(can(ctx, "assessment.create")).toBe(true);
    expect(can(ctx, "candidate.invite")).toBe(true);
    expect(can(ctx, "members.manage")).toBe(false);
    expect(can(ctx, "team.manage")).toBe(false);
  });

  it("keeps hiring managers read-only", () => {
    const ctx = { isPlatformAdmin: false, roles: ["HIRING_MANAGER"] as const };
    expect(can(ctx, "report.view")).toBe(true);
    expect(can(ctx, "assessment.create")).toBe(false);
    expect(can(ctx, "report.share")).toBe(false);
  });

  it("scopes team managers to Team mode", () => {
    const ctx = { isPlatformAdmin: false, roles: ["TEAM_MANAGER"] as const };
    expect(can(ctx, "team.manage")).toBe(true);
    expect(can(ctx, "candidate.view")).toBe(false);
  });

  it("combines roles", () => {
    const ctx = { isPlatformAdmin: false, roles: ["HIRING_MANAGER", "TEAM_MANAGER"] as const };
    expect(can(ctx, "report.view")).toBe(true);
    expect(can(ctx, "team.manage")).toBe(true);
  });

  it("gives individuals with no org role no org permissions", () => {
    for (const p of PERMISSIONS) expect(can({ isPlatformAdmin: false, roles: [] }, p)).toBe(false);
  });

  it("lets platform admins do anything", () => {
    for (const p of PERMISSIONS) expect(can({ isPlatformAdmin: true, roles: [] }, p)).toBe(true);
  });

  it("never removes the last admin", () => {
    const members = [
      { userId: "a", roles: ["ORG_ADMIN"] as const },
      { userId: "b", roles: ["RECRUITER"] as const },
    ];
    expect(wouldRemoveLastAdmin(members, "a", ["RECRUITER"])).toBe(true);
    expect(wouldRemoveLastAdmin(members, "a", [])).toBe(true);
    expect(wouldRemoveLastAdmin(members, "b", [])).toBe(false);
    expect(wouldRemoveLastAdmin([...members, { userId: "c", roles: ["ORG_ADMIN"] as const }], "a", [])).toBe(false);
  });
});
