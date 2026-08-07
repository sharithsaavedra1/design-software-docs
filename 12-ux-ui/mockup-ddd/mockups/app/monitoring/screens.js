(() => {
  const M=window.Mockup=window.Mockup||{}, C=()=>M.Components, D=()=>M.data, icon=(...a)=>M.icon(...a);
  const stateView=(ctx,e)=>ctx.state&&ctx.state!=='normal'?C().state(ctx.state,e):null;
  M.screens=M.screens||{};

  const trackingRows=[
    {date:'10/07/2026',type:'Académico',attendance:'18/20 · 90%',progress:'65%',follow:'Sí'},
    {date:'10/06/2026',type:'Proyecto',attendance:'19/20 · 95%',progress:'52%',follow:'No'},
    {date:'10/05/2026',type:'Bienestar',attendance:'17/20 · 85%',progress:'41%',follow:'Sí'},
    {date:'10/04/2026',type:'Académico',attendance:'20/20 · 100%',progress:'30%',follow:'No'}
  ];
  M.screens.tracking=(ctx)=>{
    // TODO GAP B3: GET /ficha-trackings exige MON_DASHBOARD_FULL; se usan datos mock del instructor.
    const state=stateView(ctx,'registros de seguimiento'); if(state)return `${C().pageHeader('Seguimiento de ficha','', {label:'+ Registrar seguimiento',href:'/instructor/seguimiento?modal=tracking'})}${state}`;
    const modal=ctx.query.get('modal');
    let html=`${C().pageHeader('Seguimiento de ficha','Registra mediciones periódicas de asistencia y avance curricular.',{label:'+ Registrar seguimiento',href:'/instructor/seguimiento?modal=tracking'})}
      <section class="card filters" style="grid-template-columns:minmax(260px,1fr) repeat(3,minmax(160px,.6fr))"><div class="form-field"><label>Ficha</label><select><option>2874412 — Análisis y Desarrollo de Software</option></select></div><div class="detail-item"><dt>Estado</dt><dd>${C().status('AT_RISK')}</dd></div><div class="detail-item"><dt>Último seguimiento</dt><dd>10 jul 2026</dd></div><div class="detail-item"><dt>Próximo</dt><dd>10 ago 2026</dd></div></section>
      ${C().table([{label:'Fecha',key:'date'},{label:'Tipo',key:'type'},{label:'Asistencia',key:'attendance'},{label:'Avance curricular',render:r=>`<div>${r.progress}</div><progress max="100" value="${parseInt(r.progress)}" style="width:100%"></progress>`},{label:'Requiere seguimiento',render:r=>C().status(r.follow==='Sí'?'AT_RISK':'ON_TRACK',r.follow)}],trackingRows,{caption:'Seguimientos de ficha',total:27,start:1,end:4,pageSize:10})}`;
    if(modal==='tracking') html+=C().modal('Registrar seguimiento',`<div class="form-grid"><div class="form-field full"><label>Tipo de sesión</label><select><option>Académico</option><option>Bienestar</option><option>Proyecto</option><option>Etapa productiva</option></select></div><div class="form-field full"><label>Fecha</label><input type="date" value="2026-08-06"></div><div class="form-field"><label>Asistentes</label><input type="number" value="21"><div class="field-error">${icon('warning')}Los asistentes no pueden superar el total de aprendices.</div></div><div class="form-field"><label>Total de aprendices</label><input type="number" value="20"><div class="field-help">→ 105% de asistencia</div></div><div class="form-field full"><label>Avance curricular (%)</label><input type="number" value="65"></div><div class="form-field full"><label>Observaciones</label><textarea placeholder="Ej. Se avanzó en la unidad 3, dos aprendices en riesgo de deserción"></textarea></div><label class="form-field full" style="display:flex;grid-template-columns:auto 1fr;align-items:center"><input type="checkbox" style="width:20px;min-height:20px">Requiere seguimiento adicional</label></div>`,`<button class="btn btn-secondary" data-close-modal>Cancelar</button><button class="btn btn-primary">Guardar</button>`);
    return html;
  };

  M.screens.notificationsList=(ctx)=>{
    const state=stateView(ctx,'notificaciones'); if(state)return `${C().pageHeader('Notificaciones')}${state}`;
    return `${C().pageHeader('Notificaciones','Avisos enviados a tu usuario.')}<section class="notifications-list">${D().notifications.map(n=>`<a class="card notification-card" href="#/notificaciones/${n.id}" style="text-decoration:none;color:inherit"><span class="conflict-icon" style="background:var(--color-brand-soft);color:var(--color-brand)">${icon('bell')}</span><div><h3>${n.subject}</h3><p>${n.summary}</p><time>${n.date}</time></div>${C().status(n.status)}</a>`).join('')}</section>${C().pagination(18,1,5,1,10)}`;
  };
  M.screens.notificationDetail=(ctx)=>{
    const state=stateView(ctx,'notificación'); if(state)return `${C().pageHeader('Detalle de notificación','',null,{label:'Volver a Notificaciones',href:'/notificaciones'})}${state}`;
    const n=D().notifications.find(x=>x.id===ctx.params[0])||D().notifications[0];
    return `${C().pageHeader(n.subject,n.date,null,{label:'Volver a Notificaciones',href:'/notificaciones'})}<section class="panel"><header class="panel-header"><div><h2 class="panel-title">${n.subject}</h2><p class="panel-subtitle">Notificación del sistema de horarios</p></div>${C().status(n.status)}</header><div class="panel-body"><p>${n.summary}</p><p>Este aviso corresponde a información vigente del centro de formación y se presenta únicamente para consulta.</p>${n.scheduleId?`<a class="btn btn-primary" href="#/mi-horario">Ir al horario</a>`:''}</div></section>`;
  };

  const kpiRows=[
    {ficha:'2874412',kpi:'Asistencia',value:'76%',threshold:'80%',status:'AT_RISK',period:'Ago 2026',measured:'05/08/2026'},
    {ficha:'3011550',kpi:'Avance curricular',value:'42%',threshold:'50%',status:'CRITICAL',period:'Ago 2026',measured:'04/08/2026'},
    {ficha:'2987701',kpi:'Asistencia',value:'92%',threshold:'80%',status:'ON_TRACK',period:'Ago 2026',measured:'03/08/2026'},
    {ficha:'3124508',kpi:'Riesgo de deserción',value:'18%',threshold:'20%',status:'ON_TRACK',period:'Ago 2026',measured:'02/08/2026'},
    {ficha:'2763450',kpi:'Etapa productiva',value:'61%',threshold:'70%',status:'AT_RISK',period:'Jul 2026',measured:'31/07/2026'}
  ];
  M.screens.kpiDashboard=(ctx)=>{
    const state=stateView(ctx,'fichas en seguimiento'); if(state)return `${C().pageHeader('Panel de indicadores')}${state}`;
    return `${C().pageHeader('Panel de indicadores','Estado de seguimiento de las fichas del centro.')}${C().filters([{label:'Tipo de KPI',options:['Todos','Asistencia','Avance curricular','Riesgo de deserción','Avance etapa productiva']},{label:'Estado',options:['Todos','En seguimiento','En riesgo','Crítico']},{label:'Desde',type:'date'},{label:'Hasta',type:'date'}],'Actualizar')}
      <section class="kpi-grid">${C().kpi('En seguimiento','31','Alertas activas promedio: 0,4')}${C().kpi('En riesgo','12','Requieren revisión')}${C().kpi('Crítico','4','Acción inmediata','critical')}</section>
      <section class="panel"><header class="panel-header"><div><h2 class="panel-title">Distribución por nivel de riesgo</h2></div></header><div class="panel-body"><div class="chart"><div class="chart-bar" style="height:82%"><span>Seguimiento</span></div><div class="chart-bar" style="height:42%;background:var(--color-warning)"><span>Riesgo</span></div><div class="chart-bar" style="height:18%;background:var(--color-danger)"><span>Crítico</span></div></div></div></section>
      <section class="panel" style="margin-top:20px"><header class="panel-header"><div><h2 class="panel-title">Indicadores por ficha</h2><p class="panel-subtitle">Top 5 de 47 registros</p></div></header>${C().table([{label:'Ficha',render:r=>`<a href="#/admin/indicadores/track-01/attendance"><strong>${r.ficha}</strong></a>`},{label:'KPI',key:'kpi'},{label:'Valor actual',key:'value'},{label:'Umbral',key:'threshold'},{label:'Estado',render:r=>C().status(r.status)},{label:'Período',key:'period'},{label:'Medido',key:'measured'}],kpiRows,{caption:'Indicadores por ficha',pagination:false})}<footer class="panel-footer">Mostrando 5 de 47 · <a href="#/admin/indicadores/track-01/attendance">Ver todos</a></footer></section>`;
  };
  M.screens.kpiDrilldown=(ctx)=>{
    const state=stateView(ctx,'mediciones'); if(state)return `${C().pageHeader('Detalle de indicador','',null,{label:'Volver al panel',href:'/admin/indicadores'})}${state}`;
    const measurements=[{period:'Mar 2026',measured:'10/03/2026',value:'88%',threshold:'80%',status:'ON_TRACK'},{period:'Abr 2026',measured:'10/04/2026',value:'84%',threshold:'80%',status:'ON_TRACK'},{period:'May 2026',measured:'10/05/2026',value:'79%',threshold:'80%',status:'AT_RISK'},{period:'Jun 2026',measured:'10/06/2026',value:'78%',threshold:'80%',status:'AT_RISK'},{period:'Jul 2026',measured:'10/07/2026',value:'76%',threshold:'80%',status:'AT_RISK'}];
    return `${C().pageHeader('Ficha 2874412 — Asistencia','Valor actual: 76% · Umbral vigente: 80%',null,{label:'Volver al panel',href:'/admin/indicadores'})}<section class="kpi-grid" style="grid-template-columns:repeat(2,minmax(0,300px))">${C().kpi('Valor actual','76%','Última medición: 05/08/2026')}${C().kpi('Umbral','80%','Configuración vigente')}</section><section class="panel"><header class="panel-header"><div><h2 class="panel-title">Evolución temporal</h2></div><div class="form-field"><label>Rango</label><input type="date" value="2026-03-01"></div></header><div class="panel-body"><div class="chart">${[88,84,79,78,76].map((v,i)=>`<div class="chart-bar" style="height:${v}%;background:${v<80?'var(--color-danger)':'var(--color-brand)'}"><span>${['Mar','Abr','May','Jun','Jul'][i]}</span></div>`).join('')}</div></div></section><section style="margin-top:20px">${C().table([{label:'Período',key:'period'},{label:'Medido',key:'measured'},{label:'Valor',key:'value'},{label:'Umbral',key:'threshold'},{label:'Estado',render:r=>C().status(r.status)}],measurements,{caption:'Mediciones del KPI',total:18,start:1,end:5,pageSize:10,cursor:true})}</section>`;
  };
})();
