const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const appUrl = process.env.APP_URL || 'http://127.0.0.1:4173/';

function severeFindings(violations){
  return violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({
    id:v.id,
    impact:v.impact,
    description:v.description,
    targets:v.nodes.slice(0,8).flatMap(n=>n.target),
    nodes:v.nodes.slice(0,8).map(n=>({target:n.target,html:n.html,failureSummary:n.failureSummary})),
  }));
}

async function scan(page,label){
  const result=await new AxeBuilder({page})
    .withTags(['wcag2a','wcag2aa','wcag21aa'])
    .analyze();
  const severe=severeFindings(result.violations);
  if(severe.length)console.log(`${label}: ${severe.length} hallazgo(s) serio(s)/crítico(s) de accesibilidad`,JSON.stringify(severe,null,2));
  expect(severe,`${label} no debe contener hallazgos WCAG serious/critical`).toEqual([]);
}

test.describe('accesibilidad esencial WCAG',()=>{
  for(const viewport of [{width:390,height:844},{width:1366,height:768}]){
    test(`acceso privado sin hallazgos serious/critical ${viewport.width}x${viewport.height}`,async({page})=>{
      await page.setViewportSize(viewport);
      await page.goto(appUrl,{waitUntil:'domcontentloaded'});
      await expect(page.locator('#authForm')).toBeVisible();
      await expect(page.locator('#ccGuestEnter')).toHaveCount(0);
      await scan(page,'pantalla de acceso privado');
    });
  }
});
