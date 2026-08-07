(() => {
  const M=window.Mockup=window.Mockup||{}, C=()=>M.Components, D=()=>M.data, icon=(...a)=>M.icon(...a);
  const stateView=(ctx,e)=>ctx.state&&ctx.state!=='normal'?C().state(ctx.state,e):null;
  M.screens=M.screens||{};
  M.screens.availability=(ctx)=>{
    const state=stateView(ctx,'ambientes o instructores'); if(state)return `${C().pageHeader('Disponibilidad','Consulta por fecha y franja horaria.')}${state}`;
    const env=D().environments;
    return `${C().pageHeader('Disponibilidad','Consulta ambientes e instructores disponibles para una sesión.')}
      <section class="card filters" style="grid-template-columns:repeat(3,minmax(0,1fr)) auto"><div class="form-field"><label>Fecha</label><input type="date" value="2026-08-10"></div><div class="form-field"><label>Hora inicio</label><input type="time" value="07:00"></div><div class="form-field"><label>Hora fin</label><input type="time" value="10:00"></div><button class="btn btn-primary">Consultar</button></section>
      <section class="panel">${C().tabs(['Ambientes','Instructores'],0)}<div class="panel-body"><div class="availability-grid">${env.map(x=>`<article class="card availability-card"><div style="display:flex;justify-content:space-between;gap:12px"><span class="conflict-icon" style="background:var(--color-brand-soft);color:var(--color-brand)">${icon('building')}</span>${C().status(x.available?'AVAILABLE':'UNAVAILABLE')}</div><div><h3 style="margin:0 0 4px">${x.name}</h3><p style="margin:0;color:var(--color-text-muted)">${x.type} · ${x.capacity} personas</p><p>${x.location}</p></div><a href="#/disponibilidad/ambientes/${x.id}" class="btn btn-secondary">Ver detalle</a></article>`).join('')}</div></div>${C().pagination(34,1,6,1,10)}</section>
      <section class="panel" style="margin-top:20px"><header class="panel-header"><div><h2 class="panel-title">Instructores</h2><p class="panel-subtitle">Disponibilidad compuesta a partir de instructores y excepciones registradas.</p></div><button class="btn btn-secondary">Ver reporte de carga</button></header>${C().table([
        {label:'Nombre',render:r=>`<strong>${r.name}</strong>`},{label:'Documento',key:'document'},{label:'Área',key:'area'},{label:'Horas máx./semana',key:'maxHours'},{label:'Disponibilidad',render:r=>C().status(r.available?'AVAILABLE':'EXCEPTION')}
      ],D().instructors,{caption:'Disponibilidad de instructores',total:41,start:1,end:5,pageSize:10})}</section>
      <!-- TODO GAP G2: no existe GET /instructors/available; esta vista usa datos mock compuestos de GET /instructors + availability-exceptions. -->`;
  };
  M.screens.environmentDetail=(ctx)=>{
    const state=stateView(ctx,'disponibilidad del ambiente'); if(state)return `${C().pageHeader('Detalle de ambiente','',null,{label:'Volver a Disponibilidad',href:'/disponibilidad'})}${state}`;
    const env=D().environments.find(x=>x.id===ctx.params[0])||D().environments[0];
    const cells=['Libre','Ocupada','Libre','Mantenimiento','Libre','Ocupada','Libre','Libre','Ocupada','Libre','Libre','Ocupada','Mantenimiento','Libre','Libre'];
    return `${C().pageHeader(env.name,`${env.type} · ${env.capacity} personas · ${env.location}`,null,{label:'Volver a Disponibilidad',href:'/disponibilidad'})}
      <div class="page-actions" style="margin-bottom:20px"><div class="form-field"><label>Rango de fechas</label><input type="date" value="2026-08-10"></div>${C().status('ACTIVE')}</div>
      <section class="kpi-grid" style="grid-template-columns:minmax(260px,420px)">${C().kpi('Ocupación en el rango','68%','17 de 25 franjas')}</section>
      <section class="panel"><header class="panel-header"><div><h2 class="panel-title">Ocupación por franja</h2><p class="panel-subtitle">Lunes a viernes, semana seleccionada.</p></div></header><div class="panel-body data-table-wrap"><div class="occupancy-grid"><div></div>${['Lunes','Martes','Miércoles','Jueves','Viernes'].map(d=>`<div><strong>${d}</strong></div>`).join('')}${['07:00–10:00','10:00–13:00','13:00–16:00'].map((slot,ri)=>`<div><strong>${slot}</strong></div>${cells.slice(ri*5,ri*5+5).map(v=>`<div>${C().status(v==='Libre'?'AVAILABLE':v==='Ocupada'?'CONFLICT':'ARCHIVED',v)}</div>`).join('')}`).join('')}</div></div><footer class="panel-footer"><a href="#/disponibilidad/ambientes/${env.id}?report=utilization">Ver reporte de utilización (horas)</a></footer></section>`;
  };
})();
