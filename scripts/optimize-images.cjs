const sharp=require('sharp');

const jobs=[
  ['halu-engineer-cutout-v4.png','halu-engineer-cutout-v4.webp',null],
  ['halu-engineer-seated-v1.png','halu-engineer-seated-v1.webp',600],
];

(async()=>{
  for(const [input,output,width] of jobs){
    let image=sharp(input).rotate();
    if(width)image=image.resize({width,withoutEnlargement:true});
    await image.webp({quality:82,alphaQuality:90,smartSubsample:true,effort:6}).toFile(output);
    const meta=await sharp(output).metadata();
    console.log(`${output}: ${meta.width}x${meta.height}`);
  }
})().catch(error=>{console.error(error);process.exitCode=1});
