# 검색창 고도화 — 작업 계획 (6a 확정 시안 기준)

대상 파일: `whats-the-strategy.html` 한 개 (단일 파일 앱)
디자인 시안: `design_handoff_strategy_viewer/5a-search-static.html` + `5a-search-README.md` (6a 확정안)
원래 설계안·디자인 지시문: `DESIGN-BRIEF-SEARCH.md`

> 이 문서는 단계별로 **새 창(새 세션)** 에서 작업하기 위한 인수인계 문서입니다.
> 각 단계를 시작할 때 이 문서의 0절과 해당 단계 절을 읽고 작업합니다.
>
> **진행 규칙**
> 1. 한 단계씩만 합니다. **단계를 시작하기 전에 반드시 사용자의 승인을 받습니다.** 승인 없이 다음 단계로 넘어가지 않습니다.
> 2. 단계가 끝나면 file:// 로 검증하고, 이 문서의 `진행 현황` 표와 해당 단계 절에 `[완료]` · 커밋 해시 · 실제로 고친 내용 · 남은 문제를 적어 **다음 새 창이 이어받을 수 있게** 갱신한 뒤 커밋합니다.
> 3. 모델·노력은 아래 표의 추천을 따릅니다 (토큰 절약 기준: 판단이 많은 단계만 Opus, 옮겨 적기·정리 위주는 Sonnet).
> 줄 번호는 2026-09-17 기준(±5줄). 함수 이름으로 찾는 것이 더 확실합니다.

---

## 진행 현황

| 단계 | 내용 | 난이도 | 추천 모델 · 노력 | 상태 |
| --- | --- | --- | --- | --- |
| 1 | 검색 엔진 — 문법 파서 · 적중 계산 · 정렬 · 오타 허용 | **상** | Opus 5 · 높음 | **[완료]** 2026-09-17 · 커밋 `723f26f` |
| 2 | 결과 드롭다운 — 모달 제거, 머리글 · 집계 레일 · 자료 블록 · Zero-state · 결과 없음 | 중 | Sonnet 5 · 높음 | **[완료]** 2026-09-17 · 커밋 `156daa2` |
| 3 | 키보드 · 단축키 · 입력칸 연산자 색 표시 · 문법 도움 패널 | 중 | Sonnet 5 · 중간 | **[완료]** 2026-09-17 · 커밋 `b288c21` |
| 4 | 딥링크 — 뷰어 하이라이트 층 + 결과 이동 막대(자료 넘나들기) | **상** | Opus 5 · 높음 | **[완료]** 2026-09-18 · 커밋 `6bc47be` |
| 5 | 레일 필터 · 커맨드바 교집합 · 최근 검색어/열람 저장 · 좁은 화면 · 설명서 · 옛 코드 정리 | 하~중 | Sonnet 5 · 중간 | 대기 |

난이도 근거
- **1 (상)**: 문법 의미(AND/OR/제외/정확/필드/태그)를 한 번에 맞춰야 하고, bitap 오타 허용·점수·오타 제안은 판단이 많습니다. 여기서 틀리면 2~5단계가 전부 흔들립니다.
- **2 (중)**: 시안 CSS 를 접두사만 바꿔 옮기고 `R` 을 HTML 로 그리는 일이 대부분. 위치 계산·바깥 클릭 처리 정도가 판단 거리입니다.
- **3 (중)**: 키 처리는 정형적이지만 거울 층은 한글 IME 와 커서 정렬을 실제 기기에서 확인해야 합니다.
- **4 (상)**: pdf.js 글자 좌표 → 화면 사각형 변환, 렌더 순서(`renderSeq`)와 그리기 층·확대와의 충돌, 자료를 넘나드는 이동 상태 관리.
- **5 (하~중)**: 저장·미디어쿼리·설명서 문구·삭제 정리. 양은 있지만 판단은 적습니다.

---

## 0. 이 앱에 대해 꼭 먼저 알 것 (모든 단계 공통)

- **파일이 1 MB** 이고 그 안에 아주 긴 base64 한 줄(manifest)이 있습니다. 읽거나 grep 할 때는
  `awk 'length($0)<400' whats-the-strategy.html > 스크래치/wts.txt` 로 걸러낸 사본을 쓰세요 (줄 번호가 3~4줄 작습니다).
- 앱은 **`file://` 로 엽니다.** 자료(IndexedDB)는 file:// 출처에만 있으므로 localhost 로 열면 빈 화면입니다. 검증은 반드시 파일을 직접 여세요.
- iPad 에서도 씁니다 (`isNarrow()` = 860px 이하, 왼쪽·오른쪽 패널이 덮개식). 손가락 조작·IME(한글 조합) 를 깨뜨리면 안 됩니다.
- 디자인 토큰은 `:root` 에 이미 있습니다: `--bg #f3f2f2` `--panel2 #eae9e9` `--ink #201e1d` `--muted #605d5d` `--muted2 #7d7979` `--line #d7d3d3` `--rule #201e1d` `--hairline rgba(32,30,29,.4)` `--accent #ec3013` `--accent-ink #ae1800` `--accent-soft #ffe0d9` `--shadow`. 하이라이트는 `#ffc4b8` 리터럴. **라운드 0, 새 색 만들지 않기, 전환은 색 0.12s 뿐.**
- git 커밋 메시지는 한국어 한 줄 요약 + 끝에 `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

### 지금 코드에서 검색이 어떻게 되어 있나

| 것 | 위치 | 메모 |
| --- | --- | --- |
| 검색 input | HTML `#topbar > #searchwrap > #search` (1465~1475줄), CSS 91~110줄 | `#searchwrap` 은 `position:relative`, 오른쪽 패널이 열려 있으면 `padding-right:calc(var(--right-w) - 166px)` |
| 결과 모달 | HTML `#searchpop` (1685줄), CSS 238~262줄 (`.pop .pophead #popbody .res .snip .where #popempty`) | **통째로 없앱니다** (`.pophead` 는 Agenda 팝업도 쓰므로 CSS 는 남김) |
| 검색 JS | "8) 검색" 절 3595~3790줄: **`runSearch(Q,opt)` `editDist` `suggestFix(Q)`** (1단계) + 호환용 `searchDocs(q)` `snippetOf(d,q,inNote,r)` + `openPop/closePop/renderPop` + input·focus·click 핸들러 | 옛 모달은 `searchDocs`→`runSearch` 호환 함수로 동작 중. 2단계에서 모달·호환 함수 삭제 |
| 띄어쓰기 무시 부품 | `sqz(s)→{t,map}` `sqzQ(q)` `findSpans(sq,needle,limit)` `cutSpan(hay,from,to)` (2138~2176줄) | 그대로 재사용. `cutSpan` 은 `docfind` 가 씀 |
| **검색 문법 부품 (1단계)** | `cutSpans(hay,spans,center)` 2178 · `parseQuery(raw)` 2199 · `queryHasTerms(Q)` · `fuzzyK(nq)` · `bitap(text,pat,k)` 2259 · `termHits(str,alt)` · `termSpans(sq,alt,limit)` · `hitSpans(sq,Q,fieldOk)` 2312 | 모두 `cutSpan` 바로 아래. `hitSpans` 는 검색어의 모든 조각 자리를 시작순으로 |
| 색인 | `indexDoc(d)` (2510줄): `d._allSq = sqzQ(title + SEP + pages.join(SEP))` + `d._pgQ = null`. **`pgQ(d)`** (2520줄) 가 쪽별 문자열을 게으르게 만듦. `sqzPages(d)` 는 **LRU 24개**(`SQLRU` Map, 2527줄) | 자료를 다시 끼우는 `relinkDoc` 은 `SQLRU.delete(d.id)` |
| 자료 내 검색 | "8-3)" 절: `#docfind` `S.find` `runDocFind` `gotoDocFindHit` `#dfpop` | 건드리지 않음. 결과 이동 막대 `#hitbar`(4단계, "8-4)" 절)는 별개 요소 — 막대가 열려 있으면 `#dfpop` 은 `top:72px` |
| 회의 종류 칩 | `renderCats()` 2426줄, 클릭 토글 3900줄, `S.offCats` / `KV.offcats` | `activeDocs()` 가 이미 꺼진 종류를 뺍니다 → 검색은 이미 커맨드바와 교집합 |
| 자료 열기 | `selectDoc(id)` → `loadPdfFor` → `renderPage()` (canvas + **`#hl-layer` 하이라이트 층**, `paintHl`) `goPage(n)` | 4단계 완료. `renderPage()` 끝에서 `S.hlQ` 가 있으면 `paintHl(page, vp, seq)` |
| 전역 Esc 사슬 | 9276~9296줄 (`else if($("#searchpop")…) closePop();`) | 드롭다운·결과 막대로 바꿔 끼움 |
| 전역 상태 | `S` 2384줄, `KV_DEFAULT` 2283줄, `SYNC_KV_KEYS` 8045줄 | 최근 검색어·열람은 기기별(동기화 제외) |
| 설명서 | `TUT` 배열 8855줄, 3절 "네 가지 찾기" 8917~8930줄 | 5단계에서 갱신 |
| 좁은 화면 | `@media (max-width:860px)` 1435줄 (`#brand{display:none}` `#searchpop .pop{…}`) | |

---

## 1. 확정 설계 (시안 → 구현 규칙)

### 1-1. 시안과 다르게 가는 점 — 먼저 읽을 것

1. **입력칸 안 연산자 "칩"은 만들지 않습니다.** 한글 IME 조합 중에 `contenteditable` 을 다시 그리면 글자가 깨지므로, `<input>` 은 그대로 두고 **글자색을 투명하게 한 뒤 뒤에 같은 글꼴의 거울 층**(`#qmirror`)을 깔아 조각별로 **색·배경·취소선만** 입힙니다. 테두리·패딩·굵기·글자 크기는 폭이 달라져 커서가 어긋나므로 쓰지 않습니다. (시안 D 의 칩 테두리 → 배경색으로 대체)
2. **`*`(앞부분 일치)** — 지금 검색이 이미 "포함" 검색이라 `모니터` 만 쳐도 `모니터링` 이 걸립니다. `*` 는 파싱·표시·도움말에는 넣되 동작은 일반 낱말과 같습니다. 문법 도움에는 "`모니터*` — 앞부분만 맞아도 (붙이지 않아도 됩니다)" 로 적습니다.
3. **커맨드바 교집합** — 커맨드바 칩은 지금 "기본 전부 켜짐 / 누르면 끔" 입니다. 그래서 시안 E 의 `필터: 손익보고 ✕` 칩은 **켜진 종류가 전체가 아닐 때**(`S.offCats.size>0`) 켜진 종류 이름을 보여 주는 것으로 정합니다(3개 이하면 이름, 넘으면 `N종류`). `✕` 는 Select All. 한 종류만 빠르게 보려면 드롭다운 **레일의 회의 종류 막대**를 누르면 됩니다(커맨드바는 건드리지 않는 드롭다운 안 필터).
4. **레일 숫자는 모두 "적중 수"** 기준입니다(시안 C: 전체 14 = 파일명 2 + 본문 9 + 회의록 3, 회의 종류 막대 합 14, 기간 합 14). 파일명 일치는 자료당 1곳으로 셉니다. 머리글은 `자료 N건 · 적중 M곳`.
5. **기간 세그먼트**는 `이번 달 · 지난 달 · 이전` 세 칸(달은 자료 날짜 기준, 라벨은 `08 · 8` 처럼 달·적중수). 자료가 두 달에만 있으면 두 칸.
6. **회의록 적중 줄**을 누르면 그 자료를 열고 오른쪽 패널을 **회의록 탭**으로 바꿉니다(쪽 이동 없음). 결과 이동 막대(4단계)는 **본문(쪽) 적중만** 오갑니다.
7. `author:` 필드 없음(메타데이터 없음). 필드는 `title:` `cat:` `year:` `note:` 네 가지.

### 1-2. 검색 문법 (1단계에서 구현)

| 입력 | 뜻 | 규칙 |
| --- | --- | --- |
| `임원회의 컴플라이언스` / `임원회의 + 컴플라이언스` | 모두 포함(AND) | 공백 = AND. `+` 가 홀로 있으면 무시(AND 와 같음) |
| `직영 / 위탁` | 하나라도(OR) | **홀로 선 `/` 만** OR. 낱말 안의 `/`(`현안/이슈`)는 글자 |
| `유휴차량 -지입` | 제외 | `-` 로 시작하는 조각. 제목·본문·회의록 어디든 있으면 그 자료 제외 |
| `"연간 1.5억원 추가 수익"` | 정확히(붙어서) | 따옴표 안 전체가 한 조각. 공백은 어차피 무시하므로 "붙어서 나온다"가 정확한 뜻. 일반 `차량 방치` 는 두 낱말 AND, `"차량 방치"` 는 연속 |
| `모니터*` | 앞부분 일치 | 1-1-2 참고 — 일반 낱말과 같음 |
| `컴플라인언스~` | 오타 허용 | 길이 ≤4 → 1글자, 5 이상 → 2글자까지 다른 것 허용 (Wu-Manber bitap, 음절 단위) |
| `#임원회의` `#임원` | 회의 태그 | `KV.cats` 와 정확·앞부분 일치(여러 개면 OR). 결과를 그 종류로 좁힘 |
| `title:임원회의` `cat:손익보고` `year:2026` `note:재보고` | 필드 | `title:` 제목만, `cat:` = `#`, `year:` 날짜 연도, `note:` 회의록만 |

파싱 결과 모양:

```js
/* parseQuery("#임원회의 \"차량 방치\" -지입 모니터* 직영 / 위탁") */
{
  raw:"…",
  tags:["임원회의"],                       // # · cat:
  year:null,                              // year:
  neg:[ {nq:"지입"} ],                    // -
  groups:[                                // AND 로 묶인 조각. 각 조각은 OR 대안 목록
    { alts:[ {nq:"차량방치", kind:"phrase", field:"any"} ] },
    { alts:[ {nq:"모니터",   kind:"prefix", field:"any"} ] },
    { alts:[ {nq:"직영", kind:"plain", field:"any"}, {nq:"위탁", kind:"plain", field:"any"} ] }
  ],
  tokens:[ {s:"#임원회의",kind:"tag",a:0,b:5}, {s:"\"차량 방치\"",kind:"phrase",…}, … ]  // 3단계 거울 층용 (원문 위치)
}
```

### 1-3. 적중 계산 결과 모양

```js
/* runSearch(Q) → R */
{
  q:Q,
  docs:[ {                                  // 정렬된 자료 블록
    d, score,
    title:true|false,                       // 파일명 일치
    pages:[ {p:12, n:2, spans:[[a,b],…]} ], // 쪽별 적중(원문 위치). spans 는 표시할 자료만 채움
    note:{ n:1, spans:[[a,b]] } | null,
    hits:7                                  // (title?1:0) + Σpages.n + note.n
  } ],
  tot:{ docs:8, hits:14, title:2, body:9, note:3 },
  byCat:{ "임원회의":5, … },                // 적중 수
  byMonth:{ "2026-08":8, "2026-07":4, prev:2 }
}
```

- 대상 자료 = `activeDocs()` (커맨드바 교집합은 여기서 저절로) ∩ `tags`/`year` 조건.
- 자료 걸러내기(1차, 싸게): `groups` 의 모든 조각에 대해 어느 대안이든 `d._allSq.includes(nq)` 또는 회의록 `includes` 여야 하고, `neg` 는 하나도 없어야 함. `title:`/`note:` 필드는 각각 `sqzQ(d.title)` / 회의록만 봄. fuzzy 조각은 bitap 으로 `_allSq` 검사.
- 적중 세기(2차): 걸러진 자료만. 쪽별 문자열 `d._pgQ = pageTexts.map(sqzQ)` (문자열만, `indexDoc` 에서 게으르게 만들어 붙임 — map 배열은 만들지 않음) 위에서 `indexOf` 반복으로 조각별 개수. 회의록도 같은 방식.
- span(원문 위치) 은 **화면에 그릴 블록만** `sqz(page)` 로 만듭니다. `sqzPages` 의 1개 캐시를 **LRU 24개**로 늘립니다(`SQC` → `SQLRU` Map).
- 점수: `title×5 + note.n×2 + Σpages.n×1`, 같으면 날짜 내림차순. 정렬 옵션 `관련도순 | 최신순`.
- 스니펫: 쪽 안 첫 span 을 가운데 두고 `cutSpan` 처럼 앞 28·뒤 46자를 자르되, **그 창 안의 모든 조각 span 을 `<mark>`** 로 — 새 함수 `cutSpans(hay, spans, center)`. 원문 공백 그대로.
- 오타 제안(결과 0건): `groups` 가 일반 조각 1개이고 길이 ≥3 이면 그 조각을 fuzzy 로 다시 돌려 실제로 걸린 원문 조각(길이 n-1~n+1 창 중 편집거리 최소)을 모아 **가장 많이 나온 문자열**을 `혹시 → X (N건)` 으로 제안. N 은 그 문자열로 다시 검색한 자료 수.

### 1-4. 화면 (2·3·5단계)

```
#sdrop (body 직속, position:fixed, z-index 68)      ← #searchwrap 의 getBoundingClientRect() 로 left/top/width 계산
├ .sd-head  높이 38 · 바탕 --panel2 · 아래 2px --rule
│   🔍 ‘검색어’ · 자료 N건 · 적중 M곳 · [필터: 손익보고 ✕] · [관련도순 ▾](우측) · ✕
├ .sd-row (flex)
│  ├ .sd-rail  폭 196 · 바탕 --panel2 · 오른쪽 2px --rule     (결과 있을 때만)
│  │   어디에서 걸렸나: 전체 / 📄 파일명 / 📝 본문 / 🗒 회의록 (+수)   ← 선택 줄 --accent-soft + 왼쪽 3px --accent
│  │   회의 종류: 이름 · 막대 54×6 · 수 (1위만 --accent, 나머지 --ink)
│  │   기간: 3분할 세그먼트 높이 22
│  └ .sd-col   세로 스크롤
│      .sd-doc (자료 블록) ×N
│        .sd-title  제목 800 13px + 종류 칩(높이 18, 1px --line; 선택 블록만 2px --accent)
│        .sd-meta   2026 · 08 · W3 · 24p · [📄 파일명 일치] · 본문 4곳 · 회의록 1곳
│        .sd-hit    [12p 34px 800 11px --accent-ink] 스니펫 12px/1.5     (위 1px --line)
│        .sd-more   + N곳 더 보기 (padding-left 49)
│      .sd-more2  + 자료 N건 더 보기
│      .sd-foot   ↑↓ 이동 · Enter 열기 · Tab 다음 자료 · Esc 닫기 ……… 문법 도움 ?
└ .sd-help (폭 260, 왼쪽 2px --rule, 3단계)
```

- 폭: 결과 760 / Zero-state·결과 없음 640 / 도움 열림 +260. 화면이 좁으면 `min(그 값, 창 너비 − left − 16)`. 최대 높이 `min(704px, 100vh − 56 − 16)`.
- 뒤를 덮지 않음. 바깥 클릭(`mousedown` 이 `#searchwrap`·`#sdrop` 밖) 과 Esc 로 닫힘. 페이드 없음.
- 블록 상태: 키보드 선택 `.sel`(바탕 --accent-soft, 제목 줄 왼쪽 3px --accent, 아래 2px --rule, 적중 줄 구분선 `#ffc4b8`), 마우스 hover 는 `--panel2`.
- 블록 3줄까지 기본, `+ N곳 더 보기` 로 펼침(블록 안 상태). 블록 8개까지 기본, `+ 자료 N건 더 보기` 로 8개씩 추가.
- Zero-state(글자 없음·포커스): `🕘 최근 검색어`(최대 5, 줄 끝 ✕, 머리글 `모두 지우기`) → `📂 최근 열람 문서`(최대 5: 제목 + `종류 · 연 · 월 · W · 쪽`) → 문법 한 줄 힌트 → 바닥 줄. 둘 다 비어 있으면 힌트 두 줄만.
- 결과 없음: `‘q’ 에 해당하는 자료가 없습니다.` → 제안 줄(있을 때) → `~` 안내 → 최근 검색어 3줄. 바닥 힌트 `Enter 제안 검색어로 · Esc 닫기`.

### 1-5. 키보드 (3단계)

| 키 | 동작 |
| --- | --- |
| `Ctrl/⌘ K`, `/` (글 적는 중 아닐 때) | `#search` 포커스 + 전체 선택. 유휴 상태엔 input 오른쪽 `⌘K`/`Ctrl K` 힌트(플랫폼 따라) |
| `↑ ↓` | 줄 이동 — 제목 줄과 적중 줄을 한 흐름으로. 끝에서 멈춤. 스크롤 따라감 |
| `Enter` | 선택 줄 열기(제목 줄 = 첫 적중 쪽, 적중 줄 = 그 쪽, 회의록 줄 = 회의록 탭). Zero-state 에서는 최근 검색어 채우기 / 최근 문서 열기. 결과 없음+제안 있으면 제안 검색어로 |
| `Tab` / `Shift Tab` | 다음/이전 **자료 블록** 제목 줄 (드롭다운 열려 있을 때 preventDefault) |
| `← →` | 레일 그룹 이동(전체 ↔ 파일명 ↔ 본문 ↔ 회의록) — 커서가 input 끝/처음일 때만, 아니면 글자 이동 |
| `Esc` | 드롭다운 닫기(검색어 유지). 이미 닫혀 있고 결과 이동 막대가 있으면 막대 닫기 |
| 결과 이동 막대 | `Enter` 다음 · `Shift Enter` 이전 (막대에 포커스가 있거나 검색창에 있을 때) |

### 1-6. 딥링크 (4단계)

- 적중 줄 클릭/Enter → `closeSdrop()` → `selectDoc(id)` → `goPage(p)` → `S.nav` 설정 → `#hitbar` 표시.
- **하이라이트 층** `#hl-layer`: `#canvaswrap` 안 `<div>` (absolute, canvas 와 같은 크기, `pointer-events:none`, `mix-blend-mode:multiply`). `renderPage()` 끝에 `paintHl(page, vp)`:
  1. `page.getTextContent()` → items. 추출 때와 같은 방식으로 이어 붙여(`str` 을 공백으로 join) 각 item 의 문자 시작 오프셋 표를 만든다.
  2. `sqz(joined)` 위에서 검색 조각들의 span 을 찾고(`findSpans`), 원문 오프셋 → item + 글자 범위로 되돌린다.
  3. item 사각형은 `pdfjsLib.Util.transform(vp.transform, item.transform)` 으로, 글자 범위는 item 폭을 글자 수 비례로 나눠 근사. `<i class="hl">` (배경 `#ffc4b8`) 를 놓고 현재 항목엔 `.cur`(아래 2px `--accent`).
  4. `drawSync()`(그리기 층 크기 맞춤) 뒤에 같은 크기로 맞춘다. 확대·맞춤·쪽 이동마다 다시 그림(같은 renderSeq 검사).
  5. 글자를 못 뽑은 쪽(스캔)은 하이라이트 없음 — 막대에 `(이 쪽은 글자 없음)` 표시 안 함, 그냥 쪽만 이동.
- **결과 이동 막대** `#hitbar`: `#viewbar` 바로 아래 높이 28, 바탕 `--panel2`, 아래 1px `--hairline`. `🔍 ‘검색어’  3 / 12` · `임원회의 · 2026 · 08 · W3 · 12p` · 우측 `◀ ▶ ✕`. `S.nav = { q:Q, list:[{id,p}…], i }` — `R.docs` 순서대로 본문 적중 쪽을 평평하게 펼친 목록. ◀▶ 가 다른 자료로 넘어가면 `selectDoc` 부터. `body.full` 에선 `#docfind` 처럼 어두운 색. 좁은 화면(5단계)에선 화면 아래 고정 44px `--ink` 바탕.
- 막대가 열리면 `#dfpop` 은 닫고, `#docfind` 는 그대로 둠(둘은 독립). 자료를 다른 방법(왼쪽 목록)으로 바꾸면 막대는 유지하되 `3 / 12` 대신 `– / 12`.

---

## 2. 단계별 작업

### [1단계] 검색 엔진 — 난이도 상 · Opus 5 · 노력 높음 — **[완료] 2026-09-17 · 커밋 `723f26f`**

**실제로 한 것** (아래 계획 1~6 모두 구현)
- `parseQuery(raw)` — 1-2 표 그대로. 따옴표 덩어리는 `-"…"` `title:"…"` 처럼 앞에 붙어도 한 토큰. `tokens[].kind` 는 `tag · year · neg · field · phrase · prefix · fuzzy · plain · and · or` (3단계 거울 층은 `s` 의 끝 기호를 보고 `*`/`~` 를 색칠하면 됨). 빈 조각(`-`만, `title:`만, `""`)은 버림. `queryHasTerms(Q)` 로 "조건이 하나라도 있나" 판정 — `#태그`만·`-제외`만 있어도 검색은 됨(적중 0곳으로 나열).
- `bitap(text, pat, k)` — Wu-Manber. 이웃한 끝 위치(끼워 넣기·빼기 때문에 생기는)를 한 자리로 합쳐 개수가 부풀지 않게 함. **비둘기집 사전 걸러내기**(pat 을 k+1 토막으로 나눠 하나도 `includes` 안 되면 즉시 빈 배열) 로 오타 검색이 대부분 자료를 글자 단위로 훑지 않음. `fuzzyK(nq)` = 길이 ≤4 → 1, 그 외 2.
- `cutSpans(hay, spans, center)` — 창 안의 모든 자리 `<mark>`, 겹침은 합침. `cutSpan` 은 남김(docfind).
- `pgQ(d)` / `d._pgQ` · `sqzPages` LRU 24 (`SQLRU`, `SQLRU_MAX`) · `relinkDoc` 의 `SQC` 초기화 → `SQLRU.delete(d.id)`.
- `runSearch(Q, opt)` — 1-3 모양 그대로. `opt = { spansFor:Set<id>, sort:"date" }`. **파일명 일치(`title`) 는 조각 하나라도 제목에 있으면 true** (모든 조각이 제목에 있어야 하는 것이 아님 — 2단계 레일 "파일명" 수는 이 기준). `byMonth` 의 키는 오늘 기준 이번 달·지난 달 `YYYY-MM` 과 `prev` (미래 날짜는 이번 달로).
- `suggestFix(Q)` → `{ q, n } | null`. `editDist` 는 창 고르기용 짧은 문자열 전용.
- 옛 `searchDocs(q)` → `[{d, inNote, r}]` (`r` = `R.docs` 항목), `snippetOf(d, q, inNote, r)` — `r` 을 주면 다시 검색하지 않고 처음 걸린 쪽 하나만 `sqz` 해서 모든 조각을 `<mark>`. `renderPop` 은 `r` 을 넘기도록 한 줄만 바꿈. 모달 화면은 그대로.

**검증** — Claude in Chrome 확장이 연결되지 않아 **headless Chrome(file://, 빈 프로필)** 로 앱 전체를 열고 끝에 검사 스크립트를 붙인 사본으로 확인함(실제 자료 대신 가짜 자료 3건을 `DOCS` 에 밀어 넣음). 결과: JS 오류 0 · `parseQuery` 예시 모양 일치 · `runSearch("컴플라이언스").tot.docs === searchDocs(...).length` · `컴플라인언스~` 가 컴플라이언스 자료를 찾음 · `suggestFix` → `{q:"컴플라이언스", n:2}` · 옛 모달이 여러 `<mark>` 스니펫·회의록·결과 없음 모두 정상. 성능(가짜 100건 × 60쪽 × 1,500자 = 9 MB, 모든 쪽에 걸리는 최악 검색어): 첫 실행 134 ms(`_pgQ` 생성 포함) → **2번째부터 18 ms**, 드문 낱말 7 ms, 오타 검색(모든 쪽 적중) 1.0 s, `suggestFix` 1.6 s.
**사용자 실제 자료로는 아직 안 돌려 봄** — 2단계 시작 전에 file:// 로 열어 콘솔에서 `runSearch(parseQuery("컴플라이언스")).tot` 과 `console.time` 을 한 번 찍어 보면 좋음.

**남은 문제 / 다음 단계에 넘기는 메모**
- 오타 검색(`~`)·`suggestFix` 는 검색어가 거의 모든 쪽에 있을 때 자료가 아주 많으면 1초 넘게 걸릴 수 있음(현실 자료에선 훨씬 작을 것). 느리면 2·3단계에서 `~` 입력 시 debounce 를 늘리거나 `suggestFix` 를 `requestIdleCallback` 으로.
- 입력 중간 상태(`"` 하나, `-` 하나) — `"` 만 치면 조각이 없어 "결과 없음", `-` 만 치면 글자 `-` 를 찾음. 2단계 드롭다운에서 `queryHasTerms(Q)` 가 false 면 Zero-state 를 보이면 됨.
- `neg` 는 일반 문자열만(오타 허용 없음). `-title:x` 는 `title:x` 글자를 그대로 제외 조각으로 봄(필드 제외는 미지원).
- 옛 모달·호환 함수(`searchDocs` `snippetOf` `openPop/closePop/renderPop`, HTML `#searchpop`, CSS 238~262줄)는 2단계에서 삭제.

---- 원래 계획 ----

화면은 건드리지 않고 함수만 만듭니다. 끝나면 콘솔에서 `runSearch(parseQuery("…"))` 로 확인.

1. `sqz()` 옆(2172줄 아래)에 **문법 부품** 추가
   - `parseQuery(raw)` — 1-2 표대로. 토큰화: 따옴표 안은 한 덩어리, 나머지는 공백 분리. `#`/`cat:`/`title:`/`year:`/`note:`/`-`/끝 `*`/끝 `~` 판정. 홀로 선 `/` 는 앞뒤 조각을 같은 `alts` 로 합침, 홀로 선 `+` 는 버림. 각 토큰의 원문 위치 `a,b` 를 `tokens` 에 남김(3단계용). 빈 조각(`-` 만, `title:` 만)은 버림.
   - `bitap(text, pat, k)` — Wu-Manber, `pat` 길이 ≤ 31 (넘으면 앞 31자). 끝 위치 배열 반환.
   - `cutSpans(hay, spans, center)` — `cutSpan` 일반화. `cutSpan` 은 `docfind` 가 쓰므로 남겨 둠.
2. `indexDoc()` 에 `d._pgQ = null` 초기화만 추가하고, 게으른 생성 함수 `pgQ(d)` (`d._pgQ || (d._pgQ = pageTexts.map(sqzQ))`). 자료 이름·PDF 를 바꾸는 곳(4105줄, 7226줄)이 `indexDoc` 을 다시 부르므로 거기서 `_pgQ` 도 초기화됨.
3. `sqzPages(d)` 를 LRU 24 로: `SQLRU = new Map()`; 있으면 꺼내 맨 뒤로, 없으면 만들고 25개 넘으면 맨 앞 삭제. 이름·시그니처는 그대로(`docfind` 가 씀).
4. `searchDocs(q)` / `snippetOf()` 자리에 **`runSearch(Q, opt)`** 작성 (1-3 대로). `opt = { spansFor:Set<id> }` — span 을 채울 자료만. 회의록은 `noteOf(d).text`.
   - 조각 매칭 함수 `termHits(str, alt)` : plain/prefix/phrase → `indexOf` 반복 개수, fuzzy → `bitap(...).length`.
   - `neg` 는 제목·본문·회의록 어디든 1곳이라도 있으면 제외.
   - `tags`: `KV.cats` 중 `sqzQ(cat)` 이 `sqzQ(tag)` 로 시작하는 것 전부(OR). 없으면 결과 0.
   - `year`: `yearOf(d) === year`.
5. `suggestFix(Q)` — 1-3 마지막 항목. 결과 0건일 때만 부름. 시간이 오래 걸릴 수 있으니 `_allSq` 만 훑고, 자료 300개 넘으면 처음 300개.
6. 옛 `searchDocs`/`snippetOf` 는 이 단계에서 **`runSearch` 로 감싼 호환 함수**로 바꿔 지금 모달이 계속 동작하게 둡니다(2단계에서 모달과 함께 삭제).

검증(콘솔, file:// 로 열어서):
- `parseQuery('#임원회의 "차량 방치" -지입 모니터* 직영 / 위탁')` 이 1-2 예시 모양인지.
- `runSearch(parseQuery("컴플라이언스")).tot` 이 옛 `searchDocs("컴플라이언스").length` 와 자료 수가 같은지.
- `runSearch(parseQuery("컴플라인언스~"))` 가 `컴플라이언스` 자료를 찾는지. `suggestFix(parseQuery("컴플라인언스"))` 가 `{ q:"컴플라이언스", n }` 를 주는지.
- 자료 100건 기준 `runSearch` 가 50ms 안쪽인지 (`console.time`).

### [2단계] 결과 드롭다운 — 난이도 중 · Sonnet 5 · 노력 높음 — **[완료] 2026-09-17 · 커밋 `156daa2`**

**실제로 한 것** (아래 원래 계획 1~5 그대로 구현, 세부는 이렇게 갈렸습니다)
- HTML: `#searchpop` 삭제 → `<div id="sdrop" hidden>` (JS 가 통째로 그림). placeholder·`#skbd`(`⌘K`/`Ctrl K`, `navigator.platform` 로 판정) 추가.
- CSS: `#searchpop`·`.res`·`#popempty` 삭제(`.pophead` 는 Agenda 용으로 유지). `#sdrop` 계열은 시안 CSS 를 `sd-` 접두사로 옮기고 앱 CSS 변수(`--panel2` `--accent-soft` `--hairline` 등)로 치환 — 시안의 `rgba(...,.22/.30)` 옅은 선은 전부 기존 `--hairline` 하나로 통일(새 색 안 만들기 원칙). `#search:focus` 대신 `#searchwrap.focus`(JS 가 붙임)로 흰 바탕·검은 밑줄.
- JS "8-2) 검색 결과 드롭다운" 절: 계획대로 `S.srch` 상태, `openSdrop/closeSdrop/placeSdrop/renderSdrop`, `sdCompute(Q)`(자료 걸러내기 1차 실행 후 걸린 자료 id 전부를 `spansFor` 로 2차 실행 — "보일 블록만"이 아니라 "걸린 자료 전부"로 단순화; 자료 수가 많지 않은 개인용 앱이라 성능 여유가 있고, 레일·종류·기간·정렬·더보기는 재검색 없이 이미 계산된 `R.docs` 를 화면에서만 거릅니다), `sdRecompute()`(검색어는 그대로, 대상 자료만 바뀌었을 때 — 커맨드바 교집합 칩 ✕ 에 씀), `openHit({id,p,note})`.
- 클릭 위임은 계획한 표대로 전부 구현(제목 줄 · 적중 줄 · 종류 칩 · 레일 그룹 · 회의 종류 막대 · 기간 세그먼트 · 정렬 · 더보기 두 종류 · 필터칩 ✕ · Zero-state 줄 · 제안 검색어).
- Esc 사슬 교체, `#clearsearch` 는 Zero-state 로 돌아감(안 닫힘).
- **계획에 없던 버그 두 개를 검증 중 찾아 고쳤습니다**(둘 다 코드 리뷰만으론 안 보이고 실제 클릭해봐야 드러나는 것들):
  1. `<input type="search">` 는 Esc 를 누르면 브라우저가 스스로 글자를 지웁니다 — "Esc 닫기(검색어 유지)" 요구와 충돌하여, 검색창에 포커스가 있을 때는 Esc 의 브라우저 기본 동작을 `preventDefault` 로 막았습니다.
  2. 결과를 열어 드롭다운이 닫힌 뒤 검색창은 계속 포커스 상태로 남는데, 그 상태에서 검색창을 다시 눌러도 `focus` 이벤트가 새로 나지 않아(이미 포커스라서) 드롭다운이 안 열렸습니다 — `click` 에서도 `openSdrop()` 을 한 번 더 부르게 했습니다(이미 열려 있으면 무시되므로 안전).
- **기간(`기간`) 세그먼트 기본 상태 관련 판단**: 시안(C·D)은 첫 칸이 `.on` 이어도 전체 목록이 여전히 다 보입니다(머리글 합계도 안 줄어듦) — 즉 "기본 강조"일 뿐 실제로 거르는 상태가 아닙니다. 그래서 `S.srch.mon = null` 일 때는 최근 칸을 시각적으로만 켜 두고(강조), 실제로 눌러야 그 기간으로 좁혀지게 했습니다(다시 누르면 해제). 회의 종류 막대(`.sd-bar`)는 시안에 선택 상태 그림이 없어 `--accent-soft` 배경을 새로 정해 붙였습니다(레일의 다른 선택줄과 같은 어휘).

**검증** — `python -m http.server`(기존 `.claude/launch.json` "static") 로 열어 Browser pane 콘솔에 JS 오류 없음 확인, 가짜 자료를 `DOCS` 에 직접 밀어 넣고 화면에서 확인: 머리글 합계·레일(전체/파일명/본문/회의록·회의 종류 막대·기간 세그먼트)·자료 블록(제목·칩·메타·스니펫 `<mark>`)·필터칩(켜짐/꺼짐 후 재검색까지)·정렬 토글·더보기 두 종류(자료 단위·블록 단위)·Zero-state·결과 없음+오타 제안·적중 줄 클릭(본문 쪽 이동, 회의록 탭 전환 + 오른쪽 패널 자동 열기) 모두 기대한 숫자·동작과 일치. `file://` 로도 실제 파일을 열어 JS 오류 없이 뜨는 것 확인(이 기기에 저장된 실제 자료로 검색 결과 화면까지는 이번엔 안 찍어 봄 — 사용자가 직접 열어 한 번 확인 권장). 좁은 화면(375px)에서도 드롭다운이 화면 밖으로 안 나가는 것 확인(폭 계산은 `placeSdrop()` 의 `min()` 만으로 처리 — 레일 접기·칩 줄 같은 좁은 화면 전용 배치는 5단계 몫).

**남은 문제 / 다음 단계에 넘기는 메모**
- 문법 도움 `?` 단추(`#sd-helpbtn`, `#qhelp` 자리)는 눌러도 아직 아무 일도 안 합니다(3단계에서 패널 연결).
- 키보드로 줄 이동(↑↓·Enter·Tab)은 아직 없음(3단계). 지금은 마우스/터치 클릭만 됩니다.
- `KV.recentQ`/`KV.recentDocs` 가 아직 없어 Zero-state·결과 없음의 "최근 검색어/열람" 줄은 항상 비어 있고(힌트 줄만 보임) — 5단계에서 채워지면 `sdZeroHtml`/`sdEmptyHtml` 은 그대로 씁니다(이미 `KV.recentQ || []` 로 방어해 둠). `zrow` 의 `rm`(개별 삭제) 단추도 지금은 자리만 있고 동작은 5단계.
- 커맨드바 칩을 직접 눌러 종류를 켜고 끌 때(필터칩 ✕ 가 아니라 `#cats` 칩 자체)는 드롭다운이 열려 있어도 자동으로 다시 그려지지 않습니다 — 5단계 계획(`renderCats()` 뒤 `renderSdrop()` 한 줄)대로 남겨 둠.
- 회의 종류 막대·기간 세그먼트의 "선택됨" 배경(`--accent-soft`)은 시안에 없던 것을 새로 정한 것이라, 실제 자료로 볼 때 과하면 옅게 조정할 수 있음.

---- 원래 계획 ----

1. **HTML**: `#searchpop` 블록(1685~1691줄) 삭제. `</body>` 앞 `#searchpop` 자리에 `<div id="sdrop" hidden>` 하나만(안은 JS 가 그림). `#search` 의 placeholder 를 `파일명 · 본문 · #태그 · title:` 로. `#searchwrap` 안 `#clearsearch` 뒤에 `<kbd id="skbd">⌘K</kbd>` 추가(유휴 때만 보임, 플랫폼 따라 `Ctrl K`).
2. **CSS**: 238~262줄 `#searchpop`·`.res`·`#popempty` 삭제(`.pophead` 는 유지). 1456줄 `#searchpop .pop{…}` 삭제. 1-4 트리대로 `#sdrop` 계열 CSS 를 시안 CSS(`5a-search-static.html` 9~213줄의 `.drop .dhead .rail .rg .rbar .seg3 .dblock .dtitle .dmeta .hit .hp .hs .dmore .dmore2 .dfoot .zsec .zhead .zrow .zdoc .zhint .empty .sugg`)에서 옮기되 접두사 `sd-` 와 `:root` 토큰 이름을 이 앱 것으로 바꿉니다. `#search:focus` 일 때 `#searchwrap` 에 `.focus` 를 붙여 바탕 `#fff`, 밑선 `--ink`, 돋보기 `--ink`.
3. **JS** "8) 검색" 절을 새로 씁니다:
   - `S.srch = { open:false, R:null, grp:"all", cat:null, mon:null, sort:"rel", more:8, openBlocks:new Set(), cur:-1, help:false }`.
   - `openSdrop()` / `closeSdrop()` / `placeSdrop()` (`#searchwrap` rect 로 `left/top/width/max-height`; `resize`·`scroll` 에서 다시).
   - `renderSdrop()` — `S.q.trim()` 없으면 Zero-state, 있으면 `R = runSearch(Q, {spansFor: 보일 블록})` → 결과 있으면 머리글+레일+블록, 없으면 결과 없음 화면. 레일·정렬·기간·종류 필터는 `R.docs` 를 화면에서 거르기만(재검색 없음).
   - input 핸들러: 120ms 디바운스 → `renderSdrop()`. `compositionstart/end` 동안은 조합 중이라도 그리되 커서를 건드리지 않음(input 은 그대로이므로 문제 없음).
   - focus → `openSdrop()`; `mousedown` 문서 전체에서 바깥이면 `closeSdrop()`; 드롭다운 안 클릭은 `mousedown` 에 `preventDefault` 로 input 포커스 유지.
   - 클릭: 제목 줄 → 첫 본문 적중 쪽(없으면 그냥 열기); 적중 줄 → 그 쪽(`data-p`) ; 회의록 줄 → `selectDoc` 뒤 오른쪽 탭 `note` (`S.rtab="note"; renderRight()` — 3366줄 방식); `+ N곳` → `openBlocks` 에 넣고 다시 그림; `+ 자료 N건` → `more += 8`; 종류 칩(제목 줄 오른쪽) → `S.srch.cat` 토글; 레일 줄 → `grp`; 막대 → `cat`; 세그먼트 → `mon`; 정렬 → 토글; ✕ → 닫기; 머리글 필터칩 ✕ → Select All(3890줄 함수 재사용).
   - 자료를 여는 모든 경로는 `openHit({id,p,note})` 한 함수로 — 4단계가 여기서 `S.nav` 를 세팅.
4. 전역 Esc 사슬(9290줄) `searchpop` 줄을 `else if(S.srch.open) closeSdrop();` 로.
5. `#clearsearch` 는 Zero-state 로 돌아가게(닫지 않음).

검증: 검색어 8종(설계안 예시) 각각 시안 C/E/F 와 견주기. 오른쪽 패널 열림/닫힘·창 폭 1024/1440 에서 드롭다운 왼쪽 선이 검색 셀 왼쪽 선에 붙는지. `+ N곳 더 보기` 펼침 뒤 다른 글자 치면 접히는지. 뒤 화면이 어두워지지 않는지. 스크린샷 첨부.

### [3단계] 키보드 · 연산자 표시 · 문법 도움 — 난이도 중 · Sonnet 5 · 노력 중간 — **[완료] 2026-09-17 · 커밋 `b288c21`**

**실제로 한 것** (아래 계획 1~4 모두 구현, 세부는 계획과 조금씩 다름 — 이유는 각 항목에 적음)
- **단축키**: "15) 키보드 · 창 크기" 절 전역 `keydown` 안, `isTyping` 정의 직후에 `Ctrl/⌘+K`(어디서든) 와 `/`(`isTyping(e.target)` 아닐 때) → `$("#search").focus(); select()`. `#skbd` 힌트는 이미 2단계에서 `navigator.platform` 기준으로 채워져 있고 CSS(`#searchwrap.focus,#searchwrap.has-text` 면 숨김)도 이미 있어 손대지 않음.
- **드롭다운 안 이동**: `#search` 에 새 `keydown` 리스너. `sdRows()` = `#sdrop [data-row]` 목록(제목 줄 `.sd-title`, 적중 줄 `.sd-hit`, `+더보기` 줄 `.sd-more`/`.sd-more2`, Zero-state 의 `.sd-zrow`/`.sd-zdoc`, 결과없음의 `.sd-sugg`/`.sd-zrow` 모두 포함). `↑↓` 는 `sdSetCur()` 로 `S.srch.cur` 를 옮기고 `.kbd` 클래스 + `scrollIntoView`. **`Enter` 는 새 함수를 만들지 않고 선택된 줄 요소에서 `row.click()` 을 그대로 불러** 기존 클릭 위임 로직(`#sdrop` 의 `click` 핸들러)을 재사용함 — `openHit`·`sdSetQuery`·`+더보기` 펼치기 로직을 중복 구현하지 않기 위한 판단. `Tab`/`Shift+Tab` 은 `.sd-doc` 목록에서 다음/이전 블록의 `.sd-title` 로 점프(드롭다운이 열려 있으면 자료가 없어도 항상 `preventDefault`, 브라우저 포커스 유출 방지). `← →` 는 `selectionStart/End` 로 커서가 입력 맨 끝/처음일 때만 레일 그룹(전체↔파일명↔본문↔회의록)을 순환.
  - 시안 표의 "선택 줄 표시는 hover 와 구분" 요구는 `[data-row].kbd{background:var(--accent-soft);box-shadow:inset 3px 0 0 var(--accent)}` 로 구현 — 줄마다 padding 이 달라(제목 줄·적중 줄·더보기 줄·Zero-state 줄) 매번 `padding-left` 를 맞추는 대신 `inset box-shadow` 로 통일해 레이아웃 흔들림 없이 왼쪽 띠를 흉내냄.
- **거울 층** `#qmirror`: 계획은 "`#searchwrap` 안 `#search` 바로 앞에 div" 였지만, `#searchwrap` 이 `display:flex` 라 형제 요소로는 `#search` 의 박스(가변 폭)와 정확히 겹칠 수 없었음. 대신 **`#search` 를 `#sfield`(`position:relative`, `flex:1 1 auto`) 로 감싸고 그 안에서 `#qmirror` 를 `position:absolute;inset:0`** 으로 깔아 폭을 100% 공유하게 바꿈(계획 1-1-1 의도는 그대로, 배치 방법만 구체화). `#search{color:transparent;caret-color:var(--ink)}`, 둘 다 `line-height:30px`(테두리 2px 를 뺀 안쪽 높이) + `box-sizing:border-box` 로 맞춰 세로 위치를 최대한 맞춤. `scrollLeft` 는 `input`/`scroll` 이벤트에서 동기화.
  - 색 클래스는 계획의 `qk-*` 대신 **`qm-*`**(qm = q-mirror) 로 이름 붙임 — 이유는 그냥 습관, 의미는 같음: `qm-pfx`(필드/태그 접두사, `--muted2`), `qm-tag`(태그 값, `--accent-ink`+`--accent-soft` 배경), `qm-neg`(제외, `--muted2`+취소선+`--panel2` 배경), `qm-phrase`(따옴표 구간, `--panel2` 배경+굵게), `qm-suf`(끝 `*`/`~` 한 글자만, `--accent`+굵게), `qm-op`(`+`/`/`, `--muted2`).
  - `parseQuery(raw).tokens` 는 이미 1단계에서 원문 위치(`a,b`)와 `kind` 를 갖고 있어 그대로 순회. `field` kind(=`title:`/`note:`) 는 원문에서 접두사를 다시 정규식으로 잘라내(`qmFieldSplit`) 접두사만 `qm-pfx`, 나머지는 따옴표/접미사 여부를 한 번 더 봐서 `qm-phrase`/`qm-suf` 로 색칠 — `tok.kind` 가 `field` 로 뭉뚱그려지며 `phrase`/`prefix`/`fuzzy` 구분이 사라지는 1단계 파서의 특성 때문.
- **문법 도움 패널** `.sd-help`: 계획대로 `#qhelp`(검색칸 오른쪽, 22×22) 와 `#sdrop` 바닥의 `문법 도움 ?`(`#sd-helpbtn`, 이미 2단계에 있던 자리) 둘 다 `S.srch.help` 를 토글. `#sdrop` 의 최상위 구조를 `.sd-head` + `.sd-body`(`.sd-main`{`.sd-row`+`.sd-foot`} + `.sd-help`) 로 한 겹 더 감싸(계획 문서 1-4 트리와 다르게, 2단계 구현은 `.sd-foot` 이 `.sd-row` 형제였음) 도움 패널이 결과 영역 오른쪽에 붙도록 폭을 나눔. `S.srch.help` 면 드롭다운 폭에 `+260`. 8줄 표(`SD_GRAMMAR` 배열)를 버튼으로 찍어 클릭하면 `sdSetQuery(예시)`.

**검증** — 이번에도 Claude in Chrome 확장이 연결되지 않아 (a) 로컬 정적 서버 + 가짜 자료(`DOCS.length=0; DOCS.push(...); DOCS.forEach(indexDoc)`, `window.DOCS=` 는 안 됨 — `let DOCS` 는 전역 렉시컬 변수라 `window.DOCS=` 로는 실제 코드가 보는 값이 안 바뀜, 배열 자체를 비우고 push 해야 함) 로 콘솔에서 직접 확인, (b) headless Chrome(`file://`, 빈 프로필)으로 새 요소(`#qmirror`·`#sfield`·`#qhelp`·`.sd-help`)가 DOM 에 정상적으로 있는지 확인.
- 거울 층: `#임원회의 "손익보고" -지입 모니터* 컴플라인언스~` → `#`(회색)+`임원회의`(빨강 배경 칩) · `"손익보고"`(회색 배경+굵게) · `-지입`(취소선+회색 배경) · `모니터`+`*`(빨강 굵게) · `컴플라인언스`+`~`(빨강 굵게). `title:`/`note:`/`year:` 필드 접두사와 `+`/`/` 연산자도 각각 올바른 색으로 확인. 스크린샷을 시안 D 와 견주어 배치·색 모두 근접함(아래 첨부 스크린샷 참고).
- 키보드: `↑↓` 로 `S.srch.cur` 가 제목 줄→적중 줄로 순서대로 이동, `Tab` 으로 다음 자료의 제목 줄로 점프(`preventDefault` 확인), 선택된 줄에서 `Enter` → `openHit` 이 호출되어 `S.sel` 이 그 자료 id 로 바뀜을 확인. `←→` 는 커서가 끝에 있을 때만 레일 그룹을 순환하고, 커서가 글자 중간에 있을 때는 `preventDefault` 없이 그냥 캐럿만 움직임을 확인.
- 전역 단축키: `Ctrl+K` 는 아무 데서나(가짜 포커스 상태에서도), `/` 는 `isTyping` 이 아닐 때만 검색창을 포커스시키고 `preventDefault` 됨을 확인. 별도 `<textarea>` 에 포커스가 있을 때 `/` 를 누르면 그 글자가 그대로 입력됨(가로채지 않음)을 확인.
- 문법 도움: `#qhelp` 클릭 → `.sd-help` 나타나고 `#sdrop` 폭이 760→1020 으로 바뀜, 다시 클릭 → 닫힘. 예시 줄(`#임원회의`) 클릭 → 검색창에 그대로 들어가고 거울 색도 즉시 갱신됨을 확인.
- IME(한글 조합)는 `compositionstart`/`input(isComposing:true)`/`compositionend` 이벤트를 코드로 흉내 내 값·거울·커서가 깨지지 않는 것까지는 확인했으나, **이건 진짜 IME 가 아닌 합성 이벤트이므로 Windows·iPad 실제 한글 입력기로는 아직 확인 못 함.**

**남은 문제 / 다음 단계에 넘기는 메모**
- **한글 IME 실기 확인이 안 됨** — 이 세션의 브라우저 도구로는 실제 조합 입력을 낼 수 없었음. 다음에 직접 Windows 에서 `file://` 로 열어 조합 중 커서가 안 튀는지, iPad Safari 에서도 가능하면 확인 필요. 문제가 있으면 `#search{color:transparent}` 특유의 조합선(underline) 렌더링 문제일 가능성이 높음.
- `.sd-hrow`(문법 도움 예시 줄)는 `[data-row]` 키보드 목록에 넣지 않음 — 시안 5절 키보드 표가 도움 패널 안 이동을 규정하지 않아 마우스 전용으로 남김. 필요하면 나중에 추가.
- `#qhelp` 는 유휴 상태에서도 항상 보이게 했음(시안은 이 단추의 유휴 시 표시 여부를 명시하지 않음) — `#skbd` 처럼 숨기지 않기로 판단(문법 도움 발견성이 떨어질 것을 우려).
- 거울 층은 `line-height:30px` 로 input 과 맞췄지만 브라우저마다 `<input>` 내부 텍스트의 수직 정렬 알고리즘이 100% 동일하지 않아 폰트·배율에 따라 1px 안팎으로 어긋날 수 있음(맨눈으로는 안 보임). 문제가 보고되면 `line-height` 미세 조정.
- 4단계(딥링크)에서 `S.hlQ`/하이라이트 층을 새로 만들 때 `parseQuery().tokens` 를 또 쓰므로 거울 층의 토큰 분류 함수(`qmFieldSplit`/`qmSuffixSplit`)를 재사용할 수 있는지 살펴볼 것.

---- 원래 계획 ----

1. **단축키**: 전역 `keydown`(9276줄 근처)에 `Ctrl/⌘+K` 와 `/`(`isTyping` 아닐 때) → `$("#search").focus(); select()`. `#skbd` 는 `navigator.platform` 이 Mac 이면 `⌘K` 아니면 `Ctrl K`. `#searchwrap.focus` 또는 `has-text` 면 숨김.
2. **드롭다운 안 이동**: `#search` 의 `keydown` 에서 1-5 표대로. 줄 목록은 `renderSdrop()` 이 만든 `[data-row]` 요소 순서(제목 줄·적중 줄·더 보기 줄 포함). `S.srch.cur` 로 `.sel` 표시, `scrollIntoView({block:"nearest"})`. Zero-state 에서는 최근 검색어·최근 문서 줄이 목록.
3. **거울 층** `#qmirror`: `#searchwrap` 안 `#search` 바로 앞에 `<div id="qmirror" aria-hidden>`. `#search{color:transparent;caret-color:var(--ink)}` + 거울은 같은 위치·폭·글꼴·`white-space:pre`·`overflow:hidden`, `scrollLeft` 를 input 과 맞춤(`input`/`scroll` 이벤트). `parseQuery().tokens` 로 조각별 `<span class="qk-tag|qk-field|qk-neg|qk-phrase|qk-op|qk-suf">`. 색만: tag → `--accent-ink` + 배경 `--accent-soft`(`#` 는 `--muted2`), field 접두사 → `--muted2`, neg → `--muted2` + 취소선 + 배경 `--panel2`, phrase → 배경 `--panel2`, 끝 `*`/`~` → `--accent`, `+`/`/` → `--muted2`. placeholder 는 input 것 그대로(거울은 빈 값이면 비움).
   - **IME 확인 필수**: 한글 조합 중 커서 위치가 어긋나지 않는지 Windows·iPad 둘 다.
4. **문법 도움 패널** `.sd-help`: 바닥 줄 `문법 도움 ?` 와 input 오른쪽 `?` 단추(`#qhelp`, 22×22, 2px `--line`; 켜지면 `--accent` 테두리 + `--accent-soft`) 로 토글, `S.srch.help`. 8줄 표(시안 D 그대로, `*` 설명은 1-1-2 문구). 예시 줄을 누르면 검색창에 그 예시가 들어감.

검증: 마우스 없이 `/` → 글자 → ↓↓ → Enter 로 자료가 열리는지. Tab 이 브라우저 포커스를 빼앗지 않는지. 거울 층 스크린샷(시안 D 와 비교).

### [4단계] 딥링크 — 하이라이트 층 + 결과 이동 막대 — 난이도 상 · Opus 5 · 노력 높음 — **[완료] 2026-09-18 · 커밋 `6bc47be`**

**실제로 한 것** (아래 계획 1~4 모두 구현. 코드는 새 절 "8-4) 딥링크" — `#sdrop` 클릭 핸들러 바로 뒤, "8-3) 자료 내 검색" 바로 앞)
- **HTML**: `#canvaswrap` 안 `<div id="hl-layer" aria-hidden>` 을 `#pdfcanvas` 와 `#drawlayer-hi` 사이에. `#hitbar` 는 `#viewbar` 닫힌 직후·`#dfpop` 앞(`.hic` 🔍 · `.hq#hit-q` · `.hpos#hit-pos` · `.hmeta#hit-meta` · `.hbtns` = `#hit-prev` `#hit-next.l0` `#hit-x.bare`, Lucide chevron).
- **CSS**: `#hl-layer{position:absolute;z-index:1;pointer-events:none;mix-blend-mode:multiply;overflow:hidden}` `.hl{background:#ffc4b8}` `.hl.cur{box-shadow:inset 0 -2px var(--accent)}`. `#hitbar` 는 시안 `.nstrip` 치수 그대로(높이 28 · gap 10 · padding 0 12 · `--panel2` · 아래 1px `--hairline`), `body.full #hitbar` 는 `#docfind` 처럼 `#2d2b2b`/`#605d5d`/`#9b9797`. **`#hitbar:not([hidden]) ~ #dfpop{top:72px}`** — 막대가 있을 때 자료 내 검색 팝업이 막대를 덮지 않게(계획에 없던 것, 검증 중 발견).
- **상태**: `S.nav = null | { q:Q, list:[{id,p}], i }`, `S.hlQ = null | Q`. `openHit({id,p})` 가 `S.srch.R.q` 로 둘 다 세팅하고 `closeDfPop()`. 회의록 줄(`note:true`)은 `S.hlQ` 만 세팅(막대 없음, 계획 1-1-6). Zero-state 최근 문서(`openHit({id})`)는 둘 다 건드리지 않음.
- **`navBuild(Q,id,p)`** — 계획은 "`R.docs` 순서"였지만 **드롭다운에 보이는 순서(`sdDocsFor(R)` = 정렬·레일 필터 반영)** 로 펼치고, 방금 연 (id,p) 가 거기 없을 때만(예: 레일이 '파일명' 그룹인데 제목 줄을 눌러 첫 적중 쪽을 연 때) `R.docs` 전체로 되돌림. 사용자가 보고 클릭한 목록과 ◀▶ 순서가 같아야 자연스럽다는 판단.
- **`navSync()`** — `renderHitbar()` 마다 지금 (S.sel, S.page) 가 목록에 있으면 `i` 를 그 자리로, 다른 자료를 보고 있으면 `i=-1`(`– / N`). 그래서 계획의 "`selectDoc()` 안에서 `S.nav.i=-1`" 은 따로 두지 않고 `selectDoc()` 첫머리와 `updateBars()`(= `renderPage()` finally·`closeDoc()`) 에서 `renderHitbar()` 만 부름. 같은 자료 안에서 쪽만 넘기면 `i` 는 마지막 위치를 유지(계획 그대로).
- **`stepNav(dir)`** — `i>=0` 이면 `i±1`, 끝에서 멈춤(단추 `disabled`). **`i=-1` 이면 지금 자료의 다음/이전 적중 쪽부터, 없으면 목록 처음/끝**(계획에 없던 규칙 — `– / N` 상태에서 ▶ 를 눌렀을 때 어디로 갈지 정해야 했음). 다른 자료면 `await selectDoc(id)` 뒤 `goPage(p)`. 넘어가는 사이 막대가 닫혔으면(`S.nav !== nav`) 중단.
- **`paintHl(page, vp, seq)`** — `renderPage()` 의 `await S.renderTask.promise` 뒤 `seq === S.renderSeq && S.hlQ` 일 때. `getTextContent()` 결과는 `HLC`(마지막 한 쪽) 에 캐시해 확대·축소 때 다시 뽑지 않음. 조각 `str` 을 공백으로 이어 붙여 시작 오프셋 표를 만들고 `hitSpans(sqz(joined), Q, f => f==="any")` 로 span → 조각 + 글자 범위로 되돌림(한 span 이 여러 조각에 걸치면 조각마다 하나씩). 사각형은 `pdfjsLib.Util.transform(vp.transform, it.transform)` 으로 기준선 좌표를 얻고 **높이 = `hypot(tx[2],tx[3])`(글꼴 크기), 기준선 위 0.8h·아래 0.2h**, 폭 = `it.width*vp.scale` 을 글자 수 비례로 나눔. 회전 조각(각도 ≥ 0.01rad)은 4모서리 바운딩 박스로 통째로. `.cur` 는 `S.nav.list` 에 (S.sel,S.page) 가 있을 때 첫 span. 글자 없는 쪽은 span 0 → 층 비움(오류 없음).
- **`renderPage()`** 는 canvas 크기를 정한 직후 `#hl-layer` 의 `style.width/height` 를 같은 값으로 맞추고 `innerHTML=""`(옛 쪽 하이라이트가 새 쪽 위에 잠깐 남지 않게). `loadPdfFor()` 첫머리에서 `hlClear()`. `drawSync()` 는 건드리지 않음(계획은 거기서도 맞추라 했지만 canvas 크기는 `renderPage()` 만 바꾸므로 불필요).
- **키보드**: `#search` `keydown` 맨 앞에 "드롭다운 닫힘 + `S.nav` + Enter → `stepNav(±1)`" 분기. `#hitbar` 자체 `keydown` 에서 Enter/Shift+Enter(단추의 Enter-클릭은 `preventDefault` 로 막아 두 번 안 움직임). 전역 Esc 사슬은 **`full` 해제 다음**에 `else if(S.nav) closeNav();` — 전체화면에서는 Esc 가 먼저 전체화면을 닫아야 하므로(단추 title 이 "Esc to exit"), 계획의 "드롭다운 닫혀 있으면 막대 닫기"보다 한 단계 뒤로 둠. 막대 ✕ = `closeNav()` = `S.nav=S.hlQ=null; renderHitbar(); hlClear()`.
- **회의록 적중 `noteReveal(Q)`**: note 탭을 그린 뒤 `#sumB` 의 `textContent` 에서 `hitSpans` 로 첫 자리를 찾아 TreeWalker 로 텍스트 노드·오프셋을 되짚어 `Range` 를 만들고, 잠겨 있을 때(`!S.editB`) 만 선택(selection) 으로 보이게 한 뒤 스크롤되는 상자(`overflow-y:auto` 인 가장 가까운 조상 = `#sumB` 자신) 가운데로 굴림. `<b>`/`<u>` 안 글자도 잡힘.

**검증** — Claude in Chrome 확장은 이번에도 연결되지 않았고 내장 Browser pane 은 `file://` 을 못 열어서 (a) 로컬 정적 서버(`static`) + **JS 로 만든 가짜 PDF 두 개**(Helvetica · 3쪽/4쪽 · 회전 45° 조각 포함) 를 `dbPutQuiet("files", {id, blob})` 로 IndexedDB 에 넣고 `DOCS.length=0; DOCS.push(...)` 로 자료를 밀어 넣어 화면에서 확인, (b) headless Chrome(`file://`, 빈 프로필)으로 `#hitbar`·`#hl-layer` 가 DOM 에 있고 JS 오류가 없는지 확인. 테스트 뒤 `files` 의 가짜 레코드는 지움.
- 적중 줄(`fakeA` 2p) 클릭 → 드롭다운 닫힘 · 2쪽 열림 · 하이라이트 5개(제목 "Compliance" `.cur` 밑선, 본문 2곳, 회전 조각 바운딩 박스, 30pt "COMPLIANCE") 모두 글자 위에 정확히 얹힘(스크린샷 확인, 160% 확대 뒤에도 그대로). 막대 `‘compliance’ 1 / 4 · 임원회의 · 2026 · 08 · W3 · 2p`.
- ▶ ×4: 2/4(같은 자료 3p) → 3/4(**다른 자료** `fakeB` 2p, 왼쪽 목록 `.doc.sel` 이 따라옴) → 4/4(4p, ▶ `disabled`). ◀ ×2 로 되돌아와 `fakeA` 3p(2/4, 하이라이트 2·`.cur` 1). 넘어가는 도중 빠르게 다시 눌러도 `navSync` 덕에 끝 상태가 일관됨.
- 왼쪽 목록에서 다른 자료 클릭 → `– / 4`; 그 상태에서 검색창 Enter(드롭다운 닫힘) → 그 자료의 다음 적중 쪽으로. 막대 단추에 포커스 두고 Enter/Shift+Enter → ±1. Esc: 드롭다운 열려 있으면 드롭다운만, 다 닫혀 있으면 막대 닫힘(`S.nav`·`S.hlQ` null, 층 비움).
- 전체화면(`body.full`)에서 막대가 어두운 색으로 그려짐(스크린샷). `#dfpop` 은 막대 있을 때 `top:72px`, 없을 때 `44px`. `#hl-layer` `pointer-events:none`·`z-index:1`(펜 판 `#drawlayer` z-index 2 아래) 확인.
- 글자 없는 쪽: `items:[]` 인 가짜 page 로 `paintHl` 호출 → 오류 없이 층 비움.
- 회의록: `KV.sums.fakeA.b` 에 40줄(32줄에 `<b>compliance</b>`)을 넣고 회의록 줄 클릭 → note 탭 · 선택 문자열 `"compliance"` · `#sumB.scrollTop` 321/814(가운데) 확인.

**남은 문제 / 다음 단계에 넘기는 메모**
- ~~검색의 '회의록'과 오른쪽 회의록 탭이 다른 데이터를 본다~~ → **고침 (2026-09-18, 후속 커밋)**: 새 함수 `noteTextOf(d)`(`noteOf` 바로 아래) 가 검색의 회의록 글자를 **NOTE 탭에 적은 `KV.sums[d.id].b`**(`normalizeSumHtml`→`stripHtml` 로 `<b>`/`<u>` 태그를 뺀 순수 글자)로 정하고, 거기 아무것도 없을 때만 옛 `NOTES` 스토어를 대신 봄. `runSearch`(걸러내기·세기·span)와 드롭다운 스니펫(`sdDocHtml` 의 `hay`)이 모두 이 함수를 씀 → 화면 `#sumB.textContent` 와 같은 글자라 `noteReveal` 이 곧장 그 자리로 감(태그로 쪼개진 `컴플라<b>이언스</b>` 도 잡힘 — 확인). 회의록을 고친 뒤 같은 검색어로 다시 열어도 새로 세도록 `openSdrop()` 이 `sdRecompute()` 를 부름. `NOTES` 는 그대로 두었음(삭제는 5단계 정리 몫이 아니라 별도 결정).
- 하이라이트 세로 위치는 글꼴 어센트를 0.8h 로 고정 근사 — 어센트가 큰 한글 글꼴(예: 맑은 고딕)에서는 위쪽이 1~2px 짧아 보일 수 있음. 실제 한글 PDF(파워포인트 변환본)로 확인하고 필요하면 0.8 → 0.85. 글자 범위도 조각 폭을 글자 수 비례로 나눈 근사라 프로포셔널 글꼴에서 ±1글자 어긋날 수 있음(계획 허용치 안).
- `HLC` 캐시는 마지막 한 쪽만 — 쪽을 왕복하면 `getTextContent()` 를 다시 부름(가벼움). 문제 되면 `SQLRU` 처럼 Map 으로.
- 막대의 `3 / 12` 는 **쪽 단위**(자료 안 적중 쪽 수의 합)이고 드롭다운 머리글의 '적중 M곳'(조각 단위)과 기준이 다름. 시안 G 도 쪽 단위라 그대로 두되, 사용자가 헷갈려 하면 막대에 `쪽` 글자를 붙일 것.
- 좁은 화면(≤860px)의 `#hitbar` 하단 고정 44px 배치는 5단계 3항에 그대로 남아 있음. `.hq`·`.hmeta` 에 `min-width:0;text-overflow:ellipsis` 를 넣어 두어 좁아도 단추가 밀려 나가지는 않음.
- 실기(Windows `file://`·iPad) 로는 여전히 확인 못 함 — 특히 iPad 에서 `mix-blend-mode:multiply` 층이 있는 채로 확대·펜 그리기 성능.

---- 원래 계획 ----

1. **HTML**: `#canvaswrap` 안 `<div id="hl-layer" aria-hidden="true"></div>` (canvas 들 뒤, `drawlayer` 앞). `#viewbar` 닫힌 직후 `<div id="hitbar" hidden>` (머리글 부품: `.hq` `.hpos` `.hmeta` `.hbtns` ◀ ▶ ✕ — Lucide chevron, 시안 `.nstrip` 치수).
2. **CSS**: `#hl-layer{position:absolute;left:0;top:0;pointer-events:none;mix-blend-mode:multiply}` `#hl-layer .hl{position:absolute;background:#ffc4b8}` `.hl.cur{box-shadow:inset 0 -2px var(--accent)}` ; `#hitbar` 시안 `.nstrip` 그대로 + `body.full #hitbar` 어두운 색.
3. **JS**:
   - `S.nav = null | { q:Q, list:[{id,p}], i }`, `S.hlQ = null | Q` (하이라이트 할 조각).
   - `openHit()` 이 본문 적중이면 `S.nav` 를 `R.docs` 순서의 평평한 쪽 목록으로 만들고 `i` 를 그 쪽으로. `S.hlQ = Q`. `renderHitbar()`.
   - `paintHl(page, vp)` — 1-6 절차. `renderPage()` 의 `await S.renderTask.promise` 뒤, `seq === S.renderSeq` 확인하고 호출. `S.hlQ` 없으면 층 비움. `drawSync()` 가 canvas 크기를 바꿀 때 `#hl-layer` 도 `cv.style.width/height` 로 맞춤.
   - 글자 범위 → 사각형: item 마다 `[x, y, w, h]` (`Util.transform` 으로 좌표, `h = item.height*scale`, `w = item.width*scale`), 글자 범위 `[c0,c1)` 는 `x + w*c0/len` ~ `x + w*c1/len`. 세로쓰기·회전 item 은 통째로 칠함.
   - `현재 항목`: `S.nav.list[i]` 의 쪽에서 첫 span 을 `.cur`.
   - `stepNav(dir)` — 다른 자료면 `await selectDoc(id)` 뒤 `goPage(p)`; 같은 자료면 `goPage(p)`. `renderHitbar()`.
   - 막대 ✕ → `S.nav = S.hlQ = null; renderHitbar(); renderPage()` (층 지움).
   - `selectDoc()` 안 `clearDocFind()` 옆에서: 사용자가 왼쪽 목록으로 다른 자료를 고르면 `S.nav.i = -1`(`– / 12`), `S.hlQ` 는 유지(같은 검색어 하이라이트는 계속).
   - Esc 사슬: 드롭다운이 닫혀 있고 `S.nav` 가 있으면 막대 닫기. 막대·검색창에서 `Enter`/`Shift Enter` 는 드롭다운이 닫혀 있을 때만 `stepNav`.
   - `#docfind` 와의 관계: 막대를 열 때 `closeDfPop()`. `docfind` 는 자기 하이라이트가 없으므로 충돌 없음.
4. 회의록 적중 → 오른쪽 `note` 탭 열고, 회의록 글상자 안에서 첫 일치 위치로 스크롤(`sum.fill` 텍스트영역이면 `setSelectionRange` 로 커서만 옮김 — 2126줄 근처 선택 부품 참고).

검증: 시안 G 대로 — 적중 줄 클릭 → 12쪽 열림 + 하이라이트 + 막대 `3 / 12`. ▶ 를 끝까지 눌러 **다른 자료로 넘어가고 왼쪽 목록 선택이 따라오는지**. 확대/축소·폭 맞춤·쪽 넘김 뒤 하이라이트가 글자 위에 그대로 있는지(어긋남 ±글자 1개 이내면 통과). 그리기 층 위에서 펜이 여전히 되는지. 스캔 PDF(글자 없음)에서 오류 없는지.

### [5단계] 마무리 — 난이도 하~중 · Sonnet 5 · 노력 중간

1. **최근 검색어·열람**: `KV_DEFAULT` 에 `recentQ:[]`, `recentDocs:[]` (기기별, `SYNC_KV_KEYS` 에 **넣지 않음**). `openHit()`·Enter 때 `recentQ` 앞에 넣고 중복 제거·10개 유지; `selectDoc()` 에서 `recentDocs` 같은 방식. Zero-state 줄 ✕ → 하나 삭제, `모두 지우기`. 지워진 자료 id 는 그릴 때 걸러냄.
2. **커맨드바 교집합 표시**: `renderCats()` 뒤 드롭다운이 열려 있으면 `renderSdrop()` 다시(칩 토글 3900줄 핸들러 끝에 한 줄). 머리글 필터 칩 = 1-1-3.
3. **좁은 화면** (`@media (max-width:860px)`): `#sdrop{left:0!important;width:100vw!important;top:56px;bottom:0;max-height:none}`; 레일을 접고 `.sd-col` 위에 가로 스크롤 그룹 칩 줄(`전체 14 · 📄 2 · 📝 9 · 🗒 3`)만; 회의 종류·기간 숨김; 메타 축약 `임원회의 · 08 W3 · 12p`; 스니펫 `-webkit-line-clamp:2`; `#hitbar` 는 `position:fixed;bottom:0;height:44px;background:var(--ink);color:var(--bg)`; 검색 포커스 때 `#topright` 숨겨 input 이 가득 차게(`#searchwrap.focus ~ #topright{display:none}`). iPad 세로(820)·폰(390) 에서 확인.
4. **설명서** `TUT` 3절: 표 3행 문구를 "자료 이름 + PDF 본문 + 회의록 — 그룹별로, 몇 쪽에서 걸렸는지"로, 단계 2 를 드롭다운·키보드 설명으로, `알아두기` 에 문법 8줄(문법 도움 패널과 같은 표) 추가. `Ctrl K` · `/` 단축키 문구.
5. **정리**: `searchDocs`/`snippetOf` 호환 함수, `openPop/closePop/renderPop`, `#popcount` 참조 전부 삭제(다른 `closePop` 은 그리기 도구·힌트 팝업의 지역 함수이므로 건드리지 않음 — 4914·7291줄). `sqzPages` 캐시 이름 정리. `DESIGN-BRIEF-SEARCH.md` 는 남겨 둠.
6. **성능 확인**: 자료 200건 가정 — 첫 글자 입력 뒤 드롭다운까지 100ms 안쪽(`performance.now`). 넘으면 `_pgQ` 생성을 `requestIdleCallback` 로 미리 해 둠(`loadAll` 뒤).

검증: 새 기기(빈 IndexedDB)에서 Zero-state 가 힌트만 보이는지. 동기화가 켜진 기기에서 `recentQ` 가 올라가지 않는지(`sync` 인덱스에 `kv/recentQ.enc` 가 없어야 함). 설명서 검색(`tutsearch`)에서 "문법" 이 걸리는지.

---

## 3. 시안 파일 ↔ 구현 대응표

| 시안(5a-search-static.html) | 앱 요소 | 단계 |
| --- | --- | --- |
| `.scell.focus` `.kbd` `.qbtn` | `#searchwrap.focus` `#skbd` `#qhelp` | 2·3 |
| `.tk.tag/.ex2/.neg/b` | `#qmirror .qk-*` (색·배경만) | 3 |
| `.drop` `.dhead` `.hc` `.fchip` `.sort` `.dx` | `#sdrop` `.sd-head` `.sd-cnt` `.sd-fchip` `.sd-sort` `.sd-x` | 2·5 |
| `.rail` `.rlbl` `.rg` `.rbars .rbar` `.seg3` | `.sd-rail` `.sd-rlbl` `.sd-rg` `.sd-bar` `.sd-seg` | 2 |
| `.dblock(.sel)` `.dtitle .t .tag` `.dmeta .src b` `.hit .hp .hs` `.dmore` `.dmore2` `.dfoot .hlp` | `.sd-doc(.sel)` `.sd-title` `.sd-meta` `.sd-hit .sd-p .sd-s` `.sd-more` `.sd-more2` `.sd-foot .sd-help-btn` | 2 |
| `.zsec .zhead .clr .zrow .zdoc .zhint` | `.sd-z*` | 2·5 |
| `.empty .et .sugg .en` | `.sd-empty .sd-sugg` | 2 |
| `.help .hhead .hrow .sym .mean .ex` | `.sd-help` | 3 |
| `.nstrip .pos .nmeta .nbtns` / `mark.cur` | `#hitbar` / `#hl-layer .hl.cur` | 4 |

---

## 4. 새 창에서 단계 시작할 때 붙여 넣을 말

```
PLAN-SEARCH.md 의 0절 · 1절과 [N단계]를 읽고, 무엇을 할지 요약해 보여 준 뒤 내 승인을 받고 그 단계만 작업해라.
whats-the-strategy.html 은 awk 'length($0)<400' 으로 거른 사본으로 읽어라.
시안은 design_handoff_strategy_viewer/5a-search-static.html 과 5a-search-README.md 다.
끝나면 file:// 로 열어 검증하고, PLAN-SEARCH.md 의 진행 현황 표와 그 단계에 [완료] · 커밋 · 고친 내용 · 남은 문제를 적어
다음 새 창이 이어받을 수 있게 갱신한 뒤 커밋해라. 다음 단계는 시작하지 마라.
```

모델 고르기: 1·4단계는 Opus 5 (노력 높음), 2단계는 Sonnet 5 (노력 높음), 3·5단계는 Sonnet 5 (노력 중간). 데스크톱 앱의 모델 선택에서 바꾼 뒤 새 창을 엽니다.

---

## 5. 작업 기록

(각 단계 완료 시 여기에 날짜 · 커밋 · 실제로 달라진 점 · 남은 문제를 적습니다)

- **2026-09-17 · 1단계 · `723f26f`** — 검색 엔진 함수만 추가(화면 변화 없음). `parseQuery` `bitap` `cutSpans` `termHits/termSpans/hitSpans` `pgQ` `sqzPages`(LRU 24) `runSearch` `editDist` `suggestFix`. 옛 모달은 `searchDocs`/`snippetOf` 호환 함수로 그대로 동작. 검증은 headless Chrome + 가짜 자료로만 했고 실제 자료 검증은 2단계 시작 때 콘솔에서 한 번 찍어 볼 것. 자세한 내용은 [1단계] 절.
- **2026-09-17 · 2단계 · `156daa2`** — 검색 모달(`#searchpop`) → 결과 드롭다운(`#sdrop`)으로 교체. 머리글·집계 레일·자료 블록·Zero-state·결과 없음·커맨드바 교집합 필터칩 모두 구현, 옛 모달·호환 함수(`searchDocs`/`snippetOf`/`openPop`/`closePop`/`renderPop`) 삭제. `type=search` 의 Esc-지우기 기본 동작 차단, 포커스 유지 중 재클릭 시 안 열리던 버그 수정(계획에 없었지만 검증 중 발견). 키보드 이동·문법 도움 패널·최근 검색어/열람 저장은 아직 없음(3·5단계). 자세한 내용·남은 문제는 [2단계] 절.
- **2026-09-18 · 4단계 · `6bc47be`** — 딥링크. `#hl-layer`(pdf.js `getTextContent` 좌표 → 화면 사각형, `.cur` 밑선, 회전 조각은 바운딩 박스) + `#hitbar`(◀ ▶ ✕ · Enter/Shift+Enter · 자료 넘나들기 · 왼쪽 목록으로 다른 자료 고르면 `– / N` · `body.full` 어두운 색). `S.nav`/`S.hlQ`, `navBuild`(드롭다운 보이는 순서 기준)·`navSync`·`stepNav`·`renderHitbar`·`closeNav`·`paintHl`·`noteReveal`. Esc 사슬은 전체화면 해제 다음에 막대 닫기. **발견한 문제**: 검색의 '회의록'(`NOTES` 옛 스토어)과 note 탭(`KV.sums[id].b`)이 다른 데이터 → 같은 날 후속 커밋에서 `noteTextOf(d)` 로 검색 대상을 NOTE 탭 글자(없으면 `NOTES`)로 바꿔 고침. 자세한 내용·남은 문제는 [4단계] 절.
- **2026-09-17 · 3단계 · `b288c21`** — `Ctrl/⌘K`·`/` 단축키, 드롭다운 안 `↑↓`/`Tab`/`Enter`/`←→` 줄 이동(`Enter` 는 선택 줄을 `.click()` 으로 재사용), 입력칸 거울 층(`#qmirror`, `#search` 를 `#sfield` 로 감싸 절대배치)로 연산자 색 표시, 문법 도움 패널(`#qhelp`·`.sd-help`, 8줄 표) 추가. `#sdrop` 내부 구조를 `.sd-body`(`.sd-main`+`.sd-help`)로 한 겹 더 감쌈. 한글 IME 는 합성 이벤트로만 확인했고 실기(Windows·iPad) 확인은 아직 못 함. 자세한 내용·남은 문제는 [3단계] 절.
