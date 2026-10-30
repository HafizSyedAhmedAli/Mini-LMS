import { describe, expect, it } from "vitest";
import { todayISO } from "@/shared/lib/date";
import { createStudent, loginAgent } from "../helpers/server";

describe("attendance", () => {
  it("prevents duplicates per person per date, allows other dates", async () => {
    const agent = await loginAgent();
    const { id } = await createStudent(agent);
    const date = todayISO();

    await agent.post("/api/attendance").send({ personId: id, date, status: "PRESENT" }).expect(201);
    await agent.post("/api/attendance").send({ personId: id, date, status: "ABSENT" }).expect(409);
    await agent
      .post("/api/attendance")
      .send({ personId: id, date: "2020-01-01", status: "ABSENT" })
      .expect(201);
  });

  it("queries by date and by person", async () => {
    const agent = await loginAgent();
    const { id } = await createStudent(agent);
    await agent
      .post("/api/attendance")
      .send({ personId: id, date: "2020-01-01", status: "LATE" })
      .expect(201);
    await agent
      .post("/api/attendance")
      .send({ personId: id, date: "2020-01-02", status: "PRESENT" })
      .expect(201);

    const byDate = await agent.get("/api/attendance?date=2020-01-01").expect(200);
    expect(byDate.body).toHaveLength(1);
    expect(byDate.body[0]).toMatchObject({ status: "LATE", date: "2020-01-01" });
    const byPerson = await agent.get(`/api/attendance?personId=${id}`).expect(200);
    expect(byPerson.body).toHaveLength(2);
  });

  it("rejects future dates, archived people, unknown people; allows corrections", async () => {
    const agent = await loginAgent();
    const { id } = await createStudent(agent);
    await agent
      .post("/api/attendance")
      .send({ personId: id, date: "2999-01-01", status: "PRESENT" })
      .expect(400);
    await agent
      .post("/api/attendance")
      .send({ personId: "nope", date: "2020-01-01", status: "PRESENT" })
      .expect(404);

    const rec = await agent
      .post("/api/attendance")
      .send({ personId: id, date: "2020-01-01", status: "PRESENT" })
      .expect(201);
    const fixed = await agent
      .patch(`/api/attendance/${rec.body.id}`)
      .send({ status: "ABSENT" })
      .expect(200);
    expect(fixed.body.status).toBe("ABSENT");

    await agent.patch(`/api/people/${id}`).send({ archived: true }).expect(200);
    await agent
      .post("/api/attendance")
      .send({ personId: id, date: "2020-01-05", status: "PRESENT" })
      .expect(409);
  });
});
