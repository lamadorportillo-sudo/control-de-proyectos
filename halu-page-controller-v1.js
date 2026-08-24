/* ===== HALU · CONTROL OPCIONAL DE LA APLICACIÓN ===== */
(()=>{
'use strict';
if(window.__CC_HALU_PAGE_CONTROLLER_V1__)return;
window.__CC_HALU_PAGE_CONTROLLER_V1__=true;

const STORAGE_KEY='cc_halu_page_control_v1';
const A=value=>Array.isArray(value)?value:[];
const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const enabled=()=>{try{return localStorage.getItem(STORAGE_KEY)!=='off'}catch{return true}};
const setEnabled=value=>{try{localStorage.setItem(STORAGE_KEY,value?'on':'off')}catch{}return value};
const visible=element=>!!element&&element.getAttribute('aria-hidden')!=='true'&&element.style?.display!=='none';
const clickFirst=selectors=>{
  for(const selector of String(selectors||'').split(',')){
    const element=document.querySelector(selector.trim());
    if(visible(element)){element.click();return true}
  }
  return false;
};
const clickText=(pattern,selector='button,[role="button"],a')=>{
  const element=[...document.querySelectorAll(selector)].find(item=>visible(item)&&pattern.test(norm(item.textContent)));
  if(element){element.click();return true}return false;
};
const openScreen=screen=>{
  try{
    const item=document.querySelector(`[data-ccx="${screen}"]`);
    if(item){item.click();return true}
    if(screen==='projects'){view.screen='projects';view.projectId=null;renderApp();return true}
  }catch{}
  return false;
};
const openProjectTab=tab=>{
  try{if(view?.screen!=='project'||!view?.projectId)return false;view.tab=tab;renderProject();return true}catch{return false}
};
const projects=()=>{try{return A(db?.projects).filter(project=>!project.deletedAt)}catch{return[]}};
const projectMatch=text=>{
  const query=norm(text).replace(/^(abre|abrir|busca|buscar|encuentra|ir a|ve a|llevame al?)\s+(el\s+)?proyecto\s+/,'').trim();
  if(!query)return null;
  const exact=projects().find(project=>[project.code,project.name,project.title].some(value=>norm(value)===query));
  if(exact)return exact;
  const candidates=projects().filter(project=>[project.code,project.name,project.title,project.location].some(value=>norm(value).includes(query)||query.includes(norm(value))&&norm(value).length>5));
  return candidates.length===1?candidates[0]:null;
};
const openProject=project=>{
  try{view.screen='project';view.projectId=project.id;view.tab='summary';renderApp();return true}catch{return false}
};
const moduleCommands=[
  {rx:/\b(programa de costos|fichas? de costos?|costos unitarios|apu)\b/,label:'Programa de costos',selectors:'#ccCostProgramLazyBtn,#ccCostProgramBtn'},
  {rx:/\b(centro de contratos|contratos generales|modulo de contratos)\b/,label:'Centro de contratos',selectors:'#cccNavBtn'},
  {rx:/\b(umbrales|gacetas?|modalidades de contratacion)\b/,label:'Umbrales y Gacetas',selectors:'#ccgNavBtn'},
  {rx:/\b(transparencia|portal de transparencia)\b/,label:'Transparencia',selectors:'[data-tr-exec]'},
  {rx:/\b(centro de seguridad|seguridad del sistema)\b/,label:'Centro de seguridad',selectors:'#ccSecurityBtn'},
  {rx:/\b(usuarios|equipo de trabajo|administrar usuarios)\b/,label:'Usuarios',selectors:'#ccTeamBtn'},
  {rx:/\b(respaldo|copia de seguridad|exportar respaldo)\b/,label:'Respaldo',selectors:'#backupBtn'},
  {rx:/\b(autenticacion de dos factores|doble factor|2fa|mfa)\b/,label:'Seguridad 2FA',selectors:'#ccMfaBtn'}
];
const capabilities=()=>`Puedo controlar la navegación y abrir formularios cuando tú lo ordenes: Inicio, Proyectos, Presupuesto, Alertas, Auditoría, Reportes, expedientes y sus pestañas, Programa de costos, Contratos, Transparencia, Usuarios, Seguridad y Respaldos. También puedo buscar o abrir un proyecto y comenzar un nuevo registro. Puedes decir “desactiva el control de página” cuando quieras. Para eliminar datos o cerrar sesión exijo una confirmación explícita.`;
let pendingLogoutUntil=0;

function handle(text){
  const raw=String(text||'').trim(),q=norm(raw);
  if(!q)return{handled:false};
  if(/\b(desactiva|apaga|inhabilita)\b.*\b(control|manejo)\b.*\b(pagina|sistema|aplicacion)\b/.test(q)){setEnabled(false);return{handled:true,message:'Control de página desactivado. Seguiré respondiendo consultas, pero no moveré ni abriré elementos del sistema hasta que me digas “activa el control de página”.'}}
  if(/\b(activa|enciende|habilita)\b.*\b(control|manejo)\b.*\b(pagina|sistema|aplicacion)\b/.test(q)){setEnabled(true);return{handled:true,message:'Control de página activado. Ya puedo navegar y abrir módulos por ti; las acciones sensibles seguirán requiriendo confirmación.'}}
  if(/\b(que puedes controlar|controlar la pagina|control del sistema|comandos de la pagina)\b/.test(q))return{handled:true,message:capabilities()};
  if(!enabled())return{handled:false};
  if(/^(confirmar cierre|confirmo cerrar sesion)$/.test(q)){
    if(Date.now()>pendingLogoutUntil)return{handled:true,message:'La confirmación venció. Si aún deseas salir, dime “cerrar sesión” y luego confirma.'};
    pendingLogoutUntil=0;return{handled:true,message:clickFirst('#logoutBtn,[data-logout]')?'Sesión cerrada.':'No encontré el control de salida en esta pantalla.'};
  }
  if(/\b(cerrar sesion|salir del sistema)\b/.test(q)){pendingLogoutUntil=Date.now()+60000;return{handled:true,message:'Cerrar sesión interrumpirá tu trabajo actual. Si estás seguro, escribe exactamente “confirmar cierre” durante el próximo minuto.'}}
  if(/\b(elimina|eliminar|borra|borrar|suprime|suprimir)\b/.test(q))return{handled:true,message:'No eliminaré información con una orden ambigua. Te llevo al módulo correspondiente y allí podrás revisar el registro exacto antes de confirmar la eliminación.'};
  if(/\b(nuevo proyecto|crear proyecto|agregar proyecto)\b/.test(q)){
    openScreen('projects');
    const opened=clickFirst('[data-ccx-new],[data-quick-action="project"],#addProject')||clickText(/^(nuevo|agregar|crear) proyecto$/);
    return{handled:true,message:opened?'Abrí el formulario de nuevo proyecto. Revísalo y guarda cuando los datos estén completos.':'Abrí Proyectos, pero no encontré disponible el formulario de creación para tu perfil.'};
  }
  if(/\b(abre|abrir|busca|buscar|encuentra|ir a|ve a|llevame)\b.*\bproyecto\b/.test(q)&&q.split(' ').length>2){
    const project=projectMatch(q);
    if(project&&openProject(project))return{handled:true,message:`Abrí el expediente ${project.code||''} · ${project.name||project.title||'Proyecto'}.`};
    openScreen('projects');
    return{handled:true,message:'Abrí Proyectos. No encontré una coincidencia única; escribe el código o el nombre más completo para abrir el expediente correcto.'};
  }
  for(const command of moduleCommands){
    if(command.rx.test(q)&&/\b(abre|abrir|muestra|mostrar|ir|ve|llevame|entra|quiero)\b/.test(q))return{handled:true,message:clickFirst(command.selectors)||clickText(command.rx)?`Abrí ${command.label}.`:`${command.label} no está disponible en esta pantalla o para tu perfil.`};
  }
  const screenMap=[[/\b(inicio|panel principal|dashboard)\b/,'home','Inicio'],[/\bproyectos\b/,'projects','Proyectos'],[/\bpresupuesto\b/,'budget','Presupuesto'],[/\balertas\b/,'alerts','Alertas'],[/\bauditoria\b/,'audit','Auditoría'],[/\breportes generales\b/,'reports','Reportes']];
  const screen=screenMap.find(([rx])=>rx.test(q));
  if(screen&&/\b(abre|abrir|muestra|mostrar|ir|ve|llevame|entra)\b/.test(q))return{handled:true,message:openScreen(screen[1])?`Abrí ${screen[2]}.`:`No pude abrir ${screen[2]} desde el estado actual.`};
  const tabMap=[[/\bresumen\b/,'summary','Resumen'],[/\b(ofertas|adjudicacion)\b/,'procurement','Ofertas y adjudicación'],[/\bcontrato\b/,'contract','Contrato'],[/\b(clausulas|controles)\b/,'controls','Cláusulas y controles'],[/\b(pagos|estimaciones)\b/,'estimates','Pagos / Estimaciones'],[/\bvisitas\b/,'visits','Visitas'],[/\bgarantias\b/,'guarantees','Garantías'],[/\b(modificaciones|cambios|adendas)\b/,'changes','Modificaciones'],[/\binformes\b/,'reports','Informes'],[/\bproceso contractual\b/,'lifecycle','Proceso contractual'],[/\bgaleria\b/,'gallery','Galería']];
  const tab=tabMap.find(([rx])=>rx.test(q));
  if(tab&&/\b(abre|abrir|muestra|mostrar|ir|ve|llevame|entra)\b/.test(q))return{handled:true,message:openProjectTab(tab[1])?`Abrí ${tab[2]} en el expediente actual.`:`Primero abre un proyecto; después podré llevarte a ${tab[2]}.`};
  return{handled:false};
}

window.__ccHaluPageController={handle,capabilities,isEnabled:enabled,setEnabled};
})();
