/* ===== PROJECT SEARCH DISPLAY FIX V1 ===== */
(()=>{
  if(document.getElementById('project-search-display-fix-v1')) return;
  const style=document.createElement('style');
  style.id='project-search-display-fix-v1';
  style.textContent=`
    .project-v3[hidden]{display:none!important}
  `;
  document.head.appendChild(style);
})();
