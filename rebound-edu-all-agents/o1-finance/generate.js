#!/usr/bin/env node
/**
 * O1 재무/회계 에이전트
 * 산출물: 월별 손익계산서, 세무 캘린더, 배당 시뮬레이션, 예산 대비 실적, 내부거래 명세서
 */
const fs=require("fs"),path=require("path");
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,Header,Footer,AlignmentType,LevelFormat,HeadingLevel,BorderStyle,WidthType,ShadingType,PageBreak}=require("docx");

const OUT=path.join(__dirname,"outputs"),DATA=path.join(__dirname,"data"),DR=path.join(OUT,"dataroom");
[OUT,DR].forEach(d=>{if(!fs.existsSync(d))fs.mkdirSync(d,{recursive:true});});
const f3=JSON.parse(fs.readFileSync(path.join(DATA,"f3_to_o1.json"),"utf8"));
const TODAY=new Date().toISOString().split("T")[0];
const OG="FF4500",BK="000000",DK="333333",MD="666666",GN="2E7D32",RD="C62828";
const border={style:BorderStyle.SINGLE,size:1,color:"CCCCCC"};
const borders={top:border,bottom:border,left:border,right:border};
const cm={top:80,bottom:80,left:120,right:120};
function fmt(n){return Math.round(n).toLocaleString();}
function h1(t){return new Paragraph({heading:HeadingLevel.HEADING_1,spacing:{before:400,after:200},children:[new TextRun({text:t,font:"Arial",size:32,bold:true,color:BK})]});}
function h2(t){return new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:300,after:150},children:[new TextRun({text:t,font:"Arial",size:26,bold:true,color:"0F6E56"})]});}
function h3(t){return new Paragraph({heading:HeadingLevel.HEADING_3,spacing:{before:200,after:100},children:[new TextRun({text:t,font:"Arial",size:22,bold:true,color:DK})]});}
function p(t,o={}){return new Paragraph({spacing:{after:100},children:[new TextRun({text:t,font:"Arial",size:20,color:o.color||DK,...o})]});}
function rp(r){return new Paragraph({spacing:{after:100},children:r.map(x=>new TextRun({font:"Arial",size:20,color:DK,...x}))});}
function sp(){return new Paragraph({spacing:{after:80},children:[]});}
function pb(){return new Paragraph({children:[new PageBreak()]});}
function div(){return new Paragraph({spacing:{before:200,after:200},border:{bottom:{style:BorderStyle.SINGLE,size:6,color:"0F6E56",space:1}},children:[]});}
function tbl(headers,rows,cw){
  const tw=cw.reduce((a,b)=>a+b,0);
  const hr=new TableRow({tableHeader:true,children:headers.map((h,i)=>new TableCell({borders,width:{size:cw[i],type:WidthType.DXA},shading:{fill:"2D2D2D",type:ShadingType.CLEAR},margins:cm,children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:"FFFFFF"})]})]}))});
  const dr=rows.map((row,ri)=>new TableRow({children:row.map((c,i)=>new TableCell({borders,width:{size:cw[i],type:WidthType.DXA},shading:{fill:ri%2===0?"FFFFFF":"F8F8F8",type:ShadingType.CLEAR},margins:cm,children:[new Paragraph({children:[new TextRun({text:String(c),font:"Arial",size:18,color:DK})]})]}))}));
  return new Table({width:{size:tw,type:WidthType.DXA},columnWidths:cw,rows:[hr,...dr]});
}

async function main(){
  console.log("\n\uD83D\uDCB0 O1 \uC7AC\uBB34/\uD68C\uACC4 \uC5D0\uC774\uC804\uD2B8 \u2014 \uBB38\uC11C \uC0DD\uC131\n");
  const cf=f3.cashflow_model;const bl=f3.budget_baseline;

  // ============================================================
  // 1. MONTHLY P&L TEMPLATE
  // ============================================================
  console.log("  [1/4] \uC6D4\uBCC4 \uC190\uC775\uACC4\uC0B0\uC11C \uD15C\uD50C\uB9BF...");
  const plChildren=[];
  plChildren.push(sp(),new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:[new TextRun({text:"\uC6D4\uBCC4 \uC190\uC775\uACC4\uC0B0\uC11C",font:"Arial",size:36,bold:true,color:BK})]}));
  plChildren.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:[new TextRun({text:"(\uC8FC)\uB9AC\uBC14\uC6B4\uB4DC\uC5D0\uB4C0 | "+TODAY+" \uAE30\uC900",font:"Arial",size:22,color:MD})]}));
  plChildren.push(div());

  // 12-month P&L from cashflow model
  plChildren.push(h2("12\uAC1C\uC6D4 \uC190\uC775 \uCD94\uC774 (\uAE30\uBCF8 \uC2DC\uB098\uB9AC\uC624)"));
  const months=cf.months;
  plChildren.push(tbl(
    ["\uC6D4","\uB9E4\uCD9C","\uBE44\uC6A9","\uC21C\uC774\uC775","\uB204\uC801\uC794\uC561"],
    months.map(m=>[
      `M${m.month}`,
      fmt(m.revenue)+"\uC6D0",
      fmt(m.operating_cost)+"\uC6D0",
      (m.net_cashflow>=0?"+":"")+fmt(m.net_cashflow)+"\uC6D0",
      fmt(m.closing_balance)+"\uC6D0"
    ]),
    [1000,2200,2200,2200,1760]
  ));
  plChildren.push(sp());

  // Summary
  const totalRev=months.reduce((a,m)=>a+m.revenue,0);
  const totalCost=months.reduce((a,m)=>a+m.operating_cost,0);
  const totalGrant=months.reduce((a,m)=>a+m.government_grant,0);
  plChildren.push(h3("Year 1 \uC694\uC57D"));
  plChildren.push(tbl(["\uD56D\uBAA9","\uAE08\uC561","\uBE44\uACE0"],[
    ["\uCD1D \uB9E4\uCD9C",fmt(totalRev)+"\uC6D0","B2C \uC218\uAC15\uB8CC"],
    ["\uC815\uBD80\uC9C0\uC6D0\uAE08",fmt(totalGrant)+"\uC6D0","M4 \uC218\uB839 \uC608\uC0C1"],
    ["\uCD1D \uBE44\uC6A9",fmt(totalCost)+"\uC6D0","\uC778\uAC74\uBE44+\uD50C\uB7AB\uD3FC+\uB9C8\uCF00\uD305+\uAE30\uD0C0"],
    ["\uC601\uC5C5\uC774\uC775",fmt(totalRev-totalCost)+"\uC6D0",totalRev-totalCost>=0?"\uD751\uC790":"\uC801\uC790"],
    ["\uAE30\uB9D0 \uD604\uAE08",fmt(months[11].closing_balance)+"\uC6D0",""],
  ],[3000,3400,2960]));

  plChildren.push(pb());

  // Budget vs Actual template
  plChildren.push(h2("\uC608\uC0B0 \uB300\uBE44 \uC2E4\uC801 \uCD94\uC801 \uD15C\uD50C\uB9BF"));
  plChildren.push(p("\uB9E4\uC6D4 5\uC77C\uAE4C\uC9C0 \uC804\uC6D4 \uC2E4\uC801\uC744 \uC785\uB825\uD558\uBA74 F2 \uC7AC\uBB34\uCD94\uC815 \uB300\uBE44 \uCC28\uC774\uB97C \uC790\uB3D9 \uC0B0\uCD9C\uD569\uB2C8\uB2E4."));
  plChildren.push(tbl(
    ["\uD56D\uBAA9","\uACC4\uD68D (F2)","\uC2E4\uC801","\uCC28\uC774","\uCC28\uC774\uC728"],
    [
      ["\uB9E4\uCD9C",fmt(bl.monthly_cost_target*0.46)+"\uC6D0","[\uC785\uB825]","[\uC790\uB3D9]","[\uC790\uB3D9]"],
      ["\uBE44\uC6A9",fmt(bl.monthly_cost_target)+"\uC6D0","[\uC785\uB825]","[\uC790\uB3D9]","[\uC790\uB3D9]"],
      ["\uC601\uC5C5\uC774\uC775","[\uC790\uB3D9]","[\uC790\uB3D9]","[\uC790\uB3D9]","[\uC790\uB3D9]"],
    ],
    [2000,2200,2200,1600,1360]
  ));

  const plDoc=new Document({
    styles:{default:{document:{run:{font:"Arial",size:20}}},paragraphStyles:[
      {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:32,bold:true,font:"Arial"},paragraph:{spacing:{before:400,after:200},outlineLevel:0}},
      {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:26,bold:true,font:"Arial"},paragraph:{spacing:{before:300,after:150},outlineLevel:1}},
      {id:"Heading3",name:"Heading 3",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:22,bold:true,font:"Arial"},paragraph:{spacing:{before:200,after:100},outlineLevel:2}},
    ]},
    sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:1440,right:1440,bottom:1440,left:1440}}},
    headers:{default:new Header({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:"REBOUND-EDU  |  ",font:"Arial",size:14,color:"0F6E56",bold:true}),new TextRun({text:"\uC6D4\uBCC4 \uC190\uC775\uACC4\uC0B0\uC11C",font:"Arial",size:14,color:MD})]})]})},
    children:plChildren}],
  });
  const plBuf=await Packer.toBuffer(plDoc);
  fs.writeFileSync(path.join(OUT,"01_\uC6D4\uBCC4_\uC190\uC775\uACC4\uC0B0\uC11C.docx"),plBuf);

  // ============================================================
  // 2. TAX CALENDAR
  // ============================================================
  console.log("  [2/4] \uC138\uBB34 \uCE98\uB9B0\uB354...");
  const taxMd=`# \uC138\uBB34 \uCE98\uB9B0\uB354 \u2014 (\uC8FC)\uB9AC\uBC14\uC6B4\uB4DC\uC5D0\uB4C0\n\n> \uC0DD\uC131\uC77C: ${TODAY} | \u26A0\uFE0F \uC138\uBB34\uC0AC \uD655\uC778 \uD544\uC218\n\n## \uC6D4\uBCC4 \uC138\uBB34 \uC77C\uC815\n\n| \uC6D4 | \uC138\uBB34 \uC77C\uC815 | \uB0A9\uBD80\uAE30\uD55C | \uC900\uBE44 \uC2DC\uC791 (D-14) | \uBE44\uACE0 |\n|---|---------|---------|-------------|------|\n| 1\uC6D4 | \uBD80\uAC00\uC138 \uD655\uC815\uC2E0\uACE0 (2\uAE30) | 1/25 | 1/11 | 7~12\uC6D4 \uB9E4\uCD9C/\uB9E4\uC785 |\n| 2\uC6D4 | \uC6D0\uCC9C\uC138 \uC2E0\uACE0 | \uB9E4\uC6D4 10\uC77C | \uC804\uC6D4 25\uC77C | \uAE09\uC5EC/\uAC15\uC0AC\uB8CC \uC6D0\uCC9C\uC9D5\uC218 |\n| 3\uC6D4 | \uBC95\uC778\uC138 \uC2E0\uACE0 | 3/31 | 3/17 | \uC804\uB144\uB3C4 \uACB0\uC0B0 \uAE30\uC900 |\n| 4\uC6D4 | \uBC95\uC778 \uC9C0\uBC29\uC18C\uB4DD\uC138 | 4/30 | 4/16 | \uBC95\uC778\uC138\uC758 10% |\n| 7\uC6D4 | \uBD80\uAC00\uC138 \uD655\uC815\uC2E0\uACE0 (1\uAE30) | 7/25 | 7/11 | 1~6\uC6D4 \uB9E4\uCD9C/\uB9E4\uC785 |\n| 8\uC6D4 | \uBC95\uC778\uC138 \uC911\uAC04\uC608\uB0A9 | 8/31 | 8/17 | \uC804\uB144 \uBC95\uC778\uC138\uC758 50% |\n\n## \uC6D4 \uBC18\uBCF5 \uC138\uBB34\n\n| \uC8FC\uAE30 | \uD56D\uBAA9 | \uB0A9\uBD80\uAE30\uD55C | \uC790\uB3D9\uD654 \uC0C1\uD0DC |\n|------|------|---------|----------|\n| \uB9E4\uC6D4 | \uC6D0\uCC9C\uC138 (\uAE09\uC5EC) | 10\uC77C | O2 HR\uC5D0\uC11C \uAE09\uC5EC \uB370\uC774\uD130 \uC218\uC2E0 \u2192 \uC790\uB3D9 \uC0B0\uCD9C |\n| \uB9E4\uC6D4 | \uC6D0\uCC9C\uC138 (\uAC15\uC0AC\uB8CC 3.3%) | 10\uC77C | O2\uC5D0\uC11C \uAC15\uC0AC \uC815\uC0B0 \uB370\uC774\uD130 \uC218\uC2E0 |\n| \uB9E4\uC6D4 | 4\uB300\uBCF4\uD5D8 \uB0A9\uBD80 | 10\uC77C | O2 HR\uC5D0\uC11C \uBCF4\uD5D8\uB8CC \uB370\uC774\uD130 \uC218\uC2E0 |\n| \uBD84\uAE30 | \uBD80\uAC00\uC138 \uC608\uC815\uC2E0\uACE0 | 4/25, 10/25 | PG\uC0AC \uB370\uC774\uD130 \uAE30\uBC18 \uC790\uB3D9 \uC0B0\uCD9C |\n\n## \uBC30\uB2F9 \uC2DC\uBBAC\uB808\uC774\uC158 (70/30 \uAD6C\uC870)\n\n| \uC2DC\uB098\uB9AC\uC624 | Year 1 \uC601\uC5C5\uC774\uC775 | 30% \uBC30\uB2F9\uC7AC\uC6D0 | \uC8FC\uC8FC\uB2F9 \uBC30\uB2F9\uAE08 | \uBE44\uACE0 |\n|---------|-------------|------------|------------|------|\n| \uBCF4\uC218\uC801 | ${fmt(totalRev*0.7-totalCost)}\uC6D0 | - | - | \uC801\uC790 \u2192 \uBC30\uB2F9 \uBD88\uAC00 |\n| \uAE30\uBCF8 | ${fmt(totalRev-totalCost)}\uC6D0 | - | - | \uC801\uC790 \u2192 \uBC30\uB2F9 \uBD88\uAC00 |\n| \uB099\uAD00 | ${fmt(totalRev*1.5-totalCost)}\uC6D0 | ${fmt(Math.max(0,(totalRev*1.5-totalCost)*0.3))}\uC6D0 | ${fmt(Math.max(0,(totalRev*1.5-totalCost)*0.3/3))}\uC6D0 | SHA \uC870\uD56D: \uCD08\uAE30 3\uB144 \uBC30\uB2F9 \uC720\uBCF4 \uAC00\uB2A5 |\n\n> SHA \uC81C6\uC870\uC5D0 \uB530\uB77C \uCD5C\uCD08 3\uAC1C \uC0AC\uC5C5\uC5F0\uB3C4\uAE4C\uC9C0\uB294 \uC0AC\uC5C5 \uC548\uC815\uD654\uB97C \uC704\uD574 \uBC30\uB2F9\uC744 \uC720\uBCF4\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4 (\uC8FC\uC8FC \uC804\uC6D0 \uB3D9\uC758 \uD544\uC694).\n`;
  fs.writeFileSync(path.join(OUT,"02_\uC138\uBB34_\uCE98\uB9B0\uB354.md"),taxMd,"utf8");

  // ============================================================
  // 3. INTERNAL TRANSACTION TEMPLATE
  // ============================================================
  console.log("  [3/4] \uB0B4\uBD80\uAC70\uB798 \uBA85\uC138\uC11C \uD15C\uD50C\uB9BF...");
  const itMd=`# \uB0B4\uBD80\uAC70\uB798 \uBA85\uC138\uC11C \u2014 \uB9AC\uBC14\uC6B4\uB4DC \uADF8\uB8F9\n\n> \uC0DD\uC131\uC77C: ${TODAY} | \uC815\uC0C1\uAC70\uB798(Arm's Length) \uC6D0\uCE59 \uC900\uC218 \uD544\uC218\n\n## \uADF8\uB8F9 \uB0B4\uBD80\uAC70\uB798 \uAD6C\uC870\n\n| \uAC70\uB798 \uC720\uD615 | \uC11C\uBE44\uC2A4 \uC81C\uACF5\uC790 | \uC11C\uBE44\uC2A4 \uC218\uB839\uC790 | \uAC00\uACA9 \uAE30\uC900 | \uC6D4 \uCD94\uC815\uC561 |\n|---------|---------|---------|---------|--------|\n| \uC6B4\uC601 \uB178\uD558\uC6B0 \uB77C\uC774\uC120\uC2A4 | (\uC8FC)\uB9AC\uBC14\uC6B4\uB4DC | (\uC8FC)\uB9AC\uBC14\uC6B4\uB4DC\uC5D0\uB4C0 | \uC6D4 \uC815\uC561 | 50\uB9CC\uC6D0 |\n| PM \uCEE8\uC124\uD305 \uCD94\uCC9C \uC218\uC218\uB8CC | (\uC8FC)\uB9AC\uBC14\uC6B4\uB4DC\uC5D0\uB4C0 | (\uC8FC)\uBD80\uB3D9\uCC2C | \uACC4\uC57D\uAC74\uB2F9 10% | \uBCC0\uB3D9 |\n| \uC911\uAC1C \uB9E4\uBB3C\uB9E4\uCE6D \uC218\uC218\uB8CC | (\uC8FC)\uB9AC\uBC14\uC6B4\uB4DC\uC5D0\uB4C0 | (\uC8FC)\uB9AC\uBC14\uC6B4\uB4DC\uC911\uAC1C | \uAC74\uB2F9 \uC815\uC561 | 30\uB9CC\uC6D0 |\n| \uC0AC\uBB34\uACF5\uAC04 \uC784\uCC28 | (\uC8FC)\uB9AC\uBC14\uC6B4\uB4DC | (\uC8FC)\uB9AC\uBC14\uC6B4\uB4DC\uC5D0\uB4C0 | \uC2DC\uC138 \uAE30\uC900 | 100\uB9CC\uC6D0 |\n| \uAC15\uC0AC \uD30C\uACAC | (\uC8FC)\uB9AC\uBC14\uC6B4\uB4DC\uC911\uAC1C | (\uC8FC)\uB9AC\uBC14\uC6B4\uB4DC\uC5D0\uB4C0 | \uAC74\uB2F9 \uC815\uC561 | 20\uB9CC\uC6D0 |\n\n## \uC6D4\uBCC4 \uC815\uC0B0 \uD15C\uD50C\uB9BF\n\n| \uC6D4 | \uAC70\uB798 \uC720\uD615 | \uACF5\uAE09\uC790 | \uC218\uB839\uC790 | \uAE08\uC561 | \uC138\uAE08\uACC4\uC0B0\uC11C | \uBE44\uACE0 |\n|---|---------|------|------|------|---------|------|\n| [\uC6D4] | [\uC720\uD615] | [\uBC95\uC778\uBA85] | [\uBC95\uC778\uBA85] | [\uAE08\uC561] | [\uBC1C\uD589\uC5EC\uBD80] | [\uBE44\uACE0] |\n\n## \u26A0\uFE0F \uC774\uC804\uAC00\uACA9 \uC8FC\uC758\uC0AC\uD56D\n\n1. \uBAA8\uB4E0 \uB0B4\uBD80\uAC70\uB798\uB294 **\uC815\uC0C1\uAC70\uB798 \uC6D0\uCE59**\uC744 \uC900\uC218\uD574\uC57C \uD569\uB2C8\uB2E4\n2. \uC2DC\uC138 \uB300\uBE44 \uD604\uC800\uD788 \uB0AE\uAC70\uB098 \uB192\uC740 \uAC00\uACA9\uC740 \uC138\uBB34 \uB9AC\uC2A4\uD06C\n3. \uBD84\uAE30 1\uD68C O3 \uBC95\uBB34 \uC5D0\uC774\uC804\uD2B8\uC640 \uAD50\uCC28 \uAC80\uC99D\n4. \uBAA8\uB4E0 \uAC70\uB798\uC5D0 \uC138\uAE08\uACC4\uC0B0\uC11C \uBC1C\uD589 \uD544\uC218\n5. \uC5F0\uAC04 \uB0B4\uBD80\uAC70\uB798 \uBCF4\uACE0\uC11C \uC791\uC131 (\uBC95\uC778\uC138 \uC2E0\uACE0 \uC2DC \uCCA8\uBD80)\n`;
  fs.writeFileSync(path.join(OUT,"03_\uB0B4\uBD80\uAC70\uB798_\uBA85\uC138\uC11C.md"),itMd,"utf8");

  // ============================================================
  // 4. O1 HANDOFF DATA
  // ============================================================
  console.log("  [4/4] \uC5F0\uACC4 \uB370\uC774\uD130 \uC0DD\uC131...");
  const o1_data={
    _meta:{source:"O1_\uC7AC\uBB34\uD68C\uACC4",generated:TODAY},
    monthly_budget:bl.monthly_cost_target,
    bootstrap_budget:bl.bootstrap_monthly_cost,
    tax_calendar:[
      {month:1,event:"\uBD80\uAC00\uC138 2\uAE30 \uD655\uC815\uC2E0\uACE0",deadline:"1/25"},
      {month:3,event:"\uBC95\uC778\uC138 \uC2E0\uACE0",deadline:"3/31"},
      {month:7,event:"\uBD80\uAC00\uC138 1\uAE30 \uD655\uC815\uC2E0\uACE0",deadline:"7/25"},
      {month:8,event:"\uBC95\uC778\uC138 \uC911\uAC04\uC608\uB0A9",deadline:"8/31"},
    ],
    internal_transactions:["운영노하우 라이선스","PM추천 수수료","중개매칭 수수료","사무공간 임차","강사 파견"],
    revenue_split:{reinvest:70,dividend:30},
  };
  fs.writeFileSync(path.join(DATA,"o1_status.json"),JSON.stringify(o1_data,null,2),"utf8");

  // Results
  const results=["01_\uC6D4\uBCC4_\uC190\uC775\uACC4\uC0B0\uC11C.docx","02_\uC138\uBB34_\uCE98\uB9B0\uB354.md","03_\uB0B4\uBD80\uAC70\uB798_\uBA85\uC138\uC11C.md","o1_status.json"];
  console.log("\n\u2705 O1 \uC0DD\uC131 \uC644\uB8CC!");
  results.forEach((f,i)=>console.log(`  ${i+1}. ${f}`));
}
main().catch(e=>{console.error("\u274C",e);process.exit(1);});
