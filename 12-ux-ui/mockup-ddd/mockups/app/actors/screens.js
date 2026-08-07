(() => {
  const M=window.Mockup=window.Mockup||{}, C=()=>M.Components, icon=(...a)=>M.icon(...a);
  const stateView=(ctx,e)=>ctx.state&&ctx.state!=='normal'?C().state(ctx.state,e):null;
  M.screens=M.screens||{};
  const exceptions=[
    {type:'Incapacidad médica',range:'12–14 de agosto de 2026 · 08:00–17:00',description:'Incapacidad certificada por EPS.',icon:'activity'},
    {type:'Capacitación',range:'21 de agosto de 2026 · 07:00–13:00',description:'Actualización pedagógica institucional.',icon:'student'},
    {type:'Comisión',range:'25–26 de agosto de 2026 · 08:00–16:00',description:'Visita técnica a sede alterna.',icon:'building'}
  ];
  M.screens.instructorAvailability=(ctx)=>{
    const state=stateView(ctx,'excepciones registradas'); if(state)return `${C().pageHeader('Mi disponibilidad','', {label:'+ Nueva excepción',href:'/instructor/mi-disponibilidad?modal=exception'})}${state}`;
    const modal=ctx.query.get('modal');
    let html=`${C().pageHeader('Mi disponibilidad','Registra bloqueos puntuales para que el motor de horarios los tenga en cuenta.',{label:'+ Nueva excepción',href:'/instructor/mi-disponibilidad?modal=exception'})}<section class="panel"><header class="panel-header"><div><h2 class="panel-title">Excepciones vigentes y futuras</h2><p class="panel-subtitle">Ordenadas cronológicamente.</p></div></header><div>${exceptions.map(x=>`<article class="notification-card" style="border-bottom:1px solid var(--color-border)"><span class="conflict-icon" style="background:var(--color-warning-surface);color:var(--color-warning)">${icon(x.icon)}</span><div><h3>${x.type}</h3><p><strong>${x.range}</strong></p><p>${x.description}</p></div><button class="btn btn-danger-subtle btn-sm">${icon('trash')}Eliminar</button></article>`).join('')}</div>${C().pagination(34,1,3,1,10)}</section>`;
    if(modal==='exception') html+=C().modal('Nueva excepción de disponibilidad',`<div class="form-grid"><div class="form-field full"><label>Tipo de excepción</label><select><option>Incapacidad médica</option><option>Vacaciones</option><option>Comisión</option><option>Permiso personal</option><option>Capacitación</option><option>Otro</option></select></div><div class="form-field"><label>Inicio</label><input type="datetime-local" value="2026-08-12T08:00"></div><div class="form-field"><label>Fin</label><input type="datetime-local" value="2026-08-11T17:00"><div class="field-error">${icon('warning')}La fecha de fin debe ser posterior al inicio.</div></div><div class="form-field full"><label>Descripción (opcional)</label><textarea placeholder="Ej. Cita médica especialista"></textarea></div></div>`,`<button class="btn btn-secondary" data-close-modal>Cancelar</button><button class="btn btn-primary">Guardar</button>`);
    return html;
  };
})();
