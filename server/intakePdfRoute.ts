/**
 * intakePdfRoute.ts — admin-only, on-demand intake PDF.
 *
 * The complete submission is stored as JSON in `intakeSubmissions.formDataJson`,
 * so the PDF is regenerated from the record on each request instead of being
 * uploaded to object storage. That removes the last dependency on the old
 * platform's file storage and guarantees the document always matches the data
 * actually on file.
 */

import { eq } from "drizzle-orm";
import type { Express, Request, Response } from "express";
import { intakeSubmissions } from "../drizzle/schema";
import { sdk } from "./_core/sdk";
import { getDb } from "./db";
import { renderIntakePdfBuffer } from "./generateIntakePdf";

async function requireAdmin(req: Request): Promise<boolean> {
  try {
    const user = await sdk.authenticateRequest(req);
    return user.role === "admin";
  } catch {
    return false;
  }
}

export function registerIntakePdfRoute(app: Express) {
  app.get("/api/intake/:id/pdf", async (req: Request, res: Response) => {
    if (!(await requireAdmin(req))) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid submission id" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const rows = await db
      .select()
      .from(intakeSubmissions)
      .where(eq(intakeSubmissions.id, id))
      .limit(1);
    const submission = rows[0];
    if (!submission) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }

    let formData: unknown;
    try {
      formData = JSON.parse(submission.formDataJson);
    } catch {
      res.status(500).json({ error: "Stored form data is unreadable" });
      return;
    }

    try {
      const buffer = await renderIntakePdfBuffer(formData, submission.clientName);
      const safeName = (submission.clientName || "Intake").replace(/[^\w.-]+/g, "_");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Cache-Control", "no-store");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="Intake_${safeName}.pdf"`
      );
      res.send(buffer);
    } catch (error) {
      console.error("[IntakePdf] Failed to render PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });
}
