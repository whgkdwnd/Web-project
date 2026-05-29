# 팀 공유 캘린더 앱 설계 문서

## 개요

팀 코드 기반으로 누구나 참여할 수 있는 공유 캘린더 앱. 로그인 없이 팀 코드만으로 일정을 공유하고, 팀원별 색상으로 누가 어떤 일정을 등록했는지 구분할 수 있다.

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React (Vite) |
| 백엔드 | Python FastAPI |
| DB | PostgreSQL |
| 컨테이너 | Docker |
| 리버스 프록시 | Nginx |
| 프론트 배포 | Vercel (GitHub 자동 배포) |
| 백엔드 배포 | Render (Docker 자동 배포) |
| CI/CD | GitHub Actions |

---

## 아키텍처

### 배포 구조

```
GitHub Repository
        │
        │ push to main
        ▼
GitHub Actions (CI)
  1. FastAPI pytest 테스트
  2. React 빌드 테스트
  실패 시 배포 중단
        │
  ┌─────┴──────┐
  ▼            ▼
Vercel       Render
React 배포   Docker 이미지 빌드 + 배포
               └── 컨테이너
                    ├── Nginx (port 10000, 외부 진입점)
                    │    └── /api/* → FastAPI 프록시
                    └── FastAPI (port 8000, 내부)
             + Render PostgreSQL (관리형 DB)
```

### 로컬 개발 구조

```
docker-compose.yml
  ├── nginx 컨테이너 (port 80)
  ├── fastapi 컨테이너 (port 8000, 내부)
  └── postgresql 컨테이너 (port 5432, 내부)
```

### 디렉토리 구조

```
Web-project/
├── .github/
│   └── workflows/
│       └── ci.yml
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── backend/
│   ├── app/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── requirements.txt
└── docker-compose.yml
```

---

## DB 스키마 (PostgreSQL)

### teams
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 팀 고유 ID |
| code | VARCHAR(8) UNIQUE | 참여 코드 (예: AB3K9XZ2) |
| name | VARCHAR | 팀 이름 |
| created_at | TIMESTAMP | 생성일시 |

### members
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 팀원 고유 ID |
| team_id | UUID (FK → teams.id) | 소속 팀 |
| name | VARCHAR | 팀원 이름 |
| color | VARCHAR(7) | hex 색상값 (예: #FF6B6B) |
| created_at | TIMESTAMP | 등록일시 |

### events
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 일정 고유 ID |
| team_id | UUID (FK → teams.id) | 소속 팀 |
| member_id | UUID (FK → members.id) | 작성자 |
| title | VARCHAR | 일정 제목 |
| start_at | TIMESTAMP | 시작 일시 |
| end_at | TIMESTAMP | 종료 일시 |
| memo | TEXT (nullable) | 메모 |
| created_at | TIMESTAMP | 생성일시 |
| updated_at | TIMESTAMP | 수정일시 |

---

## API 설계 (FastAPI)

```
POST   /api/teams                       팀 생성 (name → code 반환)
GET    /api/teams/{code}                팀 코드로 팀 조회

POST   /api/teams/{code}/members        팀원 등록 (name, color)
GET    /api/teams/{code}/members        팀원 목록 조회

GET    /api/teams/{code}/events         일정 목록 (쿼리: year, month)
POST   /api/teams/{code}/events         일정 생성
PUT    /api/teams/{code}/events/{id}    일정 수정
DELETE /api/teams/{code}/events/{id}    일정 삭제
```

### 요청/응답 예시

**POST /api/teams**
```json
// 요청
{ "name": "우리팀" }

// 응답
{ "id": "uuid", "code": "AB3K9XZ2", "name": "우리팀" }
```

**POST /api/teams/{code}/events**
```json
// 요청
{
  "member_id": "uuid",
  "title": "팀 회의",
  "start_at": "2026-06-05T14:00:00",
  "end_at": "2026-06-05T15:00:00",
  "memo": "주간 스프린트 회의"
}

// 응답
{
  "id": "uuid",
  "title": "팀 회의",
  "member": { "name": "홍길동", "color": "#FF6B6B" },
  "start_at": "2026-06-05T14:00:00",
  "end_at": "2026-06-05T15:00:00",
  "memo": "주간 스프린트 회의"
}
```

---

## 프론트엔드 화면 구성

### 페이지 목록

1. **홈 화면 (`/`)**
   - 팀 코드 입력 → 캘린더 진입
   - 새 팀 만들기 → 팀 이름 입력 후 코드 발급

2. **이름/색상 설정 화면 (`/join`)**
   - 이름 입력
   - 색상 선택 (기존 팀원과 겹치지 않도록 표시)

3. **캘린더 화면 (`/calendar`)**
   - 월간 / 주간 뷰 전환 탭
   - 일정 있는 날짜에 팀원 색상 점(●) 표시
   - 날짜 클릭 시 하단 패널에 해당 날짜 일정 목록 표시
   - 하단 패널에서 일정 추가/수정/삭제

### 캘린더 레이아웃

```
┌─────────────────────────────────────────┐
│ 팀명: 우리팀   [월간] [주간]  < 2026.06 >│
├─────────────────────────────────────────┤
│  일   월   화   수   목   금   토        │
│                      1    2  ● 3    4   │
│  5    6  ●  7    8   9   10   11       │
│  12   13  ●14   15   16   17   18      │
│  19   20   21   22   23   24   25      │
│  26   27   28   29   30               │
├─────────────────────────────────────────┤
│  6월 7일 (선택된 날짜)          [+ 추가] │
│ ─────────────────────────────────────  │
│  ● 14:00 팀 회의       (홍길동)         │
│  ● 16:00 코드 리뷰     (김철수)         │
└─────────────────────────────────────────┘
```

---

## Web Storage 활용

### localStorage (브라우저 닫아도 유지)
| 키 | 값 | 용도 |
|----|-----|------|
| team_code | "AB3K9XZ2" | 소속 팀 코드 |
| member_id | "uuid" | 내 팀원 ID |
| member_name | "홍길동" | 내 이름 |
| member_color | "#FF6B6B" | 내 색상 |

### sessionStorage (탭 닫으면 초기화)
| 키 | 값 | 용도 |
|----|-----|------|
| current_view | "monthly" / "weekly" | 현재 캘린더 뷰 |
| selected_date | "2026-06-07" | 마지막 선택 날짜 |

### 진입 흐름

```
첫 방문
  → localStorage에 team_code 없음
  → 홈 화면

팀 코드 입력 후
  → localStorage에 team_code 저장
  → member_id 없으면 /join (이름/색상 설정)
  → member_id 있으면 /calendar 바로 진입

캘린더 진입
  → sessionStorage에서 마지막 뷰/날짜 복원
```

---

## CI/CD 파이프라인

### GitHub Actions (`ci.yml`)

```yaml
on:
  push:
    branches: [main]

jobs:
  test:
    - FastAPI: pip install + pytest
    - React: npm install + npm run build
  
  # 테스트 통과 시 Vercel/Render 자동 배포 트리거
```

### 자동 배포
- **Vercel**: GitHub 연동으로 main 브랜치 push 시 React 자동 배포
- **Render**: GitHub 연동으로 main 브랜치 push 시 Docker 이미지 자동 빌드 + 배포

---

## 마감일

2026년 6월 9일 23:59:59
