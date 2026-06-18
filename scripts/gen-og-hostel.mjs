import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 630px;
    overflow: hidden;
    font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
    background: #0D0D0D;
    position: relative;
  }
  .accent-bar {
    position: absolute;
    top: 0; left: 0;
    width: 8px;
    height: 100%;
    background: #FF4620;
  }
  .bg-pattern {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 600px 400px at 80% 50%, rgba(255,70,32,0.12) 0%, transparent 70%),
      radial-gradient(ellipse 400px 300px at 20% 80%, rgba(255,70,32,0.06) 0%, transparent 60%);
  }
  .grid-lines {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .content {
    position: absolute;
    inset: 0;
    padding: 64px 72px 56px 88px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .top {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .logo-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,70,32,0.15);
    border: 1px solid rgba(255,70,32,0.4);
    border-radius: 6px;
    padding: 6px 14px;
  }
  .logo-re {
    font-size: 16px;
    font-weight: 900;
    color: #FF4620;
    letter-spacing: -0.5px;
  }
  .logo-edu {
    font-size: 16px;
    font-weight: 700;
    color: rgba(255,255,255,0.9);
    letter-spacing: -0.3px;
  }
  .dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.3); }
  .category-tag {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.45);
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .middle {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 20px 0;
  }
  .course-label {
    font-size: 15px;
    font-weight: 700;
    color: #FF4620;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 20px;
  }
  .title {
    font-size: 68px;
    font-weight: 900;
    color: #FFFFFF;
    line-height: 1.1;
    letter-spacing: -2px;
    margin-bottom: 24px;
  }
  .title .highlight {
    color: #FF4620;
  }
  .subtitle {
    font-size: 26px;
    font-weight: 500;
    color: rgba(255,255,255,0.55);
    letter-spacing: -0.5px;
    line-height: 1.4;
  }
  .subtitle .by {
    font-size: 22px;
    color: rgba(255,255,255,0.35);
  }
  .bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }
  .tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    max-width: 700px;
  }
  .tag {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 4px;
    padding: 5px 12px;
    letter-spacing: 0.3px;
  }
  .domain {
    font-size: 16px;
    font-weight: 700;
    color: rgba(255,255,255,0.25);
    letter-spacing: 0.5px;
  }
  .schedule-block {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .schedule-pill {
    background: rgba(255,70,32,0.12);
    border: 1px solid rgba(255,70,32,0.35);
    border-radius: 6px;
    padding: 6px 14px;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .schedule-pill .day-label {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,70,32,0.7);
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .schedule-pill .time-val {
    font-size: 14px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.3px;
  }
  .guarantee-pill {
    background: rgba(16,185,129,0.12);
    border: 1px solid rgba(16,185,129,0.35);
    border-radius: 6px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 700;
    color: #6ee7b7;
    line-height: 1.5;
  }
  .orange-corner {
    position: absolute;
    right: 0; bottom: 0;
    width: 280px;
    height: 280px;
    background: radial-gradient(circle at 100% 100%, rgba(255,70,32,0.2) 0%, transparent 70%);
    pointer-events: none;
  }
</style>
</head>
<body>
  <div class="accent-bar"></div>
  <div class="bg-pattern"></div>
  <div class="grid-lines"></div>
  <div class="orange-corner"></div>
  <div class="content">
    <div class="top">
      <div class="logo-badge">
        <span class="logo-re">RE</span>
        <span class="logo-edu">리바운드 에듀</span>
      </div>
      <div class="dot"></div>
      <span class="category-tag">숙박업 · 호스텔 창업</span>
    </div>
    <div class="middle">
      <div class="course-label">LIVE CLASS</div>
      <div class="title">호스텔 창업<br><span class="highlight">올인원</span> 과정</div>
      <div class="subtitle">이론부터 매물까지<br><span class="by">by 부동찬</span></div>
    </div>
    <div class="bottom">
      <div class="schedule-block">
        <div class="schedule-pill">
          <span class="day-label">평일반</span>
          <span class="time-val">목 13:00-19:00</span>
        </div>
        <div class="schedule-pill">
          <span class="day-label">주말반</span>
          <span class="time-val">토 13:00-19:00</span>
        </div>
        <div class="guarantee-pill">6개월 내 계약 실패 시<br>수강료 100% 환급</div>
      </div>
      <div class="domain">edu.rebound.io.kr</div>
    </div>
  </div>
</body>
</html>`;

const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.waitForTimeout(500);

const outPath = path.join(process.cwd(), 'public/og/hostel-live-sat.png');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
await page.screenshot({ path: outPath, type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log('OG image saved:', outPath);
