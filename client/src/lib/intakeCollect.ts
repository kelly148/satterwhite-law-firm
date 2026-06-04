/**
 * intakeCollect.ts — Collects a complete, structured snapshot of the trust
 * intake form.
 *
 * The intake form is injected as raw HTML and many of its inputs have no
 * id/name attributes (a no-code export artifact). The OLD collector only kept
 * fields that happened to have an id, silently discarding children, assets,
 * alternate fiduciaries, directives, etc. This collector instead keys off each
 * control's visible LABEL (which the form does have everywhere) and walks the
 * DOM by section + subsection, so nothing can be dropped.
 *
 * Output shape:
 *   { sections: [ { title, fields:[{label,value}], groups:[{title,fields}] } ] }
 *
 * It is framework-agnostic (operates on a DOM root) so it can be unit-tested
 * with jsdom and also called from the form's injected click handlers.
 */

export type IntakeField = { label: string; value: string };
export type IntakeGroup = { title: string; fields: IntakeField[] };
export type IntakeSection = { title: string; fields: IntakeField[]; groups: IntakeGroup[] };
export type IntakeData = { sections: IntakeSection[] };

type Ctl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function controlValue(el: Ctl): string {
  if (el instanceof HTMLSelectElement) {
    if (!el.value) return "";
    const o = el.options[el.selectedIndex];
    return o ? (o.text || "").trim() : "";
  }
  if (el instanceof HTMLInputElement && el.type === "checkbox") {
    return el.checked ? "Yes" : "";
  }
  return (el.value || "").trim();
}

function fieldLabel(el: Element): string {
  const fg = el.closest(".form-group");
  if (fg) {
    const l = fg.querySelector("label");
    if (l && l.textContent) return l.textContent.replace("*", "").replace(/\s+/g, " ").trim();
  }
  const ph = el.getAttribute("placeholder");
  if (ph) return ph.trim();
  return "Field";
}

function isHidden(el: Element): boolean {
  return !!el.closest(".hidden");
}

function collectControls(ctrls: Ctl[], scope: ParentNode): IntakeField[] {
  const out: IntakeField[] = [];
  const doneRadio: Record<string, boolean> = {};
  const doneCheckGroup: Element[] = [];

  for (const el of ctrls) {
    if (isHidden(el)) continue;

    if (el instanceof HTMLInputElement && el.type === "radio") {
      if (!el.name || doneRadio[el.name]) continue;
      doneRadio[el.name] = true;
      const checked = scope.querySelector<HTMLInputElement>(`input[type=radio][name="${el.name}"]:checked`);
      if (!checked) continue;
      const opt = checked.closest(".radio-option");
      const value = opt && opt.textContent ? opt.textContent.replace(/\s+/g, " ").trim() : checked.value || "Yes";
      out.push({ label: fieldLabel(el), value });
      continue;
    }

    if (el instanceof HTMLInputElement && el.type === "checkbox") {
      const cg = el.closest(".check-group");
      if (cg) {
        if (doneCheckGroup.indexOf(cg) !== -1) continue;
        doneCheckGroup.push(cg);
        const checks = cg.querySelectorAll<HTMLInputElement>("input[type=checkbox]:checked");
        if (!checks.length) continue;
        const vals: string[] = [];
        checks.forEach((c) => {
          const co = c.closest(".check-option");
          vals.push(co && co.textContent ? co.textContent.replace(/\s+/g, " ").trim() : "Yes");
        });
        out.push({ label: fieldLabel(el), value: vals.join(", ") });
        continue;
      }
      if (!el.checked) continue;
      const tg = el.closest(".toggle-group");
      const tl = tg ? tg.querySelector(".toggle-label") : null;
      out.push({ label: tl && tl.textContent ? tl.textContent.trim() : fieldLabel(el), value: "Yes" });
      continue;
    }

    const v = controlValue(el);
    if (!v) continue;
    out.push({ label: fieldLabel(el), value: v });
  }

  return out;
}

function ctrlsIn(scope: ParentNode): Ctl[] {
  return Array.from(scope.querySelectorAll<Ctl>("input, select, textarea"));
}

export function collectIntakeData(root: ParentNode): IntakeData {
  const data: IntakeData = { sections: [] };
  const sectionEls = Array.from(root.querySelectorAll(".section"));

  sectionEls.forEach((sec, idx) => {
    const stEl = sec.querySelector(".section-title");
    let title = stEl && stEl.textContent ? stEl.textContent.trim() : `Section ${idx + 1}`;
    if (/review/i.test(title)) title = "Notes & Preferences";

    // Grouped fields — one group per .subsection (Primary Client, Child 1, Property 1, Trustee, ...)
    const groups: IntakeGroup[] = [];
    sec.querySelectorAll(".subsection").forEach((sub) => {
      if (isHidden(sub)) return;
      const ttEl = sub.querySelector(".subsection-title");
      const gTitle = ttEl && ttEl.textContent ? ttEl.textContent.replace(/\s+/g, " ").trim() : "Details";
      const gFields = collectControls(ctrlsIn(sub), sub);
      if (gFields.length) groups.push({ title: gTitle, fields: gFields });
    });

    // Loose fields — controls not inside any subsection
    const looseCtrls = ctrlsIn(sec).filter((el) => !el.closest(".subsection"));
    const fields = collectControls(looseCtrls, sec);

    if (groups.length || fields.length) {
      data.sections.push({ title, fields, groups });
    }
  });

  return data;
}
