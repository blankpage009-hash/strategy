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
| 4 | ⏳ 다음 | — | 아래 **3. 4단계 상세** 참고 |

새 창 확인 방법: `python -m http.server 8777` (`.claude/launch.json` 에 `static` 로 등록돼 있음) → `http://localhost:8777/whats-the-strategy.html`. **주의:** localhost 로는 IndexedDB 자료가 안 보입니다 — JS 로직·설정 UI·콘솔 오류만 확인 가능. 자료까지 봐야 하면 `file://` 로 여세요.

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

## 3. 다음 할 일 — 4단계 상세

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
