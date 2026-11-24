import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req:Request){
  const url=new URL(req.url), kind=url.searchParams.get('kind');
  if(kind==='orders') return NextResponse.json(await prisma.order.findMany({include:{items:{include:{product:true}},recipients:true},orderBy:{createdAt:'desc'}}));
  if(kind==='history'){const phone=url.searchParams.get('phone'); return NextResponse.json(await prisma.order.findFirst({where:{phone},include:{items:{include:{product:true}},recipients:true},orderBy:{createdAt:'desc'}}));}
  return NextResponse.json(await prisma.product.findMany({orderBy:{createdAt:'asc'}}));
}
export async function POST(req:Request){
  const body=await req.json();
  if(body.action==='subscribe') return NextResponse.json(await prisma.harvestSubscription.create({data:{name:body.name,contact:body.contact,channel:body.channel||'SMS',product:body.product}}));
  if(body.action==='status') return NextResponse.json(await prisma.order.update({where:{id:body.id},data:{status:body.status}}));
  if(body.action==='inventory') return NextResponse.json(await prisma.product.update({where:{id:body.id},data:{stock:{increment:body.delta}}}));
  if(body.action==='season') return NextResponse.json(await prisma.product.update({where:{id:body.id},data:{season:body.season}}));
  if(body.action==='notify'){
    const mock=!process.env.LINE_NOTIFY_TOKEN;
    if(!mock){const r=await fetch('https://api.line.me/v2/bot/message/broadcast',{method:'POST',headers:{Authorization:`Bearer ${process.env.LINE_NOTIFY_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({messages:[{type:'text',text:body.message||'雲林花生新季到貨，歡迎回來選購！'}]})}); if(!r.ok)return NextResponse.json({error:'LINE 推播失敗'}, {status:502});}
    return NextResponse.json({mock,message:body.message||'🌱 田邊好日｜新季花生到貨囉！日曬熟成、產地直送，歡迎回來選購。'});
  }
  if(body.action==='order'){
    const lines=body.items as {productId:string;quantity:number;jin:number}[];
    const products=await prisma.product.findMany({where:{id:{in:lines.map(x=>x.productId)}}});
    const priceOf=(l:{productId:string;quantity:number;jin:number})=>(products.find(p=>p.id===l.productId)?.price||0)*(l.jin===10?8.2:l.jin===5?4.5:l.jin);
    const subtotal=lines.reduce((n,l)=>n+Math.round(priceOf(l))*l.quantity,0);
    const jin=lines.reduce((n,l)=>n+l.jin*l.quantity,0);
    const freight=subtotal>=1500?0:(body.recipients?.length>1?body.recipients.length:1)*120;
    const phone=body.phone;
    let user=await prisma.user.findUnique({where:{phone}}); if(!user)user=await prisma.user.create({data:{phone,name:body.name}});
    const order=await prisma.order.create({data:{code:`YL${Date.now().toString().slice(-8)}`,userId:user.id,customerName:body.name,phone,status:'待出貨',shipping:jin>8?'黑貓宅配':(body.shipping||'7-11 店到店'),total:subtotal+freight,freight,note:body.note,recipients:{create:body.recipients?.length?body.recipients:[{name:body.name,phone:body.phone,address:body.address,quantity:1,greeting:''}]},items:{create:lines.map(l=>({productId:l.productId,quantity:l.quantity,jin:l.jin,price:Math.round(priceOf(l))}))}}});
    const mock=!process.env.LINE_NOTIFY_TOKEN;
    if(!mock) await fetch('https://api.line.me/v2/bot/message/broadcast',{method:'POST',headers:{Authorization:`Bearer ${process.env.LINE_NOTIFY_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({messages:[{type:'text',text:`新訂單 ${order.code}，金額 NT$${order.total}`} ]})});
    return NextResponse.json({order,mock}, {status:201});
  }
  if(body.action==='login') { const user=await prisma.user.findUnique({where:{phone:body.phone}}); return NextResponse.json({ok:body.code==='1234',user}); }
  return NextResponse.json({error:'未知操作'}, {status:400});
}
