'use strict';
(() => {
  const $ = selector => document.querySelector(selector);
  const C = ScheduleCore;
  const STORAGE = 'historia-horarios-v1', PREFS = 'horarios-preferencias-v3', THEME = 'horarios-apariencia-v1';
  const CAREERS = [{id:'historia',name:'Historia',divisions:[1,2]}, {id:'geografia',name:'Geografía',divisions:[1]}, {id:'politica',name:'Ciencia Política',divisions:[1]}];
  const NAMES = Object.fromEntries(CAREERS.map(c => [c.id,c.name]));
  const ALL = CAREERS.flatMap(c => [1,2,3,4].flatMap(year => c.divisions.map(d => `${c.id}-${year}-${d}`)));
  const COLORS = ['var(--y1)','var(--y2)','var(--y3)','var(--y4)'];
  const mobile = matchMedia('(max-width:700px)');
  const mode = () => mobile.matches ? 'mobile' : 'desktop';
  let selected = new Set(['historia-1-1']), career = 'historia', query = '', onlyOverlap = false;
  let views = {desktop:'week',mobile:'day'}, selectedDay = Math.min(4,(new Date().getDay()+6)%7);
  let changes = {upserts:{},deletions:[]}, editing = null, editorOrigin = '', undoSnapshot = null, theme = 'system';
  let announceTimer, notificationTimer;
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
  changes = C.normalizeChanges(read(STORAGE));
  const saved = read(PREFS);
  if (saved) {
    if (Array.isArray(saved.divisions)) selected = new Set(saved.divisions.filter(key => ALL.includes(key)));
    if (['historia','geografia','politica','all'].includes(saved.careerFilter)) career = saved.careerFilter;
    if (['week','list','day'].includes(saved.view)) views = {desktop:saved.view,mobile:saved.view};
    for (const screen of ['desktop','mobile']) if (['week','list','day'].includes(saved.views?.[screen])) views[screen] = saved.views[screen];
    if (Number.isInteger(saved.day) && saved.day >= 0 && saved.day < 5) selectedDay = saved.day;
  } else {
    const old = read('historia-preferencias-v2') || read('historia-preferencias-v1');
    if (old) {
      const keys = Array.isArray(old.divisions) ? old.divisions : Array.isArray(old.years)
        ? old.years.flatMap(year => (['1','2'].includes(old.commission) ? [old.commission] : ['1','2']).map(d => `${year}-${d}`)) : null;
      if (keys) selected = new Set([...ALL.filter(key => !key.startsWith('historia-')), ...keys.map(key => `historia-${key}`).filter(key => ALL.includes(key))]);
      if (['week','list'].includes(old.view)) views = {desktop:old.view,mobile:old.view};
    }
  }
  const storedTheme = read(THEME);
  if (['system','light','dark'].includes(storedTheme)) theme = storedTheme;

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function button(text, className, action) {
    const element = node('button',className,text); element.type = 'button';
    element.addEventListener('click',action); return element;
  }
  function icon(name) { const image = node('img','icon'); image.src = `assets/icons/${name}.svg`; image.alt = ''; return image; }
  const all = () => C.applyChanges(BASE,changes);
  const careerEnabled = id => career === 'all' || id === career;
  const visibleKeys = () => ALL.filter(key => careerEnabled(key.split('-')[0]));
  const selectedKeys = () => visibleKeys().filter(key => selected.has(key));
  const isVisible = entry => careerEnabled(C.careerOf(entry)) && selected.has(C.divisionKey(entry));
  const period = group => C.period(group,SLOTS);
  const context = group => `${NAMES[C.careerOf(group)]} · ${group.year}.º año · ${group.commission}.ª división`;
  const chronological = (a,b) => a.slot-b.slot || C.careerOf(a).localeCompare(C.careerOf(b)) || a.year-b.year || a.commission-b.commission;

  function notify(text, canUndo = false) {
    clearTimeout(notificationTimer);
    $('#notificationText').textContent = text; $('#notificationUndo').hidden = !canUndo; $('#notification').hidden = false;
    notificationTimer = setTimeout(() => { $('#notification').hidden = true; },6500);
  }
  function persistPrefs() {
    try { localStorage.setItem(PREFS,JSON.stringify({divisions:[...selected],careerFilter:career,view:views[mode()],views,day:selectedDay})); }
    catch { notify('La selección funciona, pero este navegador no pudo recordarla.'); }
  }
  function applyTheme() {
    if (theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.dataset.theme = theme;
    document.querySelectorAll('[data-theme-choice]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.themeChoice === theme)));
  }
  function setCareer(value) {
    career = value;
    if (career !== 'all' && !selectedKeys().length) selected.add(`${career}-1-1`);
    persistPrefs(); render();
  }
  function overlapsFor(entries) {
    const counts = new Map();
    for (const entry of entries) { const key = `${entry.day}-${entry.slot}`; counts.set(key,(counts.get(key)||0)+1); }
    return new Set([...counts].filter(([,count]) => count > 1).map(([key]) => key));
  }
  function eventButton(group, overlapping) {
    const event = button('', 'event', () => openEditor(group));
    event.style.setProperty('--event-color',COLORS[group.year-1]); event.dataset.eventKey = C.groupKey(group);
    event.classList.toggle('selected',editing && C.groupKey(editing) === C.groupKey(group));
    event.append(node('b','',group.name),node('small','',period(group)));
    if (selectedKeys().length > 1) event.append(node('small','',context(group)));
    if (C.overlaps(group,overlapping)) { event.classList.add('coincidence'); event.append(node('span','coincidence-label','Coincidencia')); }
    event.setAttribute('aria-label',`${group.name}, ${DAYS[group.day]}, ${period(group)}, ${context(group)}${C.overlaps(group,overlapping) ? ', coincide con otra clase' : ''}. Editar materia`);
    return event;
  }

  function renderWeek(groups, overlapping) {
    const root = $('#weekGrid'); root.replaceChildren();
    const widths = [0,1,2,3,4].map(day => Math.max(178,...[0,1,2].map(module => C.layoutModule(groups,day,module).columns*146)));
    root.style.gridTemplateColumns = `80px ${widths.map(width => `minmax(${width}px,1fr)`).join(' ')}`;
    root.style.minWidth = `${80+widths.reduce((a,b) => a+b,0)}px`;
    root.append(node('div','dayhead hour-heading','Hora'));
    DAYS.forEach(day => root.append(node('div','dayhead',day)));
    for (let module = 0; module < 3; module++) {
      const time = node('div','module-slot module-time');
      time.append(node('span','',SLOTS[module*2][0]),node('span','',SLOTS[module*2+1][1])); root.append(time);
      for (let day = 0; day < 5; day++) {
        const cell = node('div','module-slot'); cell.setAttribute('aria-label',`${DAYS[day]}, módulo ${module+1}`);
        const {placed,columns} = C.layoutModule(groups,day,module);
        if (placed.length) {
          const timeline = node('div','module-timeline'); timeline.style.gridTemplateColumns = `repeat(${columns},minmax(0,1fr))`;
          for (const {group,lane} of placed) {
            const event = eventButton(group,overlapping); event.style.gridColumn = String(lane+1);
            event.style.gridRow = `${group.slot%2+1} / span ${group.lastSlot-group.slot+1}`; timeline.append(event);
          }
          cell.append(timeline);
        }
        root.append(cell);
      }
      if (module < 2) {
        const pause = node('div','pause-cell pause-time'); pause.append(node('span','',SLOTS[module*2+1][1]),node('span','',SLOTS[module*2+2][0])); root.append(pause);
        for (let day = 0; day < 5; day++) root.append(node('div','pause-cell','Recreo'));
      }
    }
  }
  function renderDay(groups, overlapping) {
    const root = $('#dayView'); root.replaceChildren();
    const dayGroups = groups.filter(group => group.day === selectedDay).sort(chronological);
    const title = node('div','day-title'); title.append(node('h2','',DAYS[selectedDay]),node('span','',`${dayGroups.length} ${dayGroups.length === 1 ? 'clase' : 'clases'}`)); root.append(title);
    if (!dayGroups.length) { root.append(node('p','list-empty','No hay clases para este día con los filtros elegidos.')); return; }
    for (let module = 0; module < 3; module++) {
      const inModule = dayGroups.filter(group => Math.floor(group.slot/2) === module);
      for (const group of inModule) {
        const row = node('div','day-row'), time = node('div','day-time');
        time.append(node('span','',SLOTS[group.slot][0]),node('span','',SLOTS[group.lastSlot][1])); row.append(time,eventButton(group,overlapping)); root.append(row);
      }
      if (!inModule.length) root.append(node('p','day-module-empty',`Sin clases · ${SLOTS[module*2][0]}–${SLOTS[module*2+1][1]}`));
      if (module < 2) root.append(node('div','day-break','Recreo · 10 min'));
    }
  }
  function renderList(groups, overlapping) {
    const root = $('#listView'); root.replaceChildren();
    for (let day = 0; day < 5; day++) {
      const entries = groups.filter(group => group.day === day).sort(chronological), section = node('section','list-day');
      const heading = node('div','list-day-heading'); heading.append(node('h2','',DAYS[day]),node('span','',`${entries.length} ${entries.length === 1 ? 'clase' : 'clases'}`)); section.append(heading);
      for (const group of entries) {
        const row = button('','list-row',() => openEditor(group)); row.dataset.eventKey = C.groupKey(group);
        row.classList.toggle('selected',editing && C.groupKey(editing) === C.groupKey(group));
        const description = node('div','list-description'); description.style.setProperty('--event-color',COLORS[group.year-1]);
        description.append(node('strong','',group.name),node('small','',context(group)+(C.overlaps(group,overlapping) ? ' · Coincidencia' : '')));
        row.append(node('span','list-time',period(group)),description,icon('caret-right')); section.append(row);
      }
      if (!entries.length) section.append(node('p','list-empty','Sin clases con esta selección'));
      root.append(section);
    }
  }

  function renderFilters() {
    const activeId = $('#filtersDialog').contains(document.activeElement) ? document.activeElement.id : '';
    $('#panelCareerSelect').value = career;
    const root = $('#divisionOptions'); root.replaceChildren();
    for (const year of [1,2,3,4]) {
      const group = node('div','year-group'); group.style.setProperty('--year-color',COLORS[year-1]);
      const keys = visibleKeys().filter(key => Number(key.split('-')[1]) === year);
      const label = node('label','year-heading'), checkbox = node('input'); checkbox.type = 'checkbox'; checkbox.id = `year-${year}`;
      checkbox.checked = keys.every(key => selected.has(key)); checkbox.indeterminate = !checkbox.checked && keys.some(key => selected.has(key));
      checkbox.addEventListener('change',() => { keys.forEach(key => checkbox.checked ? selected.add(key) : selected.delete(key)); persistPrefs(); render(); });
      label.append(checkbox,node('span','',`${year}.º año`)); group.append(label);
      for (const key of keys) {
        const [id,,division] = key.split('-'), row = node('div','division-row'), option = node('label','division-label'), input = node('input');
        input.type = 'checkbox'; input.id = `division-${key}`; input.checked = selected.has(key);
        const text = `${career === 'all' ? NAMES[id]+' · ' : ''}${id === 'historia' ? division+'.ª división' : 'División única'}`;
        input.setAttribute('aria-label',`${NAMES[id]}, ${year}.º año, ${division}.ª división`);
        input.addEventListener('change',() => { input.checked ? selected.add(key) : selected.delete(key); persistPrefs(); render(); });
        option.append(input,node('span','',text));
        const solo = button('Solo','division-solo',() => { selected = new Set([key]); career = id; persistPrefs(); render(); });
        solo.id = `solo-${key}`; solo.setAttribute('aria-label',`Mostrar únicamente ${NAMES[id]}, ${year}.º año, ${division}.ª división`);
        row.append(option,solo); group.append(row);
      }
      root.append(group);
    }
    if (activeId) document.getElementById(activeId)?.focus({preventScroll:true});
  }
  function render() {
    const visible = all().filter(isVisible), overlapping = overlapsFor(visible), data = visible.filter(entry => C.fold(entry.name).includes(query));
    let groups = C.groupClasses(data);
    if (onlyOverlap) groups = groups.filter(group => C.overlaps(group,overlapping));
    const keys = selectedKeys(), view = views[mode()];
    $('#careerSelect').value = career; $('#divisionCount').textContent = keys.length;
    $('#selectionSummary').textContent = !keys.length ? 'Elegí al menos una división' : keys.length === 1
      ? (() => {const [id,year,division] = keys[0].split('-'); return `${NAMES[id]} · ${year}.º año · ${division}.ª división`;})()
      : `${career === 'all' ? 'Tres carreras' : NAMES[career]} · ${keys.length} divisiones seleccionadas`;
    $('#classCount').textContent = `${groups.length} ${groups.length === 1 ? 'clase' : 'clases'}`;
    $('#overlapCount').textContent = `${overlapping.size} franjas con coincidencias`; $('#overlapCount').hidden = !overlapping.size;
    $('#overlapToggle').checked = onlyOverlap; $('#overlapMenu').checked = onlyOverlap; $('#undoBtn').disabled = !undoSnapshot;
    document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.view === view)));
    $('#dayPicker').hidden = view !== 'day';
    $('#dayPicker').replaceChildren(...DAYS.map((day,index) => {
      const item = button(day[0],'',() => { selectedDay = index; persistPrefs(); render(); $('#dayPicker button[aria-pressed="true"]').focus({preventScroll:true}); });
      item.setAttribute('aria-label',day); item.setAttribute('aria-pressed',String(selectedDay === index)); return item;
    }));
    $('#weekView').hidden = view !== 'week' || !groups.length; $('#dayView').hidden = view !== 'day' || !groups.length;
    $('#listView').hidden = view !== 'list' || !groups.length; $('#emptyState').hidden = !!groups.length;
    $('#weekHint').hidden = true;
    if (!groups.length) {
      $('#emptyTitle').textContent = !keys.length ? 'Elegí tus divisiones' : query ? 'No encontramos esa materia' : onlyOverlap ? 'Sin coincidencias' : 'Sin clases en esta selección';
      $('#emptyMessage').textContent = !keys.length ? 'Podés combinar carreras, años y divisiones para comparar sus cursadas.' : query ? 'Probá con otro nombre o revisá las divisiones seleccionadas.' : onlyOverlap ? 'Las clases de las divisiones elegidas no comparten una franja.' : 'Elegí otra división para consultar sus horarios.';
      $('#emptyAction').textContent = !keys.length ? 'Elegir divisiones' : query ? 'Limpiar búsqueda' : onlyOverlap ? 'Mostrar todas las clases' : 'Elegir divisiones';
    } else if (view === 'week') {
      renderWeek(groups,overlapping);
      $('#weekHint').hidden = $('#weekView').scrollWidth <= $('#weekView').clientWidth;
    }
    else if (view === 'day') renderDay(groups,overlapping);
    else renderList(groups,overlapping);
    if ($('#filtersDialog').open) renderFilters();
    clearTimeout(announceTimer); announceTimer = setTimeout(() => { $('#liveSummary').textContent = `${$('#selectionSummary').textContent}. ${$('#classCount').textContent}. Vista ${view === 'day' ? 'Día' : view === 'week' ? 'Semana' : 'Lista'}.`; },250);
  }

  function showFilters() { closeMenu(); renderFilters(); $('#filtersDialog').showModal(); document.body.classList.add('modal-open'); }
  function closeFilters() { $('#filtersDialog').close(); document.body.classList.remove('modal-open'); $('#filtersBtn').focus(); }
  function closeMenu() { $('#moreMenu').hidden = true; $('#menuBtn').setAttribute('aria-expanded','false'); }
  function syncDuration() {
    const start = Number($('#slot').value), full = $('#duration option[value="2"]'); full.disabled = start%2 === 1;
    if (full.disabled) $('#duration').value = '1';
    const end = start+Number($('#duration').value)-1;
    $('#editorPeriod').textContent = `${SLOTS[start][0]}–${SLOTS[end][1]}`;
    $('#editorContext').textContent = `${DAYS[Number($('#day').value)]} · ${$('#duration').value === '2' ? 'Módulo completo' : 'Media franja'}`;
  }
  function syncCommission() { const single = $('#editCareer').value !== 'historia'; $('#com option[value="2"]').disabled = single; if (single) $('#com').value = '1'; }
  function presentEditor() {
    const editor = $('#editor');
    if (editor.open) return;
    document.body.classList.add('modal-open');
    editor.showModal();
  }
  function openEditor(group) {
    closeMenu(); editing = group || null; editorOrigin = group ? C.groupKey(group) : '';
    const [id,year,division] = (selectedKeys()[0] || visibleKeys()[0] || 'historia-1-1').split('-');
    $('#dialogTitle').textContent = group ? 'Editar materia' : 'Nueva materia';
    $('#name').value = group?.name || ''; $('#editCareer').value = group ? C.careerOf(group) : id;
    $('#year').value = group?.year || year; $('#com').value = group?.commission || division;
    $('#day').value = group?.day ?? selectedDay; $('#slot').value = group?.slot ?? 0;
    $('#duration').value = group ? String(group.members.length) : '2'; syncCommission(); syncDuration();
    $('#saveError').hidden = true; $('#deleteBtn').hidden = !group; presentEditor(); render(); $('#name').focus({preventScroll:true});
  }
  function closeEditor() {
    $('#editor').close(); document.body.classList.remove('modal-open'); editing = null; render();
    const origin = [...document.querySelectorAll('[data-event-key]')].find(b => b.dataset.eventKey === editorOrigin && b.getClientRects().length);
    (origin || $('#addBtn')).focus({preventScroll:true});
  }
  function commit(next, message) {
    try { localStorage.setItem(STORAGE,JSON.stringify(next)); }
    catch { $('#saveError').textContent = 'No se pudo guardar en este navegador. Tu formulario sigue abierto; intentá nuevamente.'; $('#saveError').hidden = false; return false; }
    undoSnapshot = structuredClone(changes); changes = next; closeEditor(); notify(message,true); return true;
  }
  function undo() {
    if (!undoSnapshot) return;
    try { localStorage.setItem(STORAGE,JSON.stringify(undoSnapshot)); }
    catch { notify('No se pudo deshacer el cambio en este navegador.'); return; }
    changes = undoSnapshot; undoSnapshot = null; $('#notification').hidden = true; closeMenu();
    if ($('#editor').open) closeEditor(); else render(); notify('Último cambio deshecho.');
  }

  $('#slot').replaceChildren(...SLOTS.map(([start],index) => {const option = node('option','',start); option.value = String(index); return option;}));
  ['slot','duration','day'].forEach(id => $('#'+id).addEventListener('change',syncDuration));
  $('#editCareer').addEventListener('change',syncCommission);
  $('#eventForm').addEventListener('submit',event => {
    event.preventDefault(); const name = $('#name').value.trim(); if (!name) { $('#name').focus(); return; }
    const slot = Number($('#slot').value), duration = Number($('#duration').value); if (duration === 2 && slot%2) return;
    const next = structuredClone(changes), old = editing?.members || [];
    for (const entry of old) { delete next.upserts[entry.id]; if (!next.deletions.includes(entry.id)) next.deletions.push(entry.id); }
    for (let index = 0; index < duration; index++) {
      const id = old[index]?.id || `manual-${crypto.randomUUID()}-${index}`;
      next.upserts[id] = {id,name,career:$('#editCareer').value,year:Number($('#year').value),commission:Number($('#com').value),day:Number($('#day').value),slot:slot+index};
      next.deletions = next.deletions.filter(removed => removed !== id);
    }
    commit(next,'Cambios guardados en este navegador.');
  });
  $('#deleteBtn').addEventListener('click',() => {
    if (!editing) return; const next = structuredClone(changes);
    for (const entry of editing.members) { delete next.upserts[entry.id]; if (!next.deletions.includes(entry.id)) next.deletions.push(entry.id); }
    commit(next,'Clase eliminada. Podés deshacer este cambio.');
  });
  $('#addBtn').addEventListener('click',() => openEditor(null));
  ['cancelBtn','closeEditor'].forEach(id => $('#'+id).addEventListener('click',closeEditor));
  $('#editor').addEventListener('cancel',event => {event.preventDefault(); closeEditor();});
  let editorBackdropPress = false;
  $('#editor').addEventListener('pointerdown',event => {
    const bounds = event.currentTarget.getBoundingClientRect();
    editorBackdropPress = event.target === event.currentTarget && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
  });
  $('#editor').addEventListener('click',event => {
    const startedOutside = editorBackdropPress; editorBackdropPress = false;
    if (!startedOutside || event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeEditor();
  });
  mobile.addEventListener('change',render);
  $('#careerSelect').addEventListener('change',event => setCareer(event.target.value));
  $('#panelCareerSelect').addEventListener('change',event => setCareer(event.target.value));
  $('#filtersBtn').addEventListener('click',showFilters);
  ['closeFilters','doneFilters'].forEach(id => $('#'+id).addEventListener('click',closeFilters));
  $('#filtersDialog').addEventListener('cancel',event => {event.preventDefault(); closeFilters();});
  $('#allDivisions').addEventListener('click',() => { visibleKeys().forEach(key => selected.add(key)); persistPrefs(); render(); });
  $('#noneDivisions').addEventListener('click',() => { visibleKeys().forEach(key => selected.delete(key)); persistPrefs(); render(); });
  document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click',() => {views[mode()] = b.dataset.view; persistPrefs(); render();}));
  $('#search').addEventListener('input',event => {query = C.fold(event.target.value.trim()); render();});
  ['overlapToggle','overlapMenu'].forEach(id => $('#'+id).addEventListener('change',event => {onlyOverlap = event.target.checked; render();}));
  $('#emptyAction').addEventListener('click',() => {
    if (!selectedKeys().length) showFilters();
    else if (query) {query = ''; $('#search').value = ''; render();}
    else if (onlyOverlap) {onlyOverlap = false; render();}
    else showFilters();
  });
  $('#mobileSearchBtn').addEventListener('click',() => {
    const expanded = document.body.classList.toggle('search-open'); $('#mobileSearchBtn').setAttribute('aria-expanded',String(expanded));
    if (expanded) $('#search').focus();
  });
  $('#menuBtn').addEventListener('click',() => {
    const open = $('#moreMenu').hidden; $('#moreMenu').hidden = !open; $('#menuBtn').setAttribute('aria-expanded',String(open));
    if (open) $('#exportBtn').focus();
  });
  document.addEventListener('click',event => {if (!$('#moreMenu').contains(event.target) && !$('#menuBtn').contains(event.target)) closeMenu();});
  document.addEventListener('keydown',event => {
    if (event.key !== 'Escape') return;
    if (!$('#moreMenu').hidden) {closeMenu(); $('#menuBtn').focus();}
  });
  document.querySelectorAll('[data-theme-choice]').forEach(b => b.addEventListener('click',() => {
    theme = b.dataset.themeChoice; applyTheme();
    try { localStorage.setItem(THEME,JSON.stringify(theme)); } catch {notify('La apariencia se aplicó, pero no se pudo recordar.');}
  }));
  $('#resetBtn').addEventListener('click',() => {selected = new Set(['historia-1-1']); career = 'historia'; query = ''; onlyOverlap = false; views = {desktop:'week',mobile:'day'}; selectedDay = 0; $('#search').value = ''; closeMenu(); persistPrefs(); render();});
  $('#undoBtn').addEventListener('click',undo); $('#notificationUndo').addEventListener('click',undo);
  $('#exportBtn').addEventListener('click',() => {
    const blob = new Blob([JSON.stringify({version:2,fuente:'Horarios 2026 · PSCS',exportado:new Date().toISOString(),materias:all()},null,2)],{type:'application/json;charset=utf-8'});
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'horarios-pscs-2026.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(link.href),2000); closeMenu();
  });
  applyTheme(); render();
})();
