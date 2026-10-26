const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../schedule-core.js');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../data.js'), 'utf8') + '\n' +
  fs.readFileSync(path.join(__dirname, '../career-data.js'), 'utf8') + '\nglobalThis.snapshot={BASE,SLOTS};', context);
const {BASE, SLOTS} = context.snapshot;
const entry = (slot, extra = {}) => ({id: 'event-' + slot, name: 'Materia', year: 1, commission: 1, day: 0, slot, ...extra});

test('source keeps all 402 records, 16 divisions and 242 classes', () => {
  assert.equal(BASE.length, 402);
  assert.equal(new Set(BASE.map(core.divisionKey)).size, 16);
  const groups = core.groupClasses(BASE);
  assert.equal(groups.length, 242);
  assert.equal(groups.reduce((sum, group) => sum + group.members.length, 0), 402);
  assert(BASE.every(core.validEntry));
});
test('consecutive halves merge without crossing a break', () => {
  const groups = core.groupClasses([entry(0), entry(1), entry(2), entry(3)]);
  assert.equal(groups.length, 2);
  assert.equal(core.period(groups[0], SLOTS), '18:30–19:40');
  assert.equal(core.period(groups[1], SLOTS), '19:50–21:00');
});
test('careers, divisions and different subjects never merge together', () => {
  assert.equal(core.groupClasses([entry(0), entry(1, {career: 'geografia'})]).length, 2);
  assert.equal(core.groupClasses([entry(0), entry(1, {commission: 2})]).length, 2);
  assert.equal(core.groupClasses([entry(0), entry(1, {name: 'Otra materia'})]).length, 2);
});
test('simultaneous full classes have distinct lanes and opposite halves reuse a lane', () => {
  const groups = core.groupClasses([entry(0), entry(1), entry(0, {id:'other-0',commission:2}), entry(1,{id:'other-1',commission:2})]);
  assert.equal(core.layoutModule(groups, 0, 0).columns, 2);
  const halves = core.groupClasses([entry(0), entry(1, {name:'Otra materia'})]);
  assert.equal(core.layoutModule(halves, 0, 0).columns, 1);
});
test('every source module uses its true maximum concurrency without lane collisions', () => {
  const groups = core.groupClasses(BASE);
  for (let day = 0; day < 5; day++) for (let module = 0; module < 3; module++) {
    const {columns, placed} = core.layoutModule(groups, day, module);
    const expected = Math.max(1, ...[module*2, module*2+1].map(slot => BASE.filter(e => e.day === day && e.slot === slot).length));
    assert.equal(columns, expected);
    for (const a of placed) for (const b of placed) if (a !== b && a.lane === b.lane)
      assert(a.group.lastSlot < b.group.slot || b.group.lastSlot < a.group.slot);
  }
});
test('legacy Historia edits and deletions survive normalization and application', () => {
  const edited = {...BASE[0], name:'Personalización'};
  const changes = core.normalizeChanges({upserts:{[edited.id]:edited},deletions:[BASE[1].id]});
  const data = core.applyChanges(BASE, changes);
  assert.equal(data.length, 401);
  assert.equal(data.find(e => e.id === edited.id).name, 'Personalización');
  assert(!data.some(e => e.id === BASE[1].id));
});
test('invalid saved records are discarded before rendering', () => {
  const valid = entry(0);
  const result = core.normalizeChanges({upserts:{[valid.id]:valid,bad:{...valid,id:'bad',slot:6},wrongKey:valid},deletions:[2,'old','old']});
  assert.equal(Object.keys(result.upserts).length, 1);
  assert.deepEqual(result.deletions, ['old']);
  assert(!core.validEntry(entry(0, {career:'geografia',commission:2})));
});
test('accent-insensitive search supports ordinary Spanish input', () => {
  assert.equal(core.fold('Antigüedad'), 'antiguedad');
  assert.equal(core.fold('Geografía'), 'geografia');
});
