# 소재희 포트폴리오

<style>.split table { break-inside: auto !important; page-break-inside: auto !important; } table.stack td { padding: 0.25rem 0.625rem; } table.stack td:first-child { min-width: 0; } table.glance :is(th, td) { padding: 0.3125rem 0.6875rem; } .fig { break-inside: avoid; page-break-inside: avoid; } .fig p { text-align: center; }</style>

> **AI를 더해 기술을 비즈니스 가치로 연결하는 풀스택 개발자**
> AI로 구현하고 검증하는 하네스 엔지니어링으로, 기획부터 개발, 배포까지 혼자서도 끝까지 해냅니다.

<table class="stack">
<colgroup><col style="width:14%"><col style="width:86%"></colgroup>
<tbody>
<tr><td><strong>Backend</strong></td><td>TypeScript · Node.js · NestJS · Prisma · BullMQ · SSE · Python · FastAPI</td></tr>
<tr><td><strong>Frontend</strong></td><td>Next.js · React · React Native(Expo) · Tailwind</td></tr>
<tr><td><strong>Database</strong></td><td>PostgreSQL · MySQL · MongoDB · Redis · Supabase</td></tr>
<tr><td><strong>Infra</strong></td><td>AWS(Lambda · EventBridge · S3 · ECR) · Docker · Nginx · GitHub Actions · Vercel</td></tr>
<tr><td><strong>AI</strong></td><td>Claude Code · MCP · Claude API(Anthropic SDK) · whisper.cpp · Qwen3-TTS</td></tr>
</tbody>
</table>

## 1. 한눈에 보기

직접 설계하고 개발한 프로젝트 네 개입니다. 서비스 세 곳은 지금 열어보실 수 있습니다.

<table class="glance">
<colgroup><col style="width:17%"><col style="width:33%"><col style="width:50%"></colgroup>
<thead><tr><th>프로젝트</th><th>무엇인가</th><th>보시는 방법</th></tr></thead>
<tbody>
<tr><td><a href="https://recueve.com"><strong>Recueve</strong></a><br>풀스택 (개인)<br>2026.09~10</td><td>흩어진 관심사를 한곳에 모으는 콘텐츠 큐레이션 플랫폼<br><strong>LLM 파이프라인 기반 콘텐츠 메타데이터 자동 생성</strong></td><td>회원가입하시면 링크 주소만 넣어 AI가 설명과 카테고리를 채워 주는 기록(레코)을 직접 만들어 보실 수 있습니다(가입 시 AI 크레딧 30개 지급)</td></tr>
<tr><td><a href="https://prowith.kr"><strong>ProWith</strong></a><br>풀스택 (프리랜서)<br>2025.12~2026.02</td><td>보상플랜과 쇼핑몰을 설정으로 켜고 끄는 MLM 정산 솔루션 (멀티테넌트)</td><td>오른쪽 위 <code>로그인</code> → <code>DEMO Login</code>에서 가입 없이 <code>일반회원</code>으로 주문을, <code>시스템 관리자</code>로 모든 설정 기능을 보실 수 있습니다. 마감 결과는 시드 데이터로 정산을 실제로 돌려 나온 값입니다</td></tr>
<tr><td><a href="https://lotto.genys.kr"><strong>GENYS Lotto AI</strong></a><br>풀스택 (개인)<br>2025.10~11</td><td>로또 추첨 데이터 기반 통계 분석 + AI 예측 서비스<br><strong>분석 API 966ms → 31ms · 예측 API 10초 → 2초</strong></td><td>회원가입 후 이용하실 수 있습니다</td></tr>
<tr><td><a href="https://youtu.be/SrAWg5lS0lQ"><strong>Jake English</strong></a><br>풀스택 (개인)<br>2026.11</td><td>상황을 정해 AI 선생님과 대화하는 영어 말하기 연습 앱<br><strong>Claude Code로 닷새 남짓 동안 PR 78개 머지</strong></td><td>제 맥에서 서버를 돌리는 개인용 앱이라 <a href="https://youtu.be/SrAWg5lS0lQ">소개 영상</a>(3분 17초, 1:42부터 시연)과 <a href="https://github.com/BuffSo/jake-english">공개 저장소</a>로 보실 수 있습니다</td></tr>
</tbody>
</table>

## 2. 프로젝트 상세

### 2-1. Recueve - 콘텐츠 큐레이션 플랫폼

2026.09 ~ 2026.10 | 개인 프로젝트 (풀스택) | 🔗 https://recueve.com

`NestJS` `Next.js 16` `TypeScript` `Prisma` `MySQL` `Redis` `BullMQ` `Docker` `AWS`

> 흩어진 관심사를 한곳에 모으는 콘텐츠 큐레이션 플랫폼. 기획·디자인·개발·인프라·운영을 혼자 맡아 공개한 서비스입니다.

- 모노레포 - NestJS + Next.js Turborepo 모노레포로 백엔드/프론트/워커 앱을 나누고, 공유 패키지(zod 스키마·타입)로 프론트·백 검증을 일원화했습니다
- 인증·권한 - JWT(RS256) 액세스·리프레시 토큰 · Role/Tier 기반 RBAC · Google/Kakao OAuth · bcrypt · Redis 단기 토큰으로 이메일 인증·비밀번호 재설정(TTL 자동 만료). 토큰은 **웹은 HttpOnly 쿠키, 브라우저 확장·모바일은 Bearer 헤더**로 나눠 받습니다
- 백엔드 설계 - 컨트롤러/서비스/리포지토리 계층 분리 · Swagger 자동 문서화 · throttler 기반 Rate Limiting · Winston 구조화 로깅
- 도메인 설계 - **재귀 CTE 기반 계층 카테고리** · 캐노니컬 자동매핑 · 사이드바 캐시 동기화로 트리 일관성 유지
- 예약 표시이름 - username과 displayName을 나누고, 브랜드명·일반명사는 예약해 두었다가 사용자 신청을 관리자 심사로 배정합니다(상태 머신)
- 프론트엔드 - Next.js 16(App Router) + React Query + Tailwind/shadcn, 다국어(i18n) 구조(한·영 적용, 13개 언어 확장 가능), Vercel 배포

<div class="fig">

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 410" role="img" aria-label="Recueve 구성도: Vercel 프론트, EC2 한 대의 Nginx·백엔드·워커·Redis·MySQL 컨테이너, Claude API, GitHub Actions와 ECR 배포, S3 백업" style="width:100%;max-width:570px;height:auto;display:block;margin:0.75rem auto;">
<defs><marker id="rc-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="0.5" y="0.5" width="699" height="409" rx="10" fill="#ffffff" stroke="#e5e7eb"/>
<g stroke-width="1.2">
<rect x="196" y="20" width="320" height="280" rx="10" fill="#fffbeb" stroke="#f59e0b"/>
<rect x="16" y="40" width="140" height="44" rx="8" fill="#f9fafb" stroke="#9ca3af"/>
<rect x="16" y="120" width="140" height="60" rx="8" fill="#f9fafb" stroke="#111827"/>
<rect x="212" y="52" width="288" height="36" rx="8" fill="#f0fdf4" stroke="#16a34a"/>
<rect x="212" y="112" width="126" height="66" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<rect x="374" y="112" width="126" height="66" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<rect x="212" y="236" width="126" height="48" rx="8" fill="#ecfdf5" stroke="#059669"/>
<rect x="374" y="236" width="126" height="48" rx="8" fill="#fef2f2" stroke="#dc2626"/>
<rect x="540" y="100" width="144" height="84" rx="8" fill="#f5f3ff" stroke="#7c3aed"/>
<rect x="540" y="206" width="144" height="48" rx="8" fill="#f9fafb" stroke="#9ca3af"/>
<rect x="16" y="326" width="160" height="62" rx="8" fill="#f9fafb" stroke="#6b7280"/>
<rect x="236" y="330" width="150" height="54" rx="8" fill="#fff7ed" stroke="#ea580c"/>
<rect x="540" y="326" width="144" height="62" rx="8" fill="#fff7ed" stroke="#ea580c"/>
</g>
<g stroke="#6b7280" stroke-width="1.3" fill="none" marker-end="url(#rc-a)">
<line x1="86" y1="84" x2="86" y2="118"/>
<path d="M156,150 L180,150 L180,70 L210,70"/>
<line x1="275" y1="88" x2="275" y2="110"/>
<line x1="260" y1="178" x2="260" y2="234"/>
<path d="M310,178 L310,206 L410,206 L410,234"/>
<line x1="480" y1="236" x2="480" y2="180"/>
<line x1="374" y1="150" x2="340" y2="150" stroke-dasharray="4 3"/>
<line x1="500" y1="128" x2="538" y2="128"/>
<path d="M500,166 L520,166 L520,230 L538,230"/>
<line x1="176" y1="357" x2="234" y2="357"/>
<line x1="311" y1="330" x2="311" y2="302"/>
<path d="M516,280 L612,280 L612,324"/>
</g>
<text x="212" y="40" font-size="12" font-weight="600" fill="#b45309">AWS EC2 1대 · Docker 컨테이너 5개</text>
<g text-anchor="middle" font-size="12.5" font-weight="600" fill="#111827">
<text x="86" y="58">사용자</text><text x="86" y="140">Vercel</text><text x="356" y="75">Nginx · api.recueve.com · TLS</text>
<text x="275" y="132">백엔드 · NestJS</text><text x="437" y="132">워커 · NestJS</text><text x="275" y="256">MySQL</text><text x="437" y="256">Redis</text>
<text x="612" y="120">Claude API</text><text x="612" y="226">YouTube · 웹 페이지</text>
<text x="96" y="346">GitHub Actions</text><text x="311" y="351">Amazon ECR</text><text x="612" y="346">Amazon S3</text>
</g>
<g text-anchor="middle" font-size="11" fill="#4b5563">
<text x="86" y="75">웹 브라우저</text><text x="86" y="156">Next.js 16 프론트</text><text x="86" y="171">recueve.com</text>
<text x="275" y="149">인증 · RBAC</text><text x="275" y="165">크레딧 · Prisma</text><text x="437" y="149">yt-dlp 자막 추출</text><text x="437" y="165">Anthropic SDK</text>
<text x="275" y="273">서비스 데이터</text><text x="437" y="273">BullMQ 큐 · 토큰</text>
<text x="612" y="138">요약 모델 (Haiku)</text><text x="612" y="154">제안 생성 모델</text><text x="612" y="170">관리자 설정에서 교체</text><text x="612" y="243">자막 · 설명 · 본문</text>
<text x="96" y="363">OIDC로 AWS 인증</text><text x="96" y="379">테스트 · 이미지 빌드</text><text x="311" y="368">백엔드 · 워커 이미지</text>
<text x="612" y="363">MySQL 매일 백업</text><text x="612" y="379">30일 보관</text>
</g>
<g font-size="10.5" fill="#6b7280">
<text x="356" y="200" text-anchor="middle">작업 적재</text><text x="474" y="214" text-anchor="end">작업 처리</text>
<text x="356" y="142" text-anchor="middle">환불</text><text x="356" y="168" text-anchor="middle">요청</text>
<text x="205" y="350" text-anchor="middle">push</text><text x="318" y="320">SSH로 받아 재시작</text><text x="564" y="273" text-anchor="middle">매일 백업</text>
</g>
</svg>

<sub>Recueve 구성도. EC2 한 대의 컨테이너 5개, Vercel 프론트, ECR 자동 배포, S3 백업으로 운영합니다.</sub>

</div>


#### 기술적 결정

| 결정 | 이유 |
|---|---|
| EC2 한 대에 Nginx·백엔드·워커·Redis·MySQL을 **Docker 컨테이너 5개**로 | RDS 비용을 줄이려고 본인 AWS 계정의 서버 한 대에 모았습니다. 대신 **DB는 매일 S3로 백업**해 30일 보관합니다 |
| 무거운 처리를 **워커 앱으로 분리** | 자막 추출과 LLM 호출이 API 응답을 붙잡지 않게 BullMQ 큐로 넘기고, 결과와 환불은 `internal webhook`으로 받습니다 |
| GitHub Actions에서 **OIDC로 AWS 인증** | 장기 액세스 키 없이 ECR 이미지를 빌드해 백엔드·워커를 자동 배포합니다 |

### 2-2. ProWith - MLM 정산 솔루션

2025.12 ~ 2026.02 | 프리랜서 프로젝트 (풀스택) | 🔗 https://prowith.kr

`NestJS` `Next.js 16` `TypeScript` `PostgreSQL` `Prisma` `Docker` `AWS`

> **풍부한 관리자 설정이 핵심인 MLM 정산 솔루션입니다.** 마감 유형과 수당 종류를 코드가 아니라 설정으로 켜고 끕니다(281개 설정값 · 21개 카테고리, 설정 간 의존성 관리, 관리자 UI 변경이 즉시 반영). 데모의 `마감`에 일/15일/월 3종만 보이는 것은 주 마감을 시스템 설정에서 꺼 두었기 때문입니다.

- 정산 엔진 - 추천라인(1:N)과 후원라인(바이너리 LEFT/RIGHT)을 함께 관리하는 이중 트리 위에서 일/주/15일/월 최대 4종 마감과 최대 13종 수당을 계산하고, 트랜잭션으로 원자성을 보장합니다
- 마감 취소 - 정산 원장 7종과 회원 상태를 **스냅샷으로 보존**해, 마감을 취소하면 이전 상태로 되돌립니다. 마감 전에는 사전 검증과 미리보기를 거칩니다
- 운영자 백오피스 - 회원·조직도·수당·매출·포인트·입출금 등 10개 업무 도메인을 관리자 화면 63개로 다룹니다. 회원 문의는 그 회원이 보는 마이오피스 17개 화면을 그대로 재현해 확인하고(대리조회), 관리자 활동 108종은 바뀐 필드까지 기록합니다
- 쇼핑몰 - 무통장·포인트 결제, 배송·반품, 송장 일괄 등록을 갖췄습니다. 결제완료 때만 매출을 만들어 정산 로직을 고치지 않고 마감에 잇고, 회원별 <strong>DB 잠금(advisory lock)</strong>으로 동시 주문과 중복 매출을 막습니다
- 백엔드 - NestJS 23개 모듈 · 340여 개 REST API · JWT + Passport 인증 · 4단계 RBAC · nestjs-i18n 한·영 응답 · d3-org-chart 조직도 · 포인트 이중 시스템(Cash/Shop)

<div class="fig">

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 420" role="img" aria-label="ProWith 멀티테넌트 구성도: 업체별 Vercel 프론트, EC2 한 대의 Nginx와 업체별 백엔드 컨테이너, RDS 한 대의 업체별 Database, 업체별 GitHub Actions 배포" style="width:100%;max-width:600px;height:auto;display:block;margin:0.75rem auto;">
<defs><marker id="pw-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="0.5" y="0.5" width="699" height="419" rx="10" fill="#ffffff" stroke="#e5e7eb"/>
<g stroke-width="1.2">
<rect x="12" y="20" width="168" height="212" rx="10" fill="#ffffff" stroke="#9ca3af" stroke-dasharray="4 3"/>
<rect x="24" y="54" width="144" height="48" rx="8" fill="#f9fafb" stroke="#111827"/>
<rect x="24" y="112" width="144" height="48" rx="8" fill="#f9fafb" stroke="#111827"/>
<rect x="24" y="170" width="144" height="48" rx="8" fill="#f9fafb" stroke="#111827"/>
<rect x="208" y="20" width="276" height="276" rx="10" fill="#fffbeb" stroke="#f59e0b"/>
<rect x="222" y="52" width="248" height="44" rx="8" fill="#f0fdf4" stroke="#16a34a"/>
<rect x="258" y="112" width="212" height="40" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<rect x="258" y="162" width="212" height="40" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<rect x="258" y="212" width="212" height="40" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<rect x="512" y="20" width="176" height="276" rx="10" fill="#ecfdf5" stroke="#059669"/>
<rect x="530" y="112" width="140" height="40" rx="8" fill="#ffffff" stroke="#059669"/>
<rect x="530" y="162" width="140" height="40" rx="8" fill="#ffffff" stroke="#059669"/>
<rect x="530" y="212" width="140" height="40" rx="8" fill="#ffffff" stroke="#059669"/>
<rect x="12" y="322" width="200" height="80" rx="8" fill="#f9fafb" stroke="#6b7280"/>
<rect x="244" y="332" width="144" height="56" rx="8" fill="#fff7ed" stroke="#ea580c"/>
<rect x="420" y="322" width="268" height="80" rx="8" fill="#fefce8" stroke="#ca8a04" stroke-dasharray="4 3"/>
</g>
<g stroke="#6b7280" stroke-width="1.3" fill="none">
<path d="M168,78 L194,78 M168,136 L194,136 M168,194 L194,194 M194,194 L194,74"/>
<path d="M240,96 L240,232"/>
</g>
<g stroke="#6b7280" stroke-width="1.3" fill="none" marker-end="url(#pw-a)">
<line x1="194" y1="74" x2="220" y2="74"/>
<line x1="240" y1="132" x2="256" y2="132"/><line x1="240" y1="182" x2="256" y2="182"/><line x1="240" y1="232" x2="256" y2="232"/>
<line x1="470" y1="132" x2="528" y2="132"/><line x1="470" y1="182" x2="528" y2="182"/><line x1="470" y1="232" x2="528" y2="232"/>
<line x1="60" y1="322" x2="60" y2="234"/>
<line x1="212" y1="360" x2="242" y2="360"/>
<line x1="316" y1="332" x2="316" y2="298"/>
</g>
<g font-size="12" font-weight="600"><text x="24" y="40" fill="#374151">Vercel · 업체별 프로젝트</text><text x="222" y="40" fill="#b45309">AWS EC2 1대 · Docker</text><text x="526" y="40" fill="#047857">RDS PostgreSQL 1대</text></g>
<g text-anchor="middle" font-size="12.5" font-weight="600" fill="#111827">
<text x="96" y="74">업체 A 프론트</text><text x="96" y="132">업체 B 프론트</text><text x="96" y="190">업체 C 프론트</text>
<text x="346" y="70">Nginx · SSL</text>
<text x="364" y="128">백엔드 A · NestJS</text><text x="364" y="178">백엔드 B · NestJS</text><text x="364" y="228">백엔드 C · NestJS</text>
<text x="600" y="137">업체 A Database</text><text x="600" y="187">업체 B Database</text><text x="600" y="237">업체 C Database</text>
<text x="112" y="342">GitHub · 업체별 저장소</text><text x="316" y="354">Amazon ECR</text><text x="554" y="342">신규 업체 셋업 (하네스 스킬)</text>
</g>
<g text-anchor="middle" font-size="11" fill="#4b5563">
<text x="96" y="91">Next.js 16</text><text x="96" y="149">Next.js 16</text><text x="96" y="207">Next.js 16</text>
<text x="346" y="87">api.{업체 도메인} → 업체 컨테이너</text>
<text x="364" y="144">업체 A 설정값</text><text x="364" y="194">업체 B 설정값</text><text x="364" y="244">업체 C 설정값</text>
<text x="112" y="359">Actions 파이프라인 독립 운영</text><text x="112" y="375">배포 모드: 일반 · 신규 구축</text><text x="112" y="391">· 초기화 재배포 등</text>
<text x="316" y="371">업체별 백엔드 이미지</text>
<text x="554" y="361">명령 한 번으로 DB · GitHub · AWS · Vercel</text><text x="554" y="378">구성 · 도메인 연결 · 백엔드 배포까지</text>
</g>
<g font-size="10.5" fill="#6b7280">
<text x="346" y="278" text-anchor="middle">같은 코드베이스 · 초기 설정값으로 업체 정책 분리</text>
<text x="600" y="78" text-anchor="middle">Database만 업체별로 분리</text>
<text x="66" y="282">프론트 자동 배포</text><text x="322" y="318">SSH로 배포</text>
</g>
</svg>

<sub>ProWith 구성도. 업체가 늘면 백엔드 컨테이너와 Database를 하나씩 더합니다.</sub>

</div>


**쇼핑몰** - 설정으로 켜는 옵션이고, 정산 로직은 건드리지 않고 붙였습니다.

- 무통장입금(관리자 입금확인, 금액 불일치 시 재확인)·쇼핑포인트 결제, 결제 기록을 주문과 분리해 PG 추가에 대비
- 관리자 주문 관리 - 입금기한 경과 자동취소, 송장 엑셀 일괄 등록(행별 미리 검증 후 통과 행만 등록), 반품. **마감 후 반품은 기록하고 정산 보정 경고**
- 상품 이미지 S3 저장(EC2 IAM 역할, 액세스 키 없음)·썸네일 자동 생성, 전자상거래법 고지 항목(사업자 정보·구매 안내·약관) 설정값 관리

**동적 시스템 설정 엔진**

- **281개 설정값을 21개 카테고리**로 DB 중앙 관리, 관리자 UI 변경이 즉시 반영
- 설정 타입별 입력 폼 자동 생성 및 **설정 간 의존성 관리**(부모 → 자식 조건부 표시)

**백엔드·회원 시스템**

- **다국어(i18n)** - nestjs-i18n 한·영 응답 분기 + **메뉴 영문명을 DB 컬럼으로 관리**해 운영자가 직접 수정, d3-org-chart 조직도 시각화, 포인트 이중 시스템(Cash/Shop)·CPV 관리
- **조직도 미니맵** - 화면보다 큰 트리에서 전체를 축소해 띄우고 **현재 보이는 영역을 사각형으로 표시**, 클릭·드래그로 그 위치까지 바로 이동

#### 기술적 결정

| 결정 | 이유 |
|---|---|
| **단일 코드베이스** + 업체별 초기 설정값 | 업체마다 보상플랜이 달라도 코드를 나누지 않고, 만들어 둔 기능 중 필요한 것만 켭니다. 새 수당이 필요해지면 종류가 늘어나는 구조입니다 |
| EC2 한 대에 **업체별 백엔드 컨테이너**, RDS 한 대에서 **Database만 업체별로 분리** | 업체 데이터는 섞이지 않게 나누고, Nginx가 `api.{도메인}`으로 업체 컨테이너에 보냅니다. 프론트는 업체별 Vercel 프로젝트입니다 |
| **결제완료 때만 매출 생성** | 쇼핑몰 주문이 기존 마감으로 그대로 이어지고, 입금대기 주문은 정산에 닿지 않습니다. 결제 기록은 주문과 분리해 PG 추가에 대비했습니다 |
| 업체별 **GitHub Actions 파이프라인** | 업체마다 신규 구축·초기화 재배포 같은 배포 모드를 따로 돌리고, 신규 업체는 하네스 스킬 `new-tenant` 명령 한 번으로 셋업합니다 |

### 2-3. GENYS Lotto AI - 통계 분석 + AI 예측

2025.10 ~ 2025.11 | 개인 프로젝트 (풀스택) | 🔗 https://lotto.genys.kr

`Next.js 15` `TypeScript` `PostgreSQL` `Prisma` `Redis` `MongoDB` `AWS Lambda` `SSE` `NextAuth.js`

> 역대 로또 추첨 데이터 기반 통계적 패턴 분석과 AI 예측 모델을 결합한 서비스

구성 - Next.js 15 앱(78개 REST API), 회차를 모으는 AWS Lambda, 다음 회차를 예측하는 Python 파이프라인이 PostgreSQL 하나를 함께 씁니다.

<div class="fig">

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 390" role="img" aria-label="GENYS Lotto AI 구성도: Vercel의 Next.js 앱, PostgreSQL 공유 DB, 회차를 모으는 AWS Lambda, 로컬 Python 예측 파이프라인, SSE와 메일 알림, Redis, MongoDB 로그" style="width:100%;max-width:600px;height:auto;display:block;margin:0.75rem auto;">
<defs><marker id="lt-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="0.5" y="0.5" width="699" height="389" rx="10" fill="#ffffff" stroke="#e5e7eb"/>
<g stroke-width="1.2">
<rect x="16" y="20" width="140" height="92" rx="8" fill="#f9fafb" stroke="#9ca3af"/>
<rect x="196" y="16" width="300" height="184" rx="10" fill="#f9fafb" stroke="#111827"/>
<rect x="212" y="48" width="268" height="40" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<rect x="212" y="98" width="268" height="40" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<rect x="212" y="148" width="268" height="40" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<rect x="196" y="236" width="300" height="60" rx="8" fill="#ecfdf5" stroke="#059669"/>
<rect x="16" y="226" width="140" height="70" rx="8" fill="#fff7ed" stroke="#ea580c"/>
<rect x="16" y="330" width="140" height="44" rx="8" fill="#f9fafb" stroke="#9ca3af"/>
<rect x="526" y="20" width="160" height="72" rx="8" fill="#fef2f2" stroke="#dc2626"/>
<rect x="526" y="108" width="160" height="56" rx="8" fill="#f5f3ff" stroke="#7c3aed"/>
<rect x="526" y="172" width="160" height="52" rx="8" fill="#f0fdf4" stroke="#16a34a"/>
<rect x="526" y="246" width="160" height="84" rx="8" fill="#fefce8" stroke="#ca8a04"/>
</g>
<g stroke="#6b7280" stroke-width="1.3" fill="none" marker-end="url(#lt-a)">
<line x1="212" y1="68" x2="158" y2="68"/>
<path d="M158,96 L184,96 L184,118 L210,118"/>
<path d="M116,226 L116,168 L210,168"/>
<line x1="156" y1="262" x2="194" y2="262"/>
<line x1="86" y1="330" x2="86" y2="298"/>
<line x1="346" y1="200" x2="346" y2="234"/>
<line x1="526" y1="270" x2="498" y2="270"/>
<line x1="496" y1="56" x2="524" y2="56" marker-start="url(#lt-a)"/>
<path d="M496,168 L510,168 L510,136 L524,136"/>
</g>
<line x1="496" y1="190" x2="522" y2="196" stroke="#6b7280" stroke-width="1.3" marker-end="url(#lt-a)"/>
<text x="206" y="36" font-size="12" font-weight="600" fill="#111827">Vercel · Next.js 15 앱 (REST API 78개)</text>
<g text-anchor="middle" font-size="12.5" font-weight="600" fill="#111827">
<text x="86" y="46">사용자</text>
<text x="346" y="66">SSE 실시간 알림</text>
<text x="346" y="116">웹 화면 · 분석 · 예측 API</text>
<text x="346" y="166">당첨 알림 API</text>
<text x="346" y="260">PostgreSQL (Supabase)</text>
<text x="86" y="250">AWS Lambda</text>
<text x="86" y="356">동행복권</text>
<text x="606" y="44">Upstash Redis</text>
<text x="606" y="132">Resend 메일</text>
<text x="606" y="192">MongoDB Atlas</text>
<text x="606" y="266">예측 파이프라인</text>
</g>
<g text-anchor="middle" font-size="11" fill="#4b5563">
<text x="86" y="63">웹 브라우저</text><text x="86" y="79">알림 · 메일 수신</text>
<text x="346" y="81">회차 저장한 사용자에게 푸시</text>
<text x="346" y="131">NextAuth · RBAC · 캐시</text>
<text x="346" y="181">API 키 확인 → SSE · 메일 발송</text>
<text x="346" y="277">공유 DB · 회차 · 패턴 · 예측값</text>
<text x="86" y="266">EventBridge</text><text x="86" y="281">토요일 추첨 뒤 수집</text>
<text x="86" y="368">당첨번호</text>
<text x="606" y="61">인증 코드 (10분 TTL)</text><text x="606" y="76">SSE 인스턴스 간 전달</text>
<text x="606" y="149">당첨 결과 · 인증 코드</text>
<text x="606" y="208">버려진 당첨 조합 로그</text>
<text x="606" y="282">Python · numpy</text><text x="606" y="298">로컬에서 주 1회 실행</text><text x="606" y="314">실제값 갱신 → 다음 회차 예측</text>
</g>
<g font-size="10.5" fill="#6b7280">
<text x="122" y="161">알림 호출</text>
<text x="166" y="91">요청</text>
<text x="160" y="62">SSE</text>
<text x="160" y="256">저장</text>
<text x="92" y="318">회차 조회</text>
<text x="352" y="222">읽기 · 쓰기</text>
<text x="499" y="264">기록</text>
</g>
</svg>

<sub>GENYS Lotto AI 구성도. 회차 수집부터 알림 · 예측까지의 흐름입니다.</sub>

</div>

- 회차 수집 - AWS Lambda + EventBridge가 토요일 추첨 뒤 동행복권 회차를 모아 저장하고, 앱의 당첨 알림 API를 API 키로 호출합니다
- 당첨 알림 - 그 회차 번호를 저장해 둔 사용자에게 SSE로 실시간 알림을 보내고 메일(Resend)도 보냅니다. 앱 인스턴스가 여럿이어도 Redis로 알림을 넘깁니다
- 예측 파이프라인 - Python(numpy)으로 패턴 실제값을 갱신하고 다음 회차 예측을 같은 PostgreSQL에 씁니다. 오프라인(로컬)에서 주 1회 돌리고, 앱은 그 값을 읽어 보여 줍니다
- 로그 저장소 분리 - 제약 조건 때문에 버렸지만 실제로 당첨된 조합을 MongoDB Atlas에 따로 쌓도록 구현했습니다
- 인증·보안 - NextAuth.js OAuth(Google/Kakao)·이메일 OTP와 RBAC, Redis 인증 코드(10분 TTL), AES-256 개인정보 암호화
- 성능 개선 - 분석 API, 예측 API, 탭을 바꿀 때의 API 호출에서 병목을 하나씩 잡았습니다(5-1)

#### 로그는 NoSQL인 MongoDB에 분리해서 저장했습니다

제약 조건 때문에 **버렸는데 실제로는 당첨된 조합**을 기록해 추적하는 기능이 있습니다. 스키마가 자주 바뀌고 조회보다 적재가 훨씬 많은 데이터라, PostgreSQL 대신 **MongoDB Atlas에 Mongoose ODM으로** 따로 담았습니다.

- 사용자별·회차별 **집계 파이프라인** 구현
- **듀얼 로깅** - `LOG_TARGET` 환경변수로 파일 / MongoDB / 둘 다를 골라 씁니다. 로컬에서는 파일, 운영에서는 MongoDB
- Winston 구조화 로깅과 연동

#### 개발 모드에서 등급별 계정을 선택해 바로 테스트하게 했습니다

무료·프리미엄·관리자 3등급에 비로그인까지, **화면과 API 분기가 4가지**입니다. 등급 하나 고칠 때마다 로그아웃하고 다른 계정으로 다시 로그인하는 게 반복돼서, 개발 모드에서만 뜨는 **플로팅 계정 전환기**를 붙였습니다.

- **한 번 클릭으로 전환** - 등급별 대표 계정을 자동으로 뽑아 보여주고(`role`별 1명), 필요하면 전체 계정 목록을 펼칩니다. **`로그아웃(비로그인 테스트)`** 버튼으로 비로그인 화면도 같은 자리에서 확인합니다
- **비밀번호 없이 세션을 바꿉니다** - NextAuth credentials provider에 개발 전용 플래그를 태워 전환하고, 그게 실패하면 `/api/dev/force-login`이 **NextAuth JWT를 직접 발급해 세션 쿠키로 심습니다**
- 🔒 **프로덕션 차단을 두 겹으로 걸었습니다** - 컴포넌트가 `NODE_ENV !== 'development'`면 **렌더 자체를 하지 않고**, `/api/dev/*` 라우트도 같은 조건으로 **403**을 돌려줍니다. **화면만 숨기면 엔드포인트는 그대로 열려 있기 때문**입니다

**인프라** - Vercel + Supabase(PostgreSQL) · Upstash Redis · MongoDB Atlas · AWS Lambda·EventBridge · Vercel CI/CD

### 2-4. Jake English - 영어 말하기 연습 앱

2026.11 | 개인 프로젝트 (풀스택) | 🔗 https://youtu.be/SrAWg5lS0lQ (소개 영상) · https://github.com/BuffSo/jake-english (공개 저장소)

`React Native` `Expo` `TypeScript` `Python` `FastAPI` `whisper.cpp` `Qwen3-TTS` `Claude API` `Tailscale`

> 해 보고 싶은 상황을 직접 정해 AI 선생님과 영어로 대화하고, 말할 때마다 평가받는 연습 앱입니다. 제가 쓰려고 만들었습니다.

구성 - 폰 앱은 화면과 녹음, 재생만 하고, 받아쓰기와 목소리는 집의 맥에서 만듭니다. Claude API에는 글만 보냅니다.

<div class="fig">

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 270" role="img" aria-label="Jake English 구성도: 안드로이드 폰의 Expo 앱이 Tailscale 개인 망으로 집의 맥 서버에 붙고, 맥에서 whisper.cpp 받아쓰기와 Qwen3-TTS 목소리를 만들며, Claude API에는 글만 보낸다" style="width:100%;max-width:600px;height:auto;display:block;margin:0.75rem auto;">
<defs><marker id="je-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="0.5" y="0.5" width="699" height="269" rx="10" fill="#ffffff" stroke="#e5e7eb"/>
<g stroke-width="1.2">
<rect x="200" y="14" width="330" height="242" rx="10" fill="#f9fafb" stroke="#111827"/>
<rect x="16" y="100" width="140" height="70" rx="8" fill="#f9fafb" stroke="#9ca3af"/>
<rect x="222" y="100" width="136" height="70" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<rect x="386" y="44" width="128" height="48" rx="8" fill="#ecfdf5" stroke="#059669"/>
<rect x="386" y="106" width="128" height="48" rx="8" fill="#fff7ed" stroke="#ea580c"/>
<rect x="386" y="168" width="128" height="48" rx="8" fill="#fefce8" stroke="#ca8a04"/>
<rect x="556" y="100" width="128" height="70" rx="8" fill="#f5f3ff" stroke="#7c3aed"/>
</g>
<g stroke="#6b7280" stroke-width="1.3" fill="none" marker-end="url(#je-a)">
<line x1="158" y1="135" x2="220" y2="135" marker-start="url(#je-a)"/>
<line x1="358" y1="118" x2="384" y2="72"/>
<line x1="358" y1="132" x2="384" y2="130"/>
<line x1="358" y1="150" x2="384" y2="190"/>
<path d="M290,170 L290,236 L620,236 L620,172"/>
</g>
<text x="214" y="36" font-size="12" font-weight="600" fill="#111827">집의 맥 (launchd로 상시 실행)</text>
<g text-anchor="middle" font-size="12.5" font-weight="600" fill="#111827">
<text x="86" y="126">폰 (안드로이드)</text>
<text x="290" y="126">맥 서버</text>
<text x="450" y="65">받아쓰기</text>
<text x="450" y="127">목소리 셋</text>
<text x="450" y="189">기록과 녹음</text>
<text x="620" y="126">Claude API</text>
</g>
<g text-anchor="middle" font-size="11" fill="#4b5563">
<text x="86" y="143">Expo 앱</text><text x="86" y="158">화면 · 녹음 · 재생</text>
<text x="290" y="143">Python · FastAPI</text><text x="290" y="158">토큰 인증</text>
<text x="450" y="81">whisper.cpp</text>
<text x="450" y="143">Qwen3-TTS 복제</text>
<text x="450" y="205">앱 데이터 폴더</text>
<text x="620" y="143">대본 · 평가</text><text x="620" y="158">대화 · 통역 · 추천</text>
</g>
<g font-size="10.5" fill="#6b7280">
<text x="189" y="127" text-anchor="middle">Tailscale</text>
<text x="189" y="153" text-anchor="middle">개인 망</text>
<text x="300" y="231">글만 보냄 · 녹음은 맥 밖으로 나가지 않음</text>
</g>
</svg>

<sub>Jake English 구성도. 폰은 Tailscale 개인 망으로 집의 맥에 붙고, 녹음은 맥 밖으로 나가지 않습니다.</sub>

</div>

- 대화 연습 - 상황을 고르거나 직접 쓰면 대본이 나옵니다. 라이언이 영어로 말하면 제 대사를 소리 내 말하고, 맥이 받아쓴 말을 대사와 견줘 다르게 들린 낱말과 소리 내는 법을 한국어로 짚어 줍니다
- 자유 대화 - 대본 없이 이야기하다 막히면 통역사 소희가 라이언이 묻는 뜻과 답의 첫마디를 알려 줍니다. 끝나면 고칠 곳을 하나씩 보여 줍니다
- 복습 - 지난 대화를 같은 대본으로 다시 하고 처음 녹음과 지금 녹음을 견줘 듣습니다. 맥에 쌓인 기록으로 만들어 Claude를 다시 부르지 않습니다
- 목소리 - 선생님 라이언, 통역사 소희, 진행자 제이크의 목소리를 맥에서 Qwen3-TTS로 만듭니다. 제이크는 제 목소리를 복제했습니다
- 모델 고르기 - 통역 · 평가 · 상황 추천을 Haiku와 Sonnet에 같은 입력으로 번갈아 묻고 품질, 기다리는 시간, 값을 견줘 **일마다 모델을 골랐습니다**. 추천만 Sonnet이 확실히 나았습니다
- 첫 문장부터 목소리 - Claude의 답을 다 기다리지 않고, 받는 대로 첫 문장부터 라이언 목소리로 넘깁니다


---

## 3. AI 활용 - 개발

**구현도 검증도 AI로 돌렸습니다. 통과 조건은 제가 정하고, AI가 검사 코드로 옮겼습니다.**

### 3-1. ProWith - 업체마다 되풀이되는 작업을 스킬로 고정

ProWith를 업체마다 맞춰 구축하다 보니, 코드보다 업체마다 되풀이되는 작업에 시간이 더 들었습니다. 특히 아래 세 가지입니다.

```
정산 검증   수당 최대 13종 × 마감 최대 4종(일/주/15일/월)
신규 업체   DB·GitHub·AWS·Vercel 구성 + 도메인 연결 + 배포를 매번 손으로
보상플랜    업체마다 다른 규칙을 hwp·pptx 문서로 받아 코드로 옮기는 작업
```

그래서 **이 작업들을 재현 가능한 스킬 6종으로 고정**했습니다. 매번 같은 결과가 나오는 작업 절차입니다.

#### 무엇을 자동화했나

| 스킬 | 하는 일 |
|---|---|
| <span style="white-space:nowrap">**신규 업체 셋업**</span><br><span style="white-space:nowrap">`new-tenant`</span> | 명령 한 번으로 디렉토리 복제 → 로컬 DB·Prisma → GitHub 레포 → AWS(ECR·RDS·SSL·Secrets) 배포 → Vercel 프론트 + 도메인 연결까지. 마지막까지 직접 하던 DNS 설정도 AI 브라우저로 로그인부터 등록까지 처리합니다 |
| <span style="white-space:nowrap">**보상플랜 문서화**</span><br><span style="white-space:nowrap">`compose-plan`</span> | 원본 자료(PPTX·HWP·PDF·이미지)를 읽어 검증 스킬이 그대로 읽을 수 있는 규격 문서로 정리합니다. 자격 조건의 단위·마감 주기처럼 모호한 항목은 임의로 정하지 않고 되묻게 했습니다 |
| <span style="white-space:nowrap">**보상플랜 반영**</span><br><span style="white-space:nowrap">`build-seed-plan`</span> | 그 문서를 업체별 설정값으로 옮깁니다. 기본값과 같더라도 플랜이 정한 값은 명시해 둡니다 - 나중에 기본값이 바뀌어도 업체 설정이 따라 흔들리지 않게 |
| <span style="white-space:nowrap">**마감 검증**</span><br><span style="white-space:nowrap">`verify-cutoffs`</span> | 보상플랜 문서와 현재 설정에서 기대값을 뽑아 제 확인을 받은 뒤, DB 재시드 → 테스트 매출 → 일/주/15일/월 순차 마감 → 집계 검증. 마감 취소 정합성·탈퇴자 실적 제외까지 (아래 ①) |
| <span style="white-space:nowrap">**재마감 대조**</span><br><span style="white-space:nowrap">`compare-recut`</span> | 운영 덤프를 2벌(동결 기준본 + 작업본) 복원해 재마감 결과를 운영 원본과 전수 비교 (아래 ②) |
| <span style="white-space:nowrap">**업체 로고 생성**</span><br><span style="white-space:nowrap">`build-tenant-logo`</span> | 로고 소스 이미지를 벡터화(potrace) 해 가로형 SVG·투명 PNG·favicon 자산으로 만듭니다 |

> **셋은 체인으로 물려 있습니다** - `compose-plan`(문서화) → `build-seed-plan`(설정 반영) → `verify-cutoffs`(검증). 앞 단계의 산출물 형식을 뒷 단계가 그대로 읽도록 규격을 맞춰 둬서, 새 업체 보상플랜이 들어오면 이 순서로 흘려보내면 됩니다.

#### 검증도 AI가 수행합니다

작업 절차 안에 검사 두 가지를 넣어, AI가 구현을 끝내면 스스로 돌려보고 통과해야 끝나도록 했습니다.

**① 보상플랜 불변식(invariant) 검사** - 보상플랜이 반드시 지켜야 할 조건을 코드로 박아두고, 계산 결과가 거기서 어긋나는지 봅니다. 이때는 조건을 만족하는 테스트 데이터를 만들어내는 것 자체가 일이었습니다.

**② 운영 덤프 재마감 전수 대조** - 실제 운영 데이터를 그대로 다시 마감시켜, 기존 결과와 전수 비교합니다. 한 건이라도 어긋나면 통과하지 않습니다.

> 설계 방향과 통과 조건은 AI 코딩 도구가 나오기 전부터 여러 로직을 직접 구현해 온 경험으로 제가 정하고, 구현·테스트·검증 실행은 AI로 돌립니다.

코드 작성 밖의 반복 작업도 같은 방식으로 붙였습니다. PR 리뷰는 리뷰 축을 나눈 에이전트를 병렬로 실행해 기준 점수 이상인 이슈만 PR 코멘트로 게시하는 스킬로 만들었고, 이미지는 오픈소스 서버를 바탕으로 MCP 서버를 만들어 Claude Code 대화 안에서 만들고 고칩니다.

### 3-2. Jake English - 첫 커밋부터 AI 에이전트와 만든 앱

기능마다 Claude Code로 스펙과 계획을 쓰고, 코드와 테스트를 만들고, PR을 리뷰했습니다. 무엇을 만들지, 여러 안 가운데 무엇을 고를지, 머지할지는 제가 정했습니다. **닷새 남짓(2026-11-04 ~ 11-09) 동안 PR 78개를 머지**했고, 그 가운데 58개는 리뷰 에이전트가 먼저 검토했습니다.

<div class="split">

| 방식 | 한 일 |
|---|---|
| 기능마다 스펙 → 계획 → 테스트 먼저 | 앱 전체는 PRD 하나로 보고, 기능마다 인터뷰로 스펙을 쓰고 계획으로 나눈 뒤 테스트를 먼저 쓰고 구현합니다. 되돌리기 어려운 결정은 ADR로 남깁니다 |
| main 세션과 카드 | 기능마다 git worktree를 하나씩 만들고 세션을 따로 띄워 동시에 작업합니다. 저는 main 세션 하나와 이야기하며 무엇을 할지 정하고 머지를 판단합니다 |
| 머지 전 시험은 에이전트가 끝까지 | 단위 시험, 실제 모델 호출, 복제한 제 목소리로 만든 녹음을 서버에 보내는 시험, adb로 폰 화면을 누르고 읽는 시험을 마친 뒤에 머지를 묻습니다. PR을 열면 GitHub Actions가 단위 시험을 다시 돌립니다 |
| 공개 저장소를 지키는 커밋 전 검사 | 키, 개인 경로, 녹음 파일, 비공개 금지어가 든 커밋을 git 훅과 Claude Code 훅 두 겹으로 막습니다 |
| 작업 일지에서 나온 규칙 | 기능마다 AI가 추천한 것과 제가 정한 것을 devlog에 남깁니다. 에이전트가 폰 확인을 PR 체크리스트의 빈칸으로 넘기자 폰 시험까지 에이전트가 마치도록 규칙을 바꾼 것처럼, 규칙은 대부분 실제로 겪은 일에서 생겼습니다 |

</div>

---

## 4. AI 활용 - 제품

앞의 하네스가 AI로 개발하는 쪽이라면, 이건 AI를 제품 기능으로 넣은 쪽입니다.

Recueve의 저장 단위를 '레코'라고 부릅니다. 사용자가 URL 하나만 붙여넣으면 자막·본문을 읽어 카테고리·설명을 생성해 레코를 채우는데, 이때 AI 사용 크레딧이 하나 소모됩니다. 즉 LLM 호출이 곧 **과금되는 트랜잭션**입니다. 그래서 정산 시스템을 만들 때와 같은 방식으로 접근했습니다.

| 문제 | 처리 |
|---|---|
| **호출이 곧 과금** | 크레딧 1개 차감을 `Prisma` 트랜잭션 + `SELECT FOR UPDATE` 행 잠금으로 처리하고, 생성은 BullMQ 큐로 워커에 넘깁니다 |
| **긴 자막의 비용** | `chars/4`로 토큰을 추정해 8,000이 넘으면 Haiku로 먼저 요약하고 Sonnet에 넘깁니다. 싼 모델로 줄이고 비싼 모델은 판단에만 씁니다 |
| **입력마다 다른 상황** | 소스를 5종으로 나눠 폴백합니다 - `자막` → `페이지 본문` → `설명문만` → `캐시된 설명` → `자막 없음`(이 경우 LLM을 아예 호출하지 않습니다) |
| **같은 URL 중복 호출** | `(uriHash, locale)` 캐시에 사용 모델과 프롬프트 버전까지 저장합니다. 캐시가 있으면 자막 추출·설명 생성을 건너뛰고 카테고리만 다시 만듭니다 |
| **실패했는데 돈만 나감** | LLM 호출이 실패하면 워커가 백엔드 `internal webhook`으로 자동 환불합니다. 재전송·재시도로 중복 환불되지 않게 멱등 처리했고, LLM을 부르지 않은 `자막 없음`은 환불 대상에서 뺍니다 |
| **재시도가 오히려 위험** | YouTube 차단 위험 때문에 재시도를 1회로 고정했습니다 |
| **분류할 카테고리가 없음** | 사용자 카테고리 트리(Materialized Path)를 우선 쓰고, 적합한 게 없으면 시스템 canonical 트리로 폴백 분류합니다 |

<div class="fig">

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 270" role="img" aria-label="Recueve 자동 채우기 흐름: 크레딧 차감, 큐 적재, 캐시 확인, 입력 추출, 길면 요약, 제안 생성, 실패 시 환불" style="width:100%;max-width:600px;height:auto;display:block;margin:0.75rem auto;">
<defs><marker id="rr-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="0.5" y="0.5" width="699" height="269" rx="10" fill="#ffffff" stroke="#e5e7eb"/>
<g stroke-width="1.2">
<rect x="12" y="20" width="116" height="60" rx="8" fill="#f9fafb" stroke="#9ca3af"/>
<rect x="152" y="20" width="116" height="60" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<rect x="292" y="20" width="116" height="60" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
<rect x="432" y="20" width="116" height="60" rx="8" fill="#ecfdf5" stroke="#059669"/>
<rect x="572" y="20" width="116" height="60" rx="8" fill="#f9fafb" stroke="#9ca3af"/>
<rect x="12" y="120" width="116" height="64" rx="8" fill="#f9fafb" stroke="#9ca3af"/>
<rect x="152" y="120" width="116" height="64" rx="8" fill="#f5f3ff" stroke="#7c3aed"/>
<rect x="292" y="120" width="116" height="64" rx="8" fill="#f5f3ff" stroke="#7c3aed"/>
<rect x="432" y="120" width="116" height="64" rx="8" fill="#fff7ed" stroke="#ea580c"/>
<rect x="572" y="120" width="116" height="64" rx="8" fill="#f9fafb" stroke="#9ca3af" stroke-dasharray="4 3"/>
<rect x="152" y="208" width="216" height="48" rx="8" fill="#fef2f2" stroke="#dc2626"/>
</g>
<g stroke="#6b7280" stroke-width="1.3" fill="none" marker-end="url(#rr-a)">
<line x1="128" y1="50" x2="150" y2="50"/><line x1="268" y1="50" x2="290" y2="50"/><line x1="408" y1="50" x2="430" y2="50"/><line x1="548" y1="50" x2="570" y2="50"/>
<line x1="490" y1="80" x2="490" y2="118"/>
<line x1="432" y1="152" x2="410" y2="152"/><line x1="292" y1="152" x2="270" y2="152"/><line x1="152" y1="152" x2="130" y2="152"/><line x1="548" y1="152" x2="570" y2="152"/>
<line x1="210" y1="184" x2="210" y2="206"/>
</g>
<g text-anchor="middle" font-size="12.5" font-weight="600" fill="#111827">
<text x="70" y="45">URL 입력</text><text x="210" y="45">① 크레딧 차감</text><text x="350" y="45">② 큐 적재</text><text x="490" y="41">③ 캐시 확인</text><text x="630" y="45">캐시가 있으면</text>
<text x="70" y="147">결과 반환</text><text x="210" y="143">⑥ 제안 생성</text><text x="350" y="143">⑤ 길면 먼저 요약</text><text x="490" y="143">④ 입력 추출</text><text x="630" y="143">입력이 없으면</text>
<text x="260" y="228">⑦ LLM 호출이 실패하면 크레딧 환불</text>
</g>
<g text-anchor="middle" font-size="11" fill="#4b5563">
<text x="70" y="63">자동 채우기 요청</text><text x="210" y="63">트랜잭션 · 행 잠금</text><text x="350" y="63">BullMQ → 워커</text><text x="490" y="57">(uri, locale) 키</text><text x="490" y="72">모델 · 프롬프트 버전</text><text x="630" y="63">카테고리만 재생성</text>
<text x="70" y="166">폼에 자동 채움</text><text x="210" y="160">카테고리 · 설명</text><text x="210" y="175">제안 모델 (설정)</text><text x="350" y="160">요약 모델 (Haiku)</text><text x="350" y="175">짧으면 건너뜀</text><text x="490" y="160">자막 › 페이지 본문</text><text x="490" y="175">› 설명문 순서</text><text x="630" y="160">LLM을 부르지 않음</text><text x="630" y="175">환불 대상 아님</text>
<text x="260" y="245">워커 → 백엔드 webhook · 멱등 처리</text>
</g>
<g font-size="10.5" fill="#6b7280"><text x="497" y="104">없음</text><text x="216" y="200">실패</text><text x="141" y="145" text-anchor="middle">성공</text></g>
</svg>

<sub>URL 하나로 레코를 채우는 흐름입니다. 요약 모델과 제안 모델은 관리자 설정에서 바꿉니다.</sub>

</div>

> 정산 엔진에서 하던 것(트랜잭션·원장·멱등성·실패 복원)을 LLM 호출에 그대로 적용했습니다. AI 기능을 붙일 때도 **돈과 상태가 어긋나지 않게** 만드는 것이 먼저라고 봤습니다.

결과는 서비스에서 볼 수 있습니다 - [모두의 레코스](https://recueve.com/recos)의 각 레코에 붙은 카테고리 태그와 설명 본문이 이 파이프라인의 산출물입니다.

---

## 5. 성능 개선과 운영 이슈 해결

GENYS Lotto AI의 성능 개선과, 직접 운영하는 Recueve에서 겪은 API 장애 두 건입니다.

### 5-1. GENYS Lotto AI 성능 개선 - 세 번에 걸쳐 다른 병목을 잡았습니다

`Next.js 15` `PostgreSQL` `Prisma`

**① 서버 응답이 느리다 → LRU 인메모리 캐시** - 9개 분석 API가 매 요청마다 전체 회차를 다시 계산하고 있었습니다. 로또는 주 1회 추첨이라 같은 범위의 분석 결과는 일주일 내내 변하지 않습니다. 그래서 계산 결과를 캐시에 담았습니다.

```
966ms → 31ms   (97% 개선)
백테스트 반복 분석 40% 향상 · DB 부하 90% 감소
```

- TTL 24시간, API당 50 엔트리 LRU · 범위별 캐시 키(`_full` · `_dhl` · `_{fromTurn}_{toTurn}`)로 임의 구간에도 캐시가 듣습니다
- 새 회차가 들어오면 관련 캐시를 한 번에 무효화합니다. 다만 "전체 범위 요청인가"를 판정하는 최신 회차 값은 5분만 캐싱했습니다 - 이 값이 낡으면 옛 회차 결과가 `_full` 키에 들어앉기 때문입니다

**② 예측 API가 10초 걸린다 → 불필요한 연산 제거 + 병렬화**

```
순차 API 호출 ~7s  +  백테스트 ~3s   =  약 10초
병렬 호출 ~2s        조건부 스킵        =  약 2초   (80% 단축)
```

- 동적 제약 조건을 쓸 때는 필요 없는 520회 백테스트를 조건부로 스킵했습니다
- 4개 패턴 분석을 `Promise.allSettled()`로 병렬화했습니다 - 하나가 실패해도 나머지 결과로 예측을 보여주기 위해 `all`이 아니라 `allSettled`를 썼습니다

**③ 탭을 바꿀 때마다 API를 다시 부른다 → 클라이언트 캐싱과 필터링** - 서버 필터링을 클라이언트로 옮기고, 조회한 회차는 Map에 담아 재사용했습니다.

```
API 호출     105회 → 1회    (99% 감소, 탭 5회 전환 기준)
네트워크     350KB → 50KB   (86% 절감)
```

> 트레이드오프 - 캐시 TTL을 24시간으로 길게 잡은 대신 무효화 트리거를 정확히 걸어야 했고, 클라이언트로 데이터를 내리는 대신 첫 로딩이 무거워지는 것을 감수했습니다. 데이터가 주 1회만 바뀌고 크기도 수백 KB라 받아들일 만했습니다.

### 5-2. AI 자동 채움 API가 잘못된 설명을 계속 응답한 장애

`NestJS` `MySQL` `BullMQ` `Redis` `Claude API`

<div class="split">

| | |
|---|---|
| **증상** | 운영 중 특정 링크의 설명이 "placeholder" 한 단어로만 나왔습니다. API는 오류 없이 응답했습니다 |
| **원인** | 시작은 Claude API였습니다 - Sonnet이 가끔 설명 항목에 이 단어만 넣었습니다. 장애로 키운 것은 백엔드였습니다. 결과를 검사 없이 캐시해, 한 번 잘못 들어온 값을 계속 돌려줬습니다 |
| **해결** | 해당 캐시 행을 지워 먼저 복구하고, 워커에 결과 검사(빈 값 · placeholder 한 단어 · 프롬프트 예시를 베낀 문구)를 넣었습니다. 쓸 수 없으면 한 번만 다시 불러 정상인 값을 고르고, 빈 설명은 캐시하지 않습니다 |
| **판단** | 외부 AI API는 호출이 성공해도 내용이 틀릴 수 있어서, 검증을 통과한 결과만 캐시합니다. 재호출이 실패해도 작업을 실패로 돌리지 않고 정상인 항목은 그대로 보내 기능이 멈추지 않게 했습니다 |
| **재발 방지** | 결과 검사와 응답 선택 로직에 단위 테스트를 붙였고, 프롬프트 예시를 바꾸면 검사 목록도 고치도록 가이드 문서에 적었습니다 |

</div>

### 5-3. 토큰 갱신 API의 동시 요청으로 로그인이 풀리던 장애

`NestJS` `Redis` `Next.js`

<div class="split">

| | |
|---|---|
| **증상** | 구글 로그인 뒤 얼마 지나면 로그인이 풀렸습니다. 배포 직후라 배포 탓처럼 보였지만 서명 키와 Redis 세션은 그대로였습니다 |
| **원인** | refresh 토큰은 쓸 때마다 바꾸고(회전) 옛 토큰이 다시 오면 탈취로 봅니다. access 토큰 만료 뒤 Next.js 프록시가 같은 1초 안에 같은 토큰으로 갱신 API를 5번 불렀고, 첫 회전 뒤 나머지 4번이 탈취로 판정돼 모든 세션이 지워졌습니다. 쿠키를 지울 때 도메인이 빠져 폐기된 쿠키도 남았습니다 |
| **해결** | 회전을 Redis Lua 스크립트 하나로 원자 처리하고, 회전 직후 30초 동안 같은 옛 토큰에는 같은 새 토큰을 다시 발급합니다. 탈취로 판정돼도 그 로그인 한 건에서 이어진 토큰만 지우고, 401일 때만 로그아웃합니다(배포 중 5xx로는 로그아웃되지 않습니다) |
| **판단** | 30초 유예 동안은 토큰을 훔친 사람도 같은 새 토큰을 받습니다. 다만 두 사람의 사용 시점이 30초 넘게 벌어지면 그 로그인의 토큰이 모두 폐기돼 탈취가 드러납니다. 실제 동시 요청은 1~2초 안에 몰렸습니다 |
| **재발 방지** | 실제 Redis로 Lua 스크립트를 검증하는 테스트를 CI에서 돌립니다(같은 옛 토큰으로 10개 연결이 동시에 회전하면 회전 1건 · 재발급 9건). 탈취 판정은 warn 로그로 남겨 같은 초에 몰리면 회귀로 봅니다 |

</div>

---

## 6. 협업 - 동료 평가

팀 프로젝트에서 받은 Peer Review 원문입니다.

### view My Startup (2024.09~10) - 풀스택

> "개발에 대한 경험을 바탕으로 프로젝트 기본 틀을 설계하고 방향성을 제시해주셨습니다."<br>
> "기능에 대해 대충 넘어가지 않고 왜 필요하고 어떻게 사용될지 깊이 생각하는 부분에서 시너지가 났고, 이슈가 생기면 기록해 모두에게 공유해주는 모습이 좋았습니다."<br>
> "아무래도 개발을 하시던 분이셔서 모르는 부분을 잘 알려주셨습니다."<br>
> "제일 코드 리뷰를 활발하게 해주셔서 너무 도움이 되었고, 평소에도 협의할 점을 잘 캐치해주셔서 팀에 도움이 많이 되었습니다."

### DocThru (2024.11~12) - 팀장 · 백엔드

> "팀장으로써 팀 전체적인 부분을 잘 신경써서 이끌어 주셨습니다."<br>
> "계획성있게 이끌어주었다."<br>
> "팀장으로서 팀원들의 의견을 조율하시고 기능 구현에 대한 아이디어를 많이 내주셔서 좋았습니다."<br>
> "팀장으로서 나이와 경력, 실력에 상관없이 늘 누구에게나 일관성있게 겸손히 소통하시는 모습이 멋있었습니다. 함께 협업하고 싶은 사람은 어떤 장점이 있는지를 배울 수 있었습니다."

### Fitmate (2025.01~02) - 백엔드

> "자칫 놓칠 수 있는 부분을 잘 짚어주셔서 감사했습니다."<br>
> "거의 매일 출석하셔서 백엔드 개발을 꾸준히 해주시고, 프론트엔드 분들과도 소통을 자주 해서 필요한 것들을 반영하고 만들어 주셨습니다."<br>
> "이것저것 요구사항이 좀 있었는데 빠르게 처리해주었다."<br>
> "의문점이 생기면 같이 의견을 나누어보려고 하시는 게 좋았습니다."

---

> Recueve · ProWith · GENYS Lotto AI 저장소는 GitHub 비공개 저장소로 관리하고, Jake English는 공개 저장소입니다.
> 더 자세한 내용은 이력서를 참고해 주세요.
