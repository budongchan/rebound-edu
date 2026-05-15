# Cafe24 결제 링크 연동

리바운드에듀는 강의 소개/랜딩/수강 안내를 담당하고, 유료 강의 결제는 Cafe24 상품 상세/결제 페이지로 넘긴다.

## 기본 쇼핑몰

- Cafe24: `https://reboundws.cafe24.com`

## 현재 확인된 상품 링크

| 리바운드에듀 강의 | course id | Cafe24 상품 |
|---|---|---|
| 호스텔 창업 유료 특강 | `c0000000-0000-0000-0000-000000000002` | `https://reboundws.cafe24.com/product/detail.html?product_no=31` |

## 환경변수로 추가 매핑

Vercel 환경변수 `NEXT_PUBLIC_CAFE24_COURSE_URLS`에 JSON으로 추가하면 코드 수정 없이 강의별 결제 링크를 바꿀 수 있다.

```json
{
  "c0000000-0000-0000-0000-000000000001": "https://reboundws.cafe24.com/product/detail.html?product_no=OO",
  "course-slug": "https://reboundws.cafe24.com/product/detail.html?product_no=OO",
  "강의명": "https://reboundws.cafe24.com/product/detail.html?product_no=OO"
}
```

## 운영 원칙

- 유료 강의: 리바운드에듀 상세 페이지 CTA → Cafe24 상품 페이지 이동.
- 무료 강의: 기존 리바운드에듀 로그인/무료 수강 신청 흐름 유지.
- Cafe24 상품 링크가 없는 유료 강의: 사용자에게 “카페24 결제 상품 연결 준비 중” 알림.
