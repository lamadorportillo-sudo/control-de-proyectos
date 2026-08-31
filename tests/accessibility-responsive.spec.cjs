const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const appUrl = process.env.APP_URL || 'http://127.0.0.1:4173/';

function blocking(violations){
  return violations.filter(v=>v.impact==='critical'||(v.id==='color-contrast'&&['serious','critical'].includes(v.impact))).map(v=>({
    id:v.id,
    impact:v.impact,
    description:v.description,
    targets:v.nodes.slice(0,8).flatMap(n=>n.target),
  }));
}

async function scan(page,label){
  const result=await new AxeBuilder({page})
    .withTags(['wcag2a','wcag2aa','wcag21aa'])
    .analyze();
  const severe=result.violations.filter(v=>['serious','critical'].includes(v.impact));
  if(severe.length)console.log(`${label}: ${severe.length} hallazgo(s) serio(s)/crítico(s) de accesibilidad`,severe.map(v=>`${v.impact}:${v.id}`).join(', '));
  expect(blocking(result.violations),`${label} no debe contener contraste serio ni violaciones críticas WCAG`).toEqual([]);
}

test.describe('accesibilidad esencial WCAG',()=>{
  for(const viewport of [{width:390,height:844},{width:1366,height:768}]){
    test(`login y modo invitado sin fallos críticos ${viewport.width}x${viewport.height}`,async({page})=>{
      await page.setViewportSize(viewport);
      await page.goto(appUrl,{waitUntil:'domcontentloaded'});
      await expect(page.locator('#authForm')).toBeVisible();
      await scan(page,'pantalla de acceso');

      await expect(page.locator('#ccGuestEnter')).toBeVisible();
      await page.locator('#ccGuestEnter').click();
      await expect(page.locator('body')).toHaveClass(/cc-guest-mode/);
      await page.locator('#ccxNav [data-ccx="projects"]').click();
      await expect(page.locator('.project-v3, .project-card-premium').first()).toBeVisible();
      await scan(page,'portafolio en modo invitado');
    });
  }
});
