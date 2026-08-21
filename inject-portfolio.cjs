const fs=require('fs');
const vm=require('vm');

const htmlFile='index.html';
const moduleFile='portfolio-redesign-v1.js';
if(!fs.existsSync(htmlFile)) throw new Error('No se encontró index.html.');
if(!fs.existsSync(moduleFile)) throw new Error('No se encontró portfolio-redesign-v1.js.');

const moduleSource=fs.readFileSync(moduleFile,'utf8');
new vm.Script(moduleSource,{filename:moduleFile});

let html=fs.readFileSync(htmlFile,'utf8');
if(!html.toLowerCase().includes('</body>')) throw new Error('index.html no contiene </body>.');

html=html.replace(/<script\s+src=["']portfolio-redesign-v1\.js(?:\?[^"']*)?["']\s*><\/script>\s*/gi,'');
const tag='<script src="portfolio-redesign-v1.js?v=20260821-portfolio2"></script>\n';
const pos=html.toLowerCase().lastIndexOf('</body>');
html=html.slice(0,pos)+tag+html.slice(pos);

fs.writeFileSync(htmlFile,html,'utf8');
console.log('Rediseño tipo portafolio integrado en index.html.');