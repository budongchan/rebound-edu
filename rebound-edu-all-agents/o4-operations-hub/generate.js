#!/usr/bin/env node
/**
 * O4 교육 플랫폼 운영 에이전트 (허브)
 * 11개 서브에이전트 레지스트리, 이벤트 버스 설정, 운영 대시보드, 월간 리포트 템플릿
 */
const fs=require("fs"),path=require("path");
const OUT=path.join(__dirname,"outputs"),DATA=path.join(__dirname,"data");
[OUT].forEach(d=>{if(!fs.existsSync(d))fs.mkdirSync(d,{recursive:true});});
const f4=JSON.parse(fs.readFileSync(path.join(DATA,"f4_to_o4.json"),"utf8"));
const TODAY=new Date().toISOString().split("T")[0];

console.log("\n\uD83C\uDFDB\uFE0F O4 \uAD50\uC721\uD50C\uB7AB\uD3FC \uC6B4\uC601 \uD5C8\uBE0C \uC5D0\uC774\uC804\uD2B8\n");

// 1. Sub-Agent Registry
console.log("  [1/4] \uC11C\uBE0C\uC5D0\uC774\uC804\uD2B8 \uB808\uC9C0\uC2A4\uD2B8\uB9AC...");
const registry={
  _meta:{source:"O4_교육운영_허브",generated:TODAY,version:"1.0"},
  hub:{name:"O4_Operations_Hub",role:"11개 서브에이전트 오케스트레이션 + 데이터 통합 + 이상 감지",status:"active"},
  sub_agents:[
    {id:"S01",name:"리드 캡처",priority:"P1",status:"ready",
     trigger:{type:"event",event:"landing_page_form_submit"},
     input:["visitor_info","utm_source","interest_area"],
     output:["lead_db_entry","interest_tag"],
     tools:["Stibee API","Google Analytics","Notion DB"],
     kpi:"월간 리드 수집 수",target:"500명/월"},

    {id:"S02",name:"상담 응대",priority:"P1",status:"ready",
     trigger:{type:"event",event:"inquiry_received"},
     input:["question_text","channel(kakao/email/web)"],
     output:["auto_response","escalation_flag"],
     tools:["Claude API","카카오톡채널","이메일"],
     kpi:"자동 응답율",target:"80%",
     faq_categories:["수강료","환불","수강방법","커리큘럼","자격요건"]},

    {id:"S03",name:"콘텐츠 관리",priority:"P2",status:"ready",
     trigger:{type:"manual",event:"course_create_update"},
     input:["course_files(video/ppt/pdf)","metadata"],
     output:["course_page","access_control"],
     tools:["YouTube/Vimeo","Notion","Google Drive"],
     kpi:"콘텐츠 업데이트 주기",target:"월 2회 이상"},

    {id:"S04",name:"콘텐츠 리퍼포징",priority:"P3",status:"planned",
     trigger:{type:"event",event:"new_course_published"},
     input:["original_course(video/ppt)"],
     output:["youtube_clip","blog_post","sns_card","email_newsletter"],
     tools:["영상편집","Claude API(블로그 생성)","Canva/HTML"],
     kpi:"원본 1건당 파생 콘텐츠 수",target:"4개 이상"},

    {id:"S05",name:"수강생 온보딩",priority:"P0",status:"ready",
     trigger:{type:"event",event:"payment_completed"},
     input:["student_info","course_id","payment_info"],
     output:["welcome_message","learning_roadmap","community_invite"],
     tools:["카카오톡 알림톡","Stibee","카카오 오픈채팅"],
     kpi:"결제 후 24시간 내 온보딩 완료율",target:"95%",
     sequence:[
       {step:1,timing:"결제 직후",action:"결제 확인 + 수강 안내 이메일"},
       {step:2,timing:"결제 후 1시간",action:"환영 카카오톡 + 커뮤니티 초대링크"},
       {step:3,timing:"결제 후 24시간",action:"학습 로드맵 + 첫 강의 안내"},
       {step:4,timing:"결제 후 3일",action:"사전 설문 (학습 목표, 경험 수준)"},
     ]},

    {id:"S06",name:"학습 진도 추적",priority:"P2",status:"ready",
     trigger:{type:"scheduled",cron:"daily 09:00"},
     input:["video_watch_log","quiz_scores","assignment_submissions"],
     output:["progress_rate","dropout_alert","completion_certificate"],
     tools:["Notion DB","카카오톡 알림톡"],
     kpi:"완강률",target:"60%",
     alerts:[
       {condition:"3일 미접속",action:"리마인더 카카오톡"},
       {condition:"7일 미접속",action:"개인 연락 (운영팀)"},
       {condition:"진도 100%",action:"수료 축하 + 수료증 발급 + S07 트리거"},
     ]},

    {id:"S07",name:"수강 후 팔로업",priority:"P4",status:"planned",
     trigger:{type:"event",event:"course_completed"},
     input:["student_profile","course_id","nps_score"],
     output:["completion_certificate","next_course_recommendation","o5_lead_data"],
     tools:["WeasyPrint(수료증)","카카오톡","O5 API"],
     kpi:"수료→그룹서비스 전환율",target:"15%",
     sequence:[
       {step:1,timing:"수료 즉시",action:"수료증 PDF 발급 + 축하 메시지"},
       {step:2,timing:"수료 후 1일",action:"NPS 설문 발송"},
       {step:3,timing:"수료 후 3일",action:"다음 과정 추천 + 수료생 할인 안내"},
       {step:4,timing:"수료 후 7일",action:"O5 시너지 에이전트에 리드 전달 (동의 시)"},
     ]},

    {id:"S08",name:"결제/정산",priority:"P0",status:"ready",
     trigger:{type:"event",event:"payment_event(success/refund)"},
     input:["pg_transaction_data"],
     output:["payment_confirmation","tax_invoice","o1_financial_data"],
     tools:["포트원 API","토스페이먼츠","Stibee(영수증)"],
     kpi:"결제 성공률",target:"98%",
     refund_rules:"O3 환불규정 참조"},

    {id:"S09",name:"마케팅 자동화",priority:"P3",status:"planned",
     trigger:{type:"scheduled_or_event",conditions:["campaign_schedule","segment_condition"]},
     input:["student_segment","channel_config","campaign_content"],
     output:["email_campaign","kakao_campaign","performance_report"],
     tools:["Stibee","카카오톡 알림톡","Google Analytics"],
     kpi:"이메일 오픈율",target:"25%",
     segments:["잠재(리드)","무료수강","유료수강중","수료","이탈(30일+)"]},

    {id:"S10",name:"오케스트레이터",priority:"P4",status:"planned",
     trigger:{type:"continuous",event:"any_sub_agent_state_change"},
     input:["S01~S09 상태 정보"],
     output:["execution_order","failure_detection","escalation"],
     tools:["내부 이벤트 버스","Slack/카카오톡 웹훅"],
     kpi:"서브에이전트 가동률",target:"99%",
     failure_handling:"장애 시 수동 폴백 경로 + 담당자 알림"},

    {id:"S11",name:"데이터 분석",priority:"P4",status:"planned",
     trigger:{type:"scheduled",cron:"daily 09:00, weekly Mon 09:00, monthly 5th 09:00"},
     input:["all_sub_agent_data"],
     output:["daily_dashboard","weekly_summary","monthly_report","anomaly_alerts"],
     tools:["Notion DB","WeasyPrint(리포트)","Slack 웹훅(알림)"],
     kpi:"대시보드 갱신 적시율",target:"100% (매일 09:00)"}
  ],
  build_priority:[
    {phase:"P0 (즉시)",agents:["S05 온보딩","S08 결제"],reason:"결제+온보딩이 없으면 사업 불가"},
    {phase:"P1 (1주 내)",agents:["S01 리드캡처","S02 상담"],reason:"유입 파이프라인"},
    {phase:"P2 (2주 내)",agents:["S03 콘텐츠","S06 진도추적"],reason:"수강 경험 품질"},
    {phase:"P3 (3주 내)",agents:["S04 리퍼포징","S09 마케팅"],reason:"성장 엔진"},
    {phase:"P4 (4주 내)",agents:["S07 팔로업","S10 오케스트레이터","S11 분석"],reason:"최적화+통합"},
  ]
};
fs.writeFileSync(path.join(OUT,"01_서브에이전트_레지스트리.json"),JSON.stringify(registry,null,2),"utf8");

// 2. Event Bus Configuration
console.log("  [2/4] \uC774\uBCA4\uD2B8 \uBC84\uC2A4 \uC124\uC815...");
const eventBus={
  _meta:{source:"O4_Hub",generated:TODAY},
  events:[
    {event:"landing_page_form_submit",source:"웹사이트",target:"S01",data:["name","email","phone","interest"]},
    {event:"inquiry_received",source:"카카오톡/이메일/웹",target:"S02",data:["channel","message","sender"]},
    {event:"payment_completed",source:"포트원/PG",target:["S05","S08"],data:["student_id","course_id","amount","method"]},
    {event:"payment_refund_requested",source:"수강생",target:"S08",data:["student_id","reason","amount"],rules:"O3 환불규정 적용"},
    {event:"video_watched",source:"YouTube/Vimeo",target:"S06",data:["student_id","video_id","watch_duration","completion_pct"]},
    {event:"course_completed",source:"S06",target:["S07","S11"],data:["student_id","course_id","completion_date","total_score"]},
    {event:"nps_submitted",source:"S07",target:["S11","O5"],data:["student_id","nps_score","feedback_text"]},
    {event:"new_course_published",source:"S03",target:["S04","S09"],data:["course_id","title","category","price"]},
    {event:"campaign_scheduled",source:"마케팅팀",target:"S09",data:["campaign_id","segment","channel","schedule"]},
    {event:"anomaly_detected",source:"S11",target:"S10",data:["metric","current_value","threshold","severity"]},
    {event:"sub_agent_failure",source:"any S01~S09",target:"S10",data:["agent_id","error_type","timestamp"]},
  ],
  escalation:{
    channels:["카카오톡 그룹채팅 (운영팀)","이메일 (대표이사)"],
    severity_levels:{
      low:"S11 알림만 (대시보드 표시)",
      medium:"카카오톡 운영팀 알림",
      high:"대표이사 직접 연락 + 수동 폴백 가동",
      critical:"전 에이전트 일시 중단 + 긴급 점검"
    }
  }
};
fs.writeFileSync(path.join(OUT,"02_이벤트_버스_설정.json"),JSON.stringify(eventBus,null,2),"utf8");

// 3. Dashboard Template (HTML)
console.log("  [3/4] \uC6B4\uC601 \uB300\uC2DC\uBCF4\uB4DC \uD15C\uD50C\uB9BF...");
const dashHtml=`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>REBOUND-EDU 운영 대시보드</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Noto Sans KR',sans-serif;background:#f5f5f5;color:#333;padding:20px}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
.header h1{font-size:22px;font-weight:700}.header h1 span{color:#FF4500}
.header .date{font-size:13px;color:#666}
.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:24px}
.metric{background:#fff;border-radius:10px;padding:16px;border-left:4px solid #ddd}
.metric.up{border-left-color:#2E7D32}.metric.down{border-left-color:#C62828}.metric.neutral{border-left-color:#FF4500}
.metric .label{font-size:12px;color:#666;margin-bottom:4px}
.metric .value{font-size:28px;font-weight:700}
.metric .change{font-size:12px;margin-top:4px}
.metric .change.positive{color:#2E7D32}.metric .change.negative{color:#C62828}
.section{background:#fff;border-radius:10px;padding:20px;margin-bottom:16px}
.section h2{font-size:16px;font-weight:700;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #eee}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;padding:8px;background:#f8f8f8;font-weight:500;color:#666}
td{padding:8px;border-bottom:1px solid #f0f0f0}
.status{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}
.status.active{background:#2E7D32}.status.planned{background:#FFA000}.status.error{background:#C62828}
.footer{text-align:center;font-size:11px;color:#999;margin-top:24px}
</style></head><body>

<div class="header">
  <h1><span>REBOUND</span>-EDU 운영 대시보드</h1>
  <div class="date">${TODAY} 09:00 기준 | 매일 자동 갱신</div>
</div>

<div class="metrics">
  <div class="metric neutral"><div class="label">총 수강생 (누적)</div><div class="value">[___]</div><div class="change">이번 달 +[__]명</div></div>
  <div class="metric neutral"><div class="label">이번 달 매출</div><div class="value">[___]만원</div><div class="change positive">전월 대비 +[__%]</div></div>
  <div class="metric up"><div class="label">완강률</div><div class="value">[__%]</div><div class="change positive">목표 60%</div></div>
  <div class="metric neutral"><div class="label">NPS</div><div class="value">[__]</div><div class="change">목표 50+</div></div>
  <div class="metric neutral"><div class="label">이번 달 리드</div><div class="value">[___]명</div><div class="change">목표 500명</div></div>
  <div class="metric neutral"><div class="label">그룹 시너지 전환</div><div class="value">[__]건</div><div class="change">목표 15%</div></div>
</div>

<div class="section">
  <h2>서브에이전트 상태 (11개)</h2>
  <table>
    <tr><th>ID</th><th>에이전트</th><th>상태</th><th>마지막 실행</th><th>오늘 처리</th><th>KPI</th></tr>
    ${registry.sub_agents.map(a=>`<tr><td>${a.id}</td><td>${a.name}</td><td><span class="status ${a.status==='ready'?'active':'planned'}"></span>${a.status==='ready'?'가동중':'준비중'}</td><td>[시간]</td><td>[건수]</td><td>${a.kpi}: ${a.target}</td></tr>`).join('\n    ')}
  </table>
</div>

<div class="section">
  <h2>코스별 현황</h2>
  <table>
    <tr><th>코스</th><th>수강생</th><th>완강률</th><th>이번 달 매출</th><th>NPS</th></tr>
    ${f4.curriculum.map(c=>`<tr><td>${c.name}</td><td>[__]명</td><td>[__%]</td><td>[__]만원</td><td>[__]</td></tr>`).join('\n    ')}
  </table>
</div>

<div class="section">
  <h2>오늘의 이벤트</h2>
  <table>
    <tr><th>시간</th><th>이벤트</th><th>처리 에이전트</th><th>상태</th></tr>
    <tr><td>[09:00]</td><td>[이벤트명]</td><td>[S0X]</td><td>[완료/진행중]</td></tr>
  </table>
</div>

<div class="footer">REBOUND-EDU | O4 Operations Hub | 자동 생성 대시보드 | ${TODAY}</div>
</body></html>`;
fs.writeFileSync(path.join(OUT,"03_운영_대시보드.html"),dashHtml,"utf8");

// 4. Monthly Report Template
console.log("  [4/4] \uC6D4\uAC04 \uC6B4\uC601 \uB9AC\uD3EC\uD2B8 \uD15C\uD50C\uB9BF...");
const monthlyReport=`# 월간 운영 리포트 — (주)리바운드에듀

> [YYYY년 MM월] | O4 허브 에이전트 자동 생성 | 주주 보고용

---

## 1. Executive Summary
이번 달 핵심 하이라이트 3~5개 + 전월 대비 변화

| 핵심 지표 | 이번 달 | 전월 | 변동 | 목표 대비 |
|---------|--------|------|------|---------|
| 신규 유료 수강생 | [__]명 | [__]명 | [__%] | [달성/미달] |
| 월 매출 | [__]만원 | [__]만원 | [__%] | [달성/미달] |
| 완강률 | [__%] | [__%] | [__pp] | 목표 60% |
| NPS | [__] | [__] | [__] | 목표 50+ |
| 그룹 시너지 전환 | [__]건 | [__]건 | [__%] | 목표 15% |

## 2. 수강생 현황 (O4 S01/S05/S06)
- 신규 가입: [__]명 / 유료 전환: [__]명 / 수료: [__]명 / 이탈: [__]명
- 누적 수강생: [__]명

## 3. 매출/재무 (O1)
- 월 매출: [__]만원 (B2C [__] + B2B [__])
- 월 비용: [__]만원
- 영업이익: [__]만원 ([__%])
- 예산 대비: [계획] 만원 → [실적] 만원 (차이 [__%])

## 4. 콘텐츠 성과 (O4 S03/S06)
| 코스 | 수강생 | 완강률 | 평점 | 이탈 구간 TOP1 |
|------|-------|-------|------|-------------|
| [코스명] | [__]명 | [__%] | [_._] | [구간명] |

## 5. 마케팅 성과 (G2/O4 S09)
- 채널별 유입: 유튜브 [__] / 검색 [__] / 광고 [__] / 직접 [__]
- CAC: [__]원 / LTV: [__]원 / LTV/CAC: [__]x
- 광고 ROI: [__%]

## 6. 그룹 시너지 (O5)
- 리드 전달: [__]건 → 계약 전환: [__]건 ([__%])
- 교차 매출 기여: [__]만원
- 추천 수수료: [__]만원

## 7. HR 현황 (O2)
- 현재 인원: [__]명 (정규직 [__] + 프리랜서 강사 [__])
- 채용 진행: [포지션명] [상태]

## 8. 법무/컴플라이언스 (O3)
- 환불 건수: [__]건 / 환불률: [__%]
- 법규 변동: [있음/없음]
- 컴플라이언스 점수: [__%] / 19항목

## 9. 다음 달 계획
- [ ] [액션 아이템 1]
- [ ] [액션 아이템 2]
- [ ] [신규 코스 런칭 예정]
- [ ] [채용 예정]

---

> 이 리포트는 O4 허브 에이전트(S11)가 매월 5일 자동 생성합니다.
> 데이터 소스: O1(재무), O2(HR), O3(법무), O4(운영), O5(시너지), G2(마케팅)
`;
fs.writeFileSync(path.join(OUT,"04_월간_운영_리포트_템플릿.md"),monthlyReport,"utf8");

console.log("\n\u2705 O4 \uC0DD\uC131 \uC644\uB8CC! 4\uAC1C \uC0B0\uCD9C\uBB3C");
["01_서브에이전트_레지스트리.json","02_이벤트_버스_설정.json","03_운영_대시보드.html","04_월간_운영_리포트_템플릿.md"].forEach((f,i)=>console.log(`  ${i+1}. ${f}`));
console.log("\n  \uD83D\uDCCB 11\uAC1C \uC11C\uBE0C\uC5D0\uC774\uC804\uD2B8 \uB808\uC9C0\uC2A4\uD2B8\uB9AC \uC644\uC131");
console.log("  \uD83D\uDD14 11\uAC1C \uC774\uBCA4\uD2B8 \uD0C0\uC785 \uC815\uC758 \uC644\uC131");
console.log("  \uD83D\uDCC8 \uAD6C\uCD95 \uC6B0\uC120\uC21C\uC704: P0(\uACB0\uC81C+\uC628\uBCF4\uB529) \u2192 P1(\uB9AC\uB4DC+\uC0C1\uB2F4) \u2192 P2(\uCF58\uD150\uCE20+\uC9C4\uB3C4) \u2192 P3(\uB9C8\uCF00\uD305+\uB9AC\uD37C\uD3EC\uC9D5) \u2192 P4(\uD314\uB85C\uC5C5+\uBD84\uC11D+\uC624\uCF00\uC2A4\uD2B8\uB808\uC774\uD130)");
