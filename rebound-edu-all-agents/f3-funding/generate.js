#!/usr/bin/env node
/**
 * F3 초기자금/부트스트랩 에이전트 — 문서 생성 스크립트
 * 
 * 산출물:
 * 1. 지원사업 매칭 리포트 (DOCX)
 * 2. 12개월 캐시플로우 시뮬레이션 (DOCX + JSON)
 * 3. 부트스트랩 가이드 (Markdown)
 * 4. 자금 조달 로드맵 (Markdown)
 * 5. F4/O1 전달 데이터 (JSON)
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageBreak
} = require("docx");

const OUT = path.join(__dirname, "outputs");
const DATA = path.join(__dirname, "data");
const DR = path.join(OUT, "dataroom", "financial");
[OUT, DR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

const f2 = JSON.parse(fs.readFileSync(path.join(DATA, "f2_to_f3.json"), "utf8"));
const progs = JSON.parse(fs.readFileSync(path.join(DATA, "support_programs.json"), "utf8"));
const TODAY = new Date().toISOString().split("T")[0];

const ORANGE = "FF4500"; const BLACK = "000000"; const DARK = "333333"; const MID = "666666"; const GREEN = "2E7D32";
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cm = { top: 80, bottom: 80, left: 120, right: 120 };
const DISC = "\u26A0\uFE0F AI \uC0DD\uC131 \uCD08\uC548. \uC9C0\uC6D0\uC0AC\uC5C5 \uC120\uC815\uC744 \uBCF4\uC7A5\uD558\uC9C0 \uC54A\uC73C\uBA70, \uC9C0\uC6D0\uC11C \uCD5C\uC885 \uC81C\uCD9C \uC804 \uC804\uBB38\uAC00 \uAC80\uD1A0\uB97C \uAD8C\uC7A5\uD569\uB2C8\uB2E4.";
function fmt(n){return Math.round(n).toLocaleString();}
function fmtM(n){return Math.round(n/1e6)+"\uBC31\uB9CC\uC6D0";}

function h1(t){return new Paragraph({heading:HeadingLevel.HEADING_1,spacing:{before:400,after:200},children:[new TextRun({text:t,font:"Arial",size:32,bold:true,color:BLACK})]});}
function h2(t){return new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:300,after:150},children:[new TextRun({text:t,font:"Arial",size:26,bold:true,color:ORANGE})]});}
function h3(t){return new Paragraph({heading:HeadingLevel.HEADING_3,spacing:{before:200,after:100},children:[new TextRun({text:t,font:"Arial",size:22,bold:true,color:DARK})]});}
function p(t,o={}){return new Paragraph({spacing:{after:100},children:[new TextRun({text:t,font:"Arial",size:20,color:o.color||DARK,...o})]});}
function rp(runs){return new Paragraph({spacing:{after:100},children:runs.map(r=>new TextRun({font:"Arial",size:20,color:DARK,...r}))});}
function bl(t){return new Paragraph({numbering:{reference:"bullets",level:0},spacing:{after:60},children:[new TextRun({text:t,font:"Arial",size:20,color:DARK})]});}
function rbl(runs){return new Paragraph({numbering:{reference:"bullets",level:0},spacing:{after:60},children:runs.map(r=>new TextRun({font:"Arial",size:20,color:DARK,...r}))});}
function sp(){return new Paragraph({spacing:{after:80},children:[]});}
function pb(){return new Paragraph({children:[new PageBreak()]});}
function div(){return new Paragraph({spacing:{before:200,after:200},border:{bottom:{style:BorderStyle.SINGLE,size:6,color:ORANGE,space:1}},children:[]});}
function disc(){return new Paragraph({spacing:{before:160,after:160},shading:{fill:"FFF3E0",type:ShadingType.CLEAR},border:{left:{style:BorderStyle.SINGLE,size:12,color:ORANGE,space:8}},indent:{left:240,right:240},children:[new TextRun({text:DISC,font:"Arial",size:16,color:"BF360C",italic:true})]});}
function tbl(headers,rows,cw){
  const tw=cw.reduce((a,b)=>a+b,0);
  const hr=new TableRow({tableHeader:true,children:headers.map((h,i)=>new TableCell({borders,width:{size:cw[i],type:WidthType.DXA},shading:{fill:"2D2D2D",type:ShadingType.CLEAR},margins:cm,children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:"FFFFFF"})]})]}))});
  const dr=rows.map((row,ri)=>new TableRow({children:row.map((c,i)=>new TableCell({borders,width:{size:cw[i],type:WidthType.DXA},shading:{fill:ri%2===0?"FFFFFF":"F8F8F8",type:ShadingType.CLEAR},margins:cm,children:[new Paragraph({children:[new TextRun({text:String(c),font:"Arial",size:18,color:DARK})]})]}))}));
  return new Table({width:{size:tw,type:WidthType.DXA},columnWidths:cw,rows:[hr,...dr]});
}

// ============================================================
// CASHFLOW MODEL (12 months, 3 scenarios)
// ============================================================
function buildCashflow(scenario) {
  const months = [];
  const y1Rev = f2.year1_revenue_estimate[scenario];
  const y1Cost = f2.year1_cost_estimate;
  const capital = f2.capital;
  const govGrant = scenario === "conservative" ? 30000000 : scenario === "base" ? 50000000 : 70000000;
  const grantMonth = 4; // 정부지원금 수령 예상 월

  let balance = capital; // 시작 잔액 = 자본금

  for (let m = 1; m <= 12; m++) {
    // Revenue ramp: M1-3 낮음, M4-6 성장, M7-12 본격
    const revRatio = m <= 3 ? 0.03 : m <= 6 ? 0.07 : m <= 9 ? 0.10 : 0.13;
    const revenue = Math.round(y1Rev * revRatio);
    
    // Cost: relatively flat with slight growth
    const costRatio = 1/12 + (m > 6 ? 0.01 : 0);
    const cost = Math.round(y1Cost * costRatio);
    
    // Grant
    const grant = m === grantMonth ? govGrant : 0;
    
    const netCash = revenue + grant - cost;
    balance += netCash;

    months.push({
      month: m,
      revenue,
      government_grant: grant,
      total_inflow: revenue + grant,
      operating_cost: cost,
      net_cashflow: netCash,
      closing_balance: balance,
    });
  }
  return { scenario, govGrant, months };
}

// ============================================================
// 1. MATCHING REPORT (DOCX)
// ============================================================
async function generateMatchingReport() {
  console.log("  [1/5] \uC9C0\uC6D0\uC0AC\uC5C5 \uB9E4\uCE6D \uB9AC\uD3EC\uD2B8 \uC0DD\uC131 \uC911...");

  const sorted = [...progs.programs].sort((a, b) => b.match_pct - a.match_pct);
  const children = [];

  // Cover
  children.push(sp(),sp());
  children.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:60},children:[new TextRun({text:"\uC815\uBD80\uC9C0\uC6D0\uC0AC\uC5C5 \uB9E4\uCE6D \uB9AC\uD3EC\uD2B8",font:"Arial",size:36,bold:true,color:BLACK})]}));
  children.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:[new TextRun({text:f2.company+" | "+TODAY,font:"Arial",size:22,color:ORANGE})]}));
  children.push(disc());
  children.push(sp());

  // Summary
  children.push(h2("\uB9E4\uCE6D \uACB0\uACFC \uC694\uC57D"));
  children.push(p(`F2 \uC0AC\uC5C5\uACC4\uD68D\uC11C \uAE30\uBC18\uC73C\uB85C ${progs.programs.length}\uAC1C \uC9C0\uC6D0\uC0AC\uC5C5\uC744 \uBD84\uC11D\uD588\uC2B5\uB2C8\uB2E4. \uCC3D\uC5C5\uC790 \uD504\uB85C\uD544(KAIST MBA, \uB9CC\uC778\uC758\uAFC8 EXIT, \uACF5\uC778\uC911\uAC1C\uC0AC)\uACFC \uC0AC\uC5C5 \uD2B9\uC131(EdTech + PropTech + \uC0AC\uD68C\uC801\uAE30\uC5C5)\uC744 \uAE30\uC900\uC73C\uB85C \uB9E4\uCE6D\uD588\uC2B5\uB2C8\uB2E4.`));
  children.push(sp());

  children.push(tbl(
    ["\uC21C\uC704","\uC9C0\uC6D0\uC0AC\uC5C5","\uC8FC\uAD00","\uCD5C\uB300 \uAE08\uC561","\uB9E4\uCE6D\uB960"],
    sorted.map((pg,i)=>[`${i+1}`,pg.name,pg.agency,fmt(pg.amount_max_krw)+"\uC6D0",pg.match_pct+"%"]),
    [800,2200,2400,2000,1200]
  ));
  children.push(sp());
  children.push(p(`\uCD08\uAE30 \uC790\uAE08 \uD544\uC694\uC561 (Year 1 \uC801\uC790 \uCD94\uC815): ${fmtM(f2.funding_needed)}`,{bold:true}));
  children.push(p(`\uC190\uC775\uBD84\uAE30 \uC218\uAC15\uC0DD \uAE30\uC900: \uC6D4 ${f2.break_even_students_per_month}\uBA85`));

  children.push(pb());

  // Detail per program
  sorted.forEach((pg, idx) => {
    children.push(h2(`${idx+1}. ${pg.name} (\uB9E4\uCE6D\uB960 ${pg.match_pct}%)`));
    children.push(tbl(["\uD56D\uBAA9","\uB0B4\uC6A9"],[
      ["\uC8FC\uAD00 \uAE30\uAD00",pg.agency],
      ["\uCD5C\uB300 \uC9C0\uC6D0\uAE08",fmt(pg.amount_max_krw)+"\uC6D0"],
      ["\uC9C0\uC6D0 \uAE30\uAC04",pg.duration_months+"\uAC1C\uC6D4"],
      ["\uB300\uC0C1",pg.target],
      ["\uC2E0\uCCAD \uC2DC\uAE30",pg.application_period],
    ],[2800,6560]));
    children.push(sp());

    children.push(h3("\uB9E4\uCE6D \uBD84\uC11D"));
    children.push(tbl(["\uD3C9\uAC00 \uD56D\uBAA9","\uC810\uC218","\uADFC\uAC70"],
      Object.entries(pg.match_score_factors).map(([k,v])=>[k.replace(/_/g," "),v.score+"/10",v.reason]),
      [2400,1200,5760]
    ));
    children.push(sp());

    children.push(h3("\uB9AC\uBC14\uC6B4\uB4DC \uAC15\uC810"));
    pg.rebound_strengths.forEach(s => children.push(bl(s)));
    children.push(sp());

    children.push(h3("\uC9C0\uC6D0 \uC804\uB7B5 \uD301"));
    children.push(p(pg.tips, {italic:true, color:"BF360C"}));
    children.push(sp());

    children.push(h3("\uD544\uC694 \uC11C\uB958"));
    pg.key_requirements.forEach(r => children.push(bl(r)));

    if (idx < sorted.length - 1) children.push(pb());
  });

  children.push(pb());

  // Additional funding sources
  children.push(h1("\uCD94\uAC00 \uC790\uAE08 \uC870\uB2EC \uACBD\uB85C"));
  children.push(div());
  children.push(tbl(["\uC720\uD615","\uBA85\uCE6D","\uADDC\uBAA8","\uBE44\uACE0"],
    progs.additional_sources.map(s=>[s.type,s.name,s.amount,s.note]),
    [1600,2800,2000,2960]
  ));

  const doc = new Document({
    styles:{default:{document:{run:{font:"Arial",size:20}}},paragraphStyles:[
      {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:32,bold:true,font:"Arial"},paragraph:{spacing:{before:400,after:200},outlineLevel:0}},
      {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:26,bold:true,font:"Arial"},paragraph:{spacing:{before:300,after:150},outlineLevel:1}},
      {id:"Heading3",name:"Heading 3",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:22,bold:true,font:"Arial"},paragraph:{spacing:{before:200,after:100},outlineLevel:2}},
    ]},
    numbering:{config:[{reference:"bullets",levels:[{level:0,format:LevelFormat.BULLET,text:"\u2022",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:360}}}}]}]},
    sections:[{
      properties:{page:{size:{width:12240,height:15840},margin:{top:1440,right:1440,bottom:1440,left:1440}}},
      headers:{default:new Header({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:"REBOUND-EDU  |  ",font:"Arial",size:14,color:ORANGE,bold:true}),new TextRun({text:"\uC9C0\uC6D0\uC0AC\uC5C5 \uB9E4\uCE6D \uB9AC\uD3EC\uD2B8",font:"Arial",size:14,color:MID})]})]})},
      footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:DISC,font:"Arial",size:10,color:MID})]})]})},
      children,
    }],
  });

  const buf = await Packer.toBuffer(doc);
  const fp = path.join(OUT, "01_\uC9C0\uC6D0\uC0AC\uC5C5_\uB9E4\uCE6D\uB9AC\uD3EC\uD2B8.docx");
  fs.writeFileSync(fp, buf);
  fs.copyFileSync(fp, path.join(DR, "01_\uC9C0\uC6D0\uC0AC\uC5C5_\uB9E4\uCE6D\uB9AC\uD3EC\uD2B8.docx"));
  return fp;
}

// ============================================================
// 2. CASHFLOW SIMULATION (DOCX)
// ============================================================
async function generateCashflow() {
  console.log("  [2/5] \uCE90\uC2DC\uD50C\uB85C\uC6B0 \uC2DC\uBBAC\uB808\uC774\uC158 \uC0DD\uC131 \uC911...");

  const scenarios = {
    conservative: buildCashflow("conservative"),
    base: buildCashflow("base"),
    optimistic: buildCashflow("optimistic"),
  };

  const children = [];
  children.push(sp(),sp());
  children.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:60},children:[new TextRun({text:"12\uAC1C\uC6D4 \uCE90\uC2DC\uD50C\uB85C\uC6B0 \uC2DC\uBBAC\uB808\uC774\uC158",font:"Arial",size:36,bold:true,color:BLACK})]}));
  children.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:[new TextRun({text:f2.company+" | "+TODAY,font:"Arial",size:22,color:ORANGE})]}));
  children.push(disc());
  children.push(sp());

  // Assumptions
  children.push(h2("\uAE30\uBCF8 \uAC00\uC815"));
  children.push(tbl(["\uD56D\uBAA9","\uBCF4\uC218\uC801","\uAE30\uBCF8","\uB099\uAD00"],[
    ["Year 1 \uB9E4\uCD9C",fmtM(f2.year1_revenue_estimate.conservative),fmtM(f2.year1_revenue_estimate.base),fmtM(f2.year1_revenue_estimate.optimistic)],
    ["Year 1 \uBE44\uC6A9",fmtM(f2.year1_cost_estimate),fmtM(f2.year1_cost_estimate),fmtM(f2.year1_cost_estimate)],
    ["\uC2DC\uC791 \uC794\uC561 (\uC790\uBCF8\uAE08)",fmt(f2.capital)+"\uC6D0",fmt(f2.capital)+"\uC6D0",fmt(f2.capital)+"\uC6D0"],
    ["\uC815\uBD80\uC9C0\uC6D0\uAE08 (M4 \uC218\uB839)",fmt(scenarios.conservative.govGrant)+"\uC6D0",fmt(scenarios.base.govGrant)+"\uC6D0",fmt(scenarios.optimistic.govGrant)+"\uC6D0"],
  ],[2400,2200,2200,2560]));
  children.push(sp());

  // Monthly detail for each scenario
  for (const [key, sc] of Object.entries(scenarios)) {
    children.push(pb());
    const label = key === "conservative" ? "\uBCF4\uC218\uC801" : key === "base" ? "\uAE30\uBCF8" : "\uB099\uAD00";
    children.push(h2(`${label} \uC2DC\uB098\uB9AC\uC624 \u2014 \uC6D4\uBCC4 \uCE90\uC2DC\uD50C\uB85C\uC6B0`));
    
    children.push(tbl(
      ["\uC6D4","\uB9E4\uCD9C","\uC9C0\uC6D0\uAE08","\uC720\uC785 \uD569\uACC4","\uBE44\uC6A9","\uC21C\uD604\uAE08","\uAE30\uB9D0\uC794\uC561"],
      sc.months.map(m => [
        `M${m.month}`,
        fmt(m.revenue)+"\uC6D0",
        m.government_grant > 0 ? fmt(m.government_grant)+"\uC6D0" : "-",
        fmt(m.total_inflow)+"\uC6D0",
        fmt(m.operating_cost)+"\uC6D0",
        (m.net_cashflow >= 0 ? "+" : "") + fmt(m.net_cashflow)+"\uC6D0",
        fmt(m.closing_balance)+"\uC6D0",
      ]),
      [800,1400,1400,1400,1400,1400,1560]
    ));

    const minBalance = Math.min(...sc.months.map(m => m.closing_balance));
    const minMonth = sc.months.find(m => m.closing_balance === minBalance).month;
    const finalBalance = sc.months[11].closing_balance;
    
    children.push(sp());
    children.push(rp([
      {text:`\uCD5C\uC800 \uC794\uC561: `,bold:true},
      {text:`M${minMonth}\uC5D0 ${fmt(minBalance)}\uC6D0 ${minBalance < 0 ? "(\u26A0\uFE0F \uC790\uAE08 \uBD80\uC871!)" : "(\uC591\uD638)"}`,color:minBalance<0?"FF0000":GREEN},
    ]));
    children.push(rp([
      {text:`12\uAC1C\uC6D4 \uD6C4 \uC794\uC561: `,bold:true},
      {text:`${fmt(finalBalance)}\uC6D0`,color:finalBalance<0?"FF0000":GREEN},
    ]));
  }

  children.push(pb());

  // Risk analysis
  children.push(h2("\uC790\uAE08 \uB9AC\uC2A4\uD06C \uBD84\uC11D"));
  const baseCf = scenarios.base;
  const minBal = Math.min(...baseCf.months.map(m=>m.closing_balance));
  children.push(tbl(["\uD56D\uBAA9","\uAE30\uBCF8 \uC2DC\uB098\uB9AC\uC624","\uD310\uB2E8"],[
    ["\uCD5C\uC800 \uC794\uC561",fmt(minBal)+"\uC6D0",minBal>0?"\uC591\uD638 \u2014 \uC790\uBCF8\uAE08+\uC9C0\uC6D0\uAE08\uC73C\uB85C \uBC84\uD2F8":"\u26A0\uFE0F \uCD94\uAC00 \uC790\uAE08 \uD544\uC694"],
    ["\uC790\uAE08 \uC18C\uC9C4 \uC608\uC0C1","M1~M6 \uC9D1\uC911","\uB9E4\uCD9C \uC131\uC7A5 \uC804 \uC2DC\uAE30\uAC00 \uAC00\uC7A5 \uC704\uD5D8"],
    ["\uC815\uBD80\uC9C0\uC6D0\uAE08 \uBBF8\uC218\uB839 \uC2DC","\uC790\uBCF8\uAE08\uB9CC\uC73C\uB85C \uC6B4\uC601","\uBD80\uD2B8\uC2A4\uD2B8\uB7A9 \uBAA8\uB4DC\uB85C \uBE44\uC6A9 \uCD5C\uC18C\uD654 \uD544\uC694"],
    ["\uC548\uC804\uB9C8\uC9C4","\uC6D4 \uBE44\uC6A9\uC758 3\uAC1C\uC6D4\uBD84","\uC57D "+fmtM(f2.year1_cost_estimate/12*3)+" \uD655\uBCF4 \uAD8C\uC7A5"],
  ],[2400,3000,3960]));

  const doc = new Document({
    styles:{default:{document:{run:{font:"Arial",size:20}}},paragraphStyles:[
      {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:32,bold:true,font:"Arial"},paragraph:{spacing:{before:400,after:200},outlineLevel:0}},
      {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:26,bold:true,font:"Arial"},paragraph:{spacing:{before:300,after:150},outlineLevel:1}},
    ]},
    numbering:{config:[{reference:"bullets",levels:[{level:0,format:LevelFormat.BULLET,text:"\u2022",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:360}}}}]}]},
    sections:[{
      properties:{page:{size:{width:12240,height:15840},margin:{top:1440,right:1440,bottom:1440,left:1440}}},
      headers:{default:new Header({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:"REBOUND-EDU  |  ",font:"Arial",size:14,color:ORANGE,bold:true}),new TextRun({text:"\uCE90\uC2DC\uD50C\uB85C\uC6B0 \uC2DC\uBBAC\uB808\uC774\uC158",font:"Arial",size:14,color:MID})]})]})},
      footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:DISC,font:"Arial",size:10,color:MID})]})]})},
      children,
    }],
  });

  const buf = await Packer.toBuffer(doc);
  const fp = path.join(OUT, "02_\uCE90\uC2DC\uD50C\uB85C\uC6B0_\uC2DC\uBBAC\uB808\uC774\uC158.docx");
  fs.writeFileSync(fp, buf);
  fs.copyFileSync(fp, path.join(DR, "02_\uCE90\uC2DC\uD50C\uB85C\uC6B0_\uC2DC\uBBAC\uB808\uC774\uC158.docx"));

  // Also save JSON for O1
  const jsonFp = path.join(OUT, "02_\uCE90\uC2DC\uD50C\uB85C\uC6B0_\uBAA8\uB378.json");
  fs.writeFileSync(jsonFp, JSON.stringify(scenarios, null, 2), "utf8");
  return fp;
}

// ============================================================
// 3. BOOTSTRAP GUIDE (Markdown)
// ============================================================
function generateBootstrapGuide() {
  console.log("  [3/5] \uBD80\uD2B8\uC2A4\uD2B8\uB7A9 \uAC00\uC774\uB4DC \uC0DD\uC131 \uC911...");

  const monthlyCost = Math.round(f2.year1_cost_estimate / 12);
  const minCost = Math.round(monthlyCost * 0.45); // 최소 운영 비용 (45%)

  const md = `# \uBD80\uD2B8\uC2A4\uD2B8\uB7A9 \uAC00\uC774\uB4DC \u2014 ${f2.company}

> \uC678\uBD80 \uC790\uAE08 \uC5C6\uC774 \uC790\uCCB4 \uC218\uC775\uB9CC\uC73C\uB85C \uC6B4\uC601\uD558\uB294 \uCD5C\uC18C \uBE44\uC6A9 \uAD6C\uC870
> \uC0DD\uC131\uC77C: ${TODAY}

---

## \uD575\uC2EC \uC9C8\uBB38: \uC815\uBD80\uC9C0\uC6D0\uAE08 \uC5C6\uC774 \uBC84\uD2F8 \uC218 \uC788\uB294\uAC00?

**\uB2F5: \uAC00\uB2A5\uD558\uC9C0\uB9CC \uC870\uAC74\uC774 \uC788\uB2E4.**

\uC790\uBCF8\uAE08 ${fmt(f2.capital)}\uC6D0\uC73C\uB85C \uC2DC\uC791\uD560 \uACBD\uC6B0, \uC6D4 \uBE44\uC6A9\uC744 ${fmtM(minCost)} \uC774\uD558\uB85C \uC5B5\uC81C\uD558\uBA74\uC11C \uC6D4 ${Math.ceil(minCost / 420000)}\uBA85 \uC774\uC0C1\uC758 \uC720\uB8CC \uC218\uAC15\uC0DD\uC744 \uD655\uBCF4\uD574\uC57C \uD569\uB2C8\uB2E4.

---

## \uBD80\uD2B8\uC2A4\uD2B8\uB7A9 \uBAA8\uB4DC \uBE44\uC6A9 \uAD6C\uC870

| \uD56D\uBAA9 | \uC77C\uBC18 \uBAA8\uB4DC | \uBD80\uD2B8\uC2A4\uD2B8\uB7A9 \uBAA8\uB4DC | \uC808\uAC10 \uBC29\uBC95 |
|------|---------|------------|---------|
| \uC778\uAC74\uBE44 | ${fmtM(10000000)}/\uC6D4 | ${fmtM(4000000)}/\uC6D4 | 3\uC778 \uCC3D\uC5C5\uD300 \uBB34\uAE09 \uCD08\uAE30 + \uD504\uB9AC\uB79C\uC11C \uAC15\uC0AC\uB9CC \uC131\uACFC\uAE09 |
| \uD50C\uB7AB\uD3FC | ${fmtM(500000)}/\uC6D4 | ${fmtM(100000)}/\uC6D4 | \uB178\uCF54\uB4DC(\uD2F0\uCC98\uBE14 \uBB34\uB8CC\uD50C\uB79C) + Zoom \uBB34\uB8CC |
| \uB9C8\uCF00\uD305 | ${fmtM(3000000)}/\uC6D4 | ${fmtM(0)}/\uC6D4 | \uBD80\uB3D9\uCC2CTV 2\uB9CC \uAD6C\uB3C5\uC790 100% \uC624\uAC00\uB2C9 |
| \uC0AC\uBB34\uC2E4 | ${fmtM(2000000)}/\uC6D4 | ${fmtM(0)}/\uC6D4 | \uB9AC\uBC14\uC6B4\uB4DC \uADF8\uB8F9 \uAE30\uC874 \uACF5\uAC04 \uD65C\uC6A9 |
| \uCF58\uD150\uCE20 | ${fmtM(1500000)}/\uC6D4 | ${fmtM(300000)}/\uC6D4 | \uAE30\uC874 PPT/\uAD50\uC7AC \uD65C\uC6A9 + \uB300\uD45C \uC9C1\uC811 \uAC15\uC758 |
| \uAE30\uD0C0 | ${fmtM(1000000)}/\uC6D4 | ${fmtM(500000)}/\uC6D4 | \uCD5C\uC18C\uD55C\uC758 \uBC95\uBB34/\uC138\uBB34 |
| **\uD569\uACC4** | **${fmtM(monthlyCost)}/\uC6D4** | **${fmtM(minCost)}/\uC6D4** | **${Math.round((1-minCost/monthlyCost)*100)}% \uC808\uAC10** |

---

## \uBD80\uD2B8\uC2A4\uD2B8\uB7A9 \uB85C\uB4DC\uB9F5

### Month 1~2: \uBB34\uB8CC \uCF58\uD150\uCE20 \uB9AC\uB4DC \uD655\uBCF4
- \uBD80\uB3D9\uCC2CTV\uC5D0 \uBB34\uB8CC \uAC15\uC758 \uCF58\uD150\uCE20 3\uAC1C \uC5C5\uB85C\uB4DC
- \uBB34\uB8CC PDF \uAC00\uC774\uB4DC(\uD638\uC2A4\uD154 \uCC3D\uC5C5 \uCCB4\uD06C\uB9AC\uC2A4\uD2B8, \uC2A4\uD130\uB514\uCE74\uD398 \uC218\uC775\uBAA8\uB378) \uBC30\uD3EC
- \uC774\uBA54\uC77C/\uCE74\uCE74\uC624\uD1A1 \uB9AC\uB4DC \uC218\uC9D1 \uBAA9\uD45C: 500\uBA85
- \uBE44\uC6A9: \uAC70\uC758 0\uC6D0 (\uAE30\uC874 \uCF58\uD150\uCE20 + \uBB34\uB8CC \uB3C4\uAD6C)

### Month 2~3: \uCCA3 \uC720\uB8CC \uAC15\uC758 \uB7F0\uCE6D
- Zoom \uBB34\uB8CC \uACC4\uC815\uC73C\uB85C 40\uBD84 \uB77C\uC774\uBE0C \uAC15\uC758 \uC2DC\uC791
- \uAC00\uACA9: 99,000\uC6D0 (\uC785\uBB38 \uACFC\uC815)
- \uBAA9\uD45C: \uC6D4 20\uBA85 \u00D7 99,000\uC6D0 = \uC6D4 198\uB9CC\uC6D0
- \uACB0\uC81C: \uD1A0\uC2A4\uD398\uC774\uBA3C\uCE20 \uAC04\uD3B8\uACB0\uC81C \uB9C1\uD06C

### Month 4~6: \uC2EC\uD654 \uACFC\uC815 + \uBC18\uBCF5 \uB9E4\uCD9C
- 499,000\uC6D0 \uC2EC\uD654 \uACFC\uC815 \uCD9C\uC2DC (VOD 20\uC2DC\uAC04 + \uBA58\uD1A0\uB9C1)
- \uAE30\uC874 75\uC2AC\uB77C\uC774\uB4DC \uC2A4\uD130\uB514\uCE74\uD398 \uAC15\uC758 \u2192 VOD \uBCC0\uD658
- \uBAA9\uD45C: \uC6D4 30\uBA85 \u00D7 \uD3C9\uADE0 300,000\uC6D0 = \uC6D4 900\uB9CC\uC6D0
- \uC774 \uC2DC\uC810\uC5D0\uC11C BEP \uADFC\uC811

### Month 7~12: \uD504\uB9AC\uBBF8\uC5C4 + B2B
- 1\uBC15 2\uC77C \uBD80\uD2B8\uCE60 (150\uB9CC\uC6D0) \uCD9C\uC2DC
- B2B \uAE30\uC5C5\uAD50\uC721 \uCCA3 \uACC4\uC57D
- \uBAA9\uD45C: \uC6D4 1,500\uB9CC\uC6D0+ (\uD751\uC790 \uC804\uD658)

---

## \uB9AC\uBC14\uC6B4\uB4DC \uADF8\uB8F9 \uC778\uD504\uB77C \uD65C\uC6A9 (\uBE44\uC6A9 0\uC6D0)

| \uADF8\uB8F9 \uC790\uC6D0 | \uD65C\uC6A9 \uBC29\uBC95 | \uC808\uAC10 \uD6A8\uACFC |
|------------|---------|---------|
| \uC885\uB85C/\uCDA9\uBB34\uB85C \uC6B4\uC601\uC9C0\uC810 | \uC0AC\uBB34\uACF5\uAC04 + \uC624\uD504\uB77C\uC778 \uAC15\uC758\uC7A5 | \uC6D4 200\uB9CC\uC6D0 \uC808\uAC10 |
| \uBD80\uB3D9\uCC2CTV (2\uB9CC \uAD6C\uB3C5\uC790) | \uBB34\uB8CC \uCF58\uD150\uCE20 \u2192 \uC720\uB8CC \uC804\uD658 | \uB9C8\uCF00\uD305\uBE44 0\uC6D0 |
| 35\uBA85 \uC18C\uC18D \uC911\uAC1C\uC0AC | \uAC15\uC0AC \uD480 + \uCCA3 \uC218\uAC15\uC0DD | \uAC15\uC0AC\uBE44 \uC808\uAC10 |
| \uAE30\uC874 \uAD50\uC7AC/PPT 5\uAD8C | \uCF58\uD150\uCE20 \uC6D0\uBCF8 | \uCF58\uD150\uCE20 \uC81C\uC791\uBE44 \uC808\uAC10 |
| 11\uAC1C \uC911\uAC1C\uC13C\uD130 \uB124\uD2B8\uC6CC\uD06C | B2B \uC601\uC5C5 \uCC44\uB110 | \uC601\uC5C5\uBE44 \uC808\uAC10 |

---

## \uD575\uC2EC \uBA54\uC2DC\uC9C0

**\uBD80\uD2B8\uC2A4\uD2B8\uB7A9\uC740 '\uC808\uC57D'\uC774 \uC544\uB2C8\uB77C '\uADF8\uB8F9 \uC790\uC6D0 \uD65C\uC6A9'\uC785\uB2C8\uB2E4.**
\uC77C\uBC18 EdTech \uC2A4\uD0C0\uD2B8\uC5C5\uC740 \uBB34\uC5D0\uC11C \uC2DC\uC791\uD558\uC9C0\uB9CC, \uB9AC\uBC14\uC6B4\uB4DC\uC5D0\uB4C0\uB294 \uC774\uBBF8 \uAD6C\uCD95\uB41C \uADF8\uB8F9 \uC778\uD504\uB77C(11\uAC1C \uC13C\uD130, 5\uAC1C \uC9C0\uC810, 2\uB9CC \uAD6C\uB3C5\uC790, 35\uBA85 \uC911\uAC1C\uC0AC)\uB97C \uD65C\uC6A9\uD560 \uC218 \uC788\uC5B4 \uCD08\uAE30 \uBE44\uC6A9\uC744 \uADF9\uC801\uC73C\uB85C \uC904\uC77C \uC218 \uC788\uC2B5\uB2C8\uB2E4.

\uC815\uBD80\uC9C0\uC6D0\uAE08\uC740 **\uC5C6\uC5B4\uB3C4 \uC2DC\uC791\uD560 \uC218 \uC788\uC9C0\uB9CC, \uC788\uC73C\uBA74 \uC131\uC7A5\uC744 \uAC00\uC18D\uD560 \uC218 \uC788\uB294** \uBD80\uC2A4\uD130 \uC5ED\uD560\uC785\uB2C8\uB2E4.
`;

  const fp = path.join(OUT, "03_\uBD80\uD2B8\uC2A4\uD2B8\uB7A9_\uAC00\uC774\uB4DC.md");
  fs.writeFileSync(fp, md, "utf8");
  return fp;
}

// ============================================================
// 4. FUNDING ROADMAP (Markdown)
// ============================================================
function generateFundingRoadmap() {
  console.log("  [4/5] \uC790\uAE08 \uC870\uB2EC \uB85C\uB4DC\uB9F5 \uC0DD\uC131 \uC911...");

  const md = `# \uC790\uAE08 \uC870\uB2EC \uB85C\uB4DC\uB9F5 \u2014 ${f2.company}

> \uC0DD\uC131\uC77C: ${TODAY}

---

## \uC6D4\uBCC4 \uC790\uAE08 \uC870\uB2EC \uACC4\uD68D

| \uC2DC\uC810 | \uC790\uAE08\uC6D0 | \uBAA9\uD45C \uAE08\uC561 | \uC6A9\uB3C4 | \uC0C1\uD0DC |
|------|--------|---------|------|------|
| M0 (\uC124\uB9BD) | \uC790\uBCF8\uAE08 (3\uC778 \uADE0\uB4F1 \uCD9C\uC790) | ${fmt(f2.capital)}\uC6D0 | \uBC95\uC778\uC124\uB9BD + \uCD08\uAE30 \uC6B4\uC601 | \u2705 \uD655\uBCF4 |
| M1~2 | \uC790\uCCB4 \uB9E4\uCD9C (\uBB34\uB8CC\u2192\uC720\uB8CC \uC804\uD658) | \uC6D4 100~200\uB9CC\uC6D0 | \uC6B4\uC601\uBE44 \uBCF4\uC870 | \uD611\uC2DC |
| M2~3 | \uC608\uBE44\uCC3D\uC5C5\uD328\uD0A4\uC9C0 \uC2E0\uCCAD | \uCD5C\uB300 1\uC5B5\uC6D0 | \uD50C\uB7AB\uD3FC+\uB9C8\uCF00\uD305+\uC778\uAC74\uBE44 | \uC2E0\uCCAD \uC608\uC815 |
| M3 | \uC11C\uC6B8\uCC3D\uC5C5\uD5C8\uBE0C \uC2E0\uCCAD | \uACF5\uAC04+\uBA58\uD1A0\uB9C1 | \uC0AC\uBB34\uACF5\uAC04+\uB124\uD2B8\uC6CC\uD06C | \uC2E0\uCCAD \uC608\uC815 |
| M4 | \uC815\uBD80\uC9C0\uC6D0\uAE08 \uC218\uB839 (\uC608\uC0C1) | 3\uCC9C~5\uCC9C\uB9CC\uC6D0 | \uC131\uC7A5 \uD22C\uC790 | \uC2EC\uC0AC \uC911 |
| M4~5 | \uC0AC\uD68C\uC801\uAE30\uC5C5 \uC721\uC131\uC0AC\uC5C5 \uC2E0\uCCAD | \uCD5C\uB300 7\uCC9C\uB9CC\uC6D0 | \uC784\uD329\uD2B8 \uC0AC\uC5C5 | \uC2E0\uCCAD \uC608\uC815 |
| M6 | KAIST \uB3D9\uBB38 \uC5D4\uC824 \uD22C\uC790 | 3\uCC9C~5\uCC9C\uB9CC\uC6D0 | \uC6B4\uC601\uC790\uAE08 | \uB124\uD2B8\uC6CC\uD0B9 \uC911 |
| M7~9 | \uC790\uCCB4 \uB9E4\uCD9C \uC131\uC7A5 | \uC6D4 500~1,000\uB9CC\uC6D0 | \uC790\uB9BD \uC6B4\uC601 | \uBAA9\uD45C |
| M10~12 | Seed \uD22C\uC790 \uAC80\uD1A0 | 1~3\uC5B5\uC6D0 | \uC2A4\uCF00\uC77C\uC5C5 | G1 \uC5D0\uC774\uC804\uD2B8\uB85C \uC804\uD658 |

---

## \uC790\uAE08 \uC870\uB2EC \uC6B0\uC120\uC21C\uC704

1. **\uBD80\uD2B8\uC2A4\uD2B8\uB7A9 (\uCD5C\uC6B0\uC120)**: \uC790\uCCB4 \uB9E4\uCD9C\uB85C \uBE60\uB974\uAC8C \uC790\uB9BD. \uD22C\uC790\uC790 \uC758\uC874\uB3C4 \uCD5C\uC18C\uD654
2. **\uC815\uBD80\uC9C0\uC6D0\uAE08 (\uAC15\uB825 \uCD94\uCC9C)**: \uBE44\uD76C\uC11D\uD654 \uC790\uAE08. \uD2B9\uD788 \uC608\uBE44\uCC3D\uC5C5\uD328\uD0A4\uC9C0\uB294 \uB9E4\uCE6D\uB960 \uB192\uC74C
3. **\uC5D4\uC824 \uD22C\uC790 (\uC120\uD0DD\uC801)**: KAIST \uB124\uD2B8\uC6CC\uD06C + \uBD80\uB3D9\uCC2CTV \uAD6C\uB3C5\uC790 \uC911 \uD22C\uC790 \uAD00\uC2EC\uC790
4. **\uC815\uCC45\uC790\uAE08/\uB300\uCD9C (\uBCF4\uC870\uC801)**: \uD544\uC694 \uC2DC \uC18C\uC9C4\uACF5/\uAE30\uBCF4 \uD65C\uC6A9

---

## \uC8FC\uC758\uC0AC\uD56D

- \uC815\uBD80\uC9C0\uC6D0\uAE08\uC740 **\uC120\uC815\uC744 \uBCF4\uC7A5\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4**. \uBC18\uB4DC\uC2DC \uBD80\uD2B8\uC2A4\uD2B8\uB7A9 \uD50C\uB79C\uC744 \uBCD1\uD589 \uC900\uBE44\uD558\uC138\uC694.
- \uC9C0\uC6D0\uAE08 \uC0AC\uC6A9\uCC98\uB294 \uAD6C\uCCB4\uC801\uC73C\uB85C \uC81C\uD55C\uB429\uB2C8\uB2E4 (\uC778\uAC74\uBE44, \uB9C8\uCF00\uD305\uBE44 \uB4F1 \uD5C8\uC6A9 \uD56D\uBAA9 \uD655\uC778 \uD544\uC694)
- \uBCF5\uC218 \uC9C0\uC6D0\uC0AC\uC5C5 \uB3D9\uC2DC \uC2E0\uCCAD \uAC00\uB2A5\uD558\uB098, \uC911\uBCF5 \uC218\uD61C \uC81C\uD55C\uC774 \uC788\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4
- 3\uC778 \uC8FC\uC8FC \uADE0\uB4F1 \uCD9C\uC790 \uC2DC \uC8FC\uC8FC \uAC04 \uCD9C\uC790 \uAE08\uC561 \uD569\uC758 \uD544\uC694 (\uCD94\uAC00 \uCD9C\uC790 \uD3EC\uD568)
`;

  const fp = path.join(OUT, "04_\uC790\uAE08\uC870\uB2EC_\uB85C\uB4DC\uB9F5.md");
  fs.writeFileSync(fp, md, "utf8");
  return fp;
}

// ============================================================
// 5. HANDOFF DATA
// ============================================================
function generateHandoff() {
  console.log("  [5/5] F4/O1 \uC804\uB2EC \uB370\uC774\uD130 \uC0DD\uC131 \uC911...");

  const baseCf = buildCashflow("base");
  
  const f3_to_f4 = {
    _meta: { source: "F3_\uCD08\uAE30\uC790\uAE08_\uC5D0\uC774\uC804\uD2B8", generated: TODAY, target: "F4_MVP\uAD6C\uCD95_\uC5D0\uC774\uC804\uD2B8" },
    monthly_budget_for_platform: Math.round(f2.year1_cost_estimate / 12 * 0.026), // ~2.6% = 플랫폼비
    total_available_budget: f2.capital + buildCashflow("base").govGrant,
    platform_budget_constraint: "\uC6D4 50\uB9CC\uC6D0 \uC774\uD558 \uAD8C\uC7A5 (\uBD80\uD2B8\uC2A4\uD2B8\uB7A9 \uBAA8\uB4DC \uC2DC \uC6D4 10\uB9CC\uC6D0 \uC774\uD558)",
    bootstrap_mode_available: true,
    recommendation: "\uCD08\uAE30\uC5D0\uB294 \uB178\uCF54\uB4DC \uD50C\uB7AB\uD3FC(\uBB34\uB8CC/\uC800\uAC00) + Zoom\uC73C\uB85C \uC2DC\uC791, \uC218\uAC15\uC0DD 200\uBA85+ \uB3CC\uD30C \uD6C4 \uC720\uB8CC \uD50C\uB7AB\uD3FC \uC804\uD658",
  };

  const f3_to_o1 = {
    _meta: { source: "F3_\uCD08\uAE30\uC790\uAE08_\uC5D0\uC774\uC804\uD2B8", generated: TODAY, target: "O1_\uC7AC\uBB34\uD68C\uACC4_\uC5D0\uC774\uC804\uD2B8" },
    cashflow_model: baseCf,
    budget_baseline: {
      monthly_cost_target: Math.round(f2.year1_cost_estimate / 12),
      bootstrap_monthly_cost: Math.round(f2.year1_cost_estimate / 12 * 0.45),
      government_grant_expected: baseCf.govGrant,
      grant_receipt_month: 4,
    },
    revenue_split: { reinvest_pct: 70, dividend_pct: 30 },
  };

  fs.writeFileSync(path.join(DATA, "f3_to_f4.json"), JSON.stringify(f3_to_f4, null, 2), "utf8");
  fs.writeFileSync(path.join(DATA, "f3_to_o1.json"), JSON.stringify(f3_to_o1, null, 2), "utf8");
  return [path.join(DATA, "f3_to_f4.json"), path.join(DATA, "f3_to_o1.json")];
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log("\n\uD83D\uDCB0 F3 \uCD08\uAE30\uC790\uAE08 \uC5D0\uC774\uC804\uD2B8 \u2014 \uBB38\uC11C \uC0DD\uC131 \uC2DC\uC791\n");
  console.log(`  \uD68C\uC0AC\uBA85: ${f2.company}`);
  console.log(`  \uC790\uBCF8\uAE08: ${fmt(f2.capital)}\uC6D0`);
  console.log(`  Year 1 \uC801\uC790 \uCD94\uC815: ${fmtM(f2.funding_needed)}`);
  console.log(`  BEP \uAE30\uC900: \uC6D4 ${f2.break_even_students_per_month}\uBA85`);
  console.log(`  \uC9C0\uC6D0\uC0AC\uC5C5 DB: ${progs.programs.length}\uAC1C \uD504\uB85C\uADF8\uB7A8\n`);

  const results = [];
  results.push(await generateMatchingReport());
  results.push(await generateCashflow());
  results.push(generateBootstrapGuide());
  results.push(generateFundingRoadmap());
  const hf = generateHandoff();
  results.push(...hf);

  console.log("\n\u2705 \uC0DD\uC131 \uC644\uB8CC! \uC0B0\uCD9C\uBB3C \uBAA9\uB85D:\n");
  results.forEach((fp, i) => {
    const size = fs.statSync(fp).size;
    console.log(`  ${i + 1}. ${path.basename(fp)} (${(size / 1024).toFixed(1)}KB)`);
  });

  // Top recommendation
  const top = [...progs.programs].sort((a,b)=>b.match_pct-a.match_pct)[0];
  console.log(`\n\uD83C\uDFAF \uCD5C\uC6B0\uC120 \uC9C0\uC6D0\uC0AC\uC5C5: ${top.name} (\uB9E4\uCE6D\uB960 ${top.match_pct}%, \uCD5C\uB300 ${fmt(top.amount_max_krw)}\uC6D0)`);
  
  const baseCf = buildCashflow("base");
  const minBal = Math.min(...baseCf.months.map(m=>m.closing_balance));
  const minMonth = baseCf.months.find(m=>m.closing_balance===minBal).month;
  console.log(`\uD83D\uDCCA \uCE90\uC2DC\uD50C\uB85C\uC6B0: \uCD5C\uC800 \uC794\uC561 M${minMonth}\uC5D0 ${fmt(minBal)}\uC6D0 ${minBal>0?"(\uC591\uD638)":"(\u26A0\uFE0F \uC790\uAE08\uBD80\uC871)"}`);

  console.log("\n\uD83D\uDD17 \uB2E4\uC74C \uB2E8\uACC4:");
  console.log("  \u2192 data/f3_to_f4.json \u2192 F4 MVP\uAD6C\uCD95 \uC5D0\uC774\uC804\uD2B8 (\uC608\uC0B0 \uC81C\uC57D \uC815\uBCF4 \uC804\uB2EC)");
  console.log("  \u2192 data/f3_to_o1.json \u2192 O1 \uC7AC\uBB34\uD68C\uACC4 \uC5D0\uC774\uC804\uD2B8 (\uCE90\uC2DC\uD50C\uB85C\uC6B0 \uAE30\uC900\uC120 \uC804\uB2EC)");
  console.log("  \u2192 \uC9C0\uC6D0\uC0AC\uC5C5 \uC2E0\uCCAD\uC11C\uB294 \uC2E4\uC81C \uACF5\uACE0\uBB38 \uD655\uC778 \uD6C4 \uC791\uC131 \uD544\uC694\n");
}

main().catch(err => { console.error("\u274C \uC5D0\uB7EC:", err); process.exit(1); });
