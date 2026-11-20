import { test, expect } from "@playwright/test";

test("mobile demo, persistent attribution, sharing fallback, metrics and PWA assets", async ({ page, context, request }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const landingStored = page.waitForResponse(response => response.url().endsWith("/api/events"));
  await page.goto("/?utm_source=launch&utm_medium=social&utm_campaign=weekend&utm_content=stage&ref=friend");
  const landingResponse = await landingStored;
  expect(await landingResponse.json()).toEqual({ stored: true });
  await expect(page.getByRole("heading", { name: /Less planning/ })).toBeVisible();
  await page.getByRole("button", { name: "Try Example" }).click();
  await expect(page.getByLabel("What are you building?")).toHaveValue(/students/);
  await page.getByRole("button", { name: "Make my launch plan" }).click();
  await expect(page.getByText("Saved demo example", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const identity = await page.evaluate(() => JSON.parse(localStorage.getItem("launch_identity")!));
  await page.goto("/?utm_source=changed");
  const again = await page.evaluate(() => JSON.parse(localStorage.getItem("launch_identity")!));
  expect(again).toEqual(identity);
  await page.getByRole("button", { name: "Try Example" }).click();
  await page.getByRole("button", { name: "Make my launch plan" }).click();
  await expect(page.getByText("Saved demo example", { exact: true })).toBeVisible();
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.evaluate(() => Object.defineProperty(navigator, "share", { value: undefined, configurable: true }));
  await page.getByRole("button", { name: "Share with a friend" }).click();
  await expect(page.getByText("Referral link copied.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(`ref=${identity.anon_user_id}`);
  await page.getByRole("link", { name: "Live metrics" }).click();
  await expect(page.getByRole("heading", { name: "Proof, not promises." })).toBeVisible();
  await expect(page.getByText("Connected · refreshes every 10 seconds")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/metrics-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "test-results/metrics-desktop.png", fullPage: true });
  const metrics = await (await request.get("/api/metrics")).json();
  expect(metrics.active).toBe(0);
  expect(metrics.visitors).toBe(1);
  expect(metrics.channels[0].source).toBe("launch");
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.display).toBe("standalone");
  for (const size of [192, 512]) expect((await request.get(`/icon-${size}.png`)).status()).toBe(200);
  expect(errors).toEqual([]);
});

test("mobile consumes successful streamed results and recovers from interrupted streams", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route("**/api/generate", route => route.fulfill({
    contentType: "application/x-ndjson",
    body: '{"type":"text","text":"Your personalized plan."}\n{"type":"done","mode":"live"}\n',
  }));
  // Do not send synthetic completions to the real event store.
  const captured: string[] = [];
  await page.route("**/api/events", route => { captured.push(route.request().postData()!); return route.fulfill({ json: { stored: true } }); });
  await page.goto("/");
  await page.getByRole("button", { name: "Try Example" }).click();
  await page.getByRole("button", { name: "Make my launch plan" }).click();
  await expect(page.getByText("Made for your idea")).toBeVisible();
  expect(captured.some(body => JSON.parse(body).event === "core_action_completed")).toBe(true);
  await page.route("**/api/generate", route => route.fulfill({ contentType: "application/x-ndjson", body: '{"type":"text","text":"partial"}\n' }));
  await page.getByRole("button", { name: "Make my launch plan" }).click();
  await expect(page.getByText("Saved demo example", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
