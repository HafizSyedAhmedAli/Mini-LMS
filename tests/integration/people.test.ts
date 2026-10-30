import { describe, expect, it } from "vitest";
import { createStudent, loginAgent } from "../helpers/server";

describe("people", () => {
  it("creates, rejects duplicates and invalid input", async () => {
    const agent = await loginAgent();
    await createStudent(agent, "S-1");
    await agent
      .post("/api/people")
      .send({ kind: "STUDENT", code: "S-1", firstName: "X", lastName: "Y" })
      .expect(409);
    await agent.post("/api/people").send({ kind: "STUDENT", code: "", firstName: "X" }).expect(400);
  });

  it("filters by kind and searches", async () => {
    const agent = await loginAgent();
    await createStudent(agent, "S-1");
    await agent
      .post("/api/people")
      .send({ kind: "STAFF", code: "T-1", firstName: "Grace", lastName: "Hopper" })
      .expect(201);

    const students = await agent.get("/api/people?kind=STUDENT").expect(200);
    expect(students.body).toHaveLength(1);
    const found = await agent.get("/api/people?q=hopp").expect(200);
    expect(found.body.map((p: { code: string }) => p.code)).toEqual(["T-1"]);
  });

  it("edits and archives (soft) without deleting", async () => {
    const agent = await loginAgent();
    const { id } = await createStudent(agent);
    const edited = await agent
      .patch(`/api/people/${id}`)
      .send({ firstName: "Augusta" })
      .expect(200);
    expect(edited.body.firstName).toBe("Augusta");

    await agent.patch(`/api/people/${id}`).send({ archived: true }).expect(200);
    expect((await agent.get("/api/people").expect(200)).body).toHaveLength(0);
    expect((await agent.get("/api/people?status=archived").expect(200)).body).toHaveLength(1);
    await agent.get(`/api/people/${id}`).expect(200);

    await agent.patch(`/api/people/${id}`).send({ archived: false }).expect(200);
    expect((await agent.get("/api/people").expect(200)).body).toHaveLength(1);
  });

  it("404s on unknown id", async () => {
    const agent = await loginAgent();
    await agent.get("/api/people/nope").expect(404);
  });
});
