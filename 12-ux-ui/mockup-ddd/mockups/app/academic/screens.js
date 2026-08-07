(() => {
  const M=window.Mockup=window.Mockup||{}, C=()=>M.Components, D=()=>M.data;
  const stateView=(ctx,e)=>ctx.state&&ctx.state!=='normal'?C().state(ctx.state,e):null;
  M.screens=M.screens||{};
  M.screens.fichasList=(ctx)=>{
    const state=stateView(ctx,'fichas'); if(state)return `${C().pageHeader('Fichas')}${state}`;
    return `${C().pageHeader('Fichas')}${C().filters([{label:'Programa',type:'search',placeholder:'Buscar programa'},{label:'Estado',options:['Todos','Inducción','Ejecución','Etapa productiva','Finalizada','Cancelada']},{label:'Inicio desde',type:'date'}])}${C().table([
      {label:'Ficha',render:r=>`<a href="#/fichas/${r.id}"><strong>${r.number}</strong></a>`},{label:'Programa',key:'program'},{label:'Estado',render:r=>C().status(r.status)},{label:'Jornada',key:'shift'},{label:'Modalidad',key:'modality'},{label:'Cupo máximo',key:'capacity'},{label:'Fecha de inicio',key:'start'}
    ],D().fichas,{caption:'Fichas del centro',total:56,start:1,end:5,pageSize:10})}`;
  };
  M.screens.fichaDetail=(ctx)=>{
    const state=stateView(ctx,'detalle de la ficha'); if(state)return `${C().pageHeader('Detalle de ficha','',null,{label:'Volver a Fichas',href:'/fichas'})}${state}`;
    const f=D().fichas.find(x=>x.id===ctx.params[0])||D().fichas[0];
    const schedules=D().schedules.filter(x=>x.ficha===f.number).slice(0,3);
    return `${C().pageHeader(`Ficha ${f.number}`,'',null,{label:'Volver a Fichas',href:'/fichas'})}<section class="panel"><header class="panel-header"><div><h2 class="panel-title">${f.program}</h2><p class="panel-subtitle">Nivel: Tecnólogo · 2.440 horas · Versión cursada: 3</p></div>${C().status(f.status)}</header><div class="panel-body"><h3>Programa</h3>${C().details([['Código','233104'],['Nombre','Análisis y Desarrollo de Software'],['Nivel','Tecnólogo'],['Horas totales','2.440'],['Versión cursada','3']])}<h3 style="margin-top:24px">Datos de la ficha</h3>${C().details([['Centro de formación','Centro de la Industria, la Empresa y los Servicios'],['Jornada',f.shift],['Modalidad',f.modality],['Cupo máximo',f.capacity],['Fecha de inicio',f.start],['Fecha esperada de cierre','15/12/2027'],['Fecha real de cierre','No aplica'],['Última actualización','06/08/2026']])}</div></section>
      <section class="panel" style="margin-top:20px"><header class="panel-header"><div><h2 class="panel-title">Horarios de esta ficha</h2></div></header>${C().table([{label:'Período',key:'period'},{label:'Nombre',key:'name'},{label:'Estado',render:r=>C().status(r.status)},{label:'Última actualización',key:'updated'}],schedules.length?schedules:[D().schedules[0]],{caption:'Horarios de la ficha',pagination:false})}<footer class="panel-footer">Mostrando ${Math.max(1,schedules.length)} de ${Math.max(1,schedules.length)} · <a href="#/horarios">Ver todos en Horarios</a></footer></section>`;
  };
})();
