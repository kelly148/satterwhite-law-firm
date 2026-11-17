/**
 * Test helper: pull the visible text back out of a PDF produced by pdfkit, so
 * tests can assert on what the attorney will actually read.
 *
 * pdfkit writes each line of text as a `[<hex> kerning <hex> ...] TJ` operator
 * inside a deflated content stream. This inflates the streams and joins the hex
 * runs. It is only meant for the standard fonts this project uses.
 */
import { inflateSync } from "node:zlib";

const decoder = new TextDecoder("windows-1252");

export function extractPdfText(pdf: Buffer): string {
  const lines: string[] = [];
  const raw = pdf.toString("latin1");
  const streams = Array.from(
    raw.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)
  );
  for (const match of streams) {
    let body: Buffer = Buffer.from(match[1], "latin1");
    try {
      body = inflateSync(body);
    } catch {
      // stream was not compressed
    }
    const content = body.toString("latin1");
    for (const tj of Array.from(content.matchAll(/\[([^\]]*)\]\s*TJ/g))) {
      const bytes = Array.from(tj[1].matchAll(/<([0-9a-fA-F]*)>/g), h =>
        Buffer.from(h[1], "hex")
      );
      lines.push(decoder.decode(Buffer.concat(bytes)));
    }
  }
  return lines.join("\n");
}

/** The same text with line breaks folded away, for matching answers that wrapped. */
export function extractPdfTextFlat(pdf: Buffer): string {
  return extractPdfText(pdf).replace(/\s+/g, " ");
}
