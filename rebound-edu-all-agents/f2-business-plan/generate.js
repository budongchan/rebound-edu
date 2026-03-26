#!/usr/bin/env node
/**
 * F2 사업계획서 에이전트 — 문서 생성 스크립트
 * 
 * 산출물:
 * 1. 사업계획서 (DOCX)
 * 2. 재무추정 모델 (XLSX)
 * 3. 경쟁사 분석표 (XLSX)
 * 4. F3/G1 전달 데이터 (JSON)
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

const f1 = JSON.parse(fs.readFileSync(path.join(DATA, "f1_to_f2.json"), "utf8"));
const mkt = JSON.parse(fs.readFileSync(path.join(DATA, "market_research.json"), "utf8"));
const comp = JSON.parse(fs.readFileSync(path.join(DATA, "competitors.json"), "utf8"));
const TODAY = new Date().toISOString().split("T")[0];

const ORANGE = "FF4500"; const BLACK = "000000"; const DARK = "333333"; const MID = "666666";
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cm = { top: 80, bottom: 80, left: 120, right: 120 };
const DISC = "\u26A0\uFE0F \uBCF8 \uBB38\uC11C\uB294 AI\uAC00 \uC0DD\uC131\uD55C \uCD08\uC548\uC774\uBA70 \uD22C\uC790 \uAD8C\uC720\uAC00 \uC544\uB2D9\uB2C8\uB2E4. \uC2DC\uC7A5 \uB370\uC774\uD130\uB294 \uACF5\uAC1C \uCD9C\uCC98 \uAE30\uBC18 \uCD94\uC815\uCE58\uC785\uB2C8\uB2E4.";

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

function fmt(n){return n.toLocaleString();}
function fmtB(n){return (n/1e9).toFixed(1)+"조원";}
function fmtM(n){return Math.round(n/1e6)+"백만원";}

// ============================================================
// FINANCIAL MODEL
// ============================================================
const fin = {
  scenarios: {
    conservative: { label: "보수적", y1_students: 150, y2_students: 400, y3_students: 900, avg_price: 350000, b2b_y2: 2, b2b_y3: 5, b2b_avg: 10000000 },
    base: { label: "기본", y1_students: 250, y2_students: 700, y3_students: 1500, avg_price: 420000, b2b_y2: 4, b2b_y3: 10, b2b_avg: 12000000 },
    optimistic: { label: "낙관", y1_students: 400, y2_students: 1100, y3_students: 2500, avg_price: 500000, b2b_y2: 7, b2b_y3: 18, b2b_avg: 15000000 },
  },
  costs: {
    y1: { personnel: 120000000, platform: 6000000, marketing: 36000000, office: 24000000, content: 18000000, legal_tax: 12000000, misc: 12000000 },
    y2_multiplier: 1.6,
    y3_multiplier: 2.2,
  },
  group_synergy: { conversion_rate: 0.15, avg_pm_revenue: 5000000, avg_brokerage_revenue: 3000000 }
};

function calcScenario(sc) {
  const years = [];
  for (let y = 1; y <= 3; y++) {
    const students = y === 1 ? sc[`y1_students`] : y === 2 ? sc[`y2_students`] : sc[`y3_students`];
    const b2c_revenue = students * sc.avg_price;
    const b2b_count = y === 1 ? 0 : y === 2 ? sc.b2b_y2 : sc.b2b_y3;
    const b2b_revenue = b2b_count * sc.b2b_avg;
    const total_revenue = b2c_revenue + b2b_revenue;
    const synergy_students = Math.round(students * fin.group_synergy.conversion_rate);
    const synergy_revenue = synergy_students * (fin.group_synergy.avg_pm_revenue + fin.group_synergy.avg_brokerage_revenue) * 0.1; // 10% referral
    const mult = y === 1 ? 1 : y === 2 ? fin.costs.y2_multiplier : fin.costs.y3_multiplier;
    const total_cost = Object.values(fin.costs.y1).reduce((a,b)=>a+b,0) * mult;
    const operating_income = total_revenue - total_cost;
    const margin_pct = total_revenue > 0 ? Math.round(operating_income / total_revenue * 100) : 0;
    years.push({ year: y, students, b2c_revenue, b2b_count, b2b_revenue, total_revenue, synergy_students, synergy_revenue, total_cost, operating_income, margin_pct });
  }
  return years;
}

// ============================================================
// GENERATE BUSINESS PLAN DOCX
// ============================================================
async function generateBusinessPlan() {
  console.log("  [1/4] 사업계획서 생성 중...");
  const base = calcScenario(fin.scenarios.base);
  const cons = calcScenario(fin.scenarios.conservative);
  const opti = calcScenario(fin.scenarios.optimistic);

  const children = [];

  // COVER
  children.push(sp(),sp(),sp());
  children.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:80},children:[new TextRun({text:"REBOUND-EDU",font:"Arial",size:56,bold:true,color:ORANGE})]}));
  children.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:40},children:[new TextRun({text:"사업계획서",font:"Arial",size:40,bold:true,color:BLACK})]}));
  children.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:[new TextRun({text:"부동산·숙박·공간사업 창업 교육의 새로운 기준",font:"Arial",size:22,color:MID})]}));
  children.push(new Paragraph({alignment:AlignmentType.CENTER,border:{top:{style:BorderStyle.SINGLE,size:4,color:ORANGE,space:12}},spacing:{after:200},children:[]}));
  
  children.push(tbl(["항목","내용"],[
    ["회사명",f1.company_name],
    ["설립일",f1.establishment_date],
    ["자본금",fmt(f1.capital)+"원"],
    ["대표이사",f1.shareholders[0].name],
    ["주주 구성",f1.shareholders.map(s=>`${s.name} (${s.share_pct}%)`).join(", ")],
    ["사업 영역","온라인/오프라인 교육 서비스, 교육 콘텐츠 제작·판매, 교육 컨설팅"],
    ["목표 시장","부동산·숙박·공간사업 창업 교육 + AI 활용 교육"],
    ["작성일",TODAY],
  ],[2800,6560]));
  children.push(sp());
  children.push(disc());

  children.push(pb());

  // 1. EXECUTIVE SUMMARY
  children.push(h1("1. Executive Summary"));
  children.push(div());
  children.push(p(`${f1.company_name}는 부동산·숙박·공간사업 창업 분야의 온라인/오프라인 교육 플랫폼입니다. 단순 이론 교육이 아닌, 실제 11개 중개센터와 5개 운영지점(호스텔·코워킹·스터디카페)을 보유한 리바운드 그룹의 현장 경험을 기반으로, '교육 → PM컨설팅 → 중개 → 운영'까지 이어지는 풀퍼널 교육 서비스를 제공합니다.`));
  children.push(sp());
  children.push(h3("핵심 지표 (기본 시나리오 기준)"));
  children.push(tbl(["지표","Year 1","Year 2","Year 3"],[
    ["수강생 수",fmt(base[0].students)+"명",fmt(base[1].students)+"명",fmt(base[2].students)+"명"],
    ["총 매출",fmtM(base[0].total_revenue),fmtM(base[1].total_revenue),fmtM(base[2].total_revenue)],
    ["영업이익",fmtM(base[0].operating_income),fmtM(base[1].operating_income),fmtM(base[2].operating_income)],
    ["영업이익률",base[0].margin_pct+"%",base[1].margin_pct+"%",base[2].margin_pct+"%"],
    ["그룹 시너지 전환",base[0].synergy_students+"명",base[1].synergy_students+"명",base[2].synergy_students+"명"],
  ],[2400,2200,2200,2560]));
  children.push(sp());
  children.push(h3("투자 포인트"));
  children.push(rbl([{text:"실전 인프라 기반 교육: ",bold:true},{text:"이론만 가르치는 경쟁사와 달리, 실제 운영 중인 5개 지점에서 현장 실습 + 인턴 경험 제공"}]));
  children.push(rbl([{text:"풀퍼널 수익 모델: ",bold:true},{text:"수강료(입구) → PM컨설팅(중간) → 중개수수료(출구). 수강생 LTV가 일반 EdTech의 3~5배"}]));
  children.push(rbl([{text:"대표 브랜드 파워: ",bold:true},{text:"부동찬TV 2만 구독자 + 저서 5권 + KAIST MBA + 만인의꿈 EXIT 경험"}]));
  children.push(rbl([{text:"검증된 팀: ",bold:true},{text:"3인 균등지분의 보완적 창업팀. 대표의 연쇄창업 + EXIT 경험"}]));

  children.push(pb());

  // 2. MARKET ANALYSIS
  children.push(h1("2. 시장 분석"));
  children.push(div());
  children.push(h3("2.1 TAM / SAM / SOM"));
  const m = mkt.market.edtech_korea;
  children.push(tbl(["구분","규모","설명"],[
    ["TAM (전체 시장)",fmtB(m.tam.value_krw_billion*1e9),m.tam.note],
    ["SAM (접근 가능 시장)",fmtB(m.sam.value_krw_billion*1e9),m.sam.note],
    ["SOM (초기 목표 시장)",fmt(m.som.value_krw_billion)+"억원",m.som.note],
    ["시장 성장률 (CAGR)",m.cagr_pct+"%","온라인 교육 + EdTech 시장"],
  ],[2400,2000,4960]));
  children.push(sp());
  children.push(p(`출처: ${m.tam.source}, ${m.sam.source}`,{color:MID,italic:true}));
  children.push(sp());

  children.push(h3("2.2 시장 성장 동인"));
  m.growth_drivers.forEach(d=>children.push(bl(d)));
  children.push(sp());

  children.push(h3("2.3 타겟 고객 세그먼트"));
  children.push(tbl(["세그먼트","추정 규모","지불 의향","핵심 Pain Point"],
    mkt.target_customers.map(c=>[c.segment,fmt(c.size_estimate)+"명",c.willingness_to_pay,c.pain_points[0]]),
    [2400,1600,2000,3360]));

  children.push(pb());

  // 3. PRODUCT
  children.push(h1("3. 제품/서비스"));
  children.push(div());
  children.push(h3("3.1 교육 상품 라인업"));
  children.push(tbl(["티어","가격대","콘텐츠","목적"],
    mkt.pricing_model.tiers.map(t=>[t.name,t.price===0?"무료":fmt(t.price_range[0])+"~"+fmt(t.price_range[1])+"원",t.content,t.purpose]),
    [1800,2200,3400,1960]));
  children.push(sp());

  children.push(h3("3.2 교육 카테고리 (런칭 시)"));
  const categories = [
    ["호스텔/게스트하우스 창업 과정","입지선정→사업계획→인허가→시공→운영→매각 풀사이클 교육. 「호스텔 창업 바이블」 교재 연계"],
    ["스터디카페/코워킹 창업 과정","75슬라이드 Zoom 강의 기반. 수익 모델 분석, 입지 경쟁 전략, 차별화 운영"],
    ["부동산 법인 투자 과정","법인 설립→매입→운영→매각 실전 교육. 세무/법률 특강 포함"],
    ["바이브코딩 캠프 (AI 활용)","비개발자 전문직 대상 1박 2일. Claude Code 기반 에이전트 구축 실습"],
    ["공인중개사 역량 강화","상업용 중개 실무, 디지털 도구 활용, 수익 다각화 전략"],
  ];
  children.push(tbl(["카테고리","내용"],categories,[3000,6360]));
  children.push(sp());

  children.push(h3("3.3 리바운드 그룹 시너지 (풀퍼널)"));
  children.push(p("일반 EdTech는 수강료에서 수익이 끝나지만, 리바운드에듀는 교육 이후에도 그룹 내 서비스로 연결되어 수강생 LTV를 극대화합니다."));
  children.push(sp());
  children.push(tbl(["단계","서비스","담당 법인","수익 유형"],[
    ["1. 교육","온라인/오프라인 교육 과정","(주)리바운드에듀","수강료"],
    ["2. 컨설팅","창업 PM 컨설팅","(주)부동찬","컨설팅비"],
    ["3. 중개","매물 매칭 + 임대차 중개","(주)리바운드중개","중개수수료"],
    ["4. 운영","호스텔/코워킹/스터디카페 운영 위탁","(주)리바운드","운영수수료"],
    ["5. 실습","운영 지점 인턴/견학","(주)리바운드","교육비 포함"],
  ],[1400,2400,2400,3160]));

  children.push(pb());

  // 4. COMPETITIVE ANALYSIS
  children.push(h1("4. 경쟁사 분석"));
  children.push(div());
  children.push(tbl(["경쟁사","카테고리","강점","약점","리바운드 차별점"],
    comp.competitors.map(c=>[c.name,c.category,c.strengths[0],c.weaknesses[0],c.differentiator_vs_rebound]),
    [1400,1600,2000,1800,2560]));
  children.push(sp());

  children.push(h3("4.1 핵심 경쟁우위 (Moat)"));
  comp.competitive_advantage.moat_factors.forEach(f=>{
    children.push(rbl([{text:`${f.factor}: `,bold:true},{text:`${f.description} [방어력: ${f.defensibility}]`}]));
  });

  children.push(pb());

  // 5. TEAM
  children.push(h1("5. 팀"));
  children.push(div());
  children.push(h3("5.1 창업팀"));
  f1.shareholders.forEach(s=>{
    children.push(rbl([{text:`${s.name} (${s.role}, ${s.share_pct}%): `,bold:true},{text:s.name==="김동찬"?"KAIST MBA, 중국 인민대학교 법학, 공인중개사, 저서 5권, 만인의꿈 EXIT 경험, 부동찬TV 2만 구독자, 리바운드 그룹(4개 법인) CEO":"[주요 경력 입력]"}]));
  });
  children.push(sp());

  children.push(h3("5.2 리바운드 그룹 역량"));
  children.push(tbl(["자원","규모","활용 방안"],[
    ["중개센터","서울 7개구 11개","수료생 매물 매칭, 중개사 교육 대상"],
    ["운영지점","5개(서울역/수색/종로/충무로/역삼)","현장 실습, 인턴, 견학 프로그램"],
    ["소속 중개사","35명","교육 대상 + 강사 풀"],
    ["유튜브","부동찬TV 2만 구독자","무료 콘텐츠 → 유료 전환 퍼널"],
    ["출판","저서 5권","교재 활용 + 브랜드 신뢰도"],
  ],[2000,2600,4760]));

  children.push(pb());

  // 6. FINANCIALS
  children.push(h1("6. 재무 추정"));
  children.push(div());
  children.push(disc());
  children.push(sp());

  children.push(h3("6.1 3개년 매출/영업이익 (3시나리오)"));
  children.push(tbl(
    ["시나리오","","Year 1","Year 2","Year 3"],
    [
      ["보수적","매출",fmtM(cons[0].total_revenue),fmtM(cons[1].total_revenue),fmtM(cons[2].total_revenue)],
      ["","영업이익",fmtM(cons[0].operating_income),fmtM(cons[1].operating_income),fmtM(cons[2].operating_income)],
      ["기본","매출",fmtM(base[0].total_revenue),fmtM(base[1].total_revenue),fmtM(base[2].total_revenue)],
      ["","영업이익",fmtM(base[0].operating_income),fmtM(base[1].operating_income),fmtM(base[2].operating_income)],
      ["낙관","매출",fmtM(opti[0].total_revenue),fmtM(opti[1].total_revenue),fmtM(opti[2].total_revenue)],
      ["","영업이익",fmtM(opti[0].operating_income),fmtM(opti[1].operating_income),fmtM(opti[2].operating_income)],
    ],
    [1400,1200,2200,2200,2360]
  ));
  children.push(sp());

  children.push(h3("6.2 기본 시나리오 상세"));
  children.push(tbl(["항목","Year 1","Year 2","Year 3"],[
    ["B2C 수강생 수",fmt(base[0].students)+"명",fmt(base[1].students)+"명",fmt(base[2].students)+"명"],
    ["B2C 매출",fmtM(base[0].b2c_revenue),fmtM(base[1].b2c_revenue),fmtM(base[2].b2c_revenue)],
    ["B2B 계약 건수",base[0].b2b_count+"건",base[1].b2b_count+"건",base[2].b2b_count+"건"],
    ["B2B 매출",fmtM(base[0].b2b_revenue),fmtM(base[1].b2b_revenue),fmtM(base[2].b2b_revenue)],
    ["총 매출",fmtM(base[0].total_revenue),fmtM(base[1].total_revenue),fmtM(base[2].total_revenue)],
    ["총 비용",fmtM(base[0].total_cost),fmtM(base[1].total_cost),fmtM(base[2].total_cost)],
    ["영업이익",fmtM(base[0].operating_income),fmtM(base[1].operating_income),fmtM(base[2].operating_income)],
    ["영업이익률",base[0].margin_pct+"%",base[1].margin_pct+"%",base[2].margin_pct+"%"],
    ["그룹 시너지 전환 수강생",base[0].synergy_students+"명",base[1].synergy_students+"명",base[2].synergy_students+"명"],
    ["그룹 시너지 추천 수익",fmtM(base[0].synergy_revenue),fmtM(base[1].synergy_revenue),fmtM(base[2].synergy_revenue)],
  ],[2400,2200,2200,2560]));
  children.push(sp());

  children.push(h3("6.3 비용 구조 (Year 1)"));
  const c1 = fin.costs.y1;
  const totalCost = Object.values(c1).reduce((a,b)=>a+b,0);
  children.push(tbl(["비용 항목","Year 1","비율"],[
    ["인건비 (대표+직원 2명+프리랜서 강사)",fmtM(c1.personnel),Math.round(c1.personnel/totalCost*100)+"%"],
    ["플랫폼 운영비",fmtM(c1.platform),Math.round(c1.platform/totalCost*100)+"%"],
    ["마케팅비",fmtM(c1.marketing),Math.round(c1.marketing/totalCost*100)+"%"],
    ["사무실 임차료",fmtM(c1.office),Math.round(c1.office/totalCost*100)+"%"],
    ["콘텐츠 제작비",fmtM(c1.content),Math.round(c1.content/totalCost*100)+"%"],
    ["법률/세무/보험",fmtM(c1.legal_tax),Math.round(c1.legal_tax/totalCost*100)+"%"],
    ["기타",fmtM(c1.misc),Math.round(c1.misc/totalCost*100)+"%"],
    ["합계",fmtM(totalCost),"100%"],
  ],[4000,2400,2960]));

  children.push(pb());

  // 7. REVENUE SPLIT + GO-TO-MARKET
  children.push(h1("7. 수익 배분 및 Go-to-Market 전략"));
  children.push(div());
  children.push(h3("7.1 70/30 수익 배분"));
  children.push(p("주주간계약서(SHA)에 따라 운영이익의 70%는 사업 재투자, 30%는 주주 배당으로 배분합니다. 초기 3년간은 성장 투자를 위해 배당을 유보할 수 있습니다."));
  children.push(sp());

  children.push(h3("7.2 Go-to-Market 전략"));
  children.push(rbl([{text:"Phase 1 (Month 1~3) — 유튜브 퍼널: ",bold:true},{text:"부동찬TV 2만 구독자 기반. 무료 콘텐츠(Zoom 강의, PDF 가이드) → 입문 과정 전환. 목표: 월 30명 유료 전환"}]));
  children.push(rbl([{text:"Phase 2 (Month 4~6) — 유료 광고 + SEO: ",bold:true},{text:"메타/구글 광고로 신규 유입 확대. 부동산 창업/호스텔 창업 키워드 SEO. 목표: CAC 5만원 이하"}]));
  children.push(rbl([{text:"Phase 3 (Month 7~12) — B2B + 프리미엄: ",bold:true},{text:"기업교육 패키지 출시. 1박 2일 부트캠프(연천 연계). 공인중개사 협회 제휴. 목표: B2B 월 1건"}]));
  children.push(rbl([{text:"Phase 4 (Year 2~) — 스케일업: ",bold:true},{text:"프랜차이즈 교육 모델 검토. 지방 확장. 해외(동남아) 시장 탐색"}]));

  children.push(pb());

  // 8. MILESTONES
  children.push(h1("8. 마일스톤"));
  children.push(div());
  children.push(tbl(["시점","마일스톤","성공 기준"],[
    ["Month 3","MVP 런칭 + 첫 유료 수강생","유료 수강생 50명 돌파"],
    ["Month 6","월 매출 1,000만원 달성","B2C 수강생 월 40명 + 완강률 50%"],
    ["Month 9","B2B 첫 계약 + 그룹 시너지 첫 전환","기업교육 1건 + PM 의뢰 3건"],
    ["Month 12","연 매출 1억원 + BEP 달성","흑자 전환 + NPS 50+"],
    ["Year 2","월 매출 3,000만원 + 투자 유치","Series Seed 완료 + 신규 카테고리 3개"],
    ["Year 3","연 매출 6억원 + EXIT 준비","ARR 6억+ + 데이터룸 준비 완료"],
  ],[1400,3400,4560]));

  children.push(pb());

  // 9. RISKS
  children.push(h1("9. 리스크 및 대응"));
  children.push(div());
  children.push(tbl(["리스크","영향도","발생확률","대응 방안"],[
    ["경쟁 심화 (대형 플랫폼 진입)","높음","중간","도메인 전문성 + 풀퍼널로 차별화. 대형 플랫폼은 니치 시장 진입 느림"],
    ["핵심 인력(대표) 의존도","높음","낮음","조직 브랜드 구축 + 강사 풀 다각화 + 콘텐츠 자산화"],
    ["수강생 확보 지연","중간","중간","부동찬TV 기존 팬덤 활용 + 무료 콘텐츠 리드 확보 + CAC 관리"],
    ["환불률 높음","중간","낮음","커리큘럼 품질 관리 + 수료율 KPI + 만족 보증제"],
    ["3인 주주 의견 불일치","중간","중간","SHA 교착상태 해소 절차 + 분기 주주 미팅 정례화"],
    ["부동산 시장 침체","낮음","중간","교육은 경기 역행적 — 침체기에 오히려 교육 수요 증가 경향"],
  ],[2400,1000,1000,4960]));

  // END
  children.push(sp(),sp(),div());
  children.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:400},children:[new TextRun({text:"— End of Business Plan —",font:"Arial",size:20,color:MID,italic:true})]}));
  children.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:60},children:[new TextRun({text:`${f1.company_name} | ${TODAY}`,font:"Arial",size:16,color:ORANGE})]}));

  const doc = new Document({
    styles:{default:{document:{run:{font:"Arial",size:20}}},paragraphStyles:[
      {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:32,bold:true,font:"Arial"},paragraph:{spacing:{before:400,after:200},outlineLevel:0}},
      {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:26,bold:true,font:"Arial"},paragraph:{spacing:{before:300,after:150},outlineLevel:1}},
      {id:"Heading3",name:"Heading 3",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:22,bold:true,font:"Arial"},paragraph:{spacing:{before:200,after:100},outlineLevel:2}},
    ]},
    numbering:{config:[{reference:"bullets",levels:[{level:0,format:LevelFormat.BULLET,text:"\u2022",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:360}}}}]}]},
    sections:[{
      properties:{page:{size:{width:12240,height:15840},margin:{top:1440,right:1440,bottom:1440,left:1440}}},
      headers:{default:new Header({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:"REBOUND-EDU  |  ",font:"Arial",size:14,color:ORANGE,bold:true}),new TextRun({text:"사업계획서",font:"Arial",size:14,color:MID})]})]})},
      footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"CONFIDENTIAL | "+DISC,font:"Arial",size:10,color:MID})]})]})},
      children,
    }],
  });

  const buf = await Packer.toBuffer(doc);
  const fp = path.join(OUT, "01_사업계획서_리바운드에듀.docx");
  fs.writeFileSync(fp, buf);
  fs.copyFileSync(fp, path.join(DR, "01_사업계획서_리바운드에듀.docx"));
  return fp;
}

// ============================================================
// GENERATE FINANCIAL MODEL (simplified JSON — for Excel conversion)
// ============================================================
function generateFinancialModel() {
  console.log("  [2/4] 재무추정 모델 생성 중...");

  const model = {
    _meta: { source: "F2_사업계획서_에이전트", generated: TODAY, note: "이 파일을 openpyxl로 변환하여 XLSX 생성 가능" },
    scenarios: {},
    costs: fin.costs,
    assumptions: {
      avg_price_note: "B2C 수강생 평균 결제 단가 (무료 제외)",
      b2b_avg_note: "기업교육 1건당 평균 계약액",
      synergy_rate: "수료생 중 그룹 서비스(PM/중개) 전환 비율 15%",
      synergy_referral_fee: "그룹 서비스 매출의 10%를 추천 수수료로 에듀가 수령",
      cost_growth: "Y2는 Y1 대비 1.6배, Y3는 2.2배 (인력 확충 + 마케팅 확대)",
    },
  };

  for (const [key, sc] of Object.entries(fin.scenarios)) {
    model.scenarios[key] = { label: sc.label, years: calcScenario(sc) };
  }

  // BEP calculation (base scenario)
  const base = calcScenario(fin.scenarios.base);
  const monthlyFixedCost = base[0].total_cost / 12;
  const avgRevenuePerStudent = fin.scenarios.base.avg_price;
  const bepStudentsPerMonth = Math.ceil(monthlyFixedCost / avgRevenuePerStudent);
  model.break_even = {
    monthly_fixed_cost: monthlyFixedCost,
    avg_revenue_per_student: avgRevenuePerStudent,
    bep_students_per_month: bepStudentsPerMonth,
    note: `월 고정비 ${fmtM(monthlyFixedCost)} ÷ 수강생당 ${fmt(avgRevenuePerStudent)}원 = 월 ${bepStudentsPerMonth}명 필요`
  };

  const fp = path.join(OUT, "02_재무추정모델.json");
  fs.writeFileSync(fp, JSON.stringify(model, null, 2), "utf8");
  fs.copyFileSync(fp, path.join(DR, "02_재무추정모델.json"));
  return fp;
}

// ============================================================
// GENERATE COMPETITOR ANALYSIS (simplified)
// ============================================================
function generateCompetitorAnalysis() {
  console.log("  [3/4] 경쟁사 분석표 생성 중...");

  let md = `# 경쟁사 분석표 — ${f1.company_name}\n\n`;
  md += `> 생성일: ${TODAY}\n\n`;
  md += `## 경쟁사 비교 매트릭스\n\n`;
  md += `| 항목 | ${comp.competitors.map(c=>c.name).join(" | ")} | **리바운드에듀** |\n`;
  md += `|------|${comp.competitors.map(()=>"------").join("|")}|------|\n`;
  md += `| 카테고리 | ${comp.competitors.map(c=>c.category).join(" | ")} | **부동산·공간사업 창업 특화** |\n`;
  md += `| 설립년도 | ${comp.competitors.map(c=>c.founded).join(" | ")} | **2026** |\n`;
  md += `| 가격대 | ${comp.competitors.map(c=>c.pricing).join(" | ")} | **무료~300만원** |\n`;
  md += `| 부동산 콘텐츠 | ${comp.competitors.map(c=>c.real_estate_content).join(" | ")} | **핵심 (실전 기반)** |\n`;
  md += `| 실전 인프라 | ${comp.competitors.map(()=>"없음").join(" | ")} | **11센터+5지점** |\n`;
  md += `| 풀퍼널 연계 | ${comp.competitors.map(()=>"없음").join(" | ")} | **교육→PM→중개→운영** |\n\n`;

  md += `## 핵심 경쟁우위 (Moat)\n\n`;
  comp.competitive_advantage.moat_factors.forEach(f => {
    md += `### ${f.factor} [방어력: ${f.defensibility}]\n${f.description}\n\n`;
  });

  const fp = path.join(OUT, "03_경쟁사분석표.md");
  fs.writeFileSync(fp, md, "utf8");
  return fp;
}

// ============================================================
// GENERATE HANDOFF DATA
// ============================================================
function generateHandoff() {
  console.log("  [4/4] F3/G1 전달 데이터 생성 중...");

  const base = calcScenario(fin.scenarios.base);
  
  const f2_to_f3 = {
    _meta: { source: "F2_사업계획서_에이전트", generated: TODAY, target: "F3_초기자금_에이전트" },
    company: f1.company_name,
    capital: f1.capital,
    year1_revenue_estimate: { conservative: calcScenario(fin.scenarios.conservative)[0].total_revenue, base: base[0].total_revenue, optimistic: calcScenario(fin.scenarios.optimistic)[0].total_revenue },
    year1_cost_estimate: base[0].total_cost,
    funding_needed: Math.max(0, base[0].total_cost - base[0].total_revenue),
    break_even_students_per_month: Math.ceil(base[0].total_cost / 12 / fin.scenarios.base.avg_price),
    business_purposes: f1.business_purposes,
    team_profile: { ceo: "KAIST MBA, 공인중개사, 만인의꿈 EXIT, 저서 5권", shareholders: f1.shareholders },
    support_program_keywords: ["예비창업패키지", "초기창업패키지", "사회적기업", "EdTech", "교육서비스", "소셜벤처"],
  };

  const f2_to_g1 = {
    _meta: { source: "F2_사업계획서_에이전트", generated: TODAY, target: "G1_투자유치_에이전트" },
    company: f1.company_name,
    financials_3yr: {
      conservative: calcScenario(fin.scenarios.conservative),
      base: base,
      optimistic: calcScenario(fin.scenarios.optimistic),
    },
    market: { tam: mkt.market.edtech_korea.tam, sam: mkt.market.edtech_korea.sam, som: mkt.market.edtech_korea.som, cagr: mkt.market.edtech_korea.cagr_pct },
    moat_factors: comp.competitive_advantage.moat_factors.map(f => f.factor),
    team: f1.shareholders,
    group_synergy: fin.group_synergy,
    revenue_split: f1.revenue_split,
  };

  fs.writeFileSync(path.join(DATA, "f2_to_f3.json"), JSON.stringify(f2_to_f3, null, 2), "utf8");
  fs.writeFileSync(path.join(DATA, "f2_to_g1.json"), JSON.stringify(f2_to_g1, null, 2), "utf8");
  return [path.join(DATA, "f2_to_f3.json"), path.join(DATA, "f2_to_g1.json")];
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log("\n📊 F2 사업계획서 에이전트 — 문서 생성 시작\n");
  console.log(`  회사명: ${f1.company_name}`);
  console.log(`  F1 데이터: data/f1_to_f2.json ✅`);
  console.log(`  시장 데이터: data/market_research.json ✅`);
  console.log(`  경쟁사 데이터: data/competitors.json ✅`);
  console.log(`  생성일: ${TODAY}\n`);

  const results = [];
  results.push(await generateBusinessPlan());
  results.push(generateFinancialModel());
  results.push(generateCompetitorAnalysis());
  const hf = generateHandoff();
  results.push(...hf);

  console.log("\n✅ 생성 완료! 산출물 목록:\n");
  results.forEach((fp, i) => {
    const size = fs.statSync(fp).size;
    console.log(`  ${i + 1}. ${path.basename(fp)} (${(size / 1024).toFixed(1)}KB)`);
  });

  // Summary
  const base = calcScenario(fin.scenarios.base);
  console.log("\n📈 기본 시나리오 요약:");
  console.log(`  Year 1: 수강생 ${base[0].students}명, 매출 ${fmtM(base[0].total_revenue)}, 영업이익 ${fmtM(base[0].operating_income)} (${base[0].margin_pct}%)`);
  console.log(`  Year 2: 수강생 ${base[1].students}명, 매출 ${fmtM(base[1].total_revenue)}, 영업이익 ${fmtM(base[1].operating_income)} (${base[1].margin_pct}%)`);
  console.log(`  Year 3: 수강생 ${base[2].students}명, 매출 ${fmtM(base[2].total_revenue)}, 영업이익 ${fmtM(base[2].operating_income)} (${base[2].margin_pct}%)`);
  console.log(`  BEP: 월 ${Math.ceil(base[0].total_cost / 12 / fin.scenarios.base.avg_price)}명 수강생 확보 시 손익분기`);

  console.log("\n🔗 다음 단계:");
  console.log("  → data/f2_to_f3.json → F3 초기자금 에이전트 (지원사업 매칭 + 캐시플로우)");
  console.log("  → data/f2_to_g1.json → G1 투자유치 에이전트 (IR덱 + 밸류에이션)");
  console.log("  → 사업계획서는 파트너/투자자 미팅 전 팀 내부 검토 필요\n");
}

main().catch(err => { console.error("❌ 에러:", err); process.exit(1); });
