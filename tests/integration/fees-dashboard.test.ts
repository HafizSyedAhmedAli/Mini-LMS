import { describe, expect, it } from "vitest";
import { todayISO } from "@/shared/lib/date";
import { createStudent, loginAgent } from "../helpers/server";

describe("fees", () => {
  it("derives balance and history from the ledger", async () => {
    const agent = await loginAgent();
    const { id } = await createStudent(agent);
    await agent.post("/api/fees").send({ personId: id, type: "CHARGE", amount: 1500 }).expect(201);
    await agent
      .post("/api/fees")
      .send({ personId: id, type: "PAYMENT", amount: 500.5 })
      .expect(201);

    const ledger = await agent.get(`/api/fees?personId=${id}`).expect(200);
    expect(ledger.body).toMatchObject({
      chargedMinor: 150000,
      paidMinor: 50050,
      balanceMinor: 99950,
    });
    expect(ledger.body.entries).toHaveLength(2);

    const rows = await agent.get("/api/fees/balances").expect(200);
    expect(rows.body[0]).toMatchObject({ balanceMinor: 99950 });
  });

  it("validates amounts, dates and who can be charged", async () => {
    const agent = await loginAgent();
    const { id } = await createStudent(agent);
    const staff = await agent
      .post("/api/people")
      .send({ kind: "STAFF", code: "T-1", firstName: "G", lastName: "H" })
      .expect(201);

    await agent.post("/api/fees").send({ personId: id, type: "CHARGE", amount: -1 }).expect(400);
    await agent.post("/api/fees").send({ personId: id, type: "CHARGE", amount: 1.234 }).expect(400);
    await agent
      .post("/api/fees")
      .send({ personId: id, type: "CHARGE", amount: 5, date: "2999-01-01" })
      .expect(400);
    await agent
      .post("/api/fees")
      .send({ personId: staff.body.id, type: "CHARGE", amount: 5 })
      .expect(400);
  });
});

describe("dashboard", () => {
  it("aggregates totals, today's attendance, collections and outstanding", async () => {
    const agent = await loginAgent();
    const { id } = await createStudent(agent);
    await agent
      .post("/api/people")
      .send({ kind: "STAFF", code: "T-1", firstName: "G", lastName: "H" })
      .expect(201);
    await agent
      .post("/api/attendance")
      .send({ personId: id, date: todayISO(), status: "PRESENT" })
      .expect(201);
    await agent.post("/api/fees").send({ personId: id, type: "CHARGE", amount: 1500 }).expect(201);
    await agent
      .post("/api/fees")
      .send({ personId: id, type: "PAYMENT", amount: 500.5 })
      .expect(201);

    const { body } = await agent.get("/api/dashboard").expect(200);
    expect(body.students).toBe(1);
    expect(body.staff).toBe(1);
    expect(body.attendance).toMatchObject({ present: 1, unmarked: 1 });
    expect(body.fees).toEqual({
      collectedTodayMinor: 50050,
      collectedMonthMinor: 50050,
      outstandingMinor: 99950,
      studentsOwing: 1,
    });
  });
});
