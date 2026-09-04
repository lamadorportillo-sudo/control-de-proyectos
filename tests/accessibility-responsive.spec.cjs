const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const appUrl = process.env.APP_URL || 'http://127.0.0.1:4173/';

function severeFindings(violations){
  return violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({
    id:v.id,
    impact:v.impact,
    description:v.description,
    help:v.help,
    targets:v.nodes.slice(0,8).flatMap(n=>n.target),
    nodes:v.nodes.slice(0,8).map(n=>({
      target:n.target,
      html:n.html,
      failureSummary:n.failureSummary,
    })),
  }));
}

async function scan(page,label){
  const result=await new AxeBuilder({page})
    .withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa'])
    .analyze();
  const severe=severeFindings(result.violations);
  if(severe.length){
    console.log(`${label}: ${severe.length} hallazgo(s) serio(s)/crítico(s) de accesibilidad`);
    console.dir(severe,{depth:6});
  }
  expect(severe,`${label} no debe contener violaciones WCAG serias ni críticas`).toEqual([]);
}

test.describe('accesibilidad esencial WCAG 2.1/2.2 AA',()=>{
  for(const viewport of [{width:390,height:844},{width:1366,height:768}]){
    test(`login y modo invitado sin fallos serios/críticos ${viewport.width}x${viewport.height}`,async({page})=>{
      await page.setViewportSize(viewport);
      await page.goto(appUrl,{waitUntil:'domcontentloaded'});
      await expect(page.locator('#authForm')).toBeVisible();
      await scan(page,'pantalla de acceso');

      await expect(page.locator('#ccGuestEnter')).toBeVisible();
      await page.locator('#ccGuestEnter').click();
      await expect(page.locator('body')).toHaveClass(/cc-guest-mode/);
      await expect(page.locator('#ccSidebar')).toBeVisible({timeout:10000});
      await page.locator('#ccSidebar [data-route="proyectos"]').click();
      await expect(page.locator('.project-v3, .project-card-premium').first()).toBeVisible();
      await scan(page,'portafolio en modo invitado');
    });
  }
});
