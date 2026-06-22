# CMS — Customer Management System

영업/컨설팅 조직을 위한 **고객 관리 시스템** 포트폴리오. 고객사 정보, 상담 이력, 계약 내역, 담당자를
한 곳에서 관리하는 풀스택 웹 애플리케이션입니다.

> 실제 SI 프로젝트로 개발한 시스템을 개인 포트폴리오용으로 재구성·표준화한 버전입니다.
> 조직 식별 정보·내부 주소·자격증명은 모두 제거했고, 환경변수 기반으로 전환했습니다.

---

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Radix UI |
| Backend | Node.js, Express 5 |
| Database | MySQL 8 (mysql2) |
| 기타 | multer(파일 업로드), react-router-dom, recharts |

## 주요 기능

- **고객 현황** — 고객사 목록 조회·검색·필터, 등록/수정/상세, 사업자등록증·회사소개서 첨부
- **상담 현황** — 상담 이력 기록·조회, 고객/자사 참석자·주요 상담 내용 관리
- **계약 현황** — 계약 내역 등록·조회, 사업 기간·계약 금액·MD/PM 관리
- **담당자 현황** — 고객사 담당자(연락처) 관리
- **대시보드(홈)** — 지표 카드 + 차트(최근 6개월 신규 고객 추이, 지역별 분포) + 최근 등록 목록
- **빠른 등록** — 핵심 필드만으로 고객을 즉시 등록(상세 입력 폼과 병행)
- 목록 → 상세 하이라이트 네비게이션, 클라이언트 페이징, 반응형(모바일 드로어 메뉴)
- 모던 SaaS 디자인(인디고/슬레이트) — 공용 디자인 토큰·UI 컴포넌트로 전 화면 일관

## 아키텍처

```
cms-portfolio/
├─ CMS/                     # 프론트엔드 (Vite + React + TS)
│  └─ src/
│     ├─ pages/             # 도메인별 화면 (Customer/Consultation/Contract/Manager/Home)
│     ├─ shared/
│     │  ├─ components/list # 목록 화면 공용 베이스 (ListTable, ServerPagination ...)
│     │  ├─ hooks/          # useClientPagedList 등 공용 훅
│     │  ├─ sections/       # 폼 섹션 컴포넌트
│     │  ├─ ui/             # 디자인 시스템 (Radix 기반)
│     │  └─ utils/          # 포매터·유틸
│     ├─ api/               # 백엔드 API 호출 레이어
│     └─ types/             # 도메인 타입
└─ server/                  # 백엔드 (Express + MySQL)
   ├─ routes/               # 라우팅
   ├─ controllers/          # 비즈니스 로직
   ├─ db/                   # schema.sql · seed.sql
   └─ database.js           # MySQL 커넥션 풀
```

### 목록 화면 표준화 (List standardization)

모든 목록 화면이 동일한 표·페이징·정렬·선택 동작을 공유하도록 공용 베이스를 도입했습니다.

- [`ListTable`](CMS/src/shared/components/list/ListTable.tsx) — 컬럼 정의 기반 표준 표 (로딩/빈 상태, 숫자 포맷, 행 선택, 헤더 정렬, 하이라이트, 페이징 통합)
- [`useClientPagedList`](CMS/src/shared/hooks/useClientPagedList.ts) — 클라이언트 페이징 계산 단일 소스
- 표 디자인을 바꾸려면 `ListTable` 한 곳만 수정하면 전 목록 화면에 반영됩니다.

## 실행 방법

### 사전 준비
- Node.js 18+
- MySQL 8

### 데이터베이스
스키마와 샘플 데이터는 [`server/db/`](server/db) 에 있습니다.
```bash
mysql -u root -p < server/db/schema.sql   # cms_db + 테이블 생성
mysql -u root -p < server/db/seed.sql      # (선택) 샘플 데이터 — 대시보드/목록이 채워짐
```
> `seed.sql` 의 등록일·계약일은 실행 시점 기준 상대값이라 대시보드 차트가 항상 최근 데이터로 표시됩니다.
> 모든 샘플 데이터는 가상의 값입니다.

### 백엔드
```bash
cd server
cp .env.example .env      # DB 접속 정보 입력 (DB_USER / DB_PASSWORD 등)
npm install
npm start                 # 기본 포트 5000
```

### 프론트엔드
```bash
cd CMS
cp .env.example .env      # 필요 시 VITE_SERVER_URL 설정 (기본 http://localhost:5000)
npm install
npm run dev
```

### 스크립트
| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 번들 |
| `npm run typecheck` | 타입 검사 (`tsc --noEmit`) |

## 로드맵 / 표준화 진행

- [x] 환경변수 기반 설정 전환 (하드코딩된 주소·자격증명 제거)
- [x] 조직 식별 정보 제거 및 도메인 용어 일반화
- [x] 죽은 코드·중복 라우트 정리, TypeScript 도입(`tsc` 도구화)
- [x] 목록 화면 공용 베이스(`ListTable` / `useClientPagedList`) 도입
- [x] 전 목록 화면을 공용 베이스로 전환 (Customer / Consultation / Contract / Manager)
- [x] 폼/상세 화면의 도메인 타입 통합 (`Contract` / `CustomerContact`) — **`npm run typecheck` 0 에러**
- [x] 디자인 리뉴얼(모던 SaaS) + 시각적 대시보드(차트) + 빠른 등록
- [ ] 추가 기능: 목록 검색·엑셀 내보내기, 권한/인증, 상세 폼 단계화 — 향후

> `npm run build` 는 타입 검사(`tsc --noEmit`) 통과 후 번들링하도록 구성되어 있습니다.
