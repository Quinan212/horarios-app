'use strict';

// Shared timetable rules: the source records stay at half-module precision.
(() => {
  const careerOf = entry => entry.career || 'historia';
  const divisionKey = entry => `${careerOf(entry)}-${entry.year}-${entry.commission}`;
  const fold = text => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es');

  function validEntry(entry) {
    return entry && typeof entry === 'object' && typeof entry.id === 'string' && entry.id.length > 0 &&
      typeof entry.name === 'string' && entry.name.trim().length > 0 && entry.name.length <= 110 &&
      ['historia', 'geografia', 'politica'].includes(careerOf(entry)) &&
      Number.isInteger(entry.year) && entry.year >= 1 && entry.year <= 4 &&
      Number.isInteger(entry.commission) && entry.commission >= 1 && entry.commission <= (careerOf(entry) === 'historia' ? 2 : 1) &&
      Number.isInteger(entry.day) && entry.day >= 0 && entry.day < 5 &&
      Number.isInteger(entry.slot) && entry.slot >= 0 && entry.slot < 6;
  }

  function normalizeChanges(saved) {
    const upserts = saved?.upserts && typeof saved.upserts === 'object' && !Array.isArray(saved.upserts)
      ? Object.entries(saved.upserts).filter(([key, entry]) => validEntry(entry) && key === entry.id) : [];
    return {upserts: Object.fromEntries(upserts), deletions: Array.isArray(saved?.deletions)
      ? [...new Set(saved.deletions.filter(id => typeof id === 'string'))] : []};
  }

  function applyChanges(base, changes) {
    const edits = new Map(Object.values(changes.upserts).map(entry => [entry.id, entry]));
    const removed = new Set(changes.deletions);
    return base.filter(entry => !removed.has(entry.id) && !edits.has(entry.id)).concat([...edits.values()]);
  }

  function groupClasses(entries) {
    const sorted = [...entries].sort((a, b) => a.day - b.day || careerOf(a).localeCompare(careerOf(b)) ||
      a.year - b.year || a.commission - b.commission || a.slot - b.slot);
    const groups = [];
    for (const entry of sorted) {
      const previous = groups.find(group => group.day === entry.day && careerOf(group) === careerOf(entry) &&
        group.year === entry.year && group.commission === entry.commission && group.lastSlot === entry.slot - 1 &&
        Math.floor(group.slot / 2) === Math.floor(entry.slot / 2) &&
        group.name.trim().toLocaleLowerCase('es') === entry.name.trim().toLocaleLowerCase('es'));
      if (previous) { previous.members.push(entry); previous.lastSlot = entry.slot; }
      else groups.push({...entry, members: [entry], lastSlot: entry.slot});
    }
    return groups;
  }

  function layoutModule(groups, day, module) {
    const events = groups.filter(group => group.day === day && Math.floor(group.slot / 2) === module)
      .sort((a, b) => a.slot - b.slot || (b.lastSlot - b.slot) - (a.lastSlot - a.slot) ||
        careerOf(a).localeCompare(careerOf(b)) || a.year - b.year || a.commission - b.commission);
    const lanes = [], placed = [];
    for (const group of events) {
      let lane = lanes.findIndex(items => items.every(other => group.lastSlot < other.slot || other.lastSlot < group.slot));
      if (lane === -1) { lane = lanes.length; lanes.push([]); }
      lanes[lane].push(group); placed.push({group, lane});
    }
    return {placed, columns: Math.max(1, lanes.length)};
  }

  const period = (group, slots) => `${slots[group.slot][0]}–${slots[group.lastSlot][1]}`;
  const groupKey = group => group.members.map(entry => entry.id).join('|');
  const overlaps = (group, slots) => group.members.some(entry => slots.has(`${entry.day}-${entry.slot}`));
  const api = Object.freeze({careerOf, divisionKey, fold, validEntry, normalizeChanges, applyChanges, groupClasses, layoutModule, period, groupKey, overlaps});
  if (typeof module === 'object' && module.exports) module.exports = api;
  else globalThis.ScheduleCore = api;
})();
