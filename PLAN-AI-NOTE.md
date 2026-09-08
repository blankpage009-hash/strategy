# AI Note 고도화 — 작업계획 (인수인계 문서)

작성 2026-09-07. 이 문서 하나만 읽으면 새 창에서 바로 작업을 시작할 수 있습니다.

---

## 0. 이 앱에 대해 꼭 먼저 알 것

- 앱 본체는 **`whats-the-strategy.html` 단일 파일**(약 567KB, HTML+CSS+JS 한 덩어리)입니다. 여기만 고칩니다.
- **반드시 `file://` 로 열어서 확인합니다.** localhost 로 열면 IndexedDB 출처가 달라 자료가 하나도 안 보입니다.
- 주석은 **한국어 · 존댓말 · 비개발자도 읽히는 말투**로 씁니다 (기존 파일 전체가 그 문체입니다). 그 결을 따르세요.
- 디자인 토큰은 이미 `:root` 에 있습니다 (`--accent:#ec3013`, `--rule:#201e1d`, `--panel2:#eae9e9`, `--hairline`, `--accent-soft:#ffe0d9` …). **라운드(border-radius)는 어디에도 쓰지 않습니다.**
- 디자인 원본: `What's the Strategy_ Dashboard/design_handoff_strategy_viewer/`
  - `README.md` 329행 이하 "Addendum — AI Note (concept 4a)" 에 모달 규격이 전부 명세돼 있습니다.
  - `4a-ai-note-static.html` 이 그 정적 시안입니다.

## 0-1. 현재 코드에서 이미 확인된 사실 (다시 조사하지 말 것)

| 항목 | 위치 · 내용 |
|---|---|
| 지금의 `AI Note` 버튼 | `atBar()` (약 2324행) — Upload(PDF 첨부) · AI Note(**첨부 PDF를 팝업으로 보기**). AI 생성 기능이 아닙니다. 이 기능은 **그대로 유지**합니다. |
| 제미나이 호출부 | `callAI(prompt, opts)` (약 4368행). 키·타임아웃·이미지 전송·오류 한글화(`aiErrMsg`)까지 이미 완성돼 있습니다. |
| 모델 목록 조회 | `listModels()` (약 4470행) — 내 키로 실제 쓸 수 있는 모델만 돌려줍니다. `renderModelList(names)` 가 `#modellist` 에 그립니다. |
| 자동요약 스위치 | `AI_SUMMARY_ENABLED = false` (약 4355행). 제미나이 **자동요약은 폐지**된 기능이고 설정 UI도 `display:none` 입니다. 되살리지 마세요. |
| 옛 AI 설정 블록 | 약 1345~1380행, `style="display:none"` 인 `.mrow`. `#set-ai #set-key #set-model #modellist #aitest #airow` 와 그 핸들러(5287~5352행), `syncAiRow()` 가 여기에 묶여 있습니다. **건드리지 말고 그대로 두세요.** |
| 회의록 원문 | NOTE 탭 텍스트 = `KV.sums[docId].b`, textarea `#sumB`. `renderRight()` 안 `paneNote` (약 2444행). **AI Note 생성의 입력원입니다.** |
| 회의 Agenda | `KV.agendas[noteKey(cat,date)]` — 보조 입력으로 함께 보낼 수 있습니다. |
| `NOTES` 전역 | 옛 데이터·백업 호환용 껍데기입니다. 화면 입력은 없습니다. 새 기능에 쓰지 마세요. |
| 저장소 | IndexedDB `strategy-library` **v3** (1546행). 스토어: docs / files / notes / kv / attach / attachfile / draw |
| 백업 | `exportBackup(withPdf)` (약 5483행). `kv` 로 `cats, tasks, sums, scripts, storeMode, agendas, catMap` 만 담습니다 — **`aiKey` 는 들어가지 않습니다(확인 완료).** |
| 설정 열기 | `$("#btn-settings").onclick` (5204행) → `#modalbg` 에 `.on`. 시작 시 `syncAiRow()` 는 5621 · 5744행에서 부릅니다. |
| 쓸 수 있는 CSS 클래스 | `.mrow .lbl .lbl2 .hint .subbox .btnrow` · `#aitest`(ok/bad 색) · `#modellist`(칩 버튼) — 912~923행 |

## 0-2. 확정된 결정사항

1. **`AI NOTE 생성` 트리거는 NOTE 탭에 둔다.** (디자인 원안은 Summary 탭이지만, 입력원인 회의록 텍스트 바로 위가 자연스러움)
2. **EXPORT 는 인쇄 → PDF 저장.** 전용 `@media print` 스타일시트로 흰 시트만 출력. 외부 라이브러리 금지(file:// 환경).
3. 기존 Upload / AI Note(첨부 보기) 버튼은 **유지**한다.
4. 제미나이 모델은 `gemini-3.8-flash` 를 맨 위로 두고 아래로 순차 폴백. **최종 사용 모델을 회의록 상단에 작게 표시.**
5. API 키는 **사용자가 브라우저 설정에 직접 입력**한다. 다른 사람에게 파일을 줘도 각자 자기 키를 넣어야 동작.

---

## 1. 전체 단계 (9단계)

| # | 단계 | 난이도 | 추천 모델 / 노력 |
|---|---|---|---|
| 1 | 설정 — 제미나이 API 키 입력 UI 신설 | 하 | Sonnet 5 / 중간 |
| 2 | 모델 폴백 사다리 (3.8-flash → 하위) | 중 | Sonnet 5 / 높음 |
| 3 | 프롬프트 + 회의록 JSON 스키마 | 중 | Sonnet 5 / 높음 |
| 4 | NOTE 탭 생성 트리거 블록 · 생성 상태 | 하~중 | Sonnet 5 / 중간 |
| 5 | 회의록 모달 UI 이식 (4a 디자인 전체) | 상 | Opus 5 / 높음 |
| 6 | 저장(IDB `ainote`, DB_VER 3→4) · 백업 포함 | 중 | Sonnet 5 / 높음 |
| 7 | Edit 모드 (인라인 편집 · 행 추가/삭제) | 상 | Opus 5 / 높음 |
| 8 | COPY / EXPORT(인쇄) / REGENERATE / TASKS로 보내기 | 중 | Sonnet 5 / 높음 |
| 9 | `file://` 통합 점검 · 커밋 | 하 | Sonnet 5 / 중간 |

**각 단계는 사용자 승인을 받고 하나씩 실행합니다. 여러 단계를 몰아서 하지 마세요.**

---

## 1-1. 진행 현황 (2026-09-07)

| 단계 | 상태 | 커밋 | 남긴 것 |
|---|---|---|---|
| 1 | ✅ 완료 | `bfacbcc` | 설정 모달에 `AI NOTE (제미나이)` 새 `.mrow` (`#an-key #an-model #an-modellist #an-test #an-models #an-clear #an-test-out`). 핸들러·`syncAiNoteRow()`·`aiNoteReady()` 추가. `KV_DEFAULT.aiModel` = `gemini-3.8-flash`. 옛 `#set-ai` 블록은 그대로 숨김 유지. `renderModelList(names, box)` · `showModels(quiet, btn, box, outBox)` 로 일반화(기본값 = 옛 요소라 옛 호출부 안 깨짐). |
| 2 | ✅ 완료 | `d9c63b0` | `callAI` 에 `opts.model` 추가(KV 안 건드림). `callAINote(prompt, opts)` — 우선 모델 → 404·429·5xx·타임아웃이면 `listModels()` 로 flash 계열 최신순 폴백(`aiNoteLadder()`), 400·401·403 은 즉시 중단. 최대 4회. `{text, model}` 반환 + `aiNoteLastModel` 기록. |
| 3 | ✅ 완료 | `c4484bd` | `11-3) AI NOTE` 구획 신설. `AN_LIM` · `anClip` · `AN_SHAPE`(틀) · `aiNotePrompt(doc, noteText, agenda)` · `aiNoteParse(text)`. 입력원 = NOTE 탭 회의록 원문(+Agenda 참고), PDF 안 읽음. 출력 = `{ver,cut,doc:{title,meta:{date,place,attendees,author}}, summary:[{text,bold}], qa:[{team,items:[{kind:"Q"|"A"|"지시",text}]}], actions:[{no,text,owner,due,urgent}], keywords:[]}`. 파서는 잘린 답 복구·틀 위반 방어·지시 뒤로 정렬 처리. **아직 아무도 안 부름.** |
| 4 | ✅ 완료 | `23c5903` | NOTE 탭 회의록 입력창 **위**에 `.annote` 트리거 블록(`aiNoteBlock(d)`, `paneNote` 안). 상태: 없음 / 생성 중(`생성 중…`, disabled) / 완료(`AI NOTE 보기`, `data-annote="open"`) / 실패(빨간 줄 + `다시 시도`). `#rbody` 클릭 위임에 `data-annote` 분기(`gen`→`makeAiNote`, `open`→**아직 no-op**). `makeAiNote(docId)` — 회의록 원문+Agenda → `callAINote({json:true})`(400이면 json 없이 재시도) → `aiNoteParse` → `S.anNote = {id,note,at,model}` (**메모리만, 새로고침하면 사라짐**). 상태필드 `S.anBusy/anErr/anErrId/anNote` 신설. `selectDoc`·자료삭제 시 정리. CSS `.annote*` (약 733행). |
| 5 | ✅ 완료 | `6760ebe` | `#ainotebg` 모달 신설(`.antitle/.antag/.anfn/.anmt` 머리칸 · `.anrail` 왼쪽 레일 · `.anstage` 무대 위 `.ansheet` 흰 시트). `renderAiNote()` 가 `S.anNote.note` 를 통째로 다시 그림 — 01 Executive Summary(bold 구절에 형광 밑줄) · 02 주요 Q&A(Q/A/지시 태그 3종) · 03 지시사항(4열 표, `urgent` 는 `--accent-ink` 800). 빈 섹션은 "해당 항목 없음". 레일 = Contents(누르면 그 섹션으로 스크롤) · Keywords 칩 · Follow-up 건수. `openAiNote(docId)`(포커스 X로) · `closeAiNote()`(포커스 `.annote .gen` 로). Esc 사슬 맨 앞 · 배경 클릭 · `data-annote="open"` 위임 연결. COPY·EXPORT·REGENERATE·TASKS로 보내기는 **`disabled` 자리만**. 좁은 화면(≤900px)은 레일 접힘·Q&A 세로 쌓기, ≤640px 은 머리칸 버튼 접힘·섹션 선 아랫줄·지시사항 표 너비 해제. |
| 6 | ✅ 완료 | (이번) | `DB_VER` 3→**4**, `openDB()` 에 `ainote` 스토어(`keyPath:"id"`) 한 줄. 메모리 슬롯 `S.anNote` **폐지** → 전역 `let AINOTES = {}`(자료 id → `{id,note,at,model}`). 읽는 자리 전부 `AINOTES[d.id]` 로: `aiNoteBlock` · `openAiNote` · `renderAiNote(docId)`(인자 받게 바뀜). `makeAiNote` 는 `AINOTES[docId]=rec` + `dbPut("ainote",rec).catch()` — 저장 실패해도 화면엔 뜨고 토스트로 알림. `loadAll()` 이 `dbAll("ainote")` 를 `AINOTES` 에 담음. `removeDoc`·`#btn-wipe` 정리. `exportBackup` `meta.ainote = Object.values(AINOTES)`(JSON·PDF 백업 공통, `aiKey` 는 여전히 제외), 불러오기에서 `data.ainote` 되살림(옛 백업은 `|| []` 로 통과). 같은 자료 재생성은 경고 없이 덮어씀. |
| 7 | ✅ 완료 | (이번) | 머리칸에 `#an-edit` 신설, 그 자리에 서는 `#an-save`(`.prim`) · `#an-cancel`. 상태 `S.anOpen`(열려 있는 노트) · `S.anEdit`(고치는 중인 자료 id) · `S.anDraft`(깊은 복사본). `renderAiNote(docId)` 가 `ed` 분기로 세 섹션을 폼으로 그림 — 요약은 줄마다 `<textarea data-an="sum">`, Q&A 는 팀 `<input data-an="qteam">` + `kind` `<select data-an="qkind">`(`AN_KINDS`) + `<textarea data-an="qtext">`, 지시사항은 `.antb.edt` 표의 각 칸이 `<input>`/`<textarea>` + `긴급` 체크박스. 고치는 중엔 레일이 Contents + 분홍 안내만(Keywords·Follow-up 숨김), `#an-mt` 는 `고치는 중`. `#ainotebody` 의 `input` 위임이 사본에만 반영(재렌더 안 함 → 커서 안 튐), `[data-anadd]`/`[data-andel]` 은 `anAddRow`/`anDelRow` → `anRedraw`(스크롤 위치 지킴). `anSaveEdit()` 이 `actions[].no` 를 1..n 재부여 → `AINOTES[id].note` 교체 · `editedByUser=true` · `dbPut("ainote")` · `renderRight()`. `anCancelEdit()` 은 사본만 버림. 편집 중 배경 클릭 무시 · Esc 는 편집 취소 먼저. NOTE 탭 상태 줄에 ` · 수정함`. CSS `.anedt/.anin/.ansel/.andel/.anadd/.anck/.anact.prim` (약 1041행). ≤640px 에서 `#an-copy/#an-export/#an-regen` 만 접고 EDIT·저장·취소는 남김, `.antb.edt` 는 한 행을 세로로 쌓음. COPY/EXPORT/REGENERATE/TASKS 는 그대로 `disabled`. |
| 8 | ⏳ 다음 | — | 아래 **6. 8단계 상세** 참고 |

새 창 확인 방법: `python -m http.server 8777` (`.claude/launch.json` 에 `static` 로 등록돼 있음) → `http://localhost:8777/whats-the-strategy.html`. **주의:** localhost 로는 IndexedDB 자료가 안 보입니다 — JS 로직·설정 UI·콘솔 오류만 확인 가능. 자료까지 봐야 하면 `file://` 로 여세요. 4단계 검증 때는 콘솔에서 가짜 DOC·`KV.sums[id].b` 를 넣고 `callAINote` 를 스텁해 흐름만 확인했음.

**7단계 주의:** 6단계와 같은 이유로 미리보기에서는 `dbPut` 이 실패합니다(토스트로 "저장하지 못했습니다"). 이번에는 콘솔에서 `AINOTES` 에 가짜 노트를 넣고 EDIT → 고치기 → 추가/삭제 → 저장 → 취소 → Esc → 배경 클릭 → 좁은 화면(375px)까지 전부 확인했고, 화면·상태·번호 재부여·`editedByUser` 는 정상이었습니다. **IndexedDB 왕복(새로고침해도 남는지)만 `file://` 로 한 번 확인해 주세요.**

**6단계 주의:** 이 미리보기(localhost) 브라우저에서는 IndexedDB `open` 이 응답 없이 멈추는 환경 문제가 있어 `DB` 가 `null` 로 남습니다(빈 화면은 정상 렌더). 스토어 생성·저장·백업 왕복은 **`file://` 로 직접 열어** 확인해야 합니다. 코드상으로는 페이지 파싱·전역(`AINOTES`)·함수 정의·콘솔 오류 없음까지만 이번에 확인했습니다.

---

## 2. 지금 할 일 — 1단계 상세

### 목표
설정 화면에 **"AI NOTE (제미나이)"** 항목을 새로 만든다. 폐지된 옛 자동요약 설정과 완전히 분리한다.

### 왜 새로 만드는가
옛 블록(`#set-ai`)은 `KV.ai` 스위치·자동요약 안내문·`AI_SUMMARY_ENABLED` 판정이 얽혀 있어, 되살리면 폐지한 기능이 같이 딸려 옵니다. 그래서 **옛 블록은 숨긴 채 그대로 두고, 독립된 새 블록을 추가**합니다.

### 만들 것

1. **마크업** — 설정 모달(`#modalbg` 안 `.content`) 에서, 숨겨진 옛 AI 블록 **바로 아래**에 새 `.mrow` 추가:
   - 제목 `AI NOTE (제미나이)`
   - 안내 `hint`: 회의록을 AI가 한 장으로 정리해 줍니다. 이 기능만 인터넷을 씁니다. 키가 없으면 나머지 기능은 전부 그대로 동작합니다.
   - `.subbox` 안에:
     - `lbl2` **제미나이 API 키** + `<input type="password" id="an-key" …>`
     - `hint`: 키는 **이 기기의 브라우저 안에만** 저장됩니다. 백업 파일에도 들어가지 않으므로 폴더를 그대로 복사해 줘도 키는 따라가지 않습니다. 다른 사람이 쓰려면 각자 키를 발급받아 넣어야 합니다. 발급: **aistudio.google.com** → Get API key
     - `lbl2` **우선 모델** + `<input type="text" id="an-model" placeholder="gemini-3.8-flash">`
     - `hint`: 잘 모르면 그대로 두세요. 이 모델이 바쁘면 자동으로 아래 단계 모델로 내려가서 다시 시도합니다.
     - `<div id="an-modellist"></div>`
     - `.btnrow`: `#an-test`(연결 확인) · `#an-models`(쓸 수 있는 모델 보기) · `#an-clear`(키 지우기)
     - `<div id="an-test-out"></div>`

2. **CSS** — 912~923행의 `#aitest` / `#modellist` 규칙 선택자에 `#an-test-out` / `#an-modellist` 를 **덧붙입니다** (규칙을 복제하지 말고 선택자만 추가).

3. **JS** (5287~5352행 옛 핸들러 아래에 새 구획으로):
   - `KV_DEFAULT.aiModel` 을 `"gemini-3.5-flash"` → **`"gemini-3.8-flash"`** 로 바꾸고, 5735행의 옛 모델 승격 로직(`if(!KV.aiModel || /^gemini-2\.0|^gemini-2\.5-flash$/…)`)에 `gemini-3.5-flash` 도 승격 대상으로 넣습니다.
   - `function aiNoteReady(){ return String(KV.aiKey||"").trim().length >= 10; }` — `AI_SUMMARY_ENABLED` 와 **무관**하게 판정. (`aiReady()` 는 옛 요약용이므로 그대로 둡니다)
   - `renderModelList(names)` 를 `renderModelList(names, box)` 로 **일반화**하고, 인자가 없으면 기존처럼 `#modellist` 를 쓰도록 해 옛 호출부를 깨지 않습니다. 같은 식으로 `showModels(quiet)` 도 대상 박스를 받게 합니다.
   - 새 핸들러: `#an-key` change → `KV.aiKey` 저장 · `#an-model` change → `KV.aiModel` 저장 · `#an-clear` → 키 비우기 · `#an-test` → `callAI("한국어로 '연결 확인 완료' 라고만 답하세요.")` 로 확인 · `#an-models` → `listModels()` 결과를 `#an-modellist` 에 · `#an-modellist` 클릭 → 우선 모델 지정
   - `function syncAiNoteRow(){ … }` 를 만들고, `syncAiRow()` 를 부르는 **모든 자리(5621 · 5744행)** 와 `#btn-settings` 열 때 함께 부릅니다.

4. **확인만** — `exportBackup` 에 `aiKey` 가 없음은 이미 확인했습니다. 코드를 바꾸지 말고 그대로 두면 됩니다.

### 하지 말 것
- 옛 `#set-ai` 블록·핸들러·`syncAiRow()`·`aiReady()`·`AI_SUMMARY_ENABLED` 수정 금지
- 2단계 이후 기능(폴백 사다리 · 모달 · 생성 버튼) 미리 만들기 금지
- `whats-the-strategy.backup.html`, `test-ai.html` 은 건드리지 않습니다

### 마치고 확인
1. `file://` 로 `whats-the-strategy.html` 을 열어 설정을 연다 → 새 **AI NOTE** 항목이 보이고, 옛 AI 항목은 여전히 안 보인다.
2. 키를 넣고 `연결 확인` → 성공/실패 메시지가 한국어로 뜬다.
3. `쓸 수 있는 모델 보기` → 목록 칩이 뜨고, 눌러서 우선 모델이 바뀐다.
4. 브라우저 콘솔 오류 없음. 자료 목록·뷰어·회의록·할 일 전부 종전대로 동작.
5. 커밋 (기존 커밋 메시지처럼 한국어 한 줄 요약).

---

## 3. 4단계 상세 (✅ 완료 — `23c5903`. 아래는 그때 쓴 지시서, 기록용으로 남김)

### 목표
NOTE 탭(회의록 원문 입력창)에 **`AI NOTE 생성` 트리거 블록**을 얹고, 누르면
`callAINote(aiNotePrompt(...))` → `aiNoteParse(...)` 를 실행해 결과를 **메모리 상태에 담고**
생성 중 / 성공 / 실패를 화면에 보여 준다.
**모달 UI 는 5단계에서 만든다. 4단계는 "생성이 돌아가고 상태가 보인다" 까지만.**

### 이미 확인된 좌표 (다시 조사 말 것)

| 항목 | 위치 · 내용 |
|---|---|
| NOTE 탭 렌더 | `renderRight()` 안 `paneNote` (약 2473행). `<h4 class="aihead">${atBar(d,"note")}${lockBtn("B",…)}</h4>` + `<textarea id="sumB">`. |
| 회의록 원문 | `KV.sums[d.id].b` (없으면 `""`). `S.editB` 가 편집 잠금 상태. |
| 회의 Agenda | `String((KV.agendas||{})[noteKey(d.cat,d.date)] || "")` — `paneNote` 위쪽 `renderRight()` 에 이미 `agText` 로 뽑혀 있음(약 2385행). |
| 옛 요약 진행 상태 패턴 | `S.aiBusy`(=docId) · `S.aiErr` · `S.aiErrId` · `S.aiStep`. `makeSummary()`(약 5068행)가 표준 예시 — try/finally 로 `S.aiBusy` 세팅·해제, `S.sel===docId` 일 때만 `renderRight()`. |
| 옛 "AI Note" 버튼 | `atBar()` 의 `data-at="view"` — **첨부 PDF 뷰어**다. 이름만 같고 다른 기능. 건드리지 말 것. |
| 클릭 위임 | `#rbody` 에 이벤트 위임이 걸려 있음(예: `data-lock` · `data-at` · `data-scp`). 새 버튼도 `#rbody` 위임 핸들러에 `data-…` 로 추가하는 게 결에 맞음. `renderRight()` 가 통째로 innerHTML 을 새로 그리므로 `onclick` 직접 바인딩은 사라진다 — **반드시 위임**. |
| 토큰/클래스 | `.aihead` · `.mini` · `.addbtn` · `.tip` · `.sblk`/`.skick`/`.skel`(스켈레톤). 라운드 금지. `--accent:#ec3013`. |

### 만들 것

1. **상태 필드** — `S` 에 AI NOTE 전용 3개 추가 (옛 `aiBusy` 와 **분리**):
   `anBusy:null, anErr:"", anErrId:null` (원문 요약과 동시에 안 돌아가도 되지만, 상태가 섞이면 UI 가 헷갈림).
   생성 결과는 **4단계에서는 메모리에만**: `S.anNote = { id:docId, note:<파싱결과>, at:<iso>, model:<string> }` 한 개 슬롯이면 충분(저장은 6단계).

2. **트리거 블록** — `paneNote` 안, `<textarea id="sumB">` **위**에 삽입. 디자인 핸드오프
   `README.md` 337~340행 규격을 최대한 따르되 이 앱 토큰으로:
   - 배경 `var(--panel2, #eae9e9)`, 아래 2px `var(--rule,#201e1d)`, padding 12~16px.
   - 키커 `AI NOTE` + 오른쪽 상태 텍스트: 노트 없음 → "생성된 노트 없음" / 있음 → "생성 08.24 14:20 · <모델명>".
   - 설명 한 줄: "이 회의록에서 Executive Summary · 주요 Q&A · 지시사항을 한 장으로 정리합니다."
   - 기본 버튼 **`AI NOTE 생성`** — 전체 너비, 높이 38, 배경 `--accent`, 흰 글자. `data-annote="gen"`.
     - `aiNoteReady()` 가 false 면 `disabled` + 밑에 회색 한 줄 "설정에서 제미나이 API 키를 넣으면 켜집니다".
     - 생성 중(`S.anBusy===d.id`): `disabled`, 라벨 "생성 중…", opacity .45.
     - 노트 있음(`S.anNote?.id===d.id`): 라벨 "AI NOTE 보기", `data-annote="open"` (5단계에서 모달 연결. 4단계에선 눌러도 `toast("모달은 다음 단계")` 또는 no-op + 콘솔로그면 됨 — **가짜 UI 만들지 말 것**).
   - 실패(`S.anErrId===d.id && S.anErr`): 버튼 아래 빨간 한 줄 + "다시 시도" 버튼(`data-annote="gen"` 재사용).

3. **핸들러** — `#rbody` 클릭 위임에 `data-annote` 분기 추가:
   - `"gen"` → `makeAiNote(d.id)` 호출.
   - `"open"` → 4단계에선 비워 둠(주석으로 "5단계에서 모달").

4. **`makeAiNote(docId)`** — `makeSummary()` 구조를 그대로 본떠 새로 작성(공유 말 것):
   ```
   async function makeAiNote(docId){
     const d = DOCS.find(x => x.id === docId);
     if(!d || !aiNoteReady() || S.anBusy) return;
     const noteText = (KV.sums[docId] || {}).b || "";
     if(!noteText.trim()){ toast("먼저 회의록을 적어 주세요"); return; }
     S.anBusy = docId; S.anErr = ""; S.anErrId = null;
     if(S.sel === docId) renderRight();
     try{
       const agenda = String((KV.agendas||{})[noteKey(d.cat, d.date)] || "");
       const prompt = aiNotePrompt(d, noteText, agenda);
       let r;
       try{ r = await callAINote(prompt, { json:true }); }
       catch(err){ if(err && err.status === 400) r = await callAINote(prompt); else throw err; }
       const note = aiNoteParse(r.text);
       if(!note) throw new Error("AI가 회의록 틀을 지키지 못했습니다. 다시 시도해 주세요.");
       S.anNote = { id:docId, note, at:new Date().toISOString(), model:r.model };
       if(S.sel === docId) toast(`AI NOTE 를 만들었습니다 (${r.model})`);
     }catch(err){
       S.anErr = err.message || String(err); S.anErrId = docId;
       if(S.sel !== docId) toast("AI NOTE 실패 — " + S.anErr);
     }finally{
       S.anBusy = null;
       if(S.sel === docId) renderRight();
     }
   }
   ```

5. **자료 전환 시 정리** — 약 3311행(`S.editA = S.editB = …`) 근처에서 `S.anErr`/`S.anErrId` 도 지난 오류면 지우기. `S.anNote` 는 그대로 둬도 됨(다른 자료면 `id` 불일치라 안 보임).

### 하지 말 것
- 모달 마크업·`aiNote` 렌더러 미리 만들기 (5단계)
- IndexedDB 저장·`DB_VER` 변경 (6단계) — **4단계 결과는 새로고침하면 사라지는 게 정상**
- COPY / EXPORT / REGENERATE / TASKS 버튼 (8단계)
- 옛 `makeSummary`·`S.aiBusy`·`aiReady()` 수정
- `whats-the-strategy.backup.html`, `test-ai.html`

### 마치고 확인 (localhost 로 충분, 키 필요)
1. 설정에 실제 제미나이 키 입력 → NOTE 탭에 `AI NOTE 생성` 버튼이 활성.
2. 회의록에 몇 줄 적고(→ `#sumB` 저장 확인) 생성 → "생성 중…" → 성공 토스트에 모델명.
3. `S.anNote.note` 를 콘솔에서 확인: `summary`/`qa`/`actions` 채워짐.
4. 키 지우면 버튼 `disabled` + 안내 문구.
5. 회의록 비우고 생성 → "먼저 회의록을 적어 주세요".
6. 콘솔 오류 없음. 커밋 (한국어 한 줄).

---

## 4. 5단계 상세 (✅ 완료 — `6760ebe`. 아래는 그때 쓴 지시서, 기록용으로 남김)

### 목표
`S.anNote.note` (4단계가 채워 둔 파싱 결과)를 **회의록 모달**로 그린다. 디자인 원본
`4a-ai-note-static.html` + `README.md` 342~441행("Addendum — AI Note")을 이 앱 토큰으로 이식.
**5단계는 "보기 전용" 까지. Edit(7) · COPY/EXPORT/REGENERATE/TASKS(8) 버튼은 자리만 두거나 생략.**

### 4단계가 5단계에 넘겨 주는 것

| 것 | 값 |
|---|---|
| 데이터 | `S.anNote = { id:docId, note, at:<iso>, model:<string> }` (해당 자료를 볼 때만 유효, `id` 비교) |
| `note` 모양 | `{ ver:1, cut:<bool>, doc:{ title, meta:{date,place,attendees,author} }, summary:[{text,bold}], qa:[{team, items:[{kind:"Q"|"A"|"지시", text}]}], actions:[{no,text,owner,due,urgent}], keywords:[string] }` |
| 여는 자리 | `.annote` 의 `AI NOTE 보기` 버튼 = `<button data-annote="open">`. `#rbody` 클릭 위임(약 4135행)에 `if(an.dataset.annote === "open") openAiNote(S.sel);` 한 줄 추가(지금은 주석만 있음). |
| `cut` | true 면 답이 잘려 뒷부분이 빠졌다는 뜻 → 모달 상단에 옅은 경고 한 줄 |

### 앱의 모달 관례 (그대로 따를 것)

- 새 `<div class="modalbg" id="ainotebg">` 를 `#atvbg` 블록(약 1312행) 곁에 추가. `.modalbg.on { display:flex }` 가 이미 있음 (약 852행).
- 열기: `$("#ainotebg").classList.add("on")`. 닫기: `remove("on")`.
- **Esc**: 약 6040행 `keydown` 핸들러의 `if(e.key === "Escape")` 사슬에 `#atvbg` 위쪽으로 `if($("#ainotebg").classList.contains("on")) closeAiNote(); else …` 추가.
- 배경 클릭 닫기: `$("#ainotebg").addEventListener("click", e => { if(e.target.id === "ainotebg") closeAiNote(); })` (다른 모달과 동일 패턴, 약 4099·5573행 참고).
- 모달 내부는 `renderRight` 처럼 **매번 통째로 innerHTML** 로 그리고, 버튼은 모두 **위임** 또는 `openAiNote` 안에서 재바인딩. `onclick` 직접 바인딩 금지.
- 디자인 원본은 1200×792 고정이지만 이 앱은 좁은 화면도 쓰므로 `.modal.wide` (이미 있음) + `max-width` 로. 라운드 절대 금지.

### 만들 것

1. **마크업** `#ainotebg` — header(제목칸 + [COPY][EXPORT][REGENERATE] 는 **비활성 자리만**, 닫기 X) / 본문 `#ainotebody`.
2. **`renderAiNote()`** — `S.anNote.note` 를 읽어 `#ainotebody.innerHTML` 을 채운다. 세 묶음:
   - **01 Executive Summary** — `summary[]`. 각 문장, `bold` 구절은 `<b>` + 형광 밑줄 `box-shadow: inset 0 -8px 0 var(--accent-soft)` (README 386행). `bold` 가 `text` 안에 있으면 그 부분만 감싸고, 없으면(4단계 파서가 이미 걸러 빈 문자열) 그냥 문장만.
   - **02 주요 Q&A 및 논의사항** — `qa[]` 팀별 한 블록. 각 `item.kind` 로 태그: `Q`(빨강 채움) · `A`(테두리만) · `지시`(검정 채움, README 395~401행 표).
   - **03 지시사항** — `actions[]` 4열 표: NO · 지시/실행 항목 · 담당자 · 마감일. `urgent` 행은 마감일을 `--accent-ink` 800.
   - 세 묶음은 비어도 섹션 헤더는 남기고 "해당 항목 없음" 한 줄 (README 420행).
   - 좌측 레일(Contents·Keywords·Follow-up)은 **선택** — 넣으면 README 361~370행. 좁으면 생략 가능. Keywords 는 `note.keywords`.
   - 상단 메타: `note.doc.title` (없으면 자료 제목 `d.title`), `note.doc.meta` 4칸, 오른쪽에 `생성 <at> · <model>`. `note.cut` 면 "⚠ 답이 길어 뒷부분이 빠졌을 수 있습니다 — 다시 만들기를 권합니다".
3. **`openAiNote(docId)`** — `S.anNote && S.anNote.id === docId` 아니면 무시. `renderAiNote()` → `add("on")`. 포커스를 X 버튼에.
4. **`closeAiNote()`** — `remove("on")`. 포커스를 `.annote .gen` 로 되돌림(있으면).
5. **CSS** — `#ainotebg` 전용 규칙. 기존 토큰만. 흰 시트 `background:#fff; max-width:820px; padding:40px 44px 48px` + 얇은 그림자. 인쇄용 `@media print` 는 8단계에서.

### 하지 말 것
- 저장/백업 (6단계) — 5단계도 새로고침하면 노트가 사라지는 게 정상
- 인라인 편집·행 추가삭제 (7단계)
- COPY/EXPORT/REGENERATE/TASKS 동작 (8단계) — **버튼은 비활성 자리만**
- `4a-ai-note-static.html` 등 디자인 핸드오프 파일 수정 (읽기만)
- 4단계까지의 함수(`makeAiNote`·`aiNoteParse`·`aiNoteBlock`) 로직 변경 — 렌더러만 새로

### 마치고 확인 (localhost, 키 필요 — 또는 콘솔에서 `S.anNote` 를 손으로 채워 렌더만 확인)
1. 회의록 생성 후 `AI NOTE 보기` → 모달이 열리고 세 묶음이 보인다.
2. Esc · 배경 클릭 · X 로 닫힌다. 닫으면 포커스가 생성 버튼으로.
3. `qa` 태그 3종 색이 구분된다. `지시` 항목이 팀 블록 맨 뒤.
4. `summary` 의 bold 구절에 형광 밑줄.
5. 빈 섹션은 "해당 항목 없음".
6. 좁은 화면(모바일 폭)에서 가로 스크롤 없음. 콘솔 오류 없음. 커밋.

---

## 5. 6단계 상세 (✅ 완료. 아래는 그때 쓴 지시서, 기록용으로 남김)

### 목표
지금은 만든 AI NOTE 가 **메모리(`S.anNote`)에만** 있어서 새로고침하면 사라집니다.
IndexedDB 에 새 스토어 `ainote` 를 만들어 **자료별로 한 장씩 저장**하고, 앱을 다시 켜도 그대로 보이게 합니다.
**백업 파일(JSON·ZIP)에도 함께 담고, 불러오기로 되살아나게** 합니다.

### 5단계가 6단계에 넘겨 주는 것

| 것 | 값 |
|---|---|
| 메모리 슬롯 | `S.anNote = { id:docId, note, at:<iso>, model:<string> }` — 한 자료 것만 들고 있습니다 |
| 만드는 자리 | `makeAiNote(docId)` 안 `S.anNote = { … }` 한 줄 (약 5216행) |
| 읽는 자리 | `aiNoteBlock(d)`(약 2385행, 상태 줄·버튼 라벨) · `renderAiNote()`(모달) · `openAiNote(docId)` |
| 지우는 자리 | 자료 삭제 시 `removeDoc(id)` 근처(약 4325행)에서 `S.anNote` 를 비우는 줄이 이미 있음 |

### 이미 확인된 좌표 (다시 조사 말 것)

| 항목 | 위치 · 내용 |
|---|---|
| DB 열기 | `DB_NAME="strategy-library", DB_VER = 3` (1740행). `openDB()` 의 `onupgradeneeded` 안에서 `if(!db.objectStoreNames.contains(...)) createObjectStore(...)` 로 스토어를 하나씩 만듭니다 — **같은 결로 한 줄 추가**하고 `DB_VER` 만 4로 올리면 됩니다. 이미 v3 인 기기도 업그레이드가 한 번 돌아 새 스토어만 생깁니다. |
| 저장 도우미 | `dbGet(store,key) · dbAll(store) · dbPut(store,값) · dbDel(store,key) · dbClear(store)` (1771~1775행). 전부 Promise. |
| 첫 로딩 | `loadAll()` (6366행) 이 `Promise.all([dbAll("docs"), dbAll("notes"), dbAll("attach")])` 로 한꺼번에 읽어 전역에 담습니다. **여기에 `ainote` 를 끼워 넣는 게 결에 맞습니다.** |
| 자료 삭제 | `removeDoc(id)` (약 4319행) — `dbDel("docs"…)·dbDel("files"…)·dbDel("draw"…)` 를 나란히 부릅니다. 여기에 `dbDel("ainote", id)` 추가. |
| 전부 지우기 | `$("#btn-wipe").onclick` (6286행) 의 `dbClear` 줄들. |
| 백업 만들기 | `exportBackup(withPdf)` (6158행). `meta = { app, ver, exportedAt, kv:{…}, docs, notes }`. PDF 포함 백업은 `meta.attach` 를 뒤에서 덧붙입니다. |
| 백업 불러오기 | 6271행 근처 `if(data.kv){ … }` 블록과 그 위 `for(const n of (data.notes || [])) await dbPut("notes", n);`. 끝에서 `await loadAll(); renderAll();` 을 부릅니다. |

### 만들 것

1. **스토어 신설** — `DB_VER` 를 `3` → **`4`**. `openDB()` 안에 한 줄:
   ```js
   /* AI NOTE — 자료 하나에 회의록 한 장 { id:자료 id, note, at, model } */
   if(!db.objectStoreNames.contains("ainote")) db.createObjectStore("ainote", { keyPath:"id" });
   ```

2. **메모리 전역** — `S.anNote`(슬롯 하나)로는 목록·다른 자료 상태를 알 수 없으므로,
   `ATTACH` 처럼 **전역 하나**를 새로 둡니다: `let AINOTES = {};   // { 자료 id: {id, note, at, model} }`
   - `loadAll()` 에서 `dbAll("ainote")` 결과를 `AINOTES` 에 담습니다.
   - `S.anNote` 는 **없애고**, 읽는 자리 세 곳을 `AINOTES[d.id]` 로 바꿉니다
     (`aiNoteBlock` · `openAiNote` · `renderAiNote`). `renderAiNote()` 는 지금 인자가 없으니
     `renderAiNote(docId)` 로 바꾸고 `openAiNote` 가 넘겨 주는 게 깔끔합니다.
   - `S.anBusy · S.anErr · S.anErrId` 는 **그대로** 둡니다 (진행/오류는 저장할 것이 아닙니다).

3. **저장** — `makeAiNote()` 안에서 `S.anNote = {…}` 대신:
   ```js
   const rec = { id:docId, note, at:new Date().toISOString(), model:r.model };
   AINOTES[docId] = rec;
   await dbPut("ainote", rec);
   ```
   저장이 실패해도 화면에는 보이게 — `dbPut` 은 `.catch(() => {})` 로 감싸고, 실패하면
   `toast("저장하지 못했습니다 — 새로고침하면 사라집니다")` 한 줄이면 충분합니다.

4. **지우기** — `removeDoc(id)` 에 `await dbDel("ainote", id).catch(()=>{});` + `delete AINOTES[id];`.
   `#btn-wipe` 에 `await dbClear("ainote").catch(()=>{});` + `AINOTES = {};`.

5. **백업에 담기** — `exportBackup` 의 `meta` 에 `ainote: Object.values(AINOTES)` 추가.
   JSON 백업(`ver:2`)에도 그대로 들어갑니다. **`aiKey` 는 여전히 넣지 않습니다.**
   불러오기 쪽(6258행 `notes` 되살리는 줄 옆)에 한 줄:
   ```js
   for(const a of (data.ainote || [])) if(a && a.id) await dbPut("ainote", a).catch(() => {});
   ```
   옛 백업에는 `ainote` 가 없으므로 `|| []` 로 조용히 넘어갑니다.

6. **덮어쓰기 규칙** — 같은 자료를 다시 생성하면 새 것으로 **덮어씁니다**(경고 없음).
   손으로 고친 노트를 지키는 경고는 7단계(Edit)에서 `editedByUser` 를 만든 뒤에 붙입니다.

### 하지 말 것
- 인라인 편집·행 추가삭제 (7단계) · COPY/EXPORT/REGENERATE/TASKS 동작 (8단계)
- `KV` 에 노트를 넣기 — 노트는 길어질 수 있어 `kv` 가 아니라 **전용 스토어**에 둡니다
- 옛 스토어(`docs·files·notes·kv·attach·attachfile·draw`) 구조 변경
- `aiNotePrompt`·`aiNoteParse`·`callAINote`·`renderAiNote` 의 **그리는 내용** 손대기 (읽는 자리만 바꿉니다)
- `whats-the-strategy.backup.html`, `test-ai.html`

### 마치고 확인
1. `file://` 로 열어 노트를 만든 뒤 **새로고침** → `AI NOTE 보기` 가 그대로 있고 모달이 열린다.
2. 다른 자료로 갔다 돌아와도 상태 줄의 생성 시각·모델이 유지된다.
3. 노트가 없는 자료는 여전히 `AI NOTE 생성`.
4. 자료를 지우면 그 노트도 사라진다 (다른 자료 노트는 남는다).
5. 백업 내려받기 → `전부 지우기` → 백업 불러오기 → 노트가 되살아난다. 옛 백업 파일도 오류 없이 열린다.
6. 개발자도구 Application → IndexedDB `strategy-library` 버전이 **4**, `ainote` 스토어가 보인다.
7. 콘솔 오류 없음. 커밋 (한국어 한 줄).

---

## 6. 7단계 상세 (✅ 완료. 아래는 그때 쓴 지시서, 기록용으로 남김)

### 목표
AI NOTE 모달을 **고칠 수 있게** 만든다. AI 가 만든 초안을 사람이 손보고, 그 결과가 저장돼야
실무에서 쓸 수 있다. 헤더의 **EDIT** 를 누르면 세 섹션이 인라인 편집 상태가 되고,
**저장** 하면 `AINOTES[docId].note` 를 통째로 갈아 끼운 뒤 `dbPut("ainote", …)` 한다.

### 6단계가 7단계에 넘겨 주는 것

| 것 | 값 |
|---|---|
| 데이터 | `AINOTES[docId] = { id, note, at, model }` (전역, `loadAll()` 이 채움) |
| `note` 모양 | `{ ver, cut, doc:{title,meta:{date,place,attendees,author}}, summary:[{text,bold}], qa:[{team,items:[{kind:"Q"\|"A"\|"지시",text}]}], actions:[{no,text,owner,due,urgent}], keywords:[string] }` |
| 저장 도우미 | `dbPut("ainote", rec)` — Promise, `keyPath:"id"` 라 같은 id 면 덮어씀 |
| 렌더러 | `renderAiNote(docId)` (약 5423행) — `#ainotebody.innerHTML` 통째로. `#anrail` 도 여기서 그림 |
| 모달 열기 | `openAiNote(docId)` (약 5505행) → `renderAiNote(docId)` + `.on` |
| 비활성 버튼 자리 | 헤더 `#an-copy #an-export #an-regen` (약 1461행), 레일 `.antasks` (약 5454행) — 전부 `disabled`. **7단계는 이 중 아무것도 켜지 않는다** (COPY/EXPORT/REGENERATE/TASKS 는 8단계) |
| 태그 | `.ansum .row .tx b` · `.anqa .tag/.tx (q\|a\|d)` · `.antb` 4열 표 (CSS 약 1007~1039행). 라운드 금지 |

### 이미 확인된 좌표 (다시 조사 말 것)

| 항목 | 위치 · 내용 |
|---|---|
| 모달 마크업 | 약 1452~1471행 `#ainotebg`. 헤더 `.antitle`(태그·`#an-fn`·`#an-mt`) + `#an-copy/#an-export/#an-regen` + `#anx`. 본문 `.content` = `#anrail` + `#ainotebody`(`.anstage`). |
| 렌더러 조립부 | `renderAiNote()` 안 `secSum`/`secQa`/`secAct` 문자열 (약 5450~5481행), `$("#ainotebody").innerHTML = ...ansheet...` (약 5486행). |
| 위임 핸들러 | `$("#ainotebg").addEventListener("click", …)` (약 5514행) — 배경 닫기 + `[data-anjump]`. **여기에 `data-anedit` 분기를 붙이는 게 결에 맞음.** `onclick` 직접 바인딩 금지(모달은 매번 새로 그림). |
| 다른 인라인 편집 예시 | 자료 관리 모달(`managebg`, 약 1474행) 이 "고치는 즉시 저장" 패턴. `contenteditable` 은 이 파일에서 안 씀 — `<textarea>`/`<input>` + change 저장이 결에 맞음. |
| 회의록 편집 잠금 패턴 | NOTE 탭 `S.editB` — 잠금 토글 후에만 textarea 활성. 같은 결로 `S.anEdit`(=docId 또는 bool) 상태 하나. |
| Esc 사슬 | 약 6053행 `keydown`. 편집 중 Esc 는 **편집 취소**(모달은 유지), 편집 아닐 때 Esc 는 모달 닫기 — 사슬 맨 앞에서 `S.anEdit` 먼저 본다. |

### 만들 것

1. **상태** — `S.anEdit`(편집 중인 docId, 아니면 `null`)와 `S.anDraft`(편집용 깊은 복사본, `JSON.parse(JSON.stringify(note))`). 저장하면 `AINOTES[id].note = S.anDraft`, 취소하면 버림.

2. **EDIT 진입** — 헤더에 `#an-edit` 버튼 신설(지금 비활성 3형제 **왼쪽**). 누르면 `S.anEdit = docId`, `S.anDraft = 복사본`, `renderAiNote(docId)` 재호출. 편집 중엔 `#an-copy/#an-export/#an-regen` 은 계속 `disabled`, `#an-edit` 자리에 **[저장] [취소]** 두 개.

3. **`renderAiNote` 분기** — `const ed = S.anEdit === docId`. `ed` 면 각 섹션을 편집 폼으로:
   - **01 요약** — 줄마다 `<textarea>` 하나(`data-an="sum" data-i="N"`). `bold` 는 7단계에선 **건드리지 않음**(텍스트만 편집, `bold` 문자열은 그대로 유지하되 편집 후 문장에서 사라졌으면 렌더러가 알아서 통짜 출력 — 이미 그렇게 동작). 줄 끝 `−` 삭제 버튼, 블록 끝 `+ 줄 추가`.
   - **02 Q&A** — 팀 블록마다 팀명 `<input>`, item 마다 `kind` `<select>`(Q/A/지시) + 텍스트 `<textarea>` + `−`. 블록 끝 `+ 항목`, 섹션 끝 `+ 팀`.
   - **03 지시사항** — 표의 각 셀을 `<input>`/`<textarea>` 로. `urgent` 는 체크박스. 행 끝 `−`, 표 끝 `+ 행`. `no` 는 자동 번호(저장 시 1..n 재부여).
   - 레일(`#anrail`)은 편집 중 **차례만 남기고 Keywords/Follow-up 숨김**(또는 Keywords 도 칩 편집 — 선택). 간단히 하려면 편집 중 레일 통째로 "편집 중" 한 줄.

4. **입력 → 드래프트 반영** — `#ainotebody` 에 `input`/`change` 위임 하나. `e.target.dataset.an` 으로 어디를 고쳤는지 보고 `S.anDraft` 의 해당 자리를 갱신. **재렌더 안 함**(포커스 유지) — 행 추가/삭제일 때만 `renderAiNote` 재호출.

5. **행 추가/삭제** — `[data-anadd]`/`[data-andel]` 클릭 위임. `S.anDraft` 배열을 손보고 `renderAiNote(docId)` 재호출(편집 상태 유지). 빈 섹션도 허용(저장하면 "해당 항목 없음" 으로 보임).

6. **저장** — `#an-save`:
   ```js
   const d = S.anDraft;
   d.actions.forEach((r,i) => r.no = i + 1);   // 번호 재부여
   AINOTES[docId].note = d;
   AINOTES[docId].editedByUser = true;          // 8단계 REGENERATE 경고용 표식
   await dbPut("ainote", AINOTES[docId]).catch(() => toast("저장하지 못했습니다"));
   S.anEdit = null; S.anDraft = null;
   renderAiNote(docId);
   toast("고친 내용을 저장했습니다");
   ```
   - `at`/`model` 은 그대로 둔다(생성 시각이지 수정 시각이 아님). 필요하면 `editedAt` 을 따로 추가.

7. **취소** — `#an-cancel` 또는 편집 중 Esc: `S.anEdit = S.anDraft = null; renderAiNote(docId);` (배경 클릭은 편집 중엔 **무시** — 실수로 닫히면 편집분 날아감).

8. **상태 줄** — `aiNoteBlock` 의 "생성 …" 뒤에 `editedByUser` 면 " · 수정함" 한 마디(선택).

### 하지 말 것
- COPY / EXPORT / REGENERATE / TASKS 동작 (8단계) — 버튼은 계속 비활성
- `bold` 형광 밑줄 구절을 직접 지정하는 UI (범위 밖 — 텍스트만)
- `aiNotePrompt`·`aiNoteParse`·`callAINote` 수정
- `renderAiNote` 의 **보기 모드** 출력 바꾸기 (편집 분기만 새로)
- 저장 스토어·`DB_VER` 변경 (6단계에서 끝남)
- `whats-the-strategy.backup.html`, `test-ai.html`

### 마치고 확인 (`file://`, 노트 하나 필요)
1. 노트 열고 EDIT → 세 섹션이 폼이 된다. 요약 한 줄 고치고 저장 → 새로고침해도 고친 내용.
2. Q&A 에 팀·항목 추가/삭제, `kind` 바꾸기 → 저장 후 태그 색이 맞다.
3. 지시사항 행 추가/삭제, `urgent` 체크 → 저장 후 마감일이 빨갛다. `no` 가 1부터 다시 매겨진다.
4. 편집 중 배경 클릭은 안 닫힌다. Esc 는 편집 취소(모달 유지), 다시 Esc 로 닫힘.
5. 취소하면 고친 게 사라지고 원래대로.
6. 콘솔 오류 없음. 좁은 화면에서 폼이 넘치지 않는다. 커밋 (한국어 한 줄).

---

## 7. 다음 할 일 — 8단계 상세

### 목표
머리칸과 레일에 **자리만 잡아 둔 네 개**를 켠다 — `COPY` · `EXPORT` · `REGENERATE` · `TASKS로 보내기`.
여기까지 하면 만든 회의록을 밖으로 내보내고 다시 만들 수 있어서, AI NOTE 기능이 한 바퀴 돈다.

### 7단계가 8단계에 넘겨 주는 것

| 것 | 값 |
|---|---|
| 데이터 | `AINOTES[docId] = { id, note, at, model, editedByUser? }` (전역) |
| `note` 모양 | `{ ver, cut, doc:{title,meta:{date,place,attendees,author}}, summary:[{text,bold}], qa:[{team,items:[{kind,text}]}], actions:[{no,text,owner,due,urgent}], keywords:[string] }` |
| 사람이 손댔는지 | `AINOTES[docId].editedByUser === true` — **REGENERATE 경고에 이 표식을 씁니다** |
| 렌더러 | `renderAiNote(docId)` — 보기/편집 두 갈래. 편집 중인지는 `S.anEdit === docId` |
| 지금 열린 노트 | `S.anOpen` (모달 열 때 채우고 닫을 때 비웁니다) |
| 다시 만들기 | `makeAiNote(docId)` (약 5352행) — 회의록 원문+Agenda → `callAINote` → `aiNoteParse` → `AINOTES[docId]` 덮어쓰기 + `dbPut`. **이미 있는 노트를 경고 없이 덮어씁니다.** |
| 비활성 버튼 자리 | `#an-copy` `#an-export` `#an-regen` (약 1497행) · 레일 `.antasks`(`renderAiNote` 안) — 전부 `disabled` |
| 클릭 위임 | `$("#ainotebg").addEventListener("click", …)` — 배경 닫기 · `[data-anjump]` · `[data-anadd]` · `[data-andel]`. 머리칸 버튼은 매번 새로 그리지 않으므로 `#an-edit` 처럼 `onclick` 직접 바인딩해도 됩니다. |

### 이미 확인된 좌표 (다시 조사 말 것)

| 항목 | 위치 · 내용 |
|---|---|
| 토스트 | `toast(msg)` (약 1725행) |
| 확인 창 | 이 파일은 `confirm()` 을 씁니다 (자료 삭제·전부 지우기 등). REGENERATE 경고도 같은 결로. |
| 할 일 목록 | `KV.tasks[docId]` — TASK 탭이 읽습니다. 모양은 `renderRight()` 의 `paneTask` 와 `KV_DEFAULT` 를 보고 맞추세요(**여기서 한 번 확인 필요**). |
| KV 저장 | `saveKV()` — 고칠 때마다 부릅니다. `tasks` 는 백업에도 들어갑니다. |
| 인쇄 CSS | 이 파일에 `@media print` 가 아직 없습니다 — EXPORT 는 새로 만들어야 합니다. |
| 모달 CSS | `.anact` (약 952행) · `.anact[disabled]` · `.antasks` · ≤640px 에서 `#an-copy/#an-export/#an-regen` 은 접힙니다 — **켜고 나면 이 접힘 규칙을 다시 볼 것** |

### 만들 것

1. **COPY** — `note` 를 **글자만 있는 회의록**으로 풀어 클립보드에 넣습니다.
   제목 · 일시/장소/참석/작성 · `01 Executive Summary`(`S1.` 번호) · `02 주요 Q&A`(팀별, `Q:`/`A:`/`지시:`) ·
   `03 지시사항`(`1. 내용 — 담당 / 마감`) · `Keywords`. `navigator.clipboard.writeText` 는 `file://` 에서 막힐 수
   있으니 실패하면 숨은 `<textarea>` + `document.execCommand("copy")` 로 물러섭니다. 끝나면 토스트.

2. **EXPORT** — 흰 시트 한 장을 **인쇄(PDF 저장)** 로 냅니다. 새 창을 띄우지 말고 `@media print` 를 새로 써서
   `#ainotebg` 만 남기고 앱 나머지를 숨기는 쪽이 이 파일 결에 맞습니다(`body.printing` 같은 표식 한 개).
   레일·머리칸 버튼은 인쇄에서 빼고, 시트의 그림자도 뺍니다. 편집 중에는 `disabled`.

3. **REGENERATE** — `makeAiNote(docId)` 를 다시 부릅니다. **`editedByUser` 면 먼저 `confirm()`**:
   "손으로 고친 내용이 사라집니다. 다시 만들까요?" 진행하면 `editedByUser` 표식도 지웁니다.
   도는 동안 모달 안에 "다시 만드는 중…" 을 보이고 버튼 넷을 다 잠급니다. 끝나면 `renderAiNote(docId)`.

4. **TASKS로 보내기** — `note.actions` 를 `KV.tasks[docId]` 에 **덧붙입니다**(지우지 않습니다).
   같은 문장이 이미 있으면 건너뜁니다. 넣고 나서 `saveKV()` · `renderRight()` · 토스트("N건을 할 일로 보냈습니다").
   `owner`/`due` 를 할 일 항목 어디에 담을지는 **`paneTask` 의 실제 모양을 보고 정하세요**.

5. **버튼 잠금 규칙 정리** — 편집 중(`S.anEdit`)에는 넷 다 `disabled`, 보기 중에는 넷 다 켜짐.
   `renderAiNote` 안에서 `#an-edit` 을 다루는 줄 옆에 같이 둡니다.

### 하지 말 것
- `aiNotePrompt` · `aiNoteParse` · `callAINote` · `makeAiNote` 의 **생성 로직** 손대기 (REGENERATE 는 그냥 다시 부르기만)
- 저장 스토어 · `DB_VER` 변경 (6단계에서 끝남)
- 편집 폼 모양 바꾸기 (7단계에서 끝남)
- `whats-the-strategy.backup.html`, `test-ai.html`

### 마치고 확인 (`file://`, 노트 하나 필요)
1. COPY → 아무 데나 붙여 넣으면 세 섹션이 글자로 다 들어 있다.
2. EXPORT → 인쇄 미리보기에 흰 시트만 나오고 레일·버튼·그림자가 없다.
3. REGENERATE → 고친 노트면 경고가 뜬다. 진행하면 새 노트로 바뀌고 `· 수정함` 이 사라진다.
4. TASKS로 보내기 → TASK 탭에 지시사항이 들어와 있다. 두 번 눌러도 안 겹친다.
5. 편집 중에는 넷 다 안 눌린다. 좁은 화면에서도 넷이 보인다(접힘 규칙 재확인).
6. 콘솔 오류 없음. 커밋 (한국어 한 줄).
