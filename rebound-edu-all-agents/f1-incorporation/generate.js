#!/usr/bin/env node
/**
 * F1 법인설립 에이전트 — 문서 생성 스크립트
 * 
 * 사용법: node generate.js
 * 
 * company_info.json 데이터를 기반으로 다음 문서를 자동 생성합니다:
 * 1. 정관 (Articles of Incorporation) — DOCX
 * 2. 주주간계약서 (SHA) — DOCX
 * 3. 발기인 총회 의사록 — DOCX
 * 4. 등기 체크리스트 — Markdown
 * 5. 지배구조도 — HTML (PDF 변환용)
 * 6. F2/F4 전달 데이터 — JSON
 */

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageBreak
} = require("docx");

// ============================================================
// CONFIG
// ============================================================
const ORANGE = "FF4500";
const BLACK = "000000";
const DARK = "333333";
const MID = "666666";
const LIGHT = "F5F5F5";

const OUTPUT_DIR = path.join(__dirname, "outputs");
const DATA_DIR = path.join(__dirname, "data");
const DATAROOM_DIR = path.join(OUTPUT_DIR, "dataroom", "legal");

// Ensure output directories
[OUTPUT_DIR, DATAROOM_DIR, path.join(OUTPUT_DIR, "dataroom")].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Load company data
const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "company_info.json"), "utf8"));
const co = data.company;
const sh = data.shareholders;
const st = data.special_terms;

const TODAY = new Date().toISOString().split("T")[0];

// ============================================================
// HELPERS
// ============================================================
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cm = { top: 80, bottom: 80, left: 120, right: 120 };

const DISCLAIMER = "\u26A0\uFE0F \uBCF8 \uBB38\uC11C\uB294 AI\uAC00 \uC0DD\uC131\uD55C \uCD08\uC548\uC785\uB2C8\uB2E4. \uBC95\uC801 \uD6A8\uB825\uC744 \uC704\uD574 \uBCC0\uD638\uC0AC/\uBC95\uBB34\uC0AC\uC758 \uCD5C\uC885 \uAC80\uD1A0\uB97C \uAD8C\uC7A5\uD569\uB2C8\uB2E4.";

function h1(t) { return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, children: [new TextRun({ text: t, font: "Arial", size: 30, bold: true, color: BLACK })] }); }
function h2(t) { return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 140 }, children: [new TextRun({ text: t, font: "Arial", size: 24, bold: true, color: DARK })] }); }
function h3(t) { return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 }, children: [new TextRun({ text: t, font: "Arial", size: 22, bold: true, color: DARK })] }); }
function p(t, o = {}) { return new Paragraph({ spacing: { after: 100, ...(o.spacing || {}) }, indent: o.indent, children: [new TextRun({ text: t, font: "Arial", size: 20, color: o.color || DARK, ...o })] }); }
function rp(runs, o = {}) { return new Paragraph({ spacing: { after: 100 }, ...o, children: runs.map(r => new TextRun({ font: "Arial", size: 20, color: DARK, ...r })) }); }
function sp() { return new Paragraph({ spacing: { after: 60 }, children: [] }); }
function disclaimer() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    shading: { fill: "FFF3E0", type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: ORANGE, space: 8 } },
    indent: { left: 240, right: 240 },
    children: [new TextRun({ text: DISCLAIMER, font: "Arial", size: 18, color: "BF360C", italic: true })],
  });
}

function tbl(headers, rows, cw) {
  const tw = cw.reduce((a, b) => a + b, 0);
  const hr = new TableRow({ tableHeader: true, children: headers.map((h, i) => new TableCell({ borders, width: { size: cw[i], type: WidthType.DXA }, shading: { fill: "2D2D2D", type: ShadingType.CLEAR }, margins: cm, children: [new Paragraph({ children: [new TextRun({ text: h, font: "Arial", size: 18, bold: true, color: "FFFFFF" })] })] })) });
  const dr = rows.map((row, ri) => new TableRow({ children: row.map((c, i) => new TableCell({ borders, width: { size: cw[i], type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? "FFFFFF" : "F8F8F8", type: ShadingType.CLEAR }, margins: cm, children: [new Paragraph({ children: [new TextRun({ text: String(c), font: "Arial", size: 18, color: DARK })] })] })) }));
  return new Table({ width: { size: tw, type: WidthType.DXA }, columnWidths: cw, rows: [hr, ...dr] });
}

function makeHeader(title) {
  return new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
    new TextRun({ text: "REBOUND-EDU  |  ", font: "Arial", size: 14, color: ORANGE, bold: true }),
    new TextRun({ text: title, font: "Arial", size: 14, color: MID }),
  ] })] });
}

function makeFooter() {
  return new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: DISCLAIMER, font: "Arial", size: 12, color: MID }),
  ] })] });
}

function articleParagraph(num, title, content) {
  const children = [];
  children.push(new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text: `제${num}조 (${title})`, font: "Arial", size: 20, bold: true, color: DARK })],
  }));
  if (Array.isArray(content)) {
    content.forEach((line, idx) => {
      const prefix = content.length > 1 ? `${idx === 0 ? "\u2460" : idx === 1 ? "\u2461" : idx === 2 ? "\u2462" : idx === 3 ? "\u2463" : idx === 4 ? "\u2464" : "\u2465"} ` : "";
      children.push(new Paragraph({
        spacing: { after: 60 },
        indent: { left: 240 },
        children: [new TextRun({ text: prefix + line, font: "Arial", size: 20, color: DARK })],
      }));
    });
  } else {
    children.push(new Paragraph({
      spacing: { after: 60 },
      indent: { left: 240 },
      children: [new TextRun({ text: content, font: "Arial", size: 20, color: DARK })],
    }));
  }
  return children;
}

// ============================================================
// 1. GENERATE 정관 (Articles of Incorporation)
// ============================================================
async function generateArticles() {
  console.log("  [1/6] 정관 생성 중...");

  const shares_authorized = co.capital.shares_total * 4;
  const children = [];

  // Title
  children.push(sp(), sp());
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "정     관", font: "Arial", size: 40, bold: true, color: BLACK })] }));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: co.name_kr, font: "Arial", size: 28, color: ORANGE })] }));
  children.push(disclaimer());
  children.push(sp());

  // 제1장 총칙
  children.push(h1("제1장  총칙"));
  children.push(...articleParagraph(1, "상호", `본 회사는 ${co.name_kr}(이하 "회사")라 하고, 영문으로는 ${co.name_en}라 표기한다.`));

  // 제2조 목적
  const purposes = co.business_purposes.map((bp, i) => `${i + 1}. ${bp}`).join("\n");
  children.push(new Paragraph({ spacing: { before: 200, after: 80 }, children: [new TextRun({ text: "제2조 (목적)", font: "Arial", size: 20, bold: true, color: DARK })] }));
  children.push(p("회사는 다음의 사업을 영위함을 목적으로 한다.", { indent: { left: 240 } }));
  co.business_purposes.forEach((bp, i) => {
    children.push(p(`${i + 1}. ${bp}`, { indent: { left: 480 } }));
  });

  children.push(...articleParagraph(3, "본점의 소재지", `회사의 본점은 ${co.headquarters}에 둔다.`));
  children.push(...articleParagraph(4, "공고방법", "회사의 공고는 회사의 인터넷 홈페이지(https://edu.rebound.co.kr)에 게재한다. 다만, 전산장애 또는 그 밖의 부득이한 사유로 회사의 인터넷 홈페이지에 공고를 할 수 없는 때에는 서울특별시에서 발행되는 일간 매일경제신문에 게재한다."));
  children.push(...articleParagraph(5, "회사가 발행할 주식의 총수", `회사가 발행할 주식의 총수는 ${shares_authorized.toLocaleString()}주로 한다.`));
  children.push(...articleParagraph(6, "1주의 금액", `회사가 발행하는 주식 1주의 금액은 금 ${co.capital.par_value.toLocaleString()}원으로 한다.`));
  children.push(...articleParagraph(7, "설립 시에 발행하는 주식의 총수", `회사가 설립 시에 발행하는 주식의 총수는 ${co.capital.shares_total.toLocaleString()}주로 한다.`));
  children.push(...articleParagraph(8, "주식의 종류", ["회사가 발행하는 주식은 보통주식과 종류주식으로 한다.", "회사가 발행하는 종류주식은 이익배당에 관한 우선주식, 의결권 배제 또는 제한에 관한 주식, 상환주식, 전환주식 및 이들의 전부 또는 일부를 혼합한 주식으로 한다."]));

  // 제2장 주식
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(h1("제2장  주식"));
  children.push(...articleParagraph(9, "주식의 양도제한", [
    "주주가 주식을 양도하고자 할 때에는 이사회의 승인을 받아야 한다. (상법 제335조 제1항 단서)",
    "제1항의 승인을 위한 이사회 결의는 이사 전원의 동의를 요한다.",
    "주주간계약서(SHA)에 정한 우선매수권(Right of First Refusal) 절차를 선행하여야 한다.",
  ]));
  children.push(...articleParagraph(10, "명의개서대리인", ["회사는 주식의 명의개서대리인을 둘 수 있다.", "명의개서대리인 및 그 사무취급장소와 대행업무의 범위는 이사회의 결의로 정한다."]));

  // 제3장~제6장 (간략)
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(h1("제3장  주주총회"));
  children.push(...articleParagraph(11, "소집시기", "회사의 정기주주총회는 매 사업연도 종료 후 3월 이내에 소집하고, 임시주주총회는 필요에 따라 수시로 소집한다."));
  children.push(...articleParagraph(12, "소집권자", ["주주총회는 법령에 다른 규정이 있는 경우를 제외하고는 이사회의 결의에 따라 대표이사가 소집한다.", "대표이사의 유고 시에는 이사회에서 정한 순서에 따라 다른 이사가 이를 소집한다."]));
  children.push(...articleParagraph(13, "의결방법", ["주주총회의 결의는 법령에 다른 정함이 있는 경우를 제외하고는 출석한 주주의 의결권의 과반수와 발행주식총수의 4분의 1 이상의 수로써 한다.", "정관 변경, 영업 양도, 합병, 분할, 해산, 자본금 감소는 출석한 주주의 의결권의 3분의 2 이상의 수와 발행주식총수의 3분의 1 이상의 수로써 한다(특별결의)."]));

  children.push(h1("제4장  이사·이사회"));
  children.push(...articleParagraph(14, "이사의 수", "회사의 이사는 3명 이상 7명 이내로 한다."));
  children.push(...articleParagraph(15, "이사의 선임과 임기", ["이사는 주주총회에서 선임한다.", "이사의 임기는 3년으로 한다."]));
  children.push(...articleParagraph(16, "대표이사", ["회사는 이사회의 결의로 대표이사 1명을 선임한다.", "대표이사는 회사의 업무를 총괄하고, 회사를 대표한다."]));
  children.push(...articleParagraph(17, "이사회", ["이사회는 이사로 구성하고, 회사의 업무에 관한 중요사항을 결의한다.", "이사회의 결의는 이사 과반수의 출석과 출석이사의 과반수로 한다."]));

  children.push(h1("제5장  감사"));
  children.push(...articleParagraph(18, "감사의 수와 선임", ["회사의 감사는 1명 이상 3명 이내로 한다.", "감사는 주주총회에서 선임하며, 임기는 취임 후 3년 내의 최종 결산기에 관한 정기주주총회 종결 시까지로 한다."]));

  // 제6장 계산
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(h1("제6장  계산"));
  children.push(...articleParagraph(19, "사업연도", `회사의 사업연도는 매년 ${co.fiscal_year.start}부터 ${co.fiscal_year.end}까지로 한다.`));
  children.push(...articleParagraph(20, "이익배당", [
    "이익의 배당은 금전과 주식으로 할 수 있다.",
    "배당금의 지급청구권은 5년간 이를 행사하지 아니하면 소멸시효가 완성한다.",
    "회사의 이익배당 정책은 주주간계약서(SHA)에서 정한 바에 따라 운영이익의 30%를 배당 재원으로 한다.",
  ]));

  // 제7장 교육업 특화
  children.push(h1("제7장  교육업 특화 조항"));
  children.push(...articleParagraph(21, "수강료 수납 및 환불", [
    '회사의 수강료 수납 및 환불 정책은 「소비자기본법」, 「전자상거래 등에서의 소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」을 준수한다.',
    "수강료 환불 기준은 별도의 이용약관 및 환불규정에서 정한다.",
    "선수금(수강료 선납분)의 회계 처리는 기업회계기준에 따라 수강 기간에 걸쳐 안분하여 수익으로 인식한다.",
  ]));
  children.push(...articleParagraph(22, "교육 콘텐츠 저작권", [
    "회사가 자체 제작한 교육 콘텐츠(강의 영상, 교재, 실습자료 등)의 저작권은 회사에 귀속한다.",
    "외부 강사가 회사와의 계약에 따라 제작한 교육 콘텐츠의 저작권 귀속은 해당 업무위탁계약에서 정한 바에 따른다.",
    "수강생이 작성한 과제, 프로젝트 등의 저작권은 수강생에게 귀속하되, 회사는 교육 목적 범위 내에서 이를 활용할 수 있다.",
  ]));
  children.push(...articleParagraph(23, "개인정보 보호", [
    '회사는 수강생의 개인정보를 「개인정보 보호법」에 따라 수집·이용·관리한다.',
    "수강생 개인정보의 제3자 제공은 법령에 의하거나 수강생의 동의가 있는 경우에만 허용한다.",
  ]));

  // 부칙
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(h1("부칙"));
  children.push(...articleParagraph(24, "발기인의 성명 및 인수주식", "발기인의 성명, 주민등록번호 및 인수주식 수는 다음과 같다."));
  children.push(tbl(
    ["성명", "주민등록번호", "주소", "인수주식(주)", "지분율(%)"],
    sh.map(s => [s.name, s.resident_id, s.address, s.shares.toLocaleString(), String(s.share_pct)]),
    [1800, 2200, 2400, 1500, 1200]
  ));
  children.push(sp());
  children.push(...articleParagraph(25, "시행일", "이 정관은 회사 설립등기일부터 시행한다."));
  children.push(sp(), sp());
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: TODAY, font: "Arial", size: 20, color: DARK })] }));
  children.push(sp());
  sh.forEach(s => {
    children.push(new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 60 }, children: [new TextRun({ text: `발기인  ${s.name}  (인)`, font: "Arial", size: 20, color: DARK })] }));
  });

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 20 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 30, bold: true, font: "Arial" }, paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, font: "Arial" }, paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
      ],
    },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: makeHeader("정관") },
      footers: { default: makeFooter() },
      children,
    }],
  });

  const buf = await Packer.toBuffer(doc);
  const fp = path.join(OUTPUT_DIR, "01_정관_리바운드에듀.docx");
  fs.writeFileSync(fp, buf);
  fs.copyFileSync(fp, path.join(DATAROOM_DIR, "01_정관_리바운드에듀.docx"));
  return fp;
}

// ============================================================
// 2. GENERATE SHA
// ============================================================
async function generateSHA() {
  console.log("  [2/6] 주주간계약서(SHA) 생성 중...");

  const children = [];
  children.push(sp(), sp());
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "주주간계약서", font: "Arial", size: 40, bold: true, color: BLACK })] }));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: co.name_kr, font: "Arial", size: 28, color: ORANGE })] }));
  children.push(disclaimer());
  children.push(sp());

  // 당사자
  children.push(h2("당사자"));
  const labels = ["A", "B", "C"];
  sh.forEach((s, i) => {
    children.push(rp([
      { text: `주주${labels[i]}: `, bold: true },
      { text: `${s.name} | 지분 ${s.shares.toLocaleString()}주 (${s.share_pct}%) | ${s.role}` },
    ]));
  });
  children.push(sp());

  // Key articles
  const articles = [
    ["1", "계약의 목적", "본 계약은 대상회사의 설립, 운영 및 경영에 관한 주주 간의 권리·의무를 규정하고, 주주 간의 이해관계를 조정하며, 대상회사의 건전한 발전을 도모하는 것을 목적으로 한다."],
    ["2", "회사 운영의 기본 원칙", `대상회사는 리바운드 그룹의 교육 사업 총괄 법인으로서, 기존 그룹 법인과 상호 협력하여 시너지를 창출한다. 기존 법인과의 거래는 정상거래(Arm's Length) 원칙에 따른다.`],
    ["3", "지분 구조", `설립 시 발행주식총수 ${co.capital.shares_total.toLocaleString()}주, 각 주주 균등 보유.`],
    ["4", "경영진 구성", `대표이사: ${sh[0].name}. 이사회: 주주 3인 전원. 임기 3년.`],
  ];

  articles.forEach(([num, title, content]) => {
    children.push(...articleParagraph(num, title, content));
  });

  // 제5조 의사결정 (만장일치)
  children.push(new Paragraph({ spacing: { before: 200, after: 80 }, children: [new TextRun({ text: "제5조 (의사결정 구조)", font: "Arial", size: 20, bold: true, color: DARK })] }));
  children.push(p("다음 각 호의 사항은 주주 전원의 서면 동의를 요한다 (만장일치 사항):", { indent: { left: 240 } }));
  const unanimousItems = [
    "정관의 변경", "신주 발행 및 자본금 변동", "연간 사업계획 및 예산 승인",
    "대표이사의 변경", "주요 자산(총자산의 30% 이상)의 처분 또는 취득",
    "회사의 합병, 분할, 해산", "주주 또는 특수관계인과의 거래",
    "차입금이 자본금의 200%를 초과하는 경우",
    "리바운드 그룹 기존 법인과의 신규 서비스 계약 체결"
  ];
  unanimousItems.forEach((item, i) => {
    children.push(p(`${i + 1}. ${item}`, { indent: { left: 480 } }));
  });

  // 제6조 이익배분
  children.push(...articleParagraph("6", "이익 배분", [
    `운영이익(영업이익 기준)의 ${data.revenue_split.reinvest_pct}%는 사업 재투자(사내유보)한다.`,
    `운영이익의 ${data.revenue_split.dividend_pct}%를 주주 배당 재원으로 하며, 지분율에 비례하여 배당한다.`,
    "최초 3개 사업연도까지는 사업 안정화를 위해 배당을 유보할 수 있다 (주주 전원 동의 필요).",
  ]));

  // 제7조 경업금지
  children.push(...articleParagraph("7", "경업금지", [
    `각 주주는 재임 기간 및 퇴출 후 ${st.non_compete.duration_years}년간, ${st.non_compete.geography}에서 "${st.non_compete.scope}" 분야 사업을 영위하지 아니한다.`,
    `예외: ${st.non_compete.exception}`,
    "위반 시 손해배상 및 부당이득 반환 의무.",
  ]));

  // 제8조 우선매수권
  children.push(...articleParagraph("8", "주식양도 제한 및 우선매수권 (ROFR)", [
    "주주가 주식을 제3자에게 양도하고자 하는 경우, 나머지 주주에게 우선매수권을 부여한다.",
    `양도 통지를 받은 날로부터 ${st.rofr.notice_days}일 이내에 동일 조건으로 매수 의사를 통지해야 한다.`,
    "기간 내 미행사 시, 양도 통지 조건 이상으로 제3자에게 양도 가능.",
  ]));

  // 제9조 Drag-along
  children.push(...articleParagraph("9", "동반매도 청구권 (Drag-Along)", [
    `지분율 합계 ${st.drag_along.threshold_pct}% 이상의 주주가 전체 주식 매도 결정 시, 나머지 주주에게 동일 조건 매도 의무 부여.`,
    "통지일로부터 30일 이내 응해야 함.",
    "동일한 1주당 가격 및 거래 조건 보장.",
  ]));

  // 제10조 Tag-along
  children.push(...articleParagraph("10", "동반매도 참여권 (Tag-Along)", [
    "1인 주주가 지분 매각 시, 나머지 주주도 동일 조건으로 참여할 권리.",
    "매도 통지 후 20일 이내 서면 행사.",
  ]));

  // 제11조 교착상태
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(...articleParagraph("11", "교착상태 해소", [
    `교착상태: 만장일치 사항에 대해 합의 불성립이 ${st.deadlock.escalation_days}일 이상 계속되는 경우.`,
    "1단계 — 내부 협의 (30일): 주주 전원 대면 회의.",
    `2단계 — 외부 중재 (30일): ${st.deadlock.method}에 중재 신청.`,
    "3단계 — Put/Call 옵션: 중재 실패 시, 반대 주주의 Put Option (공정가치 매도권) 부여.",
  ]));

  children.push(...articleParagraph("12", "비밀유지", "각 주주는 본 계약 및 경영 비밀정보를 제3자에게 누설하지 않으며, 계약 종료 후 3년간 존속한다."));
  children.push(...articleParagraph("13", "준거법 및 관할", "대한민국 법률 적용. 서울중앙지방법원을 제1심 관할법원으로 한다."));

  // 서명란
  children.push(sp(), sp());
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: TODAY, font: "Arial", size: 20, color: DARK })] }));
  children.push(sp());
  sh.forEach((s, i) => {
    children.push(new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 80 }, children: [new TextRun({ text: `주주${labels[i]}: ${s.name}  (서명/인)`, font: "Arial", size: 20, color: DARK })] }));
  });

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 20 } } } },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: makeHeader("주주간계약서 (SHA)") },
      footers: { default: makeFooter() },
      children,
    }],
  });

  const buf = await Packer.toBuffer(doc);
  const fp = path.join(OUTPUT_DIR, "02_주주간계약서_SHA.docx");
  fs.writeFileSync(fp, buf);
  fs.copyFileSync(fp, path.join(DATAROOM_DIR, "02_주주간계약서_SHA.docx"));
  return fp;
}

// ============================================================
// 3. GENERATE 발기인총회 의사록
// ============================================================
async function generateMinutes() {
  console.log("  [3/6] 발기인 총회 의사록 생성 중...");

  const children = [];
  children.push(sp());
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "발기인 총회 의사록", font: "Arial", size: 36, bold: true, color: BLACK })] }));
  children.push(disclaimer());
  children.push(sp());

  children.push(p(`1. 일시: ${TODAY} 오전 10시`));
  children.push(p(`2. 장소: ${co.headquarters}`));
  children.push(p(`3. 발기인 총수: ${sh.length}명`));
  children.push(p(`4. 출석 발기인: ${sh.length}명 (전원 출석)`));
  children.push(sp());
  children.push(p("위와 같이 발기인 전원이 출석하였으므로 의장 선출 없이 바로 의안 심의에 들어가다."));
  children.push(sp());

  children.push(h2("제1호 의안: 정관 승인의 건"));
  children.push(p("의장이 별첨 정관(안)을 낭독하고 그 승인을 구한 바, 전원 이의 없이 원안대로 승인가결하다."));
  children.push(sp());

  children.push(h2("제2호 의안: 이사 및 감사 선임의 건"));
  children.push(p("다음과 같이 이사 및 감사를 선임하기로 전원 이의 없이 승인가결하다."));
  sh.forEach(s => {
    children.push(p(`- ${s.role}: ${s.name}`, { indent: { left: 480 } }));
  });
  children.push(sp());

  children.push(h2("제3호 의안: 본점 소재지 결정의 건"));
  children.push(p(`회사의 본점을 ${co.headquarters}에 두기로 전원 이의 없이 승인가결하다.`));
  children.push(sp());

  children.push(h2("제4호 의안: 설립비용 결정의 건"));
  children.push(p("회사의 설립에 관한 비용으로 금 5,000,000원을 지출하기로 전원 이의 없이 승인가결하다."));
  children.push(sp());

  children.push(p("이상으로 의안 심의를 모두 마치고 의장이 폐회를 선언하다."));
  children.push(sp(), sp());
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: TODAY, font: "Arial", size: 20, color: DARK })] }));
  children.push(sp());
  sh.forEach(s => {
    children.push(new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 60 }, children: [new TextRun({ text: `발기인  ${s.name}  (인)`, font: "Arial", size: 20, color: DARK })] }));
  });

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 20 } } } },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: makeHeader("발기인 총회 의사록") },
      footers: { default: makeFooter() },
      children,
    }],
  });

  const buf = await Packer.toBuffer(doc);
  const fp = path.join(OUTPUT_DIR, "03_발기인총회_의사록.docx");
  fs.writeFileSync(fp, buf);
  fs.copyFileSync(fp, path.join(DATAROOM_DIR, "03_발기인총회_의사록.docx"));
  return fp;
}

// ============================================================
// 4. GENERATE 등기 체크리스트 (Markdown)
// ============================================================
function generateChecklist() {
  console.log("  [4/6] 등기 체크리스트 생성 중...");

  const taxBase = co.capital.total;
  const registrationTax = Math.round(taxBase * 0.004); // 등록면허세 0.4%
  const localEduTax = Math.round(registrationTax * 0.2); // 지방교육세 20%

  const md = `# 📋 법인 설립 등기 체크리스트 — ${co.name_kr}

> ⚠️ 본 체크리스트는 AI가 생성한 가이드입니다. 관할 법원 등기소별로 양식이 다를 수 있습니다.
> 생성일: ${TODAY}

---

## Phase A: 법인 설립 전 준비 (D-14 ~ D-7)

| # | 할일 | 담당 | 상태 | 비고 |
|---|------|------|------|------|
| A1 | 주주 3인 주민등록등본 발급 | 각 주주 | ☐ | 3개월 이내 발급분 |
| A2 | 주주 3인 인감증명서 발급 | 각 주주 | ☐ | 법인설립용 |
| A3 | 법인인감 도장 제작 | 대표이사 | ☐ | 법인명 새김, 약 3만원 |
| A4 | 본점 소재지 확보 | 대표이사 | ☐ | 임대차계약서 또는 전대차동의서 |
| A5 | 정관 최종 확정 | 전원 | ☐ | 변호사/법무사 검토 완료 |
| A6 | 주주간계약서(SHA) 서명 | 전원 | ☐ | 3통 작성, 각 1통 보관 |

## Phase B: 등기 서류 준비 (D-7 ~ D-3)

| # | 할일 | 담당 | 상태 | 비고 |
|---|------|------|------|------|
| B1 | 발기인 총회 의사록 작성·서명 | 전원 | ☐ | 정관승인, 이사선임, 본점결정 |
| B2 | 주식인수증 작성 | 각 주주 | ☐ | 주주별 인수 주식수 기재 |
| B3 | 취임승낙서 작성 | 이사/감사 | ☐ | 이사·감사 전원 |
| B4 | 법인인감신고서 작성 | 대표이사 | ☐ | 등기소 양식 |
| B5 | 주금납입보관증명서 발급 | 대표이사 | ☐ | 은행에서 발급 (자본금 입금 후) |
| B6 | 등록면허세 납부 | 대표이사 | ☐ | 금액: ${registrationTax.toLocaleString()}원 |
| B7 | 지방교육세 납부 | 대표이사 | ☐ | 금액: ${localEduTax.toLocaleString()}원 |

## Phase C: 설립등기 신청 (D-Day)

| # | 할일 | 담당 | 상태 | 비고 |
|---|------|------|------|------|
| C1 | 설립등기 신청서 작성 | 법무사/대표 | ☐ | 관할 등기소 제출 |
| C2 | 등기 서류 일체 제출 | 대표이사 | ☐ | A~B 서류 전체 |
| C3 | 등기 수수료 납부 | 대표이사 | ☐ | 약 6만원 (등기소 확인) |
| C4 | 등기 완료 확인 | 대표이사 | ☐ | 보통 3~7영업일 소요 |
| C5 | 등기부등본 발급 | 대표이사 | ☐ | 인터넷등기소에서 발급 가능 |

## Phase D: 설립 후 절차 (등기 완료 후 ~ 14일)

| # | 할일 | 담당 | 상태 | 비고 |
|---|------|------|------|------|
| D1 | 사업자등록 신청 | 대표이사 | ☐ | 관할 세무서 (등기 후 20일 이내) |
| D2 | 법인 통장 개설 | 대표이사 | ☐ | 사업자등록증 수령 후 |
| D3 | 4대보험 사업장 가입 | 대표이사 | ☐ | 국민연금/건강보험/고용보험/산재보험 |
| D4 | 통신판매업 신고 | 대표이사 | ☐ | 온라인 교육 서비스 → 구청 신고 |
| D5 | 법인카드 발급 | 대표이사 | ☐ | 법인 통장 개설 후 |
| D6 | 세무사 계약 | 대표이사 | ☐ | 기장료 약 월 10~20만원 |
| D7 | 도메인/웹사이트 법인명의 전환 | 대표이사 | ☐ | edu.rebound.co.kr |

---

## 💰 예상 비용 요약

| 항목 | 금액 | 비고 |
|------|------|------|
| 등록면허세 | ${registrationTax.toLocaleString()}원 | 자본금 × 0.4% |
| 지방교육세 | ${localEduTax.toLocaleString()}원 | 등록면허세 × 20% |
| 등기 수수료 | 약 60,000원 | 등기소 확인 |
| 법인인감 제작 | 약 30,000원 | |
| 법무사 수수료 (선택) | 300,000~500,000원 | 직접 진행 시 절약 가능 |
| **합계** | **약 ${(registrationTax + localEduTax + 60000 + 30000).toLocaleString()}원~** | 법무사 제외 |

---

## 📎 다음 단계 연계

- ✅ 사업자등록 완료 후 → **F4 MVP 에이전트** (PG사 연동에 사업자등록번호 필요)
- ✅ 법인 정보 확정 후 → **F2 사업계획서 에이전트** (법인명/자본금/주주구성 반영)
- ✅ 모든 서류 → **E2 데이터룸** (outputs/dataroom/legal/ 에 자동 저장됨)
`;

  const fp = path.join(OUTPUT_DIR, "04_등기_체크리스트.md");
  fs.writeFileSync(fp, md, "utf8");
  return fp;
}

// ============================================================
// 5. GENERATE 지배구조도 (HTML)
// ============================================================
function generateGovernanceChart() {
  console.log("  [5/6] 지배구조도 생성 중...");

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>리바운드 그룹 지배구조도</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Noto Sans KR', sans-serif; background: #fff; padding: 40px; }
  .title { text-align: center; font-size: 24px; font-weight: 700; margin-bottom: 8px; }
  .subtitle { text-align: center; font-size: 14px; color: #666; margin-bottom: 40px; }
  .disclaimer { text-align: center; font-size: 11px; color: #999; margin-bottom: 30px; padding: 8px; background: #FFF3E0; border-radius: 4px; }
  .ceo-box { width: 280px; margin: 0 auto 40px; background: #FF4500; color: #fff; border-radius: 12px; padding: 20px; text-align: center; }
  .ceo-box .name { font-size: 20px; font-weight: 700; }
  .ceo-box .role { font-size: 13px; opacity: 0.9; margin-top: 4px; }
  .ceo-box .detail { font-size: 11px; opacity: 0.8; margin-top: 8px; line-height: 1.5; }
  .connector { width: 2px; height: 30px; background: #333; margin: 0 auto; }
  .branch-line { width: 80%; max-width: 900px; height: 2px; background: #333; margin: 0 auto; }
  .entities { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin-top: 0; padding: 0 20px; }
  .entity { width: 170px; border: 2px solid #ddd; border-radius: 10px; padding: 14px 10px; text-align: center; position: relative; }
  .entity::before { content: ''; position: absolute; top: -16px; left: 50%; transform: translateX(-50%); width: 2px; height: 16px; background: #333; }
  .entity.new { border-color: #FF4500; background: #FFF8F5; }
  .entity .ename { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
  .entity .ebiz { font-size: 11px; color: #666; line-height: 1.4; }
  .entity .etag { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 10px; margin-top: 6px; }
  .entity .etag.existing { background: #E8E8E8; color: #555; }
  .entity .etag.newco { background: #FF4500; color: #fff; }
  .synergy { margin-top: 40px; padding: 20px; background: #F5F5F5; border-radius: 8px; max-width: 900px; margin-left: auto; margin-right: auto; }
  .synergy h3 { font-size: 14px; font-weight: 700; margin-bottom: 12px; }
  .synergy-item { font-size: 12px; color: #444; margin-bottom: 6px; padding-left: 16px; position: relative; }
  .synergy-item::before { content: '→'; position: absolute; left: 0; color: #FF4500; }
  .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #999; }
</style>
</head>
<body>
  <div class="title">리바운드 그룹 지배구조도</div>
  <div class="subtitle">대표이사: 김동찬 | 5개 법인 체계 | ${TODAY} 기준</div>
  <div class="disclaimer">${DISCLAIMER}</div>

  <div class="ceo-box">
    <div class="name">김동찬</div>
    <div class="role">대표이사 / 리바운드 그룹 총괄</div>
    <div class="detail">KAIST MBA | 공인중개사 | 저서 5권<br>만인의꿈 EXIT 경험 | 부동찬TV 2만 구독자</div>
  </div>

  <div class="connector"></div>
  <div class="branch-line"></div>

  <div class="entities">
    <div class="entity">
      <div class="ename">(주)부동찬</div>
      <div class="ebiz">PM / 컨설팅 사업<br>매입→펀딩→시공→입점→매각</div>
      <span class="etag existing">기존 법인</span>
    </div>
    <div class="entity">
      <div class="ename">(주)리바운드</div>
      <div class="ebiz">운영 / 교육 사업<br>호스텔·코워킹·스터디카페 5개 지점</div>
      <span class="etag existing">기존 법인</span>
    </div>
    <div class="entity">
      <div class="ename">(주)리바운드중개</div>
      <div class="ebiz">중개 사업 (강북권)<br>서울 7개구 11개 센터</div>
      <span class="etag existing">기존 법인</span>
    </div>
    <div class="entity">
      <div class="ename">(주)미스터홈즈중개</div>
      <div class="ebiz">중개 사업<br>소속 공인중개사 35명</div>
      <span class="etag existing">기존 법인</span>
    </div>
    <div class="entity new">
      <div class="ename">(주)리바운드에듀</div>
      <div class="ebiz">교육 플랫폼 운영<br>온라인/오프라인 교육 서비스</div>
      <span class="etag newco">신설 법인</span>
    </div>
  </div>

  <div class="synergy">
    <h3>그룹 시너지 흐름</h3>
    <div class="synergy-item">교육 수료생 → (주)부동찬 PM 컨설팅 의뢰</div>
    <div class="synergy-item">창업 상담 → (주)리바운드중개 / 미스터홈즈 매물 매칭</div>
    <div class="synergy-item">운영 교육 수료 → (주)리바운드 지점 인턴/견학</div>
    <div class="synergy-item">운영 노하우 → (주)리바운드에듀 교육 콘텐츠 제공</div>
    <div class="synergy-item">중개사 역량강화 → (주)리바운드에듀 전문 교육 과정</div>
  </div>

  <div class="footer">
    REBOUND GROUP | Confidential | Generated by F1 Agent | ${TODAY}
  </div>
</body>
</html>`;

  const fp = path.join(OUTPUT_DIR, "05_지배구조도.html");
  fs.writeFileSync(fp, html, "utf8");
  fs.copyFileSync(fp, path.join(DATAROOM_DIR, "05_지배구조도.html"));
  return fp;
}

// ============================================================
// 6. GENERATE F2/F4 전달 데이터
// ============================================================
function generateHandoff() {
  console.log("  [6/6] F2/F4 전달 데이터 생성 중...");

  const f1_to_f2 = {
    _meta: { source: "F1_법인설립_에이전트", generated: TODAY, target: "F2_사업계획서_에이전트" },
    company_name: co.name_kr,
    company_name_en: co.name_en,
    establishment_date: "[등기 완료일 입력]",
    capital: co.capital.total,
    shares_total: co.capital.shares_total,
    par_value: co.capital.par_value,
    shareholders: sh.map(s => ({ name: s.name, share_pct: s.share_pct, role: s.role })),
    business_purposes: co.business_purposes,
    revenue_split: data.revenue_split,
    group_entities: data.group_entities.map(e => ({ name: e.name, business: e.business, relationship: e.relationship })),
    headquarters: co.headquarters,
  };

  const f1_to_f4 = {
    _meta: { source: "F1_법인설립_에이전트", generated: TODAY, target: "F4_MVP구축_에이전트" },
    company_name: co.name_kr,
    business_registration_number: "[사업자등록번호 — 등록 완료 후 입력]",
    representative: { name: sh[0].name, role: sh[0].role },
    bank_account: "[법인 통장 계좌번호 — 개설 후 입력]",
    business_purposes: co.business_purposes,
    headquarters: co.headquarters,
    telecom_sales_registration: "[통신판매업 신고번호 — 신고 후 입력]",
  };

  fs.writeFileSync(path.join(DATA_DIR, "f1_to_f2.json"), JSON.stringify(f1_to_f2, null, 2), "utf8");
  fs.writeFileSync(path.join(DATA_DIR, "f1_to_f4.json"), JSON.stringify(f1_to_f4, null, 2), "utf8");

  return [path.join(DATA_DIR, "f1_to_f2.json"), path.join(DATA_DIR, "f1_to_f4.json")];
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log("\n🏢 F1 법인설립 에이전트 — 문서 생성 시작\n");
  console.log(`  회사명: ${co.name_kr}`);
  console.log(`  자본금: ${co.capital.total.toLocaleString()}원`);
  console.log(`  주주: ${sh.map(s => s.name).join(", ")}`);
  console.log(`  생성일: ${TODAY}\n`);

  const results = [];
  results.push(await generateArticles());
  results.push(await generateSHA());
  results.push(await generateMinutes());
  results.push(generateChecklist());
  results.push(generateGovernanceChart());
  const handoffs = generateHandoff();
  results.push(...handoffs);

  console.log("\n✅ 생성 완료! 산출물 목록:\n");
  results.forEach((fp, i) => {
    const size = fs.statSync(fp).size;
    console.log(`  ${i + 1}. ${path.basename(fp)} (${(size / 1024).toFixed(1)}KB)`);
  });

  console.log(`\n📁 출력 폴더: ${OUTPUT_DIR}`);
  console.log(`📁 데이터룸: ${DATAROOM_DIR}`);
  console.log("\n🔗 다음 단계:");
  console.log("  → data/f1_to_f2.json을 F2 에이전트에 전달하여 사업계획서 생성");
  console.log("  → 사업자등록 완료 후 data/f1_to_f4.json 업데이트 → F4 에이전트에 전달");
  console.log("  → 모든 DOCX 파일은 변호사/법무사 최종 검토 필요\n");
}

main().catch(err => {
  console.error("❌ 에러 발생:", err);
  process.exit(1);
});
