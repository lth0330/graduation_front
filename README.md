# Park-On 관리자 웹 (Frontend)

> **아파트 주차 관리 시스템 Park-On**의 React 관리자 웹입니다.
> 웹 최고 관리자와 아파트 관리자가 가입 승인, 입주민·차량 관리, 주차장 현황 확인, 문의 답변을 처리합니다.

- 백엔드 레포: [lth0330/graduation](https://github.com/lth0330/graduation) (Spring Boot)
- 전체 구성: React 관리자 웹 · Spring Boot 백엔드 · Flutter 입주민 앱 · Python 객체 인식 모듈

<br>

## 기술 스택

![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router_7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

<br>

## 사용자별 화면

### 웹 최고 관리자 (`/web-admin`)
| 화면 | 설명 |
|:---|:---|
| 대시보드 | 가입 요청, 관리자 현황 요약 |
| 가입 승인 | 아파트 관리자 가입 요청 목록·상세, 승인/거절 |
| 아파트 관리자 관리 | 등록된 관리자 조회·수정 |
| 문의 관리 | 아파트 관리자가 보낸 문의 확인과 답변 |

### 아파트 관리자 (`/apartment-admin`, `/apartment-manager/*`)
| 화면 | 설명 |
|:---|:---|
| 대시보드 | 주차 현황과 처리할 요청 요약 |
| 입주민 가입 요청 | 입주민 앱 가입 요청 승인/거절 |
| 입주민 관리 | 입주민 등록·수정 |
| 차량 / 방문차량 관리 | 입주민 차량과 방문차량 등록·수정 |
| 주차장 · 주차구역 관리 | 주차장, 주차구역 등록·수정·삭제와 배치 관리 |
| 주차 현황 그리드 | 주차구역별 상태를 한눈에 확인 |
| 번호판 인식 검토 | 번호판 인식(OCR) 결과를 관리자가 확인·보정 |
| 알림 | 이상 주차, 인식 실패 등 관리자 알림 |
| 입주민 문의 / 내 문의 | 입주민 문의 답변, 웹 관리자에게 문의 작성 |

<br>

## 구현 포인트

- **권한별 라우트 보호** — `ProtectedRoute`가 로그인 여부와 역할(웹 관리자 / 아파트 관리자)을 먼저 검사합니다. (`src/app/routes.jsx`)
- **토큰 자동 선택** — Axios 인터셉터가 요청 URL을 보고 필요한 관리자 토큰을 골라 `Authorization` 헤더에 붙입니다. 화면 코드에서 매번 헤더를 붙이지 않아도 됩니다. (`src/api/axiosInstance.js`)
- **인증 만료 처리** — 토큰을 보낸 요청이 401을 받으면 저장된 세션을 정리하고 로그인 화면으로 보냅니다. 만료된 토큰으로 계속 요청하는 오류 반복을 막습니다.
- **자동 새로고침** — 주차 현황처럼 자주 바뀌는 화면은 `useAutoRefresh` 훅으로 주기적으로 다시 불러옵니다.
- **로직 단위 테스트** — 주차 배치, 방문차량 상태, 번호판 보정, 알림 표시 같은 화면 로직을 `src/utils`에 순수 함수로 분리하고 Node 내장 테스트 러너로 **53개 테스트**를 작성했습니다.
- **API 모듈 분리** — 기능별 API 호출을 `src/api/*Api.js`로 나눠 화면과 통신 코드를 분리했습니다.

<br>

## 폴더 구조

```text
src/
├── api/          # 기능별 API 호출 (axiosInstance 공통 설정)
├── app/          # App, 라우팅 설정
├── components/   # auth, layout, tables, forms 등 공용 컴포넌트
├── contexts/     # 웹 관리자 / 아파트 관리자 전역 상태
├── data/         # 메뉴(navigation) 등 정적 데이터
├── hooks/        # useAutoRefresh
├── pages/
│   ├── webAdmin/          # 웹 최고 관리자 화면
│   ├── apartmentManager/  # 아파트 관리자 화면
│   ├── auth/              # 로그인, 가입 요청
│   └── public/            # 메인 페이지
├── styles/
└── utils/        # 인증 토큰, 역할 처리
```

<br>

## 실행 방법

```bash
npm install
npm run dev      # http://localhost:5173
```

백엔드 주소는 `.env`의 `VITE_API_BASE_URL`로 지정합니다. 값이 없으면 `http://localhost:8080`(로컬 Spring Boot)을 사용합니다.

```env
VITE_API_BASE_URL=http://localhost:8080
```

```bash
npm test         # src/utils 로직 테스트 (node:test)
npm run build    # dist/ 에 배포용 파일 생성
```
