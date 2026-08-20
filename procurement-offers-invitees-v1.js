/* ===== OFERTAS VINCULADAS A INVITACIONES V1 ===== */
(()=>{
'use strict';
if(window.__CC_OFFERS_INVITEES_V1__)return;
window.__CC_OFFERS_INVITEES_V1__=true;

const A=v=>Array.isArray(v)?v:[];
const H=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
const say=m=>{try{toast(m)}catch{console.log(m)}};

function css(){
 if(document.getElementById('cc-offers-invitees-v1-style'))return;
 const s=document.createElement('style');s.id='cc-offers-invitees-v1-style';s.textContent=`
 .cc-invite-status{display:inline-flex;align-items:center;gap:4px;margin-top:4px;padding:3px 6px;border-radius:999px;font-size:8px;font-weight:800;border:1px solid #cbdcea;background:#eef6ff;color:#1769c2}.cc-invite-status.extra{background:#fff8e8;border-color:#ecd9a4;color:#8d630b}.cc-invite-status.pending{background:#f6f8fa;border-color:#dce5ed;color:#64778a}.cc-pending-invite-row td{background:#fbfcfe!important;color:#6a7d90!important}.cc-pending-invite-row td:nth-child(2){color:#21384f!important}.cc-offer-help{margin:0 0 10px;padding:9px 11px;border:1px solid #d8e5f0;border-radius:10px;background:#f7fafc;color:#5c7389;font-size:10px;line-height:1.45}.cc-offer-help b{color:#244a6b}.cc-offer-origin{display:block;margin-top:4px;font-size:9px;color:#6d8194}
 `;document.head.appendChild(s);
}
function current(){try{const p=A(db?.projects).find(x=>x.id===view?.projectId&&!x.deletedAt);if(!p)return null;p.procurement=p.procurement&&typeof p.procurement==='object'?p.procurement:{};p.procurement.offers=A(p.procurement.offers);p.procurement.invitees=A(p.procurement.invitees);const c=A(db?.contracts).find(x=>x.projectId===p.id)||null;return{p,proc:p.procurement,c}}catch{return null}}
function matchInvitee(offer,invitees){if(offer?.inviteeId)return invitees.find(i=>String(i.id)===String(offer.inviteeId))||null;return invitees.find(i=>N(i.name)===N(offer?.bidder))||null}
function pendingInvitees(proc){const offers=A(proc.offers),invitees=A(proc.invitees);return invitees.filter(i=>!offers.some(o=>String(o.inviteeId||'')===String(i.id)||N(o.bidder)===N(i.name)))}
function addBadges(proc){
 const table=document.querySelector('#tabBody .table');if(!table)return;
 const offers=A(proc.offers),invitees=A(proc.invitees),rows=[...table.querySelectorAll('tbody tr')];
 rows.forEach((tr,idx)=>{const o=offers[idx];if(!o)return;const cell=tr.children[1];if(!cell||cell.querySelector('.cc-invite-status'))return;const inv=matchInvitee(o,invitees);const b=document.createElement('span');b.className='cc-invite-status'+(inv?'':' extra');b.textContent=inv?'Invitado':'Se presentó sin invitación';cell.appendChild(document.createElement('br'));cell.appendChild(b)});
}
function appendPendingRows(proc){
 const tbody=document.querySelector('#tabBody .table tbody');if(!tbody)return;
 tbody.querySelectorAll('.cc-pending-invite-row').forEach(x=>x.remove());
 const pend=pendingInvitees(proc);if(!pend.length)return;
 const empty=tbody.querySelector('tr .empty');if(empty)empty.closest('tr')?.remove();
 const start=A(proc.offers).length;
 pend.forEach((i,k)=>{const tr=document.createElement('tr');tr.className='cc-pending-invite-row';tr.dataset.pendingInvitee=i.id;tr.innerHTML=`<td>${start+k+1}</td><td><b>${H(i.name||'—')}</b><br><span class="cc-invite-status pending">Invitado · pendiente de oferta</span></td><td>—</td><td>—</td><td>—</td><td>Pendiente</td><td>—</td><td>Invitación registrada previamente.</td><td>${typeof roleCanEdit==='function'&&roleCanEdit()?`<button class="btn" data-register-invitee-offer="${H(i.id)}">Registrar oferta</button>`:''}</td>`;tbody.appendChild(tr)});
}
function offerModal(invitee=null){
 const ctx=current();if(!ctx)return;const {p,proc,c}=ctx;
 const invited=!!invitee;
 const title=invited?'Registrar oferta de oferente invitado':'Registrar oferente no invitado';
 const help=invited?`El oferente <b>${H(invitee.name)}</b> ya está vinculado desde la etapa de invitaciones. Solo registra aquí los datos de la oferta recibida.`:'Utiliza esta opción únicamente cuando una persona o empresa se presentó al proceso aunque no estuviera en la lista original de invitados.';
 let m;
 try{m=openModal(title,`${typeof projectContext==='function'?projectContext(p,c):''}<div class="cc-offer-help">${help}</div><form id="ccLinkedOfferForm" class="form-grid"><label class="field wide"><span>Oferente / participante</span><input id="ccOfBidder" required ${invited?'readonly':''} value="${H(invitee?.name||'')}">${invited?'<small>Tomado automáticamente de Invitaciones.</small>':'<small>Este nombre quedará identificado como participante no invitado.</small>'}</label><label class="field"><span>Monto ofertado</span><input id="ccOfAmount" type="number" min="0" step="0.01" required></label><label class="field"><span>Monto corregido</span><input id="ccOfCorrected" type="number" min="0" step="0.01"><small>Si queda vacío, se utilizará el monto ofertado.</small></label><label class="field"><span>Evaluación técnica</span><select id="ccOfTech"><option>Pendiente</option><option>Cumple</option><option>No cumple</option><option>Admisible</option><option>Inadmisible</option></select></label><label class="field"><span>Elegible para sugerencia</span><select id="ccOfEligible"><option value="true">Sí</option><option value="false">No</option></select></label><label class="field wide"><span>Observaciones</span><textarea id="ccOfNotes" rows="3"></textarea></label><div class="modal-actions"><button type="button" class="btn cancel">Cancelar</button><button class="btn primary">Guardar oferta</button></div></form>`)}catch(e){console.error(e);return}
 m.querySelector('.cancel').onclick=()=>m.remove();
 m.querySelector('#ccLinkedOfferForm').onsubmit=e=>{
  e.preventDefault();const bidder=m.querySelector('#ccOfBidder').value.trim();if(!bidder)return;
  if(A(proc.offers).some(o=>(invitee&&String(o.inviteeId||'')===String(invitee.id))||N(o.bidder)===N(bidder))){say('Ese oferente ya tiene una oferta registrada.');return}
  const amount=typeof round2==='function'?round2(m.querySelector('#ccOfAmount').value||0):Math.round(Number(m.querySelector('#ccOfAmount').value||0)*100)/100;
  const raw=m.querySelector('#ccOfCorrected').value;
  const corrected=raw===''?amount:(typeof round2==='function'?round2(raw):Math.round(Number(raw||0)*100)/100);
  const no={id:typeof uid==='function'?uid():crypto.randomUUID(),bidder,amount,correctedAmount:corrected,technicalStatus:m.querySelector('#ccOfTech').value,eligible:m.querySelector('#ccOfEligible').value==='true',notes:m.querySelector('#ccOfNotes').value.trim(),inviteeId:invitee?.id||'',invited,origin:invited?'Invitación':'Presentado sin invitación',createdAt:typeof iso==='function'?iso():new Date().toISOString(),updatedAt:typeof iso==='function'?iso():new Date().toISOString()};
  proc.offers.push(no);try{const sg=typeof procurementSuggestion==='function'?procurementSuggestion(p):null;proc.suggestedOfferId=sg?.id||'';if(typeof audit==='function')audit('CREAR','Oferta',no.id,{projectId:p.id,bidder:no.bidder,amount:no.amount,invited});if(typeof saveDB==='function')saveDB()}catch(err){console.error(err)}m.remove();if(typeof renderProcurement==='function')renderProcurement(p,c);say(invited?'Oferta del invitado registrada.':'Oferente no invitado agregado al proceso.');
 };
}
function enhance(){
 css();const ctx=current();if(!ctx)return;const {proc}=ctx;if(!document.getElementById('tabBody'))return;
 addBadges(proc);appendPendingRows(proc);
 document.querySelectorAll('[data-register-invitee-offer]').forEach(b=>{b.onclick=e=>{e.preventDefault();e.stopPropagation();const i=A(proc.invitees).find(x=>String(x.id)===String(b.dataset.registerInviteeOffer));if(i)offerModal(i)}});
 const add=document.getElementById('addOffer');if(add&&!add.dataset.ccInviteeOffer){add.dataset.ccInviteeOffer='1';add.textContent='+ Oferente no invitado';add.classList.remove('primary');add.onclick=e=>{e.preventDefault();e.stopPropagation();offerModal(null)}
 const actions=add?.parentElement;if(actions&&A(proc.invitees).length&&!actions.querySelector('[data-open-invitations-offers]')){const b=document.createElement('button');b.type='button';b.className='btn primary';b.dataset.openInvitationsOffers='1';const pending=pendingInvitees(proc).length;b.textContent=pending?`Registrar oferta invitada (${pending})`:'Invitados completos';b.disabled=!pending;b.onclick=e=>{e.preventDefault();const list=pendingInvitees(proc);if(list.length===1)return offerModal(list[0]);if(!list.length)return;let m;try{m=openModal('Seleccionar oferente invitado',`<div class="stack">${list.map(i=>`<button type="button" class="btn" data-pick-invitee="${H(i.id)}" style="text-align:left">${H(i.name)}</button>`).join('')}</div>`)}catch{return}m.querySelectorAll('[data-pick-invitee]').forEach(x=>x.onclick=()=>{const i=list.find(z=>String(z.id)===String(x.dataset.pickInvitee));m.remove();if(i)offerModal(i)})};actions.insertBefore(b,add)}
}

if(typeof renderProcurement==='function'&&!renderProcurement.__ccOffersInviteesV1){const base=renderProcurement;const wrapped=function(){const r=base.apply(this,arguments);enhance();return r};wrapped.__ccOffersInviteesV1=true;renderProcurement=wrapped}
setTimeout(enhance,0);setTimeout(enhance,350);
window.refreshInvitedOffers=enhance;
})();