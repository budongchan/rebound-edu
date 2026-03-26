#!/usr/bin/env node
/**
 * F4 MVP/플랫폼 구축 에이전트 — Phase 1 최종 에이전트
 * 
 * 산출물:
 * 1. 플랫폼 비교 분석 + 기술 스택 결정서 (DOCX)
 * 2. 커리큘럼 구조 설계서 (Markdown)
 * 3. 결제 연동 가이드 (Markdown)
 * 4. MVP 런칭 D-30 체크리스트 (Markdown)
 * 5. 랜딩페이지 (HTML)
 * 6. Phase 2 전달 데이터 (JSON)
 */
const fs=require("fs"),path=require("path");
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,Header,Footer,AlignmentType,LevelFormat,HeadingLevel,BorderStyle,WidthType,ShadingType,PageBreak}=require("docx");

const OUT=path.join(__dirname,"outputs"),DATA=path.join(__dirname,"data"),DR=path.join(OUT,"dataroom","technical");
[OUT,DR].forEach(d=>{if(!fs.existsSync(d))fs.mkdirSync(d,{recursive:true});});

const f1=JSON.parse(fs.readFileSync(path.join(DATA,"f1_to_f4.json"),"utf8"));
const f3=JSON.parse(fs.readFileSync(path.join(DATA,"f3_to_f4.json"),"utf8"));
const pd=JSON.parse(fs.readFileSync(path.join(DATA,"platform_data.json"),"utf8"));
const TODAY=new Date().toISOString().split("T")[0];

const OG="FF4500",BK="000000",DK="333333",MD="666666",GN="2E7D32";
const border={style:BorderStyle.SINGLE,size:1,color:"CCCCCC"};
const borders={top:border,bottom:border,left:border,right:border};
const cm={top:80,bottom:80,left:120,right:120};
const DISC="\u26A0\uFE0F AI \uC0DD\uC131 \uCD08\uC548. \uD50C\uB7AB\uD3FC \uC120\uD0DD\uC740 \uC2E4\uC81C \uD14C\uC2A4\uD2B8 \uD6C4 \uCD5C\uC885 \uACB0\uC815\uD558\uC2DC\uAE30 \uBC14\uB78D\uB2C8\uB2E4.";
function fmt(n){return Math.round(n).toLocaleString();}

function h1(t){return new Paragraph({heading:HeadingLevel.HEADING_1,spacing:{before:400,after:200},children:[new TextRun({text:t,font:"Arial",size:32,bold:true,color:BK})]});}
function h2(t){return new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:300,after:150},children:[new TextRun({text:t,font:"Arial",size:26,bold:true,color:OG})]});}
function h3(t){return new Paragraph({heading:HeadingLevel.HEADING_3,spacing:{before:200,after:100},children:[new TextRun({text:t,font:"Arial",size:22,bold:true,color:DK})]});}
function p(t,o={}){return new Paragraph({spacing:{after:100},children:[new TextRun({text:t,font:"Arial",size:20,color:o.color||DK,...o})]});}
function rp(r){return new Paragraph({spacing:{after:100},children:r.map(x=>new TextRun({font:"Arial",size:20,color:DK,...x}))});}
function bl(t){return new Paragraph({numbering:{reference:"bullets",level:0},spacing:{after:60},children:[new TextRun({text:t,font:"Arial",size:20,color:DK})]});}
function rbl(r){return new Paragraph({numbering:{reference:"bullets",level:0},spacing:{after:60},children:r.map(x=>new TextRun({font:"Arial",size:20,color:DK,...x}))});}
function sp(){return new Paragraph({spacing:{after:80},children:[]});}
function pb(){return new Paragraph({children:[new PageBreak()]});}
function div(){return new Paragraph({spacing:{before:200,after:200},border:{bottom:{style:BorderStyle.SINGLE,size:6,color:OG,space:1}},children:[]});}
function disc(){return new Paragraph({spacing:{before:160,after:160},shading:{fill:"FFF3E0",type:ShadingType.CLEAR},border:{left:{style:BorderStyle.SINGLE,size:12,color:OG,space:8}},indent:{left:240,right:240},children:[new TextRun({text:DISC,font:"Arial",size:16,color:"BF360C",italic:true})]});}
function tbl(headers,rows,cw){
  const tw=cw.reduce((a,b)=>a+b,0);
  const hr=new TableRow({tableHeader:true,children:headers.map((h,i)=>new TableCell({borders,width:{size:cw[i],type:WidthType.DXA},shading:{fill:"2D2D2D",type:ShadingType.CLEAR},margins:cm,children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:"FFFFFF"})]})]}))});
  const dr=rows.map((row,ri)=>new TableRow({children:row.map((c,i)=>new TableCell({borders,width:{size:cw[i],type:WidthType.DXA},shading:{fill:ri%2===0?"FFFFFF":"F8F8F8",type:ShadingType.CLEAR},margins:cm,children:[new Paragraph({children:[new TextRun({text:String(c),font:"Arial",size:18,color:DK})]})]}))}));
  return new Table({width:{size:tw,type:WidthType.DXA},columnWidths:cw,rows:[hr,...dr]});
}

// ============================================================
// 1. PLATFORM COMPARISON + TECH STACK DECISION (DOCX)
// ============================================================
async function generatePlatformDecision(){
  console.log("  [1/6] \uD50C\uB7AB\uD3FC \uBE44\uAD50 + \uAE30\uC220\uC2A4\uD0DD \uACB0\uC815\uC11C \uC0DD\uC131 \uC911...");
  const rec=pd.recommendation;const children=[];
  children.push(sp(),sp());
  children.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:60},children:[new TextRun({text:"\uAD50\uC721 \uD50C\uB7AB\uD3FC \uAE30\uC220\uC2A4\uD0DD \uACB0\uC815\uC11C",font:"Arial",size:36,bold:true,color:BK})]}));
  children.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:[new TextRun({text:f1.company_name+" | "+TODAY,font:"Arial",size:22,color:OG})]}));
  children.push(disc());children.push(sp());

  // Context
  children.push(h2("\uC608\uC0B0 \uC81C\uC57D \uC870\uAC74 (F3\uC5D0\uC11C \uC804\uB2EC)"));
  children.push(tbl(["\uD56D\uBAA9","\uAC12"],[
    ["\uCD1D \uAC00\uC6A9 \uC608\uC0B0",fmt(f3.total_available_budget)+"\uC6D0"],
    ["\uD50C\uB7AB\uD3FC \uC6D4 \uC608\uC0B0 \uAD8C\uC7A5",f3.platform_budget_constraint],
    ["\uBD80\uD2B8\uC2A4\uD2B8\uB7A9 \uBAA8\uB4DC",f3.bootstrap_mode_available?"\uAC00\uB2A5 \u2714":""],
    ["\uCD94\uCC9C\uC0AC\uD56D",f3.recommendation],
  ],[3000,6360]));children.push(sp());

  // Comparison matrix
  children.push(h2("\uD50C\uB7AB\uD3FC \uBE44\uAD50 \uBD84\uC11D"));
  children.push(tbl(
    ["\uD50C\uB7AB\uD3FC","\uC720\uD615","\uC6D4 \uBE44\uC6A9","\uD55C\uAD6D \uACB0\uC81C","\uC801\uD569\uB3C4","\uCD94\uCC9C"],
    pd.platforms.map(pl=>[
      pl.name,pl.type,
      pl.monthly_cost_krw.free!==undefined?fmt(pl.monthly_cost_krw.free)+"~"+fmt(pl.monthly_cost_krw.pro||pl.monthly_cost_krw.basic||0)+"\uC6D0":fmt(pl.monthly_cost_krw.basic)+"\uC6D0~",
      pl.features.payment_kr?"\u2705 \uC9C0\uC6D0":"\u274C \uBBF8\uC9C0\uC6D0",
      pl.fit_score+"/100",
      pl.fit_score>=80?"\u2B50 \uCD5C\uC6B0\uC120":pl.fit_score>=50?"\uACE0\uB824":"\uBE44\uCD94\uCC9C",
    ]),
    [1800,1400,1800,1400,1000,1200]
  ));children.push(sp());

  // Detail per platform
  pd.platforms.forEach(pl=>{
    children.push(h3(`${pl.name} (${pl.fit_score}/100)`));
    children.push(rp([{text:"\uC7A5\uC810: ",bold:true},{text:pl.pros.join(", ")}]));
    children.push(rp([{text:"\uB2E8\uC810: ",bold:true},{text:pl.cons.join(", ")}]));
    children.push(rp([{text:"\uD55C\uAD6D \uACB0\uC81C: ",bold:true},{text:pl.kr_payment}]));
    children.push(rp([{text:"\uCD5C\uC801 \uC0AC\uC6A9 \uC2DC\uC810: ",bold:true},{text:pl.best_for}]));
    children.push(sp());
  });

  children.push(pb());

  // DECISION
  children.push(h1("\uCD5C\uC885 \uACB0\uC815: "+rec.phase1.platform));
  children.push(div());
  children.push(new Paragraph({spacing:{before:100,after:200},shading:{fill:"E8F5E9",type:ShadingType.CLEAR},border:{left:{style:BorderStyle.SINGLE,size:12,color:GN,space:8}},indent:{left:240,right:240},children:[new TextRun({text:rec.phase1.reason,font:"Arial",size:20,color:"1B5E20",bold:true})]}));
  children.push(sp());

  children.push(h2("\uAE30\uC220 \uC2A4\uD0DD \uC0C1\uC138"));
  const st=rec.phase1.stack;
  children.push(tbl(["\uAD6C\uC131\uC694\uC18C","\uC120\uC815 \uB3C4\uAD6C","\uC6D4 \uBE44\uC6A9"],[
    ["\uB79C\uB529\uD398\uC774\uC9C0",st.landing,"\uBB34\uB8CC"],
    ["\uACB0\uC81C \uC2DC\uC2A4\uD15C",st.payment,"PG \uC218\uC218\uB8CC\uB9CC (3.2%)"],
    ["\uC601\uC0C1 \uD638\uC2A4\uD305",st.video,"\uBB34\uB8CC~$20/\uC6D4"],
    ["\uB77C\uC774\uBE0C \uAC15\uC758",st.live,"$13/\uC6D4"],
    ["LMS (\uC218\uAC15\uC0DD \uAD00\uB9AC)",st.lms,"\uBB34\uB8CC~$10/\uC6D4"],
    ["\uCEE4\uBBA4\uB2C8\uD2F0",st.community,"\uBB34\uB8CC"],
    ["\uC774\uBA54\uC77C \uB9C8\uCF00\uD305",st.email,"\uBB34\uB8CC (500\uBA85\uAE4C\uC9C0)"],
    ["\uBD84\uC11D",st.analytics,"\uBB34\uB8CC"],
  ],[2800,4400,2160]));
  children.push(sp());
  children.push(rp([{text:"\uCD1D \uC6D4 \uBE44\uC6A9: ",bold:true},{text:`\uC57D ${fmt(rec.phase1.total_monthly_cost)}\uC6D0 (\uBD80\uD2B8\uC2A4\uD2B8\uB7A9 \uBAA8\uB4DC)`,color:GN,bold:true}]));
  children.push(sp());

  children.push(h2("\uD50C\uB7AB\uD3FC \uC804\uD658 \uD2B8\uB9AC\uAC70"));
  children.push(rp([{text:"\uC804\uD658 \uC2DC\uC810: ",bold:true},{text:rec.phase2_trigger}]));
  children.push(rp([{text:"Phase 2 \uD50C\uB7AB\uD3FC: ",bold:true},{text:rec.phase2.platform}]));
  children.push(rp([{text:"\uC774\uC720: ",bold:true},{text:rec.phase2.reason}]));

  children.push(pb());

  // PG Comparison
  children.push(h1("PG\uC0AC \uBE44\uAD50 \uBC0F \uACB0\uC81C \uC5F0\uB3D9"));
  children.push(div());
  children.push(tbl(["PG\uC0AC","\uCE74\uB4DC \uC218\uC218\uB8CC","\uAC00\uC0C1\uACC4\uC88C","\uC138\uAE08\uACC4\uC0B0\uC11C","\uC2EC\uC0AC\uAE30\uAC04","\uCD94\uCC9C"],
    pd.pg_comparison.map(pg=>[pg.name,pg.fee_card_pct+"%",fmt(pg.fee_virtual_account_krw)+"\uC6D0/\uAC74",pg.tax_invoice?"\u2705":"\u274C",pg.approval_days,pg.recommendation]),
    [1600,1400,1400,1200,1400,1360]
  ));
  children.push(sp());
  children.push(rp([{text:"\uCD5C\uC885 \uACB0\uC815: ",bold:true},{text:"\uD3EC\uD2B8\uC6D0\uC73C\uB85C \uC5F0\uB3D9 \u2192 \uD1A0\uC2A4\uD398\uC774\uBA3C\uCE20\uB97C \uAE30\uBCF8 PG\uB85C \uC124\uC815. \uD5A5\uD6C4 PG \uBCC0\uACBD \uC2DC \uD3EC\uD2B8\uC6D0 \uC124\uC815\uB9CC \uBCC0\uACBD\uD558\uBA74 \uB428.",color:GN}]));

  const doc=new Document({
    styles:{default:{document:{run:{font:"Arial",size:20}}},paragraphStyles:[
      {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:32,bold:true,font:"Arial"},paragraph:{spacing:{before:400,after:200},outlineLevel:0}},
      {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:26,bold:true,font:"Arial"},paragraph:{spacing:{before:300,after:150},outlineLevel:1}},
      {id:"Heading3",name:"Heading 3",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:22,bold:true,font:"Arial"},paragraph:{spacing:{before:200,after:100},outlineLevel:2}},
    ]},
    numbering:{config:[{reference:"bullets",levels:[{level:0,format:LevelFormat.BULLET,text:"\u2022",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:360}}}}]}]},
    sections:[{
      properties:{page:{size:{width:12240,height:15840},margin:{top:1440,right:1440,bottom:1440,left:1440}}},
      headers:{default:new Header({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:"REBOUND-EDU  |  ",font:"Arial",size:14,color:OG,bold:true}),new TextRun({text:"\uAE30\uC220\uC2A4\uD0DD \uACB0\uC815\uC11C",font:"Arial",size:14,color:MD})]})]})},
      footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:DISC,font:"Arial",size:10,color:MD})]})]})},
      children,
    }],
  });
  const buf=await Packer.toBuffer(doc);
  const fp=path.join(OUT,"01_\uAE30\uC220\uC2A4\uD0DD_\uACB0\uC815\uC11C.docx");
  fs.writeFileSync(fp,buf);fs.copyFileSync(fp,path.join(DR,"01_\uAE30\uC220\uC2A4\uD0DD_\uACB0\uC815\uC11C.docx"));
  return fp;
}

// ============================================================
// 2. CURRICULUM DESIGN (Markdown)
// ============================================================
function generateCurriculum(){
  console.log("  [2/6] \uCEE4\uB9AC\uD050\uB7FC \uAD6C\uC870 \uC124\uACC4\uC11C \uC0DD\uC131 \uC911...");
  const courses=pd.curriculum.launch_courses;
  let md=`# \uCEE4\uB9AC\uD050\uB7FC \uAD6C\uC870 \uC124\uACC4\uC11C \u2014 ${f1.company_name}\n\n> \uC0DD\uC131\uC77C: ${TODAY}\n\n---\n\n`;
  md+=`## \uB7F0\uCE6D \uCF54\uC2A4 \uB77C\uC778\uC5C5 (${courses.length}\uAC1C)\n\n`;
  md+=`| \uC6B0\uC120\uC21C\uC704 | \uCF54\uC2A4\uBA85 | \uD2F0\uC5B4 | \uAC00\uACA9 | \uD615\uC2DD | \uC900\uBE44 \uC0C1\uD0DC |\n|---------|--------|------|------|------|----------|\n`;
  courses.sort((a,b)=>a.launch_priority-b.launch_priority).forEach(c=>{
    md+=`| P${c.launch_priority} | ${c.category} | ${c.tier} | ${c.price===0?"\uBB34\uB8CC":fmt(c.price)+"\uC6D0"} | ${c.format} | ${c.ready?"\u2705 \uC900\uBE44\uC644\uB8CC":"\uD83D\uDD04 \uC900\uBE44\uC911"} |\n`;
  });
  md+=`\n---\n\n## \uCF54\uC2A4 \uC0C1\uC138\n\n`;
  courses.forEach(c=>{
    md+=`### ${c.id}. ${c.category} [${c.tier}] \u2014 ${c.price===0?"\uBB34\uB8CC":fmt(c.price)+"\uC6D0"}\n\n`;
    md+=`- **\uD615\uC2DD**: ${c.format}\n- **\uB0B4\uC6A9**: ${c.content}\n- **\uBE44\uACE0**: ${c.note}\n- **\uC900\uBE44 \uC0C1\uD0DC**: ${c.ready?"\u2705 \uC989\uC2DC \uB7F0\uCE6D \uAC00\uB2A5":"\uD83D\uDD04 \uCF58\uD150\uCE20 \uC81C\uC791 \uD544\uC694"}\n\n`;
  });
  md+=`---\n\n## \uB7F0\uCE6D \uC804\uB7B5\n\n`;
  md+=`### Week 1~2: \uBB34\uB8CC \uCF58\uD150\uCE20 \uBC30\uD3EC (C05)\n- \uBD80\uB3D9\uCC2CTV\uC5D0 \uBB34\uB8CC \uAC00\uC774\uB4DC PDF + \uB9DB\uBCF4\uAE30 \uC601\uC0C1\n- \uB9AC\uB4DC \uC218\uC9D1 \uBAA9\uD45C: 500\uBA85\n\n### Week 3~4: \uCCA3 \uC720\uB8CC \uAC15\uC758 (C01)\n- \uC2A4\uD130\uB514\uCE74\uD398 \uCC3D\uC5C5 Zoom \uB77C\uC774\uBE0C 3\uC2DC\uAC04 (99,000\uC6D0)\n- \uAE30\uC874 75\uC2AC\uB77C\uC774\uB4DC \uD65C\uC6A9 \u2192 \uCD94\uAC00 \uC81C\uC791\uBE44 0\uC6D0\n- \uBAA9\uD45C: \uCCA3 \uB2EC 20\uBA85 \uACB0\uC81C\n\n### Month 2~3: \uC2EC\uD654 \uACFC\uC815 \uCD94\uAC00 (C02, C04)\n- \uD638\uC2A4\uD154 \uCC3D\uC5C5 \uD480\uC0AC\uC774\uD074 (499,000\uC6D0)\n- \uBD80\uB3D9\uC0B0 \uBC95\uC778 \uD22C\uC790 \uC785\uBB38 (149,000\uC6D0)\n\n### Month 4~5: \uD504\uB9AC\uBBF8\uC5C4 \uB7F0\uCE6D (C03)\n- \uBC14\uC774\uBE0C\uCF54\uB529 \uCE60 1\uBC15 2\uC77C (1,500,000\uC6D0)\n- \uCCA3 \uD68C\uCC28 8~12\uBA85 \uBAA8\uC9D1\n`;
  const fp=path.join(OUT,"02_\uCEE4\uB9AC\uD050\uB7FC_\uC124\uACC4\uC11C.md");
  fs.writeFileSync(fp,md,"utf8");return fp;
}

// ============================================================
// 3. PAYMENT INTEGRATION GUIDE (Markdown)
// ============================================================
function generatePaymentGuide(){
  console.log("  [3/6] \uACB0\uC81C \uC5F0\uB3D9 \uAC00\uC774\uB4DC \uC0DD\uC131 \uC911...");
  const md=`# \uACB0\uC81C \uC5F0\uB3D9 \uAC00\uC774\uB4DC \u2014 ${f1.company_name}\n\n> \uC0DD\uC131\uC77C: ${TODAY}\n\n---\n\n## \uC120\uC815 \uACB0\uACFC: \uD3EC\uD2B8\uC6D0 + \uD1A0\uC2A4\uD398\uC774\uBA3C\uCE20\n\n## Step 1: \uC0AC\uC804 \uC900\uBE44 (D-14)\n- [ ] \uC0AC\uC5C5\uC790\uB4F1\uC99D \uC900\uBE44 (\uD1B5\uC2E0\uD310\uB9E4\uC5C5 \uC2E0\uACE0 \uD3EC\uD568)\n- [ ] \uBC95\uC778 \uD1B5\uC7A5 \uACC4\uC88C\uBC88\uD638 \uD655\uC778\n- [ ] \uB300\uD45C\uC790 \uC2E0\uBD84\uC99D \uC900\uBE44\n\n## Step 2: \uD3EC\uD2B8\uC6D0 \uAC00\uC785 (D-10)\n1. https://portone.io \uC811\uC18D\n2. \uD68C\uC6D0\uAC00\uC785 \u2192 \uAD00\uB9AC\uC790 \uCF58\uC194\n3. \"\uACB0\uC81C \uC5F0\uB3D9\" \u2192 \"\uD1A0\uC2A4\uD398\uC774\uBA3C\uCE20\" \uC120\uD0DD\n4. \uC0AC\uC5C5\uC790 \uC815\uBCF4 \uC785\uB825 (\uC0AC\uC5C5\uC790\uB4F1\uB85D\uBC88\uD638, \uB300\uD45C\uC790, \uC5C5\uC885)\n5. \uC11C\uB958 \uC5C5\uB85C\uB4DC (\uC0AC\uC5C5\uC790\uB4F1\uC99D, \uD1B5\uC7A5\uC0AC\uBCF8)\n6. \uC2EC\uC0AC \uB300\uAE30 (3~5\uC601\uC5C5\uC77C)\n\n## Step 3: \uD14C\uC2A4\uD2B8 \uACB0\uC81C (D-3)\n- \uD3EC\uD2B8\uC6D0 \uD14C\uC2A4\uD2B8 \uBAA8\uB4DC\uB85C \uACB0\uC81C \uD14C\uC2A4\uD2B8\n- \uCE74\uB4DC/\uAC00\uC0C1\uACC4\uC88C/\uCE74\uCE74\uC624\uD398\uC774 \uAC01\uAC01 \uD14C\uC2A4\uD2B8\n- \uD658\uBD88 \uD504\uB85C\uC138\uC2A4 \uD14C\uC2A4\uD2B8\n\n## Step 4: \uB7F0\uCE6D\uD398\uC774\uC9C0 \uC5F0\uB3D9 (D-1)\n- \uACB0\uC81C \uBC84\uD2BC\uC5D0 \uD3EC\uD2B8\uC6D0 \uACB0\uC81C\uCC3D \uC5F0\uACB0\n- \uACB0\uC81C \uC644\uB8CC \u2192 \uC218\uAC15 \uC548\uB0B4 \uC774\uBA54\uC77C \uC790\uB3D9 \uBC1C\uC1A1 \uC124\uC815\n- \uC138\uAE08\uACC4\uC0B0\uC11C \uC790\uB3D9 \uBC1C\uD589 \uC124\uC815 (\uD1A0\uC2A4\uD398\uC774\uBA3C\uCE20 \uAD00\uB9AC\uC790)\n\n---\n\n## \uC218\uC218\uB8CC \uAD6C\uC870\n\n| \uACB0\uC81C \uC218\uB2E8 | \uC218\uC218\uB8CC | \uC815\uC0B0 \uC8FC\uAE30 |\n|---------|--------|----------|\n| \uC2E0\uC6A9\uCE74\uB4DC | 3.2% | D+2 \uC601\uC5C5\uC77C |\n| \uCE74\uCE74\uC624\uD398\uC774 | 3.3% | D+2 \uC601\uC5C5\uC77C |\n| \uAC00\uC0C1\uACC4\uC88C | 300\uC6D0/\uAC74 | D+1 \uC601\uC5C5\uC77C |\n| \uD734\uB300\uD3F0 \uACB0\uC81C | 3.5% | \uC775\uC6D4 15\uC77C |\n\n## \uD658\uBD88 \uCC98\uB9AC\n- \uACB0\uC81C \uD6C4 7\uC77C \uC774\uB0B4: \uC804\uC561 \uD658\uBD88 (\uCCAD\uC57D\uCCA0\uD68C)\n- 7\uC77C \uC774\uD6C4 ~ \uC218\uAC15 \uC2DC\uC791 \uC804: 90% \uD658\uBD88\n- \uC218\uAC15 \uC2DC\uC791 \uD6C4: \uC794\uC5EC \uAE30\uAC04 \uBE44\uB840 \uD658\uBD88\n- \uC0C1\uC138 \uADDC\uC815\uC740 O3 \uBC95\uBB34 \uC5D0\uC774\uC804\uD2B8\uC758 \uD658\uBD88\uADDC\uC815 \uCC38\uC870\n`;
  const fp=path.join(OUT,"03_\uACB0\uC81C\uC5F0\uB3D9_\uAC00\uC774\uB4DC.md");
  fs.writeFileSync(fp,md,"utf8");return fp;
}

// ============================================================
// 4. LAUNCH CHECKLIST (Markdown)
// ============================================================
function generateLaunchChecklist(){
  console.log("  [4/6] MVP \uB7F0\uCE6D \uCCB4\uD06C\uB9AC\uC2A4\uD2B8 \uC0DD\uC131 \uC911...");
  const md=`# MVP \uB7F0\uCE6D D-30 \uCCB4\uD06C\uB9AC\uC2A4\uD2B8 \u2014 ${f1.company_name}\n\n> \uC0DD\uC131\uC77C: ${TODAY}\n\n---\n\n## D-30 ~ D-21: \uC778\uD504\uB77C \uC138\uD305\n\n| # | \uD560\uC77C | \uB2F4\uB2F9 | \uC0C1\uD0DC |\n|---|------|------|------|\n| 1 | \uD1B5\uC2E0\uD310\uB9E4\uC5C5 \uC2E0\uACE0 (\uAD6C\uCCAD) | \uB300\uD45C | \u2610 |\n| 2 | \uD3EC\uD2B8\uC6D0 \uAC00\uC785 + \uD1A0\uC2A4\uD398\uC774\uBA3C\uCE20 \uC2EC\uC0AC \uC2E0\uCCAD | \uB300\uD45C | \u2610 |\n| 3 | Notion \uC218\uAC15\uC0DD DB \uAD6C\uC870 \uC124\uACC4 | \uB300\uD45C | \u2610 |\n| 4 | Zoom Pro \uACC4\uC815 \uAC1C\uC124 | \uB300\uD45C | \u2610 |\n| 5 | YouTube \uCC44\uB110 \uACBD\uC5B4 \uC815\uBE44 (\uBD80\uB3D9\uCC2CTV \u2192 \uAD50\uC721 \uC7AC\uC0DD\uBAA9\uB85D) | \uB300\uD45C | \u2610 |\n| 6 | \uC2A4\uD2F0\uBE44(Stibee) \uC774\uBA54\uC77C \uACC4\uC815 \uC124\uC815 | \uB300\uD45C | \u2610 |\n| 7 | Google Analytics 4 \uC124\uCE58 | \uB300\uD45C | \u2610 |\n\n## D-20 ~ D-11: \uCF58\uD150\uCE20 \uC900\uBE44\n\n| # | \uD560\uC77C | \uB2F4\uB2F9 | \uC0C1\uD0DC |\n|---|------|------|------|\n| 8 | C05 \uBB34\uB8CC PDF \uAC00\uC774\uB4DC 3\uC885 \uC81C\uC791 | \uB300\uD45C | \u2610 |\n| 9 | C01 \uC2A4\uD130\uB514\uCE74\uD398 \uAC15\uC758 \uB9AC\uD5C8\uC124 + \uC2DC\uAC04 \uD655\uC815 | \uB300\uD45C | \u2610 |\n| 10 | \uB7F0\uB529\uD398\uC774\uC9C0 \uCE74\uD53C\uB77C\uC774\uD305 (\uD5E4\uB4DC\uB77C\uC778, CTA, \uD6C4\uAE30) | \uB300\uD45C | \u2610 |\n| 11 | \uACB0\uC81C \uC644\uB8CC \uD6C4 \uC548\uB0B4 \uC774\uBA54\uC77C \uD15C\uD50C\uB9BF \uC81C\uC791 | \uB300\uD45C | \u2610 |\n| 12 | \uC218\uAC15\uC0DD \uC628\uBCF4\uB529 \uBA54\uC2DC\uC9C0 \uC791\uC131 (\uD658\uC601+\uC548\uB0B4+\uCEE4\uBBA4\uB2C8\uD2F0 \uCD08\uB300) | \uB300\uD45C | \u2610 |\n| 13 | \uCE74\uCE74\uC624\uD1A1 \uC624\uD508\uCC44\uD305\uBC29 \uAC1C\uC124 (\uC218\uAC15\uC0DD \uCEE4\uBBA4\uB2C8\uD2F0) | \uB300\uD45C | \u2610 |\n\n## D-10 ~ D-4: \uD14C\uC2A4\uD2B8\n\n| # | \uD560\uC77C | \uB2F4\uB2F9 | \uC0C1\uD0DC |\n|---|------|------|------|\n| 14 | PG \uC2EC\uC0AC \uC644\uB8CC \uD655\uC778 | \uB300\uD45C | \u2610 |\n| 15 | \uD14C\uC2A4\uD2B8 \uACB0\uC81C (\uCE74\uB4DC/\uCE74\uCE74\uC624\uD398\uC774/\uAC00\uC0C1\uACC4\uC88C) | \uB300\uD45C | \u2610 |\n| 16 | \uD14C\uC2A4\uD2B8 \uD658\uBD88 \uD504\uB85C\uC138\uC2A4 \uD655\uC778 | \uB300\uD45C | \u2610 |\n| 17 | \uB7F0\uB529\uD398\uC774\uC9C0 \u2192 \uACB0\uC81C \u2192 \uC548\uB0B4\uBA54\uC77C \uC804\uCCB4 \uD50C\uB85C\uC6B0 \uD14C\uC2A4\uD2B8 | \uB300\uD45C | \u2610 |\n| 18 | \uBCA0\uD0C0 \uD14C\uC2A4\uD130 3~5\uBA85 \uBAA8\uC9D1 (\uBD80\uB3D9\uCC2CTV \uAD6C\uB3C5\uC790 \uC911) | \uB300\uD45C | \u2610 |\n| 19 | \uBCA0\uD0C0 \uD53C\uB4DC\uBC31 \uBC18\uC601 | \uB300\uD45C | \u2610 |\n\n## D-3 ~ D-Day: \uB7F0\uCE6D\n\n| # | \uD560\uC77C | \uB2F4\uB2F9 | \uC0C1\uD0DC |\n|---|------|------|------|\n| 20 | \uBD80\uB3D9\uCC2CTV \uB7F0\uCE6D \uC608\uACE0 \uC601\uC0C1 \uC5C5\uB85C\uB4DC | \uB300\uD45C | \u2610 |\n| 21 | \uC774\uBA54\uC77C \uB9AC\uC2A4\uD2B8 \uB7F0\uCE6D \uC548\uB0B4 \uBC1C\uC1A1 | \uB300\uD45C | \u2610 |\n| 22 | \uCE74\uCE74\uC624\uD1A1 \uCC44\uB110 \uB7F0\uCE6D \uACF5\uC9C0 | \uB300\uD45C | \u2610 |\n| 23 | D-Day: \uB7F0\uCE6D! \uACB0\uC81C \uBAA8\uB2C8\uD130\uB9C1 \uC2DC\uC791 | \uB300\uD45C | \u2610 |\n\n## D+1 ~ D+7: \uC548\uC815\uD654\n\n| # | \uD560\uC77C | \uB2F4\uB2F9 | \uC0C1\uD0DC |\n|---|------|------|------|\n| 24 | \uCCA3 \uACB0\uC81C \uD655\uC778 + \uC218\uAC15\uC0DD \uC628\uBCF4\uB529 \uC2E4\uD589 | \uB300\uD45C | \u2610 |\n| 25 | \uCCA3 Zoom \uB77C\uC774\uBE0C \uAC15\uC758 \uC2E4\uC2DC | \uB300\uD45C | \u2610 |\n| 26 | \uC218\uAC15\uC0DD \uD53C\uB4DC\uBC31 \uC218\uC9D1 (NPS \uC124\uBB38) | \uB300\uD45C | \u2610 |\n| 27 | Week 1 \uACB0\uC0B0: \uACB0\uC81C \uAC74\uC218, \uB9E4\uCD9C, \uD658\uBD88, \uBB38\uC758 \uC815\uB9AC | \uB300\uD45C | \u2610 |\n| 28 | \uAC1C\uC120\uC810 \uBC18\uC601 + 2\uD68C\uCC28 \uAC15\uC758 \uC900\uBE44 | \uB300\uD45C | \u2610 |\n\n---\n\n## \uC131\uACF5 \uAE30\uC900\n\n| \uC9C0\uD45C | D+7 \uBAA9\uD45C | D+30 \uBAA9\uD45C |\n|------|---------|----------|\n| \uC720\uB8CC \uACB0\uC81C | 5\uBA85+ | 20\uBA85+ |\n| \uBB34\uB8CC \uB9AC\uB4DC | 100\uBA85+ | 500\uBA85+ |\n| NPS | - | 50+ |\n| \uAE30\uC220 \uBB38\uC758 | 0\uAC74 (\uC9C1\uAD00\uC801 UX) | \uC6D4 5\uAC74 \uC774\uD558 |\n| \uD658\uBD88\uB960 | - | 5% \uC774\uD558 |\n`;
  const fp=path.join(OUT,"04_MVP\uB7F0\uCE6D_\uCCB4\uD06C\uB9AC\uC2A4\uD2B8.md");
  fs.writeFileSync(fp,md,"utf8");return fp;
}

// ============================================================
// 5. LANDING PAGE (HTML)
// ============================================================
function generateLandingPage(){
  console.log("  [5/6] \uB79C\uB529\uD398\uC774\uC9C0 \uC0DD\uC131 \uC911...");
  const html=`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>REBOUND EDU - \uBD80\uB3D9\uC0B0\u00B7\uC219\uBC15\u00B7\uACF5\uAC04\uC0AC\uC5C5 \uCC3D\uC5C5 \uAD50\uC721</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Noto Sans KR',sans-serif;color:#333;line-height:1.7}
.hero{background:linear-gradient(135deg,#1a1a1a 0%,#333 100%);color:#fff;padding:80px 20px;text-align:center}
.hero h1{font-size:clamp(28px,5vw,48px);font-weight:900;margin-bottom:16px}
.hero h1 span{color:#FF4500}
.hero p{font-size:clamp(16px,2.5vw,20px);opacity:0.85;max-width:600px;margin:0 auto 32px}
.cta{display:inline-block;background:#FF4500;color:#fff;padding:16px 40px;border-radius:8px;font-size:18px;font-weight:700;text-decoration:none;transition:transform 0.2s}
.cta:hover{transform:scale(1.05)}
.stats{display:flex;justify-content:center;gap:40px;margin-top:48px;flex-wrap:wrap}
.stat{text-align:center}.stat .num{font-size:36px;font-weight:900;color:#FF4500}.stat .label{font-size:14px;opacity:0.7}
section{max-width:900px;margin:0 auto;padding:60px 20px}
h2{font-size:28px;font-weight:900;margin-bottom:24px;text-align:center}
h2 span{color:#FF4500}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-top:32px}
.card{border:1px solid #e0e0e0;border-radius:12px;padding:24px;transition:box-shadow 0.2s}
.card:hover{box-shadow:0 4px 20px rgba(0,0,0,0.08)}
.card h3{font-size:18px;font-weight:700;margin-bottom:8px}
.card .price{font-size:24px;font-weight:900;color:#FF4500;margin:12px 0}
.card .price small{font-size:14px;font-weight:400;color:#999}
.card ul{list-style:none;padding:0}.card ul li{padding:4px 0;font-size:14px}.card ul li:before{content:"\u2713 ";color:#FF4500;font-weight:bold}
.why{background:#f8f8f8;padding:60px 20px}
.why-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;max-width:900px;margin:32px auto 0}
.why-item{text-align:center;padding:20px}.why-item .icon{font-size:40px;margin-bottom:12px}.why-item h4{font-size:16px;font-weight:700;margin-bottom:8px}.why-item p{font-size:14px;color:#666}
.ceo{display:flex;align-items:center;gap:24px;max-width:700px;margin:32px auto 0;padding:24px;background:#fff;border-radius:12px;border:1px solid #e0e0e0}
.ceo-avatar{width:80px;height:80px;border-radius:50%;background:#FF4500;display:flex;align-items:center;justify-content:center;color:#fff;font-size:32px;font-weight:900;flex-shrink:0}
.ceo-info h4{font-size:18px;font-weight:700}.ceo-info p{font-size:14px;color:#666;margin-top:4px}
.final-cta{background:#1a1a1a;color:#fff;text-align:center;padding:60px 20px}
.final-cta h2{color:#fff}
footer{text-align:center;padding:24px;font-size:12px;color:#999}
</style></head><body>

<div class="hero">
<h1>\uBD80\uB3D9\uC0B0\u00B7\uC219\uBC15\u00B7\uACF5\uAC04\uC0AC\uC5C5<br><span>\uCC3D\uC5C5 \uAD50\uC721\uC758 \uC0C8\uB85C\uC6B4 \uAE30\uC900</span></h1>
<p>\uC774\uB860\uB9CC \uAC00\uB974\uCE58\uB294 \uAD50\uC721\uC740 \uB05D\uB0AC\uC2B5\uB2C8\uB2E4. 11\uAC1C \uC911\uAC1C\uC13C\uD130\uC640 5\uAC1C \uC6B4\uC601\uC9C0\uC810\uC744 \uBCF4\uC720\uD55C \uD604\uC7A5 \uC804\uBB38\uAC00\uAC00 \uC9C1\uC811 \uAC00\uB974\uCE69\uB2C8\uB2E4.</p>
<a href="#courses" class="cta">\uBB34\uB8CC \uAC00\uC774\uB4DC \uBC1B\uAE30</a>
<div class="stats">
<div class="stat"><div class="num">11</div><div class="label">\uC911\uAC1C\uC13C\uD130</div></div>
<div class="stat"><div class="num">5</div><div class="label">\uC6B4\uC601 \uC9C0\uC810</div></div>
<div class="stat"><div class="num">20K</div><div class="label">\uC720\uD29C\uBE0C \uAD6C\uB3C5\uC790</div></div>
<div class="stat"><div class="num">5\uAD8C</div><div class="label">\uCD9C\uD310 \uC800\uC11C</div></div>
</div></div>

<section id="courses">
<h2>\uAD50\uC721 <span>\uACFC\uC815</span></h2>
<div class="cards">
<div class="card"><h3>\uC2A4\uD130\uB514\uCE74\uD398 \uCC3D\uC5C5 \uACFC\uC815</h3><div class="price">99,000\uC6D0 <small>/\uD68C</small></div><ul><li>Zoom \uB77C\uC774\uBE0C 3\uC2DC\uAC04</li><li>\uC218\uC775\uBAA8\uB378 \uBD84\uC11D</li><li>\uC785\uC9C0 \uC120\uC815 \uC804\uB7B5</li><li>\uB179\uD654\uBCF8 VOD \uC81C\uACF5</li></ul><a href="#" class="cta" style="display:block;text-align:center;margin-top:16px;font-size:15px;padding:12px">\uC2E0\uCCAD\uD558\uAE30</a></div>
<div class="card"><h3>\uD638\uC2A4\uD154 \uCC3D\uC5C5 \uD480\uC0AC\uC774\uD074</h3><div class="price">499,000\uC6D0 <small>/\uACFC\uC815</small></div><ul><li>VOD 20\uC2DC\uAC04 + \uB77C\uC774\uBE0C Q&A</li><li>\uC785\uC9C0\u2192\uC2DC\uACF5\u2192\uC6B4\uC601\u2192\uB9E4\uAC01</li><li>\uD638\uC2A4\uD154 \uCC3D\uC5C5 \uBC14\uC774\uBE14 \uAD50\uC7AC</li><li>PM \uCEE8\uC124\uD305 \uC5F0\uACC4</li></ul><a href="#" class="cta" style="display:block;text-align:center;margin-top:16px;font-size:15px;padding:12px">\uC2E0\uCCAD\uD558\uAE30</a></div>
<div class="card" style="border-color:#FF4500"><h3>\uBC14\uC774\uBE0C\uCF54\uB529 \uCE60</h3><div class="price">1,500,000\uC6D0 <small>/1\uBC15 2\uC77C</small></div><ul><li>\uBE44\uAC1C\uBC1C\uC790 \uC804\uBB38\uC9C1 \uB300\uC0C1</li><li>Claude Code \uC2E4\uC2B5</li><li>AI \uC5D0\uC774\uC804\uD2B8 \uC9C1\uC811 \uAD6C\uCD95</li><li>1:1 \uBA58\uD1A0\uB9C1 3\uD68C</li></ul><a href="#" class="cta" style="display:block;text-align:center;margin-top:16px;font-size:15px;padding:12px">\uC0AC\uC804 \uC608\uC57D</a></div>
</div></section>

<div class="why">
<h2>\uC65C <span>REBOUND EDU</span>\uC778\uAC00?</h2>
<div class="why-grid">
<div class="why-item"><div class="icon">\uD83C\uDFE2</div><h4>\uC2E4\uC804 \uC778\uD504\uB77C</h4><p>\uC774\uB860\uC774 \uC544\uB2CC \uC2E4\uC81C \uC6B4\uC601 \uC911\uC778 5\uAC1C \uC9C0\uC810\uC5D0\uC11C \uBC30\uC6C0\uB2C8\uB2E4</p></div>
<div class="why-item"><div class="icon">\uD83D\uDD04</div><h4>\uD480\uD37C\uB110 \uC5F0\uACC4</h4><p>\uAD50\uC721 \u2192 PM\uCEE8\uC124\uD305 \u2192 \uC911\uAC1C \u2192 \uC6B4\uC601\uAE4C\uC9C0 \uC6D0\uC2A4\uD1B1</p></div>
<div class="why-item"><div class="icon">\uD83C\uDF93</div><h4>\uAC80\uC99D\uB41C \uAC15\uC0AC</h4><p>EXIT \uACBD\uD5D8 + \uC800\uC11C 5\uAD8C + KAIST MBA</p></div>
<div class="why-item"><div class="icon">\uD83E\uDD1D</div><h4>\uCEE4\uBBA4\uB2C8\uD2F0</h4><p>\uC218\uB8CC \uD6C4\uC5D0\uB3C4 \uB124\uD2B8\uC6CC\uD0B9\uACFC \uC2E4\uC804 \uC9C0\uC6D0</p></div>
</div>
<div class="ceo"><div class="ceo-avatar">\uAE40</div><div class="ceo-info"><h4>\uAE40\uB3D9\uCC2C \uB300\uD45C</h4><p>KAIST \uC0AC\uD68C\uC801\uAE30\uC5C5\uAC00 MBA | \uACF5\uC778\uC911\uAC1C\uC0AC | \uC800\uC11C 5\uAD8C<br>\uB9AC\uBC14\uC6B4\uB4DC \uADF8\uB8F9 CEO (4\uAC1C \uBC95\uC778) | \uBD80\uB3D9\uCC2CTV 2\uB9CC \uAD6C\uB3C5\uC790<br>\uB9CC\uC778\uC758\uAFC8 \uCC3D\uC5C5 \u2192 \uD22C\uC790 \uC720\uCE58 \u2192 EXIT \uACBD\uD5D8</p></div></div>
</div>

<div class="final-cta">
<h2>\uBB34\uB8CC \uAC00\uC774\uB4DC\uBD80\uD130 \uC2DC\uC791\uD558\uC138\uC694</h2>
<p style="opacity:0.7;margin:12px 0 24px">\uD638\uC2A4\uD154 \uCC3D\uC5C5 \uCCB4\uD06C\uB9AC\uC2A4\uD2B8 | \uC2A4\uD130\uB514\uCE74\uD398 \uC218\uC775 \uC2DC\uBBAC\uB808\uC774\uD130 | AI \uD65C\uC6A9 \uBBF8\uB9AC\uBCF4\uAE30</p>
<a href="#" class="cta">\uBB34\uB8CC \uAC00\uC774\uB4DC \uB2E4\uC6B4\uB85C\uB4DC</a>
</div>

<footer>\u00A9 ${new Date().getFullYear()} ${f1.company_name} | \uBD80\uB3D9\uC0B0 \uACF5\uC2E4 \uD574\uACB0 \uC804\uBB38\uAC00</footer>
</body></html>`;
  const fp=path.join(OUT,"05_\uB79C\uB529\uD398\uC774\uC9C0.html");
  fs.writeFileSync(fp,html,"utf8");fs.copyFileSync(fp,path.join(DR,"05_\uB79C\uB529\uD398\uC774\uC9C0.html"));
  return fp;
}

// ============================================================
// 6. HANDOFF DATA
// ============================================================
function generateHandoff(){
  console.log("  [6/6] Phase 2 \uC804\uB2EC \uB370\uC774\uD130 \uC0DD\uC131 \uC911...");
  const f4_to_o4={
    _meta:{source:"F4_MVP\uAD6C\uCD95_\uC5D0\uC774\uC804\uD2B8",generated:TODAY,target:"O4_\uAD50\uC721\uC6B4\uC601_\uD5C8\uBE0C_\uC5D0\uC774\uC804\uD2B8"},
    platform:{name:pd.recommendation.phase1.platform,stack:pd.recommendation.phase1.stack,monthly_cost:pd.recommendation.phase1.total_monthly_cost},
    curriculum:pd.curriculum.launch_courses.map(c=>({id:c.id,name:c.category,tier:c.tier,price:c.price,ready:c.ready,priority:c.launch_priority})),
    payment:{pg:"토스페이먼츠",gateway:"포트원",card_fee_pct:3.2},
    launch_kpi:{d7_paid_target:5,d30_paid_target:20,d30_free_leads_target:500,d30_nps_target:50},
    phase2_trigger:pd.recommendation.phase2_trigger,
  };
  const f4_to_g2={
    _meta:{source:"F4_MVP\uAD6C\uCD95_\uC5D0\uC774\uC804\uD2B8",generated:TODAY,target:"G2_\uADF8\uB85C\uC2A4\uB9C8\uCF00\uD305_\uC5D0\uC774\uC804\uD2B8"},
    landing_page:"outputs/05_\uB79C\uB529\uD398\uC774\uC9C0.html",
    funnel:{youtube_subscribers:20000,free_lead_target:500,paid_conversion_target_pct:4,channels:["부동찬TV","카카오톡채널","블로그","이메일"]},
    courses_for_marketing:pd.curriculum.launch_courses.filter(c=>c.launch_priority<=2).map(c=>({name:c.category,price:c.price,usp:c.content})),
  };
  fs.writeFileSync(path.join(DATA,"f4_to_o4.json"),JSON.stringify(f4_to_o4,null,2),"utf8");
  fs.writeFileSync(path.join(DATA,"f4_to_g2.json"),JSON.stringify(f4_to_g2,null,2),"utf8");
  return [path.join(DATA,"f4_to_o4.json"),path.join(DATA,"f4_to_g2.json")];
}

// ============================================================
async function main(){
  console.log("\n\uD83D\uDE80 F4 MVP/\uD50C\uB7AB\uD3FC \uAD6C\uCD95 \uC5D0\uC774\uC804\uD2B8 \u2014 Phase 1 \uCD5C\uC885 \uC5D0\uC774\uC804\uD2B8\n");
  console.log(`  \uD68C\uC0AC\uBA85: ${f1.company_name}`);
  console.log(`  \uC608\uC0B0 \uC81C\uC57D: ${f3.platform_budget_constraint}`);
  console.log(`  \uBD80\uD2B8\uC2A4\uD2B8\uB7A9: ${f3.bootstrap_mode_available?"\uAC00\uB2A5":"\uBD88\uAC00"}`);
  console.log(`  \uB7F0\uCE6D \uCF54\uC2A4: ${pd.curriculum.launch_courses.length}\uAC1C\n`);

  const results=[];
  results.push(await generatePlatformDecision());
  results.push(generateCurriculum());
  results.push(generatePaymentGuide());
  results.push(generateLaunchChecklist());
  results.push(generateLandingPage());
  const hf=generateHandoff();results.push(...hf);

  console.log("\n\u2705 \uC0DD\uC131 \uC644\uB8CC! \uC0B0\uCD9C\uBB3C \uBAA9\uB85D:\n");
  results.forEach((fp,i)=>{const size=fs.statSync(fp).size;console.log(`  ${i+1}. ${path.basename(fp)} (${(size/1024).toFixed(1)}KB)`);});

  console.log(`\n\uD83C\uDFAF \uCD5C\uC885 \uACB0\uC815: ${pd.recommendation.phase1.platform}`);
  console.log(`  \uC6D4 \uBE44\uC6A9: ${fmt(pd.recommendation.phase1.total_monthly_cost)}\uC6D0`);
  console.log(`  \uCCA3 \uB7F0\uCE6D \uCF54\uC2A4: ${pd.curriculum.launch_courses.find(c=>c.launch_priority===1&&c.price>0)?.category||"C01"}`);

  console.log("\n\uD83C\uDFC1 Phase 1 \uC644\uB8CC! \uC804\uCCB4 \uD30C\uC774\uD504\uB77C\uC778:");
  console.log("  F1(\uBC95\uC778\uC124\uB9BD) \u2192 F2(\uC0AC\uC5C5\uACC4\uD68D) \u2192 F3(\uCD08\uAE30\uC790\uAE08) \u2192 F4(MVP) \u2705");
  console.log("\n\uD83D\uDD17 Phase 2 \uC5F0\uACB0:");
  console.log("  \u2192 f4_to_o4.json \u2192 O4 \uAD50\uC721\uC6B4\uC601 \uD5C8\uBE0C (\uD50C\uB7AB\uD3FC+\uCEE4\uB9AC\uD050\uB7FC+\uACB0\uC81C \uC815\uBCF4)");
  console.log("  \u2192 f4_to_g2.json \u2192 G2 \uADF8\uB85C\uC2A4 \uB9C8\uCF00\uD305 (\uB79C\uB529+\uD37C\uB110+\uCC44\uB110 \uC815\uBCF4)\n");
}
main().catch(err=>{console.error("\u274C",err);process.exit(1);});
