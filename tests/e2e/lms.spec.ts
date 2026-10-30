import { expect, test } from "@playwright/test";

test("admin runs the full flow: login → student → attendance → fees → dashboard → logout", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await page.waitForLoadState("networkidle");

  await page.getByLabel("Email").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("Password").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  // student
  await page.getByRole("link", { name: "Students" }).click();
  await page.getByRole("button", { name: "Add student" }).click();
  await page.getByLabel("Code").fill("S-001");
  await page.getByLabel("First name").fill("Ada");
  await page.getByLabel("Last name").fill("Lovelace");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("row", { name: /Ada Lovelace/ })).toBeVisible();

  // attendance (+ correction, persisted across reload)
  await page.getByRole("link", { name: "Attendance" }).click();
  const row = page.getByRole("row", { name: /Ada Lovelace/ });
  await row.getByRole("button", { name: "Present", exact: true }).click();
  await expect(row.getByTestId("status")).toHaveText("Present");
  await row.getByRole("button", { name: "Absent", exact: true }).click();
  await expect(row.getByTestId("status")).toHaveText("Absent");
  await page.reload();
  await expect(row.getByTestId("status")).toHaveText("Absent");

  // fees
  await page.getByRole("link", { name: "Fees" }).click();
  await page.getByRole("button", { name: /Ada Lovelace/ }).click();
  await page.getByLabel("Amount").fill("1500");
  await page.getByRole("button", { name: "Record" }).click();
  await expect(page.getByTestId("balance")).toContainText("1,500.00");
  await page.getByLabel("Type").selectOption({ label: "Payment" });
  await page.getByLabel("Amount").fill("500.50");
  await page.getByRole("button", { name: "Record" }).click();
  await expect(page.getByTestId("balance")).toContainText("999.50");

  // dashboard
  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page.getByTestId("stat-students")).toHaveText("1");
  await expect(page.getByTestId("stat-collected-today")).toContainText("500.50");
  await expect(page.getByTestId("stat-outstanding")).toContainText("999.50");

  // logout locks everything
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect((await page.request.get("/api/dashboard")).status()).toBe(401);
  await page.goto("/students");
  await expect(page).toHaveURL(/\/login$/);
});
