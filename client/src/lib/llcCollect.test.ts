// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { collectIntakeData } from './intakeCollect';
it('retains separate LLC members, unlabeled controls, and selected business purposes', () => {
  document.body.innerHTML = `<div class="section"><h2 class="section-title">Members</h2>
    <div class="member-card"><div class="member-card-title">Member 1</div><div class="form-group"><label>Full Legal Name</label><input value="Alex Test"></div></div>
    <div class="member-card"><div class="member-card-title">Member 2</div><div class="form-group"><label>Ownership %</label><input value="40"></div></div>
    <div class="form-group"><label>Business Purpose</label><div class="tag-group"><span class="tag selected">Consulting</span><span class="tag">Retail</span></div></div>
    <div class="hidden"><div class="form-group"><label>Hidden value</label><input value="omit"></div></div></div>`;
  const data = collectIntakeData(document.body);
  expect(data.sections[0].groups).toEqual([
    {title:'Member 1',fields:[{label:'Full Legal Name',value:'Alex Test'}]},
    {title:'Member 2',fields:[{label:'Ownership %',value:'40'}]},
  ]);
  expect(data.sections[0].fields).toEqual([{label:'Business Purpose',value:'Consulting'}]);
});
