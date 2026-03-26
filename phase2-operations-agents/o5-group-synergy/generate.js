#!/usr/bin/env node
/**
 * O5 그룹 시너지 에이전트
 * 산출물: 매칭 룰 엔진 설정, 크로스셀링 제안서 템플릿, 시너지 리포트 템플릿, 리드 라우팅 설정
 */
const fs=require("fs"),path=require("path");
const OUT=path.join(__dirname,"outputs"),DATA=path.join(__dirname,"data");
[OUT].forEach(d=>{if(!fs.existsSync(d))fs.mkdirSync(d,{recursive:true});});
const co=JSON.parse(fs.readFileSync(path.join(DATA,"company_info.json"),"utf8"));
const TODAY=new Date().toISOString().split("T")[0];

console.log("\n\uD83D\uDD04 O5 \uADF8\uB8F9 \uC2DC\uB108\uC9C0 \uC5D0\uC774\uC804\uD2B8\n");

// 1. Matching Rules Engine
console.log("  [1/4] \uB9E4\uCE6D \uB8F0 \uC5D4\uC9C4...");
const matchingRules={
  _meta:{source:"O5_그룹시너지",generated:TODAY,version:"1.0"},
  rules:[
    {
      id:"MR-001",course:"호스텔 창업 과정",nps_threshold:7,
      matches:[
        {entity:"(주)부동찬",service:"호스텔 PM 컨설팅",trigger:"수료 후 3일",priority:1,contact_team:"PM팀",referral_fee_pct:10,
         message_template:"${co.shareholders[0].name} 대표의 호스텔 창업 과정을 수료하셨군요! 실제 창업을 고려 중이시라면, 리바운드 그룹의 PM 서비스(입지선정→시공→운영)를 특별 조건으로 안내드립니다."},
        {entity:"(주)리바운드중개",service:"상업용 매물 매칭",trigger:"수료 후 7일",priority:2,contact_team:"매물팀",referral_fee_pct:10,
         message_template:"수강 중 관심 가졌던 지역의 호스텔 적합 매물을 찾아드립니다. 수료생 전용 중개 수수료 할인(10%) 혜택이 있습니다."},
        {entity:"(주)리바운드",service:"운영 지점 견학/인턴",trigger:"수료 후 14일",priority:3,contact_team:"운영팀",referral_fee_pct:0,
         message_template:"서울역/종로 호스텔에서 1주일 현장 체험 프로그램을 운영 중입니다. 수료생 무료 참여 가능합니다."}
      ]
    },
    {
      id:"MR-002",course:"스터디카페 창업 과정",nps_threshold:7,
      matches:[
        {entity:"(주)부동찬",service:"스터디카페 PM 컨설팅",trigger:"수료 후 3일",priority:1,contact_team:"PM팀",referral_fee_pct:10},
        {entity:"(주)리바운드중개",service:"상가 매물 매칭",trigger:"수료 후 7일",priority:2,contact_team:"매물팀",referral_fee_pct:10},
        {entity:"(주)리바운드",service:"은평수색 스터디카페 견학",trigger:"수료 후 14일",priority:3,contact_team:"운영팀",referral_fee_pct:0}
      ]
    },
    {
      id:"MR-003",course:"부동산 법인 투자 과정",nps_threshold:6,
      matches:[
        {entity:"(주)리바운드중개",service:"투자용 매물 브리핑",trigger:"수료 후 3일",priority:1,contact_team:"매물팀",referral_fee_pct:10},
        {entity:"(주)부동찬",service:"법인 투자 컨설팅",trigger:"수료 후 7일",priority:2,contact_team:"PM팀",referral_fee_pct:10}
      ]
    },
    {
      id:"MR-004",course:"바이브코딩 캠프",nps_threshold:8,
      matches:[
        {entity:"(주)리바운드에듀",service:"고급 AI 에이전트 구축 컨설팅",trigger:"수료 후 7일",priority:1,contact_team:"교육팀",referral_fee_pct:0},
        {entity:"(주)리바운드",service:"에이전트 실전 적용 (운영 자동화)",trigger:"수료 후 14일",priority:2,contact_team:"운영팀",referral_fee_pct:0}
      ]
    },
    {
      id:"MR-005",course:"공인중개사 역량 강화",nps_threshold:7,
      matches:[
        {entity:"(주)리바운드중개",service:"소속 중개사 채용 안내",trigger:"수료 후 3일",priority:1,contact_team:"인사팀",referral_fee_pct:0},
        {entity:"(주)미스터홈즈중개",service:"소속 중개사 채용 안내",trigger:"수료 후 3일",priority:2,contact_team:"인사팀",referral_fee_pct:0}
      ]
    }
  ],
  guardrails:{
    consent_required:true,consent_text:"수료 후 리바운드 그룹의 관련 서비스 안내를 받으시겠습니까? (선택사항)",
    max_messages_per_month:2,
    opt_out_respected:true,opt_out_text:"더 이상 안내를 원하지 않으시면 '거부'라고 답장해 주세요.",
    privacy_note:"O3 개인정보처리방침 제2조(제3자 제공)에 따라 수강생 별도 동의 필요"
  }
};
fs.writeFileSync(path.join(OUT,"01_매칭_룰_엔진.json"),JSON.stringify(matchingRules,null,2),"utf8");

// 2. Cross-selling Proposal Template
console.log("  [2/4] \uD06C\uB85C\uC2A4\uC140\uB9C1 \uC81C\uC548\uC11C \uD15C\uD50C\uB9BF...");
const proposal=`# 크로스셀링 제안서 템플릿

> O5 에이전트가 수료생 프로필 기반으로 자동 생성하는 맞춤형 제안서

---

## [수강생명]님을 위한 다음 단계 안내

[수강생명]님, **[과정명]** 과정을 성공적으로 수료하신 것을 축하드립니다!

수강 중 보여주신 [관심 분야/질문 내용]을 바탕으로, 실제 [창업/투자]를 위한 다음 단계를 안내드립니다.

---

### 추천 서비스 1: [서비스명]

| 항목 | 내용 |
|------|------|
| 제공 법인 | [법인명] |
| 서비스 내용 | [상세 내용] |
| 수료생 혜택 | [할인/우선 안내 등] |
| 예상 비용 | [가격대] |
| 담당자 | [담당자명] / [연락처] |

### 추천 서비스 2: [서비스명]

[위와 동일 구조]

---

### 수료생 전용 혜택

- PM 컨설팅 수수료 10% 할인
- 중개 수수료 10% 할인
- 운영 지점 견학 무료 참여
- 추가 교육 과정 20% 할인

---

> 이 안내는 수강생님의 동의에 따라 발송되었습니다. 더 이상 수신을 원하지 않으시면 [거부 링크]를 클릭해 주세요.

**${co.company.name_kr}** | **리바운드 그룹**
`;
fs.writeFileSync(path.join(OUT,"02_크로스셀링_제안서_템플릿.md"),proposal,"utf8");

// 3. Synergy Report Template
console.log("  [3/4] \uC2DC\uB108\uC9C0 \uB9AC\uD3EC\uD2B8 \uD15C\uD50C\uB9BF...");
const synergyReport=`# 월간 그룹 시너지 리포트 — ${co.company.name_kr}

> [YYYY년 MM월] | O5 에이전트 자동 생성

---

## Executive Summary

| 지표 | 이번 달 | 전월 | 변동 |
|------|--------|------|------|
| 수료생 수 | [__]명 | [__]명 | [__%] |
| 리드 전달 건수 | [__]건 | [__]건 | [__%] |
| 계약 전환 건수 | [__]건 | [__]건 | [__%] |
| 전환율 | [__%] | [__%] | [__pp] |
| 교차 매출 (그룹 전체) | [__]만원 | [__]만원 | [__%] |
| 추천 수수료 수익 | [__]만원 | [__]만원 | [__%] |

## 법인별 리드 전달 현황

| 수신 법인 | 전달 건수 | 계약 전환 | 전환율 | 매출 기여 |
|---------|---------|---------|-------|---------|
| (주)부동찬 (PM) | [__]건 | [__]건 | [__%] | [__]만원 |
| (주)리바운드중개 | [__]건 | [__]건 | [__%] | [__]만원 |
| (주)미스터홈즈중개 | [__]건 | [__]건 | [__%] | [__]만원 |
| (주)리바운드 (운영) | [__]건 | [__]건 | [__%] | [__]만원 |

## 과정별 전환 성과

| 교육 과정 | 수료생 | 리드 전달 | 전환 | 전환율 | 인사이트 |
|---------|-------|---------|------|-------|---------|
| 호스텔 창업 | [__]명 | [__]건 | [__]건 | [__%] | [인사이트] |
| 스터디카페 | [__]명 | [__]건 | [__]건 | [__%] | [인사이트] |
| 부동산 투자 | [__]명 | [__]건 | [__]건 | [__%] | [인사이트] |
| 바이브코딩 | [__]명 | [__]건 | [__]건 | [__%] | [인사이트] |

## 추천 수수료 정산 (→ O1 재무 전달)

| 거래 유형 | 건수 | 추천 수수료 | 비고 |
|---------|------|----------|------|
| PM 컨설팅 추천 | [__]건 | [__]만원 | 계약액의 10% |
| 중개 매물 매칭 | [__]건 | [__]만원 | 건당 정액 |
| 합계 | [__]건 | **[__]만원** | |

## 다음 달 계획

- [ ] [액션 아이템 1]
- [ ] [액션 아이템 2]
- [ ] [매칭 룰 개선 사항]

---

> 이 리포트는 O5 에이전트가 자동 생성하며, G4 KPI 대시보드 및 O1 재무에 데이터를 공급합니다.
`;
fs.writeFileSync(path.join(OUT,"03_시너지_리포트_템플릿.md"),synergyReport,"utf8");

// 4. Lead Routing Config
console.log("  [4/4] \uB9AC\uB4DC \uB77C\uC6B0\uD305 \uC124\uC815...");
const routing={
  _meta:{source:"O5_그룹시너지",generated:TODAY},
  routing_channels:[
    {entity:"(주)부동찬",team:"PM팀",channel:"kakaotalk",contact:"[PM팀장 카카오톡]",backup_channel:"email",backup_contact:"[PM팀 이메일]",sla_hours:24},
    {entity:"(주)리바운드중개",team:"매물팀",channel:"kakaotalk",contact:"[매물팀 카카오톡]",backup_channel:"email",backup_contact:"[매물팀 이메일]",sla_hours:24},
    {entity:"(주)미스터홈즈중개",team:"매물팀",channel:"kakaotalk",contact:"[미스터홈즈 카카오톡]",backup_channel:"email",backup_contact:"[미스터홈즈 이메일]",sla_hours:24},
    {entity:"(주)리바운드",team:"운영팀",channel:"kakaotalk",contact:"[운영팀 카카오톡]",backup_channel:"email",backup_contact:"[운영팀 이메일]",sla_hours:48}
  ],
  lead_template:{
    subject:"[리바운드에듀] 수료생 리드 전달 — {수강생명} / {과정명}",
    body:"수강생명: {수강생명}\n과정명: {과정명}\n수료일: {수료일}\nNPS: {nps_score}\n관심분야: {interests}\n연락처: {phone} (수강생 동의 완료)\n추천 서비스: {recommended_service}\n\n※ 24시간 내 초기 연락 부탁드립니다."
  },
  tracking:{follow_up_days:[3,7,14,30],conversion_check_day:30,report_to:"O1_재무 + G4_KPI"}
};
fs.writeFileSync(path.join(OUT,"04_리드_라우팅_설정.json"),JSON.stringify(routing,null,2),"utf8");

console.log("\n\u2705 O5 \uC0DD\uC131 \uC644\uB8CC! 4\uAC1C \uC0B0\uCD9C\uBB3C");
["01_매칭_룰_엔진.json","02_크로스셀링_제안서_템플릿.md","03_시너지_리포트_템플릿.md","04_리드_라우팅_설정.json"].forEach((f,i)=>console.log(`  ${i+1}. ${f}`));
