import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const products = [
  {slug:'black-king-kong',name:'元長特產・黑金剛花生',description:'花青素豐富，日曬熟成後香脆爽口。',price:420,stock:38,season:'現貨供應',category:'在地花生',image:'🥜'},
  {slug:'roasted-peanut',name:'古早味・台南選9號焙炒花生仁',description:'蒜香濃郁、種皮薄，老師傅慢火焙炒。',price:360,stock:24,season:'春作預購',category:'職人焙炒',image:'🫘'},
  {slug:'red-peanut',name:'北港飽滿・紅仁花生',description:'雲林沙質土壤孕育，口感紮實飽滿。',price:390,stock:0,season:'已完售',category:'在地花生',image:'🌰'},
  {slug:'peanut-oil',name:'土庫冷壓花生油',description:'低溫壓榨，保留花生的純粹香氣。',price:580,stock:18,season:'現貨供應',category:'好油好醬',image:'🫙'},
  {slug:'peanut-butter',name:'無添加純濃花生醬',description:'只有花生，沒有多餘添加，濃厚滑順。',price:280,stock:32,season:'現貨供應',category:'好油好醬',image:'🥣'}
];
async function main(){
  for(const p of products) await prisma.product.upsert({where:{slug:p.slug},update:p,create:p});
  const user=await prisma.user.upsert({where:{phone:'0912345678'},update:{name:'林阿嬤'},create:{name:'林阿嬤',phone:'0912345678'}});
  if(await prisma.order.count({where:{userId:user.id}})===0){
    const product=await prisma.product.findUniqueOrThrow({where:{slug:'black-king-kong'}});
    await prisma.order.create({data:{code:'YL-DEMO-2026',userId:user.id,customerName:user.name,phone:user.phone,status:'已完成',shipping:'黑貓宅配',total:840,freight:0,recipients:{create:{name:user.name,phone:user.phone,address:'雲林縣元長鄉農村路 88 號',quantity:2}},items:{create:{productId:product.id,quantity:2,jin:2,price:420}}}});
  }
}
main().finally(()=>prisma.$disconnect());
