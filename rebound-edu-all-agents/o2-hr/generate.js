#!/usr/bin/env node
/**
 * O2 HR/조직 관리 에이전트
 * 산출물: 근로계약서 템플릿, 강사위탁계약서, 급여명세서 템플릿, 스톡옵션 설계서, 조직도
 */
const fs=require("fs"),path=require("path");
const OUT=path.join(__dirname,"outputs"),DATA=path.join(__dirname,"data");
[OUT].forEach(d=>{if(!fs.existsSync(d))fs.mkdirSync(d,{recursive:true});});
const co=JSON.parse(fs.readFileSync(path.join(DATA,"company_info.json"),"utf8"));
const TODAY=new Date().toISOString().split("T")[0];

console.log("\n\uD83D\uDC65 O2 HR/\uC870\uC9C1 \uAD00\uB9AC \uC5D0\uC774\uC804\uD2B8\n");

// 1. Employment Contract Template
console.log("  [1/5] \uADFC\uB85C\uACC4\uC57D\uC11C \uD15C\uD50C\uB9BF...");
const empContract=`# 근로계약서 템플릿 — ${co.company.name_kr}

> ⚠️ AI 생성 초안. 노무사/변호사 최종 검토 필수. | ${TODAY}

---

## 근로계약서

**사용자(갑)**: ${co.company.name_kr} (대표이사 ${co.shareholders[0].name})
**근로자(을)**: [성명]

### 제1조 (근로계약기간)
- [ ] 정규직 (기간의 정함이 없음)
- [ ] 계약직 (20__년 __월 __일 ~ 20__년 __월 __일)
- [ ] 수습기간: 입사일로부터 3개월

### 제2조 (근무장소 및 업무)
- 근무장소: ${co.company.headquarters}
- 담당업무: [직무명] / [업무 내용]
- 재택근무: 주 __일 가능 (팀 합의 시)

### 제3조 (근로시간)
- 소정근로시간: 주 40시간 (1일 8시간)
- 시업시간: 09:00 / 종업시간: 18:00 (휴게 12:00~13:00)
- 유연근무: 코어타임 10:00~16:00, 그 외 자율

### 제4조 (임금)
- 월 급여: 금 [________]원 (세전)
- 지급일: 매월 25일 (은행 휴업일인 경우 전 영업일)
- 지급방법: 을의 명의 은행계좌로 이체
- 구성: 기본급 __% + 직무수당 __% + 식대 (월 20만원, 비과세)

### 제5조 (휴일·휴가)
- 주휴일: 매주 일요일
- 연차유급휴가: 근로기준법 제60조에 따름
- 경조사 휴가: 사내 규정에 따름

### 제6조 (4대보험)
- 국민연금, 건강보험, 고용보험, 산재보험 가입

### 제7조 (교육업 특화 조항)
① 을이 업무상 제작한 교육 콘텐츠(강의 자료, 교재, 영상 등)의 저작권은 갑에게 귀속한다. (저작권법 제9조 업무상저작물)
② 을은 재직 중 및 퇴직 후 2년간 갑의 사전 서면 동의 없이 갑과 경쟁관계에 있는 교육 서비스를 운영하거나 참여하지 않는다.
③ 을은 수강생 개인정보를 개인정보보호법에 따라 처리하며, 퇴직 시 모든 개인정보를 반환 또는 파기한다.

### 제8조 (비밀유지)
을은 재직 중 및 퇴직 후 갑의 영업비밀, 수강생 정보, 경영 정보를 제3자에게 누설하지 않는다.

### 제9조 (기타)
본 계약에 정하지 아니한 사항은 근로기준법 및 관계 법령에 따른다.

---

**${TODAY}**

사용자(갑): ${co.company.name_kr} 대표이사 ${co.shareholders[0].name} (인)
근로자(을): [성명] (인)
`;
fs.writeFileSync(path.join(OUT,"01_근로계약서_템플릿.md"),empContract,"utf8");

// 2. Instructor Contract Template
console.log("  [2/5] \uAC15\uC0AC \uC704\uD0C1\uACC4\uC57D\uC11C...");
const instrContract=`# 강사 업무위탁계약서 — ${co.company.name_kr}

> ⚠️ AI 생성 초안. 노무사/변호사 최종 검토 필수. | ${TODAY}

---

## 업무위탁계약서

**위탁자(갑)**: ${co.company.name_kr}
**수탁자(을)**: [강사명] (프리랜서)

### 제1조 (위탁 업무)
- 교육 과정명: [과정명]
- 강의 형태: [ ] 라이브(Zoom) [ ] VOD 촬영 [ ] 오프라인 [ ] 멘토링
- 강의 횟수/시간: 총 __회, __시간
- 계약 기간: 20__년 __월 __일 ~ 20__년 __월 __일

### 제2조 (위탁 대가)
- 강의료: 1회당 금 [________]원 (부가세 별도)
- 또는 월 정액: 금 [________]원
- 지급일: 매월 __일 (출강 실적 기준)
- 원천징수: 사업소득세 3.3% 공제 후 지급

### 제3조 (저작권 귀속) ★ 핵심 조항
① **옵션 A (회사 귀속)**: 을이 본 계약에 따라 제작한 교육 콘텐츠(강의 영상, 교재, 발표자료, 실습자료 포함)의 저작재산권은 갑에게 양도되며, 을은 저작인격권을 행사하지 않는다. 양도 대가는 제2조의 위탁 대가에 포함된다.
② **옵션 B (공동 소유)**: 콘텐츠의 저작재산권은 갑과 을이 공동으로 소유하며, 갑은 교육 목적으로 자유롭게 사용할 수 있다. 을은 갑의 사전 동의 없이 제3자에게 동일 콘텐츠를 제공할 수 없다.
③ **옵션 C (강사 보유)**: 을이 저작권을 보유하되, 갑에게 [__]년간 독점적 이용 허락을 부여한다.

> 💡 추천: 회사 제작비 투입 시 옵션 A, 강사 자체 기획 시 옵션 B, 유명 강사 초빙 시 옵션 C

### 제4조 (경업금지)
을은 계약 기간 중 및 종료 후 [6개월/1년]간 갑과 동일한 주제의 교육을 갑의 경쟁 플랫폼에서 제공하지 않는다. 단, 을의 개인 채널(유튜브, 블로그)에서의 무료 콘텐츠는 예외로 한다.

### 제5조 (비밀유지)
을은 수강생 개인정보 및 갑의 영업비밀을 제3자에게 누설하지 않는다.

### 제6조 (계약 해지)
- 상호 30일 전 서면 통보로 해지 가능
- 을의 귀책사유(무단 결강, 품질 미달) 시 갑은 즉시 해지 가능
- 해지 시 이미 촬영/제작된 콘텐츠의 저작권 귀속은 제3조에 따름

---

**${TODAY}**

위탁자(갑): ${co.company.name_kr} 대표이사 ${co.shareholders[0].name} (인)
수탁자(을): [강사명] (인)
`;
fs.writeFileSync(path.join(OUT,"02_강사_위탁계약서_템플릿.md"),instrContract,"utf8");

// 3. Payroll Template
console.log("  [3/5] \uAE09\uC5EC \uBA85\uC138\uC11C \uD15C\uD50C\uB9BF...");
const payroll=`# 급여 명세서 템플릿 — ${co.company.name_kr}

> ${TODAY} | 4대보험 요율은 변동될 수 있으므로 세무사 확인 필요

## 정규직 급여 계산기

| 항목 | 계산 방법 | 예시 (월 300만원) |
|------|---------|----------------|
| **기본급** | 고정 | 2,800,000원 |
| **식대 (비과세)** | 고정 (월 20만원 한도) | 200,000원 |
| **총 지급액** | 기본급 + 식대 | **3,000,000원** |
| | | |
| **공제 항목** | | |
| 국민연금 (4.5%) | 기본급 × 4.5% | 126,000원 |
| 건강보험 (3.545%) | 기본급 × 3.545% | 99,260원 |
| 장기요양 (건보의 12.81%) | 건강보험 × 12.81% | 12,715원 |
| 고용보험 (0.9%) | 기본급 × 0.9% | 25,200원 |
| 소득세 | 간이세액표 기준 | 약 38,960원 |
| 지방소득세 | 소득세 × 10% | 약 3,896원 |
| **총 공제액** | | **약 306,031원** |
| | | |
| **실지급액** | 총지급 - 총공제 | **약 2,693,969원** |

## 프리랜서 강사 정산

| 항목 | 계산 방법 | 예시 (건당 30만원 × 4회) |
|------|---------|----------------------|
| **총 강의료** | 건당 × 횟수 | 1,200,000원 |
| **원천징수 (3.3%)** | 총액 × 3.3% | 39,600원 |
| **실지급액** | 총액 - 원천징수 | **1,160,400원** |

## O1 재무 에이전트 연계

매월 25일(급여일) D-3까지 아래 데이터를 O1에 전달:
- 정규직: 급여총액, 4대보험 사업주부담금, 원천세
- 프리랜서: 강사료총액, 원천징수세액
`;
fs.writeFileSync(path.join(OUT,"03_급여_명세서_템플릿.md"),payroll,"utf8");

// 4. Stock Option Design
console.log("  [4/5] \uC2A4\uD1A1\uC635\uC158 \uC124\uACC4...");
const soption=`# 스톡옵션 설계서 — ${co.company.name_kr}

> ${TODAY} | ⚠️ 상법 제340조의2 기반. 최종 법률 검토 필요.

## 스톡옵션 풀 설계

| 항목 | 내용 |
|------|------|
| 발행주식총수 | ${co.company.capital.shares_total.toLocaleString()}주 |
| 스톡옵션 풀 상한 | ${Math.round(co.company.capital.shares_total*0.15).toLocaleString()}주 (15%) |
| 행사가격 기준 | 부여일 시가 (비상장: 최근 거래가 또는 공정가치 평가) |
| 베스팅 스케줄 | 4년 균등 베스팅, 1년 클리프 |
| 행사 기간 | 부여일로부터 2년~10년 |

## 베스팅 스케줄 (4년, 1년 클리프)

| 시점 | 베스팅 비율 | 누적 | 예시 (1,000주 부여) |
|------|----------|------|-------------------|
| 입사 | 0% | 0% | 0주 |
| 1년 (클리프) | 25% | 25% | 250주 |
| 2년 | 25% | 50% | 500주 |
| 3년 | 25% | 75% | 750주 |
| 4년 | 25% | 100% | 1,000주 |

## 부여 기준 (안)

| 직급/역할 | 부여 범위 | 비고 |
|---------|---------|------|
| 초기 핵심 멤버 (CTO/CMO급) | 500~2,000주 | 3인 주주와 동등한 커밋먼트 기대 |
| 시니어 (팀리더급) | 200~500주 | |
| 주니어/인턴 | 50~200주 | 전환 시 부여 |
| 핵심 강사 (장기 계약) | 100~500주 | 프리랜서도 부여 가능 (상법 요건 충족 시) |

## SHA 연계 (제12조)
- 스톡옵션 부여는 **주주 전원 만장일치** 사항
- 총 풀은 발행주식의 **15% 이내**
- 행사 시 3인 주주 지분 희석은 균등
`;
fs.writeFileSync(path.join(OUT,"04_스톡옵션_설계서.md"),soption,"utf8");

// 5. Org Chart (HTML)
console.log("  [5/5] \uC870\uC9C1\uB3C4...");
const orgHtml=`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>조직도 — ${co.company.name_kr}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Noto Sans KR',sans-serif;padding:40px;background:#fff}
.title{text-align:center;font-size:22px;font-weight:700;margin-bottom:4px}
.sub{text-align:center;font-size:13px;color:#666;margin-bottom:30px}
.org{display:flex;flex-direction:column;align-items:center;gap:0}
.node{border:2px solid #ddd;border-radius:10px;padding:12px 20px;text-align:center;min-width:160px;background:#fff;position:relative}
.node.ceo{border-color:#FF4500;background:#FFF8F5}
.node .name{font-weight:700;font-size:15px}.node .role{font-size:12px;color:#666;margin-top:2px}
.node .tag{display:inline-block;font-size:10px;padding:2px 8px;border-radius:10px;margin-top:6px}
.tag.filled{background:#FF4500;color:#fff}.tag.planned{background:#E8E8E8;color:#555;border:1px dashed #999}
.line{width:2px;height:24px;background:#ccc}.hline{height:2px;background:#ccc}
.row{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;position:relative}
.row::before{content:'';position:absolute;top:-24px;left:50%;width:2px;height:24px;background:#ccc}
.col{display:flex;flex-direction:column;align-items:center;gap:0}
.col .line{width:2px;height:16px;background:#ccc}
.section{margin-top:16px;text-align:center}
.section h3{font-size:14px;font-weight:700;margin-bottom:12px;color:#333}
.note{text-align:center;font-size:11px;color:#999;margin-top:30px}
</style></head><body>
<div class="title">조직도 — ${co.company.name_kr}</div>
<div class="sub">${TODAY} 기준 | 현재 인원 + 채용 예정(점선)</div>

<div class="org">
  <div class="node ceo"><div class="name">${co.shareholders[0].name}</div><div class="role">대표이사 (CEO)</div><span class="tag filled">현재</span></div>
  <div class="line"></div>

  <div style="width:70%;max-width:500px" class="hline"></div>

  <div class="row" style="margin-top:0">
    <div class="col">
      <div class="line"></div>
      <div class="node"><div class="name">[주주B]</div><div class="role">이사 / [역할]</div><span class="tag filled">현재</span></div>
    </div>
    <div class="col">
      <div class="line"></div>
      <div class="node"><div class="name">[주주C]</div><div class="role">이사 / [역할]</div><span class="tag filled">현재</span></div>
    </div>
  </div>

  <div class="section">
    <div class="line" style="margin:16px auto"></div>
    <h3>초기 채용 계획 (M3~M6)</h3>
    <div class="row">
      <div class="col">
        <div class="node" style="border-style:dashed"><div class="name">콘텐츠 매니저</div><div class="role">강의 기획·촬영·편집</div><span class="tag planned">M3 채용</span></div>
      </div>
      <div class="col">
        <div class="node" style="border-style:dashed"><div class="name">마케터</div><div class="role">그로스·SNS·퍼포먼스</div><span class="tag planned">M4 채용</span></div>
      </div>
      <div class="col">
        <div class="node" style="border-style:dashed"><div class="name">운영 매니저</div><div class="role">수강생 관리·CS·정산</div><span class="tag planned">M6 채용</span></div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="line" style="margin:16px auto"></div>
    <h3>프리랜서 강사 풀</h3>
    <div class="row">
      <div class="col"><div class="node" style="border-color:#0F6E56"><div class="name">부동산 강사</div><div class="role">중개·투자·세무</div><span class="tag" style="background:#E1F5EE;color:#0F6E56">프리랜서</span></div></div>
      <div class="col"><div class="node" style="border-color:#0F6E56"><div class="name">숙박/공간 강사</div><div class="role">호스텔·스터디카페</div><span class="tag" style="background:#E1F5EE;color:#0F6E56">프리랜서</span></div></div>
      <div class="col"><div class="node" style="border-color:#0F6E56"><div class="name">AI/코딩 강사</div><div class="role">바이브코딩·자동화</div><span class="tag" style="background:#E1F5EE;color:#0F6E56">프리랜서</span></div></div>
    </div>
  </div>
</div>

<div class="note">⚠️ 점선 박스는 채용 예정 포지션입니다. 실선은 현재 인원. | REBOUND-EDU</div>
</body></html>`;
fs.writeFileSync(path.join(OUT,"05_조직도.html"),orgHtml,"utf8");

console.log("\n\u2705 O2 \uC0DD\uC131 \uC644\uB8CC! 5\uAC1C \uC0B0\uCD9C\uBB3C");
["01_근로계약서_템플릿.md","02_강사_위탁계약서_템플릿.md","03_급여_명세서_템플릿.md","04_스톡옵션_설계서.md","05_조직도.html"].forEach((f,i)=>console.log(`  ${i+1}. ${f}`));
