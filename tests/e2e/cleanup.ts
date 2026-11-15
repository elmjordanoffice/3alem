import { withDb } from "./db";

/**
 * Remove everything the end-to-end suite creates, so the demo organisation
 * stays as the demo seed left it. Test data is recognisable: addresses at
 * @test.aalim, roles created from the test job description, "Pilot" teams.
 */
export async function cleanupTestData() {
  await withDb(async (c) => {
    await c.query("BEGIN");
    const sessions = `
      SELECT s.id FROM assessment_session s
      LEFT JOIN invitation i ON i.id = s."invitationId"
      LEFT JOIN assessment_template t ON t.id = s."templateId"
      LEFT JOIN "user" u ON u.id = s."subjectUserId"
      WHERE i.email LIKE '%@test.aalim' OR i.email LIKE '%@t.aalim' OR t.title = 'Senior Data Analyst' OR u.email LIKE '%@test.aalim'`;
    await c.query(`DELETE FROM fairness_response WHERE "sessionRef" IN (${sessions})`);
    await c.query(`DELETE FROM outcome_rating WHERE "sessionId" IN (${sessions})`);
    await c.query(`DELETE FROM assessment_session WHERE id IN (${sessions})`);
    await c.query(`DELETE FROM invitation WHERE email LIKE '%@test.aalim'`);
    await c.query(`DELETE FROM assessment_template WHERE title = 'Senior Data Analyst'`);
    await c.query(`DELETE FROM team WHERE name LIKE 'Pilot %'`);
    await c.query(`DELETE FROM "user" WHERE email LIKE '%@test.aalim'`);
    await c.query("COMMIT");
  });
}
