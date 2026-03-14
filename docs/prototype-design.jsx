import { useState } from "react";

const O="#FF6600",OL="#FFF7ED",font="'Noto Sans KR',sans-serif";

// Google Fonts injection
const fontLink=document.createElement("link");
fontLink.rel="stylesheet";
fontLink.href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&display=swap";
if(!document.querySelector('link[href*="Noto+Sans+KR"]')) document.head.appendChild(fontLink);

const IC={
  Search:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Bell:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  Book:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Grid:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Card:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
  Chat:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Award:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
  Layout:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>,
  Cal:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  Users:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Wallet:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>,
  Head:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>,
  Clip:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>,
  Mega:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>,
  Check:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>,
  Trend:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  Gear:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Out:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  Star:({fill})=><svg width="14" height="14" viewBox="0 0 24 24" fill={fill?"#FFB800":"none"} stroke="#FFB800" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Play:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  ChannelTalk:()=><svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.48 2 2 5.92 2 10.67c0 2.92 1.72 5.5 4.35 7.08-.15.85-.78 3.15-.82 3.35 0 0-.02.08.04.12.06.03.12.01.12.01.56-.08 3.26-2.12 3.75-2.53.83.13 1.7.2 2.56.2 5.52 0 10-3.92 10-8.67S17.52 2 12 2z"/></svg>,
  ChevronRight:()=><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>,
};

const CATS=["전체","중개업","숙박업","사업장","AI자동화","투자개발"];
const ROLES={
  student:{label:"학생",menus:[{l:"내 강의실",ic:"Book",id:"home"},{l:"강의 탐색",ic:"Grid",id:"explore"},{l:"결제 내역",ic:"Card",id:"pay"},{l:"Q&A",ic:"Chat",id:"qna"},{l:"수료증",ic:"Award",id:"cert"}]},
  teacher:{label:"교사",menus:[{l:"대시보드",ic:"Layout",id:"home"},{l:"강의 관리",ic:"Book",id:"courses"},{l:"스케줄",ic:"Cal",id:"schedule"},{l:"수강생",ic:"Users",id:"students"},{l:"Q&A",ic:"Chat",id:"qna"},{l:"정산",ic:"Wallet",id:"settle"}]},
  staff:{label:"직원",menus:[{l:"운영 현황",ic:"Layout",id:"home"},{l:"학생 DB",ic:"Users",id:"sdb"},{l:"교사 DB",ic:"Users",id:"tdb"},{l:"CS 상담",ic:"Head",id:"cs"},{l:"콘텐츠 검수",ic:"Clip",id:"rev"},{l:"프로모션",ic:"Mega",id:"promo"}]},
  admin:{label:"관리자",menus:[{l:"대시보드",ic:"Layout",id:"home"},{l:"사용자 관리",ic:"Users",id:"users"},{l:"강의 승인",ic:"Check",id:"approvals"},{l:"매출·정산",ic:"Trend",id:"revenue"},{l:"설정",ic:"Gear",id:"settings"},{l:"공지",ic:"Bell",id:"notice"}]},
};
const icMap={Book:IC.Book,Grid:IC.Grid,Card:IC.Card,Chat:IC.Chat,Award:IC.Award,Layout:IC.Layout,Cal:IC.Cal,Users:IC.Users,Wallet:IC.Wallet,Head:IC.Head,Clip:IC.Clip,Mega:IC.Mega,Check:IC.Check,Trend:IC.Trend,Gear:IC.Gear,Bell:IC.Bell};

function Badge({children,color="gray"}){
  const C={green:{bg:"#EBFBEE",c:"#2B8A3E"},blue:{bg:"#E7F5FF",c:"#1971C2"},red:{bg:"#FFF5F5",c:"#E03131"},orange:{bg:OL,c:O},gray:{bg:"#F1F3F5",c:"#868E96"},amber:{bg:"#FFF9DB",c:"#E67700"}};
  const s=C[color]||C.gray;
  return <span style={{fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:4,background:s.bg,color:s.c,whiteSpace:"nowrap",fontFamily:font}}>{children}</span>;
}
function Stat({l,v,sub,accent}){
  return <div style={{background:"#fff",borderRadius:8,padding:"18px 20px",border:"1px solid #f0f0f0"}}>
    <p style={{fontSize:12,color:"#868e96",marginBottom:6,fontWeight:500,fontFamily:font}}>{l}</p>
    <p style={{fontSize:22,fontWeight:700,color:accent||"#212529",letterSpacing:"-0.5px",fontFamily:font}}>{v}</p>
    {sub&&<p style={{fontSize:11,color:"#868e96",marginTop:4,fontFamily:font}}>{sub}</p>}
  </div>;
}
function CourseCard({title,instructor,rating,students,price,original,tags,thumb}){
  return <div style={{background:"#fff",borderRadius:8,overflow:"hidden",border:"1px solid #f0f0f0",cursor:"pointer",transition:"box-shadow .2s"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.08)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
    <div style={{height:140,background:thumb||"linear-gradient(135deg,#f8f9fa,#e9ecef)",display:"flex",alignItems:"center",justifyContent:"center"}}>{!thumb&&<div style={{width:48,height:48,borderRadius:"50%",background:"rgba(0,0,0,.06)",display:"flex",alignItems:"center",justifyContent:"center",color:"#adb5bd"}}><IC.Play/></div>}</div>
    <div style={{padding:"14px 16px 16px"}}>
      {tags&&<div style={{display:"flex",gap:4,marginBottom:6,flexWrap:"wrap"}}>{tags.map((t,i)=><span key={i} style={{fontSize:10,color:"#868e96",background:"#f1f3f5",padding:"2px 6px",borderRadius:3,fontFamily:font}}>{t}</span>)}</div>}
      <h3 style={{fontSize:14,fontWeight:700,color:"#212529",lineHeight:1.4,marginBottom:6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",fontFamily:font}}>{title}</h3>
      <p style={{fontSize:12,color:"#868e96",marginBottom:8,fontFamily:font}}>{instructor}</p>
      <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:8}}><div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(i=><IC.Star key={i} fill={i<=Math.floor(rating)}/>)}</div><span style={{fontSize:11,color:"#868e96",fontFamily:font}}>({students})</span></div>
      <div style={{display:"flex",alignItems:"baseline",gap:6}}>{original&&<span style={{fontSize:12,color:"#adb5bd",textDecoration:"line-through",fontFamily:font}}>{original}</span>}<span style={{fontSize:15,fontWeight:700,color:"#212529",fontFamily:font}}>{price}</span></div>
    </div>
  </div>;
}

function ChannelTalkBtn(){
  const [open,setOpen]=useState(false);
  return <>
    {open&&<div style={{position:"fixed",bottom:88,right:24,width:320,background:"#fff",borderRadius:16,boxShadow:"0 8px 32px rgba(0,0,0,.15)",zIndex:1000,overflow:"hidden",fontFamily:font}}>
      <div style={{background:O,padding:"20px 20px 16px",color:"#fff"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:16,fontWeight:700}}>리바운드에듀 상담</span>
          <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:"#fff",fontSize:18,cursor:"pointer",padding:0,lineHeight:1}}>×</button>
        </div>
        <p style={{fontSize:13,opacity:.9}}>안녕하세요! 무엇이든 물어보세요.</p>
      </div>
      <div style={{padding:20}}>
        <div style={{background:"#f8f9fa",borderRadius:12,padding:"12px 16px",marginBottom:12}}><p style={{fontSize:13,color:"#495057"}}>안녕하세요! 리바운드에듀입니다. 강의, 결제, 환불 등 궁금하신 사항을 남겨주세요.</p></div>
        <div style={{display:"flex",gap:8}}>
          <input placeholder="메시지를 입력하세요..." style={{flex:1,height:40,padding:"0 12px",border:"1px solid #dee2e6",borderRadius:8,fontSize:13,fontFamily:font,outline:"none"}}/>
          <button style={{width:40,height:40,borderRadius:8,background:O,border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
        </div>
      </div>
    </div>}
    <button onClick={()=>setOpen(!open)} style={{position:"fixed",bottom:24,right:24,width:56,height:56,borderRadius:28,background:O,border:"none",cursor:"pointer",boxShadow:"0 4px 16px rgba(255,102,0,.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,transition:"transform .2s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
      {open?<svg width="24" height="24" fill="#fff" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>:<IC.ChannelTalk/>}
    </button>
  </>;
}

// ── LANDING ──
function Landing({go}){
  const [cat,setCat]=useState(0);
  const courses=[
    {title:"공실 해결 실전 마스터 과정",instructor:"김동찬",rating:4.8,students:"312",price:"₩490,000",tags:["중개업","실전"],thumb:"linear-gradient(135deg,#FF6600,#FF8533)"},
    {title:"부동산 중개 실무 입문",instructor:"리바운드중개",rating:4.6,students:"108",price:"₩290,000",tags:["중개업","입문"],thumb:"linear-gradient(135deg,#228be6,#4dabf7)"},
    {title:"호스텔 창업 바이블",instructor:"권진수 · 김동찬",rating:4.9,students:"47",price:"₩390,000",original:"₩490,000",tags:["숙박업","창업"],thumb:"linear-gradient(135deg,#40c057,#69db7c)"},
    {title:"고연봉 전문직 AI 시스템 설계",instructor:"리바운드",rating:4.7,students:"85",price:"₩290,000",tags:["AI자동화"],thumb:"linear-gradient(135deg,#7950f2,#9775fa)"},
    {title:"상업용 부동산 투자 분석",instructor:"김동찬",rating:4.5,students:"63",price:"₩390,000",tags:["투자개발"],thumb:"linear-gradient(135deg,#f76707,#ff922b)"},
    {title:"사업장 공간 기획 실무",instructor:"리바운드",rating:4.4,students:"92",price:"₩190,000",tags:["사업장"],thumb:"linear-gradient(135deg,#15aabf,#3bc9db)"},
  ];

  return <div style={{fontFamily:font,color:"#212529",minHeight:"100vh",background:"#fff"}}>
    {/* Header — logo + login/signup only */}
    <header style={{borderBottom:"1px solid #e9ecef",background:"#fff",position:"sticky",top:0,zIndex:50}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"0 24px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:2,cursor:"pointer"}}><span style={{fontSize:20,fontWeight:800,color:O,fontFamily:font}}>리바운드</span><span style={{fontSize:20,fontWeight:800,fontFamily:font}}>에듀</span></div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <button onClick={()=>go("login")} style={{fontSize:14,color:"#495057",background:"none",border:"none",cursor:"pointer",fontFamily:font,fontWeight:500}}>로그인</button>
          <button onClick={()=>go("signup")} style={{fontSize:14,color:"#fff",background:O,border:"none",borderRadius:8,padding:"8px 20px",cursor:"pointer",fontFamily:font,fontWeight:600}}>회원가입</button>
        </div>
      </div>
    </header>

    {/* Hero — text only, no CTA buttons */}
    <section style={{background:`linear-gradient(135deg,${OL} 0%,#fff 100%)`,padding:"60px 24px 52px"}}>
      <div style={{maxWidth:1200,margin:"0 auto",textAlign:"center"}}>
        <p style={{fontSize:14,fontWeight:600,color:O,marginBottom:16,fontFamily:font}}>부동산·공간사업 전문 교육 플랫폼</p>
        <h1 style={{fontSize:36,fontWeight:800,color:"#212529",lineHeight:1.35,marginBottom:16,fontFamily:font}}>공실을 기회로 바꾸는<br/><span style={{color:O}}>실전 교육</span>의 시작</h1>
        <p style={{fontSize:16,color:"#868e96",lineHeight:1.6,fontFamily:font}}>현장 전문가의 노하우를 온라인으로 배워보세요</p>
      </div>
    </section>

    {/* Category chips */}
    <section style={{maxWidth:1200,margin:"0 auto",padding:"32px 24px 0"}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {CATS.map((c,i)=><button key={i} onClick={()=>setCat(i)} style={{fontSize:14,fontWeight:cat===i?600:400,color:cat===i?"#fff":"#495057",background:cat===i?O:"#f1f3f5",border:"none",borderRadius:20,padding:"8px 20px",cursor:"pointer",fontFamily:font,transition:"all .15s"}}>{c}</button>)}
      </div>
    </section>

    {/* Course grid */}
    <section style={{maxWidth:1200,margin:"0 auto",padding:"24px 24px 60px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
        {courses.map((c,i)=><CourseCard key={i} {...c}/>)}
      </div>
    </section>

    <footer style={{borderTop:"1px solid #e9ecef",padding:"32px 24px",background:"#f8f9fa"}}>
      <div style={{maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><span style={{fontSize:14,fontWeight:700,color:"#868e96",fontFamily:font}}>리바운드에듀</span><span style={{fontSize:12,color:"#adb5bd",marginLeft:12,fontFamily:font}}>© 2026 주식회사 리바운드</span></div>
        <div style={{display:"flex",gap:20,fontSize:12,color:"#868e96",fontFamily:font}}><span>이용약관</span><span style={{fontWeight:600}}>개인정보처리방침</span><span>고객센터</span></div>
      </div>
    </footer>
    <ChannelTalkBtn/>
  </div>;
}

// ── LOGIN ──
function Login({go}){
  return <div style={{fontFamily:font,minHeight:"100vh",background:"#f8f9fa",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
    <div style={{width:"100%",maxWidth:400}}>
      <div style={{textAlign:"center",marginBottom:32,cursor:"pointer"}} onClick={()=>go("landing")}><span style={{fontSize:24,fontWeight:800,color:O,fontFamily:font}}>리바운드</span><span style={{fontSize:24,fontWeight:800,fontFamily:font}}>에듀</span></div>
      <div style={{background:"#fff",borderRadius:12,padding:32,border:"1px solid #e9ecef"}}>
        <h1 style={{fontSize:18,fontWeight:700,textAlign:"center",marginBottom:24,fontFamily:font}}>로그인</h1>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
          <button style={{height:48,borderRadius:8,border:"none",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:font,background:"#FEE500",color:"#191919"}}>카카오 로그인</button>
          <button style={{height:48,borderRadius:8,border:"1px solid #dee2e6",fontWeight:500,fontSize:14,cursor:"pointer",fontFamily:font,background:"#fff",color:"#495057"}}>Google 로그인</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}><div style={{flex:1,height:1,background:"#e9ecef"}}/><span style={{fontSize:12,color:"#adb5bd",whiteSpace:"nowrap",fontFamily:font}}>이메일로 로그인</span><div style={{flex:1,height:1,background:"#e9ecef"}}/></div>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
          <input placeholder="이메일" style={{height:48,padding:"0 16px",border:"1px solid #dee2e6",borderRadius:8,fontSize:14,fontFamily:font,outline:"none"}} onFocus={e=>e.target.style.borderColor=O} onBlur={e=>e.target.style.borderColor="#dee2e6"}/>
          <input type="password" placeholder="비밀번호" style={{height:48,padding:"0 16px",border:"1px solid #dee2e6",borderRadius:8,fontSize:14,fontFamily:font,outline:"none"}} onFocus={e=>e.target.style.borderColor=O} onBlur={e=>e.target.style.borderColor="#dee2e6"}/>
        </div>
        <button onClick={()=>go("roleSelect")} style={{width:"100%",height:48,borderRadius:8,border:"none",background:O,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:font}}>로그인</button>
        <p style={{fontSize:12,color:"#adb5bd",textAlign:"center",marginTop:16,fontFamily:font}}>비밀번호를 잊으셨나요? <span style={{color:O,cursor:"pointer"}}>비밀번호 찾기</span></p>
      </div>
      <p style={{textAlign:"center",fontSize:13,color:"#868e96",marginTop:20,fontFamily:font}}>아직 계정이 없으신가요? <span style={{color:O,fontWeight:600,cursor:"pointer"}} onClick={()=>go("signup")}>회원가입</span></p>
    </div>
    <ChannelTalkBtn/>
  </div>;
}

// ── SIGNUP ──
function Signup({go}){
  const [role,setRole]=useState("student");
  const [submitted,setSubmitted]=useState(false);
  const roleLabels={student:"학생",teacher:"교사",staff:"직원",admin:"관리자"};
  const roleDesc={student:"수강생으로 가입합니다. 바로 이용 가능합니다.",teacher:"강사로 가입합니다. 관리자 승인 후 이용 가능합니다.",staff:"운영 직원으로 가입합니다. 관리자 승인 후 이용 가능합니다.",admin:"관리자로 가입합니다. 기존 관리자 승인이 필요합니다."};

  if(submitted){
    const need=role!=="student";
    return <div style={{fontFamily:font,minHeight:"100vh",background:"#f8f9fa",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:400,textAlign:"center"}}>
        <div style={{background:"#fff",borderRadius:12,padding:40,border:"1px solid #e9ecef"}}>
          <div style={{width:64,height:64,borderRadius:32,background:need?"#FFF9DB":"#EBFBEE",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
            {need?<svg width="28" height="28" fill="none" stroke="#E67700" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>:<svg width="28" height="28" fill="none" stroke="#2B8A3E" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>}
          </div>
          <h2 style={{fontSize:18,fontWeight:700,marginBottom:8,fontFamily:font}}>{need?"가입 신청 완료":"회원가입 완료!"}</h2>
          <p style={{fontSize:14,color:"#868e96",lineHeight:1.6,marginBottom:24,fontFamily:font}}>
            {need?<>{roleLabels[role]} 계정으로 가입 신청되었습니다.<br/>관리자 승인 후 이용 가능합니다.<br/>승인 완료 시 이메일로 알려드립니다.</>:<>학생 계정이 생성되었습니다.<br/>바로 로그인하여 강의를 시작하세요!</>}
          </p>
          <button onClick={()=>go("login")} style={{width:"100%",height:48,borderRadius:8,border:"none",background:O,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:font}}>로그인 페이지로</button>
        </div>
      </div>
      <ChannelTalkBtn/>
    </div>;
  }

  return <div style={{fontFamily:font,minHeight:"100vh",background:"#f8f9fa",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
    <div style={{width:"100%",maxWidth:440}}>
      <div style={{textAlign:"center",marginBottom:32,cursor:"pointer"}} onClick={()=>go("landing")}><span style={{fontSize:24,fontWeight:800,color:O,fontFamily:font}}>리바운드</span><span style={{fontSize:24,fontWeight:800,fontFamily:font}}>에듀</span></div>
      <div style={{background:"#fff",borderRadius:12,padding:32,border:"1px solid #e9ecef"}}>
        <h1 style={{fontSize:18,fontWeight:700,textAlign:"center",marginBottom:24,fontFamily:font}}>회원가입</h1>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
          {[["이름","홍길동","text"],["이메일","email@example.com","email"],["비밀번호","8자 이상","password"],["비밀번호 확인","비밀번호 재입력","password"]].map(([l,p,t],i)=>(
            <div key={i}><label style={{display:"block",fontSize:13,fontWeight:600,color:"#495057",marginBottom:6,fontFamily:font}}>{l}</label><input type={t} placeholder={p} style={{width:"100%",height:44,padding:"0 14px",border:"1px solid #dee2e6",borderRadius:8,fontSize:14,fontFamily:font,outline:"none",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=O} onBlur={e=>e.target.style.borderColor="#dee2e6"}/></div>
          ))}
        </div>
        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:13,fontWeight:600,color:"#495057",marginBottom:10,fontFamily:font}}>가입 유형</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {(["student","teacher","staff","admin"]).map(r=>{
              const active=role===r;
              return <button key={r} onClick={()=>setRole(r)} style={{padding:"12px 14px",borderRadius:8,border:active?`2px solid ${O}`:"1px solid #dee2e6",background:active?OL:"#fff",cursor:"pointer",fontFamily:font,textAlign:"left",transition:"all .15s"}}>
                <p style={{fontSize:14,fontWeight:600,color:active?O:"#212529",fontFamily:font}}>{roleLabels[r]}</p>
                <p style={{fontSize:11,color:active?"#c2410c":"#adb5bd",lineHeight:1.4,fontFamily:font}}>{r==="student"?"바로 이용":r==="teacher"?"강사 신청":"승인 필요"}</p>
              </button>;
            })}
          </div>
          <p style={{fontSize:12,color:"#868e96",marginTop:8,lineHeight:1.5,fontFamily:font}}>{roleDesc[role]}</p>
        </div>
        <button onClick={()=>setSubmitted(true)} style={{width:"100%",height:48,borderRadius:8,border:"none",background:O,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:font}}>{role==="student"?"회원가입":"가입 신청"}</button>
      </div>
      <p style={{textAlign:"center",fontSize:13,color:"#868e96",marginTop:20,fontFamily:font}}>이미 계정이 있으신가요? <span style={{color:O,fontWeight:600,cursor:"pointer"}} onClick={()=>go("login")}>로그인</span></p>
    </div>
    <ChannelTalkBtn/>
  </div>;
}

// ── ROLE SELECT ──
function RoleSelect({go}){
  const roles=["student","teacher","staff","admin"];
  const roleLabels={student:"학생",teacher:"교사",staff:"직원",admin:"관리자"};
  const roleDesc={student:"강의 수강, Q&A, 수료증",teacher:"강의 관리, 스케줄, 정산",staff:"학생·교사 DB, CS, 검수",admin:"전체 관리, 매출, 설정"};
  const roleColors={student:"#228be6",teacher:"#20c997",staff:"#fab005",admin:"#7950f2"};
  const roleIcons={student:IC.Book,teacher:IC.Cal,staff:IC.Head,admin:IC.Layout};

  return <div style={{fontFamily:font,minHeight:"100vh",background:"#f8f9fa",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
    <div style={{width:"100%",maxWidth:480}}>
      <div style={{textAlign:"center",marginBottom:32}}><span style={{fontSize:24,fontWeight:800,color:O,fontFamily:font}}>리바운드</span><span style={{fontSize:24,fontWeight:800,fontFamily:font}}>에듀</span></div>
      <div style={{background:"#fff",borderRadius:12,padding:32,border:"1px solid #e9ecef"}}>
        <div style={{textAlign:"center",marginBottom:8}}>
          <div style={{width:48,height:48,borderRadius:24,background:OL,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><svg width="24" height="24" fill="none" stroke={O} strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          <h1 style={{fontSize:18,fontWeight:700,marginBottom:4,fontFamily:font}}>김동찬님, 안녕하세요</h1>
          <p style={{fontSize:14,color:"#868e96",fontFamily:font}}>접속할 공간을 선택해주세요</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:24}}>
          {roles.map(r=>{
            const Icon=roleIcons[r];
            return <button key={r} onClick={()=>go("dash",r)} style={{display:"flex",alignItems:"center",gap:14,padding:"16px 18px",borderRadius:10,border:"1px solid #e9ecef",background:"#fff",cursor:"pointer",fontFamily:font,transition:"all .15s",textAlign:"left"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=roleColors[r];e.currentTarget.style.background="#fafafa"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#e9ecef";e.currentTarget.style.background="#fff"}}>
              <div style={{width:40,height:40,borderRadius:10,background:roleColors[r]+"18",display:"flex",alignItems:"center",justifyContent:"center",color:roleColors[r],flexShrink:0}}><Icon/></div>
              <div style={{flex:1}}><p style={{fontSize:15,fontWeight:600,color:"#212529",fontFamily:font}}>{roleLabels[r]}</p><p style={{fontSize:12,color:"#868e96",marginTop:2,fontFamily:font}}>{roleDesc[r]}</p></div>
              <span style={{color:"#adb5bd"}}><IC.ChevronRight/></span>
            </button>;
          })}
        </div>
      </div>
      <p style={{textAlign:"center",fontSize:13,color:"#868e96",marginTop:20,fontFamily:font}}><span style={{cursor:"pointer",color:O}} onClick={()=>go("login")}>← 다른 계정으로 로그인</span></p>
    </div>
    <ChannelTalkBtn/>
  </div>;
}

// ── Dashboard pages (same as v3 but with font applied) ──
function StudentDash(){
  const enroll=[
    {t:"공실 해결 실전 마스터 과정",by:"김동찬",pct:50,done:12,total:24,st:"수강중",sc:"blue"},
    {t:"부동산 중개 실무 입문",by:"리바운드중개",pct:100,done:16,total:16,st:"완강",sc:"green"},
    {t:"AI 업무 자동화 기초",by:"리바운드",pct:25,done:3,total:12,st:"수강중",sc:"blue"},
  ];
  return <>
    <h2 style={{fontSize:16,fontWeight:700,marginBottom:14,fontFamily:font}}>수강 중인 강의</h2>
    <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
      {enroll.map((e,i)=><div key={i} style={{background:"#fff",borderRadius:8,border:"1px solid #f0f0f0",padding:"18px 20px",cursor:"pointer"}} onMouseEnter={x=>x.currentTarget.style.borderColor="#dee2e6"} onMouseLeave={x=>x.currentTarget.style.borderColor="#f0f0f0"}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div><h3 style={{fontSize:15,fontWeight:600,marginBottom:4,fontFamily:font}}>{e.t}</h3><p style={{fontSize:13,color:"#868e96",fontFamily:font}}>{e.by} · 총 {e.total}강</p></div>
          <Badge color={e.sc}>{e.st}</Badge>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1,height:4,background:"#f1f3f5",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",borderRadius:2,background:e.pct===100?"#40c057":O,width:`${e.pct}%`}}/></div>
          <span style={{fontSize:12,color:"#868e96",minWidth:70,textAlign:"right",fontFamily:font}}>{e.done}/{e.total}강 ({e.pct}%)</span>
        </div>
      </div>)}
    </div>
    <h2 style={{fontSize:16,fontWeight:700,marginBottom:14,fontFamily:font}}>추천 강의</h2>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <CourseCard title="호스텔 창업 바이블" instructor="권진수 · 김동찬" rating={4.9} students="47" price="₩390,000" original="₩490,000" tags={["숙박업"]} thumb="linear-gradient(135deg,#40c057,#69db7c)"/>
      <CourseCard title="고연봉 AI 시스템 설계" instructor="리바운드" rating={4.7} students="85" price="₩290,000" tags={["AI자동화"]} thumb="linear-gradient(135deg,#7950f2,#9775fa)"/>
    </div>
  </>;
}

function TeacherDash(){
  return <>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:28}}>
      <Stat l="총 수강생" v="482" sub="+23 이번달"/><Stat l="이번달 매출" v="₩12.4M" sub="+18%"/><Stat l="평균 완강률" v="67%"/><Stat l="미답변 Q&A" v="2" accent="#e03131"/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <div>
        <h2 style={{fontSize:16,fontWeight:700,marginBottom:14,fontFamily:font}}>이번 주 스케줄</h2>
        <div style={{background:"#fff",borderRadius:8,border:"1px solid #f0f0f0",overflow:"hidden"}}>
          {[{d:"3/15 (토)",ty:"촬영",t:"공실해결 13강 촬영",tm:"10:00 · 스튜디오 A",c:"blue"},{d:"3/16 (일)",ty:"리허설",t:"14강 대본 점검",tm:"14:00 · 온라인",c:"amber"},{d:"3/18 (화)",ty:"무료특강",t:"공실 진단법 라이브",tm:"19:00 · 라이브",c:"green"},{d:"3/20 (목)",ty:"본강의",t:"공실해결 15강 녹화",tm:"10:00 · 스튜디오 A",c:"red"}].map((s,i)=><div key={i} style={{padding:"14px 16px",borderBottom:"1px solid #f8f9fa",display:"flex",gap:14,alignItems:"center",cursor:"pointer"}} onMouseEnter={x=>x.currentTarget.style.background="#f8f9fa"} onMouseLeave={x=>x.currentTarget.style.background="#fff"}>
            <div style={{textAlign:"center",minWidth:56}}><Badge color={s.c}>{s.ty}</Badge><p style={{fontSize:11,color:"#adb5bd",marginTop:4,fontFamily:font}}>{s.d}</p></div>
            <div><p style={{fontSize:14,fontWeight:600,fontFamily:font}}>{s.t}</p><p style={{fontSize:12,color:"#868e96",marginTop:2,fontFamily:font}}>{s.tm}</p></div>
          </div>)}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div><h2 style={{fontSize:16,fontWeight:700,marginBottom:14,fontFamily:font}}>최근 Q&A</h2><div style={{background:"#fff",borderRadius:8,border:"1px solid #f0f0f0",overflow:"hidden"}}>{[{q:"공실률 계산 방법?",by:"이수현 · 3시간 전",a:false},{q:"임대차 계약서 작성 팁",by:"정하은 · 1일 전",a:true}].map((q,i)=><div key={i} style={{padding:"12px 16px",borderBottom:"1px solid #f8f9fa",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}><div><p style={{fontSize:14,fontWeight:500,fontFamily:font}}>{q.q}</p><p style={{fontSize:12,color:"#adb5bd",marginTop:2,fontFamily:font}}>{q.by}</p></div><Badge color={q.a?"green":"red"}>{q.a?"답변완료":"미답변"}</Badge></div>)}</div></div>
        <div><h2 style={{fontSize:16,fontWeight:700,marginBottom:14,fontFamily:font}}>내 강의</h2><div style={{background:"#fff",borderRadius:8,border:"1px solid #f0f0f0",overflow:"hidden"}}>{[{t:"공실 해결 마스터",n:312,s:"공개중",c:"green"},{t:"호스텔 창업 바이블",n:0,s:"준비중",c:"amber"}].map((c,i)=><div key={i} style={{padding:"12px 16px",borderBottom:"1px solid #f8f9fa",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}><div><p style={{fontSize:14,fontWeight:600,fontFamily:font}}>{c.t}</p><p style={{fontSize:12,color:"#adb5bd",marginTop:1,fontFamily:font}}>수강생 {c.n}명</p></div><Badge color={c.c}>{c.s}</Badge></div>)}</div></div>
      </div>
    </div>
  </>;
}

function StaffDash(){
  return <>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:28}}>
      <Stat l="전체 학생" v="1,247" sub="+32"/><Stat l="등록 교사" v="8"/><Stat l="대기 CS" v="2" accent="#e03131"/><Stat l="검수 대기" v="2" accent="#e67700"/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:16}}>
      <div><h2 style={{fontSize:16,fontWeight:700,marginBottom:14,fontFamily:font}}>CS 상담 현황</h2><div style={{background:"#fff",borderRadius:8,border:"1px solid #f0f0f0",overflow:"hidden"}}><div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr .7fr .6fr",padding:"10px 16px",borderBottom:"1px solid #e9ecef",fontSize:12,fontWeight:600,color:"#868e96",fontFamily:font}}><span>이름</span><span>유형</span><span>접수일</span><span>상태</span></div>{[{n:"이수현",cat:"환불 요청",d:"3/13",s:"대기",c:"red"},{n:"최민준",cat:"결제 오류",d:"3/13",s:"대기",c:"red"},{n:"정하은",cat:"강의 문의",d:"3/12",s:"진행중",c:"amber"},{n:"김태호",cat:"수료증",d:"3/12",s:"완료",c:"green"}].map((t,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1.3fr 1fr .7fr .6fr",padding:"12px 16px",borderBottom:"1px solid #f8f9fa",fontSize:14,alignItems:"center",cursor:"pointer",fontFamily:font}} onMouseEnter={x=>x.currentTarget.style.background="#f8f9fa"} onMouseLeave={x=>x.currentTarget.style.background="#fff"}><span style={{fontWeight:600}}>{t.n}</span><span style={{color:"#495057"}}>{t.cat}</span><span style={{color:"#adb5bd"}}>{t.d}</span><Badge color={t.c}>{t.s}</Badge></div>)}</div></div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div><h2 style={{fontSize:16,fontWeight:700,marginBottom:14,fontFamily:font}}>콘텐츠 검수</h2><div style={{background:"#fff",borderRadius:8,border:"1px solid #f0f0f0",overflow:"hidden"}}>{[{t:"호스텔 창업 1~3강",s:"검수중"},{t:"AI 자동화 7강 수정본",s:"대기"}].map((c,i)=><div key={i} style={{padding:"12px 16px",borderBottom:"1px solid #f8f9fa",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:14,fontWeight:500,fontFamily:font}}>{c.t}</span><Badge color="amber">{c.s}</Badge></div>)}</div></div>
        <div><h2 style={{fontSize:16,fontWeight:700,marginBottom:14,fontFamily:font}}>프로모션</h2><div style={{background:"#fff",borderRadius:8,border:"1px solid #f0f0f0",overflow:"hidden"}}>{[{t:"얼리버드 30% 할인",d:"D-5",c:"blue"},{t:"2강좌 번들 20%",d:"진행중",c:"green"}].map((p,i)=><div key={i} style={{padding:"12px 16px",borderBottom:"1px solid #f8f9fa",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:14,fontWeight:500,fontFamily:font}}>{p.t}</span><Badge color={p.c}>{p.d}</Badge></div>)}</div></div>
      </div>
    </div>
  </>;
}

function AdminDash(){
  const rev=[{m:"10월",v:28.5},{m:"11월",v:32.1},{m:"12월",v:29.8},{m:"1월",v:38.2},{m:"2월",v:42.6},{m:"3월",v:48.2}];
  const mx=Math.max(...rev.map(r=>r.v));
  return <>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:28}}>
      <Stat l="월 매출" v="₩48.2M" sub="+13%"/><Stat l="신규 가입" v="+127" sub="이번달"/><Stat l="전환율" v="8.3%"/><Stat l="활성 강의" v="14"/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:16}}>
      <div>
        <h2 style={{fontSize:16,fontWeight:700,marginBottom:14,fontFamily:font}}>월별 매출 추이</h2>
        <div style={{background:"#fff",borderRadius:8,border:"1px solid #f0f0f0",padding:20}}>
          <div style={{display:"flex",alignItems:"flex-end",gap:10,height:160}}>
            {rev.map((r,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
              <span style={{fontSize:11,color:"#868e96",fontWeight:500,fontFamily:font}}>{r.v}M</span>
              <div style={{width:"100%",borderRadius:"4px 4px 0 0",background:O,opacity:.45+i*.1,height:`${(r.v/mx)*130}px`,cursor:"pointer"}} onMouseEnter={x=>x.style.opacity="1"} onMouseLeave={x=>x.style.opacity=String(.45+i*.1)}/>
              <span style={{fontSize:12,color:"#868e96",fontFamily:font}}>{r.m}</span>
            </div>)}
          </div>
        </div>
        <h2 style={{fontSize:16,fontWeight:700,marginBottom:14,marginTop:20,fontFamily:font}}>강의 승인 대기</h2>
        <div style={{background:"#fff",borderRadius:8,border:"1px solid #f0f0f0",overflow:"hidden"}}>
          {[{t:"호스텔 창업 바이블",by:"권진수 · 18강",d:"3/10"},{t:"고연봉 AI 시스템 설계",by:"리바운드 · 12강",d:"3/12"}].map((c,i)=><div key={i} style={{padding:16,borderBottom:"1px solid #f8f9fa"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:14,fontWeight:600,fontFamily:font}}>{c.t}</span><Badge color="amber">검토중</Badge></div>
            <p style={{fontSize:12,color:"#adb5bd",marginBottom:10,fontFamily:font}}>{c.by} · 제출 {c.d}</p>
            <div style={{display:"flex",gap:8}}><button style={{flex:1,height:32,borderRadius:6,border:"none",background:O,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:font}}>승인</button><button style={{flex:1,height:32,borderRadius:6,border:"1px solid #dee2e6",background:"#fff",color:"#495057",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:font}}>수정요청</button></div>
          </div>)}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div><h2 style={{fontSize:16,fontWeight:700,marginBottom:14,fontFamily:font}}>가입 승인 대기</h2><div style={{background:"#fff",borderRadius:8,border:"1px solid #f0f0f0",overflow:"hidden"}}>{[{n:"박영수",role:"교사",d:"3/13"},{n:"이지은",role:"직원",d:"3/12"},{n:"최현우",role:"교사",d:"3/11"}].map((u,i)=><div key={i} style={{padding:"12px 16px",borderBottom:"1px solid #f8f9fa",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><p style={{fontSize:14,fontWeight:600,fontFamily:font}}>{u.n}</p><p style={{fontSize:12,color:"#adb5bd",marginTop:1,fontFamily:font}}>{u.role} 신청 · {u.d}</p></div><div style={{display:"flex",gap:6}}><button style={{padding:"4px 12px",borderRadius:6,border:"none",background:O,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:font}}>승인</button><button style={{padding:"4px 12px",borderRadius:6,border:"1px solid #dee2e6",background:"#fff",color:"#868e96",fontSize:12,cursor:"pointer",fontFamily:font}}>거절</button></div></div>)}</div></div>
        <div><h2 style={{fontSize:16,fontWeight:700,marginBottom:14,fontFamily:font}}>최근 활동</h2><div style={{background:"#fff",borderRadius:8,border:"1px solid #f0f0f0",overflow:"hidden"}}>{[{a:"이수현 환불 요청",t:"2시간 전"},{a:"공실해결 12강 업로드",t:"4시간 전"},{a:"신규 가입 +8명",t:"오늘"},{a:"3월 정산 확인 대기",t:"어제"}].map((a,i)=><div key={i} style={{padding:"12px 16px",borderBottom:"1px solid #f8f9fa",display:"flex",justifyContent:"space-between",cursor:"pointer",fontSize:14,fontFamily:font}} onMouseEnter={x=>x.currentTarget.style.background="#f8f9fa"} onMouseLeave={x=>x.currentTarget.style.background="#fff"}><span style={{color:"#495057"}}>{a.a}</span><span style={{fontSize:12,color:"#adb5bd"}}>{a.t}</span></div>)}</div></div>
      </div>
    </div>
  </>;
}

// ── DASHBOARD SHELL ──
function DashShell({role,menu,setMenu,go}){
  const cfg=ROLES[role];
  const cur=cfg.menus.find(m=>m.id===menu)||cfg.menus[0];
  const names={student:"김학생",teacher:"김동찬",staff:"박직원",admin:"관리자"};
  const colors={student:"#228be6",teacher:"#20c997",staff:"#fab005",admin:"#7950f2"};

  return <div style={{fontFamily:font,minHeight:"100vh",display:"flex",background:"#f8f9fa",color:"#212529"}}>
    <aside style={{width:220,background:"#fff",borderRight:"1px solid #e9ecef",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh"}}>
      <div style={{padding:"18px 20px",borderBottom:"1px solid #f1f3f5",cursor:"pointer"}} onClick={()=>go("landing")}><span style={{fontSize:18,fontWeight:800,color:O,fontFamily:font}}>리바운드</span><span style={{fontSize:18,fontWeight:800,fontFamily:font}}>에듀</span></div>
      <div style={{padding:"16px 20px",borderBottom:"1px solid #f1f3f5",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:colors[role],display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:700,fontFamily:font}}>{names[role][0]}</div>
        <div><p style={{fontSize:14,fontWeight:600,fontFamily:font}}>{names[role]}</p><p style={{fontSize:12,color:"#adb5bd",fontFamily:font}}>{cfg.label}</p></div>
      </div>
      <nav style={{flex:1,padding:"12px 10px",overflow:"auto"}}>
        {cfg.menus.map(m=>{
          const Icon=icMap[m.ic]||IC.Book;const active=menu===m.id;
          return <button key={m.id} onClick={()=>setMenu(m.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:font,fontSize:14,fontWeight:active?600:400,color:active?O:"#495057",background:active?OL:"transparent",marginBottom:2,transition:"all .15s"}}><span style={{color:active?O:"#868e96"}}><Icon/></span>{m.l}</button>;
        })}
      </nav>
      <div style={{padding:"8px 10px",borderTop:"1px solid #f1f3f5"}}>
        <button onClick={()=>go("roleSelect")} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:font,fontSize:13,color:"#868e96",background:"transparent",marginBottom:2}}><IC.Users/>공간 전환</button>
        <button onClick={()=>go("login")} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:font,fontSize:13,color:"#868e96",background:"transparent"}}><IC.Out/>로그아웃</button>
      </div>
    </aside>
    <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
      <header style={{height:60,background:"#fff",borderBottom:"1px solid #e9ecef",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",flexShrink:0,position:"sticky",top:0,zIndex:20}}>
        <h1 style={{fontSize:18,fontWeight:700,fontFamily:font}}>{cur.l}</h1>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button style={{padding:8,borderRadius:8,border:"none",background:"transparent",cursor:"pointer",color:"#868e96"}}><IC.Search/></button>
          <button style={{padding:8,borderRadius:8,border:"none",background:"transparent",cursor:"pointer",color:"#868e96",position:"relative"}}><IC.Bell/><span style={{position:"absolute",top:6,right:6,width:6,height:6,borderRadius:3,background:"#e03131"}}/></button>
        </div>
      </header>
      <main style={{flex:1,padding:24,overflow:"auto"}}><div style={{maxWidth:960}}>
        {role==="student"&&<StudentDash/>}
        {role==="teacher"&&<TeacherDash/>}
        {role==="staff"&&<StaffDash/>}
        {role==="admin"&&<AdminDash/>}
      </div></main>
    </div>
    <ChannelTalkBtn/>
  </div>;
}

// ── MAIN ──
export default function App(){
  const [page,setPage]=useState("landing");
  const [role,setRole]=useState("student");
  const [menu,setMenu]=useState("home");
  const go=(target,r)=>{if(target==="dash"){setRole(r);setMenu("home");setPage("dash");}else setPage(target);};

  if(page==="landing") return <Landing go={go}/>;
  if(page==="login") return <Login go={go}/>;
  if(page==="signup") return <Signup go={go}/>;
  if(page==="roleSelect") return <RoleSelect go={go}/>;
  if(page==="dash") return <DashShell role={role} menu={menu} setMenu={setMenu} go={go}/>;
  return null;
}
