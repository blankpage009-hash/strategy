# AI Summary (p별 요약) — 작업계획 (인수인계 문서)

작성 2026-09-18. 이 문서 하나만 읽으면 새 창에서 바로 단계 작업을 시작할 수 있습니다.
**각 단계는 새 창에서 하나씩 실행합니다. 여러 단계를 몰아서 하지 마세요.**

---

## 0. 이 앱에 대해 꼭 먼저 알 것

- 앱 본체는 **`whats-the-strategy.html` 단일 파일**(약 1.2MB, HTML+CSS+JS 한 덩어리, 약 10,580행)입니다. 여기만 고칩니다.
- **반드시 `file://` 로 열어서 확인합니다.** localhost 로 열면 IndexedDB 출처가 달라 자료가 하나도 안 보입니다.
  실제 주소: `file:///D:/Documents/Coding%20Projects/Strategy%20Library/whats-the-strategy.html`
  → 브라우저 도구로 자동 검증할 수 없습니다. 코드 검토 + 사용자가 직접 눌러 보는 것으로 확인합니다.
- 주석은 **한국어 · 존댓말 · 비개발자도 읽히는 말투**로 씁니다 (기존 파일 전체가 그 문체입니다).
- **라운드(border-radius)는 어디에도 쓰지 않습니다.** 디자인 토큰은 `:root` 에 있습니다 (`--accent`, `--rule`, `--panel2`, `--muted` …).
- 행 번호는 2026-09-18 기준 근사치입니다. 반드시 `grep` 으로 다시 찾고 시작하세요.

## 0-1. 확정된 결정사항 (2026-09-18 사용자 승인)

1. **요약 범위 = 지금 뷰어에 펼쳐진 p 하나** (`S.page`). 자료 전체가 아닙니다.
   (예시 3개가 슬라이드 1장씩과 1:1 대응)
2. **p별로 따로 저장·표시.** 발표 스크립트 탭처럼 p를 넘기면 그 p의 요약이 보이고, p마다 따로 만듭니다.
3. **입력 = 그 p의 글자(`pageTexts[p-1]`) + 그 p 그림(JPEG) 함께** 보냅니다. PDF 원본이 없는 자료(`hasPdf` false)는 글자만 보냅니다.
4. **출력 틀 = 3 카테고리 고정**: `1. 핵심 내용` / `2. 주요 수치 및 현황` / `3. 비고`. 2번은 한 단계 하위 항목을 가질 수 있습니다.
5. API 키·모델은 **설정의 "AI NOTE (제미나이)" 칸에 이미 넣어 둔 것**을 그대로 씁니다 (`KV.aiKey`, `KV.aiModel`). 새 설정 UI를 만들지 않습니다.
6. 제미나이 호출은 **`callAINote()`** (모델 폴백 사다리 포함)로 합니다. `callAI()` 를 직접 부르지 않습니다.
7. 저장 위치: **`KV.sums[docId].pg[page] = { text, at, model, src }`**. `KV.sums` 는 이미 백업(export/import)·GitHub 동기화(`SYNC_KV_KEYS`)에 들어 있어 추가 작업이 없습니다.
8. 옛 자료 단위 요약 `KV.sums[docId].a` 는 **데이터는 건드리지 않되 화면에는 더 이상 그리지 않습니다.** (현재도 읽기 전용 빈 상자만 있었음)

## 0-2. 절대 하지 말 것

- **`AI_SUMMARY_ENABLED = false` 를 `true` 로 바꾸지 마세요.** 그러면 폐지된 옛 자동요약 UI(구조 요약 `ex`, `execBox`, `AI_SHAPE`, `makeSummary`)가 통째로 되살아납니다.
  새 기능의 게이트는 `aiNoteReady()` 를 본뜬 **`aiSumReady()`** (키 길이 ≥ 10) 를 새로 만듭니다.
- `makeSummary()` / `aiPrompt()` / `aiParseEx()` / `AI_SHAPE` 경로를 재사용하지 마세요. 출력 틀이 완전히 다르고, `KV.sums[id].b`(사용자 회의록)까지 덮어씁니다.
- 설정 화면의 숨겨진 옛 AI mrow(`#set-ai #set-key #airow …`, 약 2127행)는 건드리지 마세요.
- `#rbody` input 핸들러(약 6157행)의 `sumA` 분기는 `cur.by = "me"` 를 찍고 `.a` 에 씁니다. 새 상자는 **다른 id(`sumP`)** 를 써서 이 분기를 타지 않게 합니다.

## 0-3. 현재 코드에서 이미 확인된 사실 (다시 조사하지 말 것)

| 항목 | 위치 · 내용 |
|---|---|
| Summary 탭 상단 블록 | `aiSumBlock(d)` (약 3586행) — `disabled` 단추 + "준비 중 — 곧 추가됩니다". 여기를 활성화합니다. |
| Summary 탭 본문 | `renderRight()` (약 3610행) 안 `paneSum` (약 3706행). `aiSumBlock(d) + (busy&&!ex ? skelBlk : asText ? 글상자 : execBox…)`. `sumTools`·`sumStatus`·`skelBlk`·`ex` 는 옛 자동요약 잔재 — `aiOn` 이 항상 false 라 실제로는 `sumBox("sumA", a, false, …)` 하나만 그려집니다. |
| 본뜰 대상 (AI NOTE) | `aiNoteBlock(d)` (약 3541행) 상태줄·단추, `makeAiNote(docId)` (약 7476행) 생성 흐름, `aiNotePrompt` (7270행), `aiNoteParse` (7340행), `AN_LIM` (7223행), `aiNoteReady()` (8667행). |
| 클릭 위임 | `$("#rbody").addEventListener("click", …)` 안 `e.target.closest("[data-annote]")` (약 6317행). 같은 자리에 `[data-aisum]` 분기를 추가합니다. |
| 스크립트 탭 p 이동 | `paneScript` 의 `.scpage` 블록(`.scnav[data-scp=prev/next]`, `.no`, `.tot`) (약 3730행), 핸들러 `scGo(n)` (약 5436행). 같은 모양을 Summary 탭에도 씁니다. |
| p 바뀔 때 오른쪽 다시 그리기 | `syncScriptPane()` (약 3172행) — `S.rtab !== "script"` 면 return, `body.dataset.page` 비교. `renderRight()` 끝(약 3822행)에서 `body.dataset.page = tab === "script" ? String(curPg) : ""`. **둘 다 `sum` 탭도 포함하도록 넓혀야 합니다.** |
| 현재 p·PDF | `S.page`, `S.pdf`(pdf.js document, 뷰어에 열린 것), `d.pages`, `d.pageTexts[]`. 원본 없는 자료는 `S.pdf` 가 null. |
| p 그림 만들기 | `pageImages(doc, onStep)` (약 6646행) — IDB `files` 에서 blob 을 꺼내 **1쪽부터 n쪽까지** JPEG 로. 상수 `AI_IMG_LONG=1600`, `AI_IMG_Q=0.8`, `AI_IMG_TIMEOUT`. 한 쪽만 뽑는 변형이 필요합니다. |
| 제미나이 호출 | `callAI(prompt, opts)` (약 6693행): `opts.json`, `opts.images=[{mime,data}]`, `opts.timeout`, `opts.model`. `callAINote(prompt, opts)` (6790행): 폴백 사다리, `{text, model}` 반환. 400 재시도 관용구는 7437·7490행 그대로 복사. |
| 숫자 규칙 | `aiPrompt()` (약 6924행) 안 `--- 숫자 규칙 (가장 중요) ---` 블록. ▲/+/미기재/자릿수 규칙이 이 자료에 맞춰 이미 조정돼 있습니다. **그대로 재사용**합니다. |
| 글상자 저장 형식 | `normalizeSumHtml` (2324행) / `toEditableHtml` (2339행) / `sumBox(id, value, editing, placeholder)` (2341행). 순수 글자 + `\n` + `<b>`·`<u>` 만. `BULLET = "ㆍ"` (6153행). |
| 상태 객체 | `const S = {…}` (2852행). AI NOTE 는 `S.anBusy / S.anErr / S.anErrId`. 새 기능은 `S.asBusy / S.asErr / S.asErrId / S.asStep`. |
| 시각 표기 | `anWhen(iso)` → `2026.08.24 14:20`. `aiNoteBlock` 의 `stat` 문자열 만드는 법 참고. |
| 백업·동기화 | `exportBackup` meta.kv 에 `sums` 포함(8856행), import 는 `Object.assign` 얕은 병합(8978행), `SYNC_KV_KEYS` 에 `sums` 포함(9210행). |
| CSS | `.annote .anhd .anlbl .kick .stat .anbtns .genmini .lock .bad .retry` (1111~1129행). `#rbody[data-tab="sum"][data-mode="text"] .sum.fill` 이 상자를 세로로 채웁니다(1022행) — `data-mode="text"` 유지 필요. |

---

## 1. 전체 단계

| # | 단계 | 난이도 | 추천 모델 / 노력 | 눈에 보이는 변화 |
|---|---|---|---|---|
| 1 | 백엔드 — 프롬프트·JSON 틀·파서·글 변환·한 쪽 그림·생성 함수·저장 | 중~상 | **Opus 5 / 높음** | 없음 (콘솔에서 `makeAiSum(S.sel, S.page)` 로 확인) |
| 2 | UI — 상단 블록 활성화, p별 상자 + p 이동, 클릭 위임, p 동기화 | 중 | **Opus 5 / 높음** | 단추가 눌리고 결과가 상자에 나옵니다 |
| 3 | 손보기 — Edit/완료 로 p별 요약 고치기, 지우기, 다시 만들기 확인 | 하~중 | **Sonnet 5 / 중간** | Edit 단추 |
| 4 | 점검·정리 — 오류 경로, 원본 없는 자료, 백업 왕복, 설명서 한 줄, 커밋 | 하 | **Sonnet 5 / 낮음** | — |

---

## 2. 단계별 상세

### 1단계 — 백엔드 (Opus 5 / 높음)

목표: 화면 없이도 콘솔에서 `await makeAiSum(S.sel, S.page)` 를 부르면 `KV.sums[id].pg[page]` 에 결과가 저장된다.

**1-a. 숫자 규칙 공용화**
- `aiPrompt()` 안 `--- 숫자 규칙 (가장 중요) ---` 부터 `--- 구조 규칙` 직전까지의 7줄을 `const AI_NUM_RULES = \`…\`` 로 뽑아 `aiPrompt` 는 `${AI_NUM_RULES}` 로 바꿉니다 (옛 코드 동작 불변).

**1-b. 출력 틀·한도** (`AN_LIM`/`AN_SHAPE` 바로 아래에 둡니다)
```js
const AS_LIM = { core:4, figures:8, sub:6, notes:4, lineLen:140 };
const AS_SHAPE = `{
  "core":    ["핵심 내용 한 줄"],
  "figures": [ { "text":"주요 수치·현황 한 줄", "sub":["하위 항목 한 줄"] } ],
  "notes":   ["비고 한 줄"]
}`;
```

**1-c. 프롬프트 `aiSumPrompt(doc, pageNo, pageText, withImage)`**
- 역할: "회사 전략담당자의 비서". 입력은 회의자료 한 쪽(p)의 글자 + (있으면) 같은 쪽 그림.
- `${AS_SHAPE}` + `${AI_NUM_RULES}` + 카테고리 규칙:
  - core: 이 쪽이 말하려는 결론 1~`AS_LIM.core` 줄. "~중", "~함" 보고서 종결형.
  - figures: 표·항목의 수치를 근거로. 묶음(팀·항목·고객사)이 있으면 `text` 에 묶음 이름과 규모, `sub` 에 세부. 없으면 `sub: []`.
  - notes: 각주(※)·조건·미반영 사항·리스크. 없으면 `[]`.
  - 글자 조각 순서가 섞여 있으니 그림이 있으면 그림의 표 위치를 기준으로 읽는다.
- **사용자가 준 예시 3개를 프롬프트 안에 "이런 결과를 원합니다" 로 그대로 넣습니다** (문체·밀도·기호 사용의 기준). 원문은 이 문서 4장에 있습니다.
- 마지막에 `--- 자료 정보 ---` 제목·회의종류·날짜·`${pageNo}p / ${doc.pages}p`, `--- 이 쪽의 글자 ---` 본문(`clip(pageText, 8000)`).
- JSON 하나만, 코드펜스 없이.

**1-d. 파서 `aiSumParse(text)`** — `aiNoteParse` 를 본뜹니다.
- 코드펜스·앞뒤 잡글 제거 → `JSON.parse` → 실패 시 첫 `{` ~ 마지막 `}` 재시도.
- 배열이 아니면 `[]`, 문자열 아니면 버림, `AS_LIM` 개수·길이로 자름, 공백 정리.
- 세 배열이 전부 비면 `null` 반환.

**1-e. 글 변환 `aiSumToText(o)`** — 상자에 넣을 저장 형식(순수 글자 + `\n` + `<b>`)
```
<b>1. 핵심 내용</b>
ㆍ …
(빈 줄)
<b>2. 주요 수치 및 현황</b>
ㆍ 묶음 이름: …
   - 하위 …
(빈 줄)
<b>3. 비고</b>
ㆍ …
```
- 하위 항목 들여쓰기는 공백 3칸 + `- `. 비어 있는 카테고리는 `ㆍ (해당 없음)` 한 줄.

**1-f. 한 쪽 그림 `pageImageOne(doc, pageNo)`**
- `pageImages` 의 안쪽 루프 본문(뷰포트·캔버스·JPEG)을 `renderPageJpeg(page)` 로 뽑아 둘이 같이 씁니다.
- `S.pdf` 가 열려 있고 `S.sel === doc.id` 면 `S.pdf.getPage(pageNo)` 를 바로 씁니다(재로딩 없음). 아니면 IDB `files` 에서 blob 을 열고 끝나면 `destroy()`.
- 원본이 없으면(`!doc.hasPdf` 또는 blob 없음) `null` 반환 — 오류 아님, 글자만 보냅니다.

**1-g. 게이트·상태**
- `function aiSumReady(){ return String(KV.aiKey || "").trim().length >= 10; }` — `aiNoteReady` 옆.
- `S` 에 `asBusy:null, asErr:"", asErrId:null, asStep:""` 추가. 자료 바꿀 때 `S.aiErr` 를 지우는 자리(5394·6364행)에서 `S.asErr` 도 같이 지웁니다.

**1-h. 생성 `async function makeAiSum(docId, pageNo)`** — `makeAiNote` 구조 그대로
1. `d`, `aiSumReady()`, `S.asBusy` 검사. `pageNo` 를 `1..(S.pdf ? S.pdf.numPages : d.pages||1)` 로 고정.
2. `pageText = (d.pageTexts||[])[pageNo-1] || ""`. 글자도 없고 원본도 없으면 오류 "이 쪽은 글자를 뽑지 못했고 PDF 원본도 없습니다".
3. `S.asBusy = docId; S.asStep = "p 그림을 만드는 중"` → `renderRight()`.
4. `img = await pageImageOne(d, pageNo)` (try/catch — 실패하면 글자만, `src="text"`).
5. `S.asStep = "AI가 읽는 중"` → `renderRight()`.
6. `prompt = aiSumPrompt(d, pageNo, pageText, !!img)`; `opts = { json:true, images: img ? [img] : [], timeout: img ? AI_IMG_TIMEOUT : AI_TIMEOUT }`
   ```js
   try{ r = await callAINote(prompt, opts); }
   catch(err){ if(err && err.status === 400) r = await callAINote(prompt, Object.assign({}, opts, {json:false})); else throw err; }
   ```
7. `o = aiSumParse(r.text)`; null 이면 "AI가 요약 틀을 지키지 못했습니다. 다시 시도해 주세요."
8. 저장:
   ```js
   const cur = Object.assign({}, KV.sums[docId]);
   cur.pg = Object.assign({}, cur.pg, { [pageNo]: { text: aiSumToText(o), at: new Date().toISOString(), model: r.model, src: img ? "text+image" : "text" } });
   KV.sums[docId] = cur; saveKV("sums");
   ```
   (`.a`·`.b`·`.by` 는 건드리지 않습니다.)
9. toast `"AI 요약을 만들었습니다 (${pageNo}p · ${r.model})"`. 실패는 `S.asErr/asErrId`. finally 에서 `S.asBusy=null; S.asStep=""; renderRight()`.

**1단계 확인법**: file:// 로 열고 자료 하나 선택 → 콘솔 `await makeAiSum(S.sel, S.page); KV.sums[S.sel].pg` 에 3 카테고리 글이 있으면 통과. `aiSumParse('```json {"core":["a"],"figures":[],"notes":[]} ```')` 도 확인.

---

### 2단계 — UI (Opus 5 / 높음)

목표: Summary 탭에서 단추를 누르면 지금 p 요약이 만들어져 상자에 보이고, p를 넘기면 그 p 것이 보인다.

**2-a. `aiSumBlock(d, pageNo)` 다시 쓰기** — `aiNoteBlock` 과 같은 뼈대
- `rec = ((KV.sums[d.id]||{}).pg||{})[pageNo]`, `ready = aiSumReady()`, `busy = S.asBusy === d.id`, `err = S.asErrId === d.id ? S.asErr : ""`.
- `stat`: 없으면 `"${pageNo}p · 생성된 요약 없음"`, 있으면 `"${pageNo}p · 생성 09.18 14:20 · gemini-3.8-flash"` (`anWhen` 재사용, `src` 가 text 뿐이면 `· 글자만` 덧붙임). busy 면 `S.asStep`.
- 단추: `<button class="genmini" data-aisum="gen" ${dis}>` 라벨 = busy ? "생성 중…" : rec ? "Regenerate" : "Generate AI Summary". `dis = busy || !ready`.
- 첨부 단추(`data-at`, `data-attab="sum"`)는 AI NOTE 블록과 같은 자리에 함께 둡니다 (지금 Summary 탭에는 첨부 단추가 없으니 **추가하지 않습니다** — 현 상태 유지).
- `ready` 아니면 `.lock` "설정 › AI NOTE (제미나이) 에 API 키를 넣으면 켜집니다." / `err` 면 `.bad` + `data-aisum="gen"` 재시도.

**2-b. `paneSum` 교체** (약 3706행)
- 옛 `skelBlk / asText / execBox / exSections / sumTools / sumStatus` 분기를 **Summary 탭에서 떼어 냅니다.** 함수들 자체는 지우지 말고(옛 코드 유지 원칙) `paneSum` 만 새로 조립:
  ```js
  const pgRec  = ((mine.pg || {})[curPg]) || null;
  const pgText = pgRec ? pgRec.text : "";
  const paneSum = aiSumBlock(d, curPg) + `
    <div class="sect grow">
      <h4 class="aihead">
        <span class="scpage">‹ ${curPg}p / ${lastPg}p ›  (paneScript 의 .scpage 를 data-sup="prev|next" 로 복사)</span>
      </h4>
      ${ sumBox("sumP", pgText, false, "Generate AI Summary 를 누르면 이 p의 요약이 여기에 채워집니다") }
    </div>`;
  ```
- `mode` 계산(약 3814행) `tab === "sum" ? "text"` 로 고정 (`asText` 참조 제거). `data-mode="text"` 여야 상자가 세로로 채워집니다.
- 옛 `ex`·`asText`·`whenTxt`·`sumTools`·`sumStatus`·`skelBlk` 변수는 `paneSum` 에서만 안 쓰게 되면 선언째 지워도 됩니다 (다른 곳에서 참조하는지 grep 후).

**2-c. p 동기화**
- `renderRight()` 끝: `body.dataset.page = (tab === "script" || tab === "sum") ? String(curPg) : ""`.
- `syncScriptPane()`: `if(S.rtab !== "script" && S.rtab !== "sum") return;` / `if(body.dataset.tab !== S.rtab) return;` 로 넓힙니다. 함수 위 주석도 "스크립트·요약 판" 으로.

**2-d. 클릭 위임** (약 6317행 `[data-annote]` 옆)
```js
const as = e.target.closest("[data-aisum]");
if(as){ if(!S.sel) return; if(as.dataset.aisum === "gen") makeAiSum(S.sel, S.page); return; }
const sp = e.target.closest("[data-sup]");
if(sp){ scGo(S.page + (sp.dataset.sup === "next" ? 1 : -1)); return; }
```
- 이미 그 p에 요약이 있고 `Regenerate` 면 `confirm("이 p의 AI 요약이 이미 있습니다.\n새로 만들어 덮어쓸까요?")` 를 `makeAiSum` 앞(클릭 핸들러)에서 묻습니다.

**2-e. 문구**
- 설정의 "AI NOTE (제미나이)" hint 한 줄을 "회의록을 AI가 한 장으로 정리하고, Summary 탭의 p별 AI 요약도 이 키로 만듭니다." 로 고칩니다.
- `aiSumBlock` 위 주석(3584행) "아직 기능이 없어…" 삭제.

**2단계 확인법**: file:// 로 열기 → 자료 선택 → Summary 탭 → 단추 → 상태줄이 "p 그림을 만드는 중 → AI가 읽는 중" 으로 바뀌고 상자에 3 카테고리가 채워진다. ‹ › 로 p를 넘기면 뷰어도 같이 넘어가고 상자가 그 p 요약(또는 빈 안내)으로 바뀐다. 키를 지우면 단추가 잠기고 `.lock` 문구가 보인다.

---

### 3단계 — 손보기 (Sonnet 5 / 중간)

- `lockBtn("P", scHas(pgText), S.editP)` 를 `.aihead` 오른쪽에 붙입니다. `S.editP` 를 `S` 에 추가하고, `editA/B/S/M` 를 한꺼번에 false 로 만드는 자리 5곳(3837·5377·5394·6364·9756행)과 `editing()` (9769행)에 `editP` 도 넣습니다. `data-lock` 핸들러(6294행)의 `which` 분기에 `"P" → "editP"` 추가, `S.focusSum = "sumP"`.
- `SUMBOX` 에 `"sumP"` 추가. `#rbody` input 핸들러에 분기:
  ```js
  if(e.target.id === "sumP"){
    const pg = +($("#rbody").dataset.page || S.page || 1); if(!(pg > 0)) return;
    const cur = Object.assign({}, KV.sums[S.sel]); const pgs = Object.assign({}, cur.pg);
    const v = normalizeSumHtml(e.target.innerHTML);
    if(scHas(v)) pgs[pg] = Object.assign({}, pgs[pg], { text:v, editedByUser:true }); else delete pgs[pg];
    cur.pg = pgs; KV.sums[S.sel] = cur; saveKV("sums"); return;
  }
  ```
- `aiSumBlock` stat 에 `editedByUser` 면 `· 수정함`.
- 편집 중(`S.editP`)에는 `syncScriptPane` 이 다시 그리지 않도록 `editing()` 로 이미 막히는지 확인(9767행 근처).

**확인법**: Edit → 글자 고침 → 완료 → p 넘겼다 돌아와도 고친 글이 남아 있고 stat 에 "수정함".

---

### 4단계 — 점검·정리 (Sonnet 5 / 낮음)

- 원본 없는 자료(글자만 등록)에서 생성 → 글자만 보내고 stat 에 "· 글자만" 표시되는지.
- 글자도 원본도 없는 p → 친절한 오류 + 재시도 단추.
- 키 없음 / 잘못된 키 / 429 → `aiErrMsg` 문구가 `.bad` 에 나오는지.
- 백업 내보내기 → 전부 지우기 → 가져오기 → `pg` 가 돌아오는지 (자동이지만 한 번 확인).
- 자료 삭제 시 `KV.sums[id]` 정리 경로(6353행 근처)가 `pg` 도 같이 지우는지 (통째로 지우면 자동).
- `설치-사용-안내.html` 에 "Summary 탭 › Generate AI Summary" 한 줄 추가.
- 커밋 메시지 예: `Summary 탭 p별 AI 요약 — Generate AI Summary 단추(글자+p그림 → 제미나이, 핵심 내용/주요 수치 및 현황/비고), p 이동·동기화, Edit, KV.sums[id].pg 저장`
- 메모리 `ai-summary-rework.md` 갱신: "p별 AI Summary 는 2026-09-18 부활(별도 경로 `makeAiSum`), `AI_SUMMARY_ENABLED` 는 여전히 false".

---

## 3. 사용자가 원하는 결과 형식 (화면에 이렇게 보여야 합니다)

```
1. 핵심 내용
ㆍ '26년 6월 누계 실적 및 7월 추정 실적 모두 전년 대비 성장, 계획 대비 초과 달성하며 양호한 수익성을 기록 중.
ㆍ 다수 팀의 흑자전환 및 목표 초과 달성이 실적을 견인 중이나, 일부 팀(GFS, FW 부문 등)은 추가 개선 필요.

2. 주요 수치 및 현황
ㆍ 6월 누계 실적: 매출액 9,099억 원(계획비 107.2%), 영업이익 327억 원(계획비 118.3%)
ㆍ 7월 누계 추정 실적: 매출액 10,787억 원(전년비 +9.7%, 계획비 107.3%), 영업이익 402억 원(전년비 +17.6%, 계획비 117.2%)
ㆍ 주요 팀별 특이사항:
   - TLS운영1팀: 영업이익 106억 원(흑자전환)
   - 유통3팀: 영업이익 112억 원(계획비 212.6% 달성)
   - GFS: 영업이익 106억 원(계획비 75.5%로 미달성)

3. 비고
ㆍ 6월 2차 확정 영업이익은 46억 원으로 1차 확정 대비 7억 원 증가함.
ㆍ 동남권/덕평센터 사용률 조정(17억 원) 미반영 시 본부 7월 누계 영업이익은 419억 원(계획비 121.9%)으로 추산됨.
```

## 4. 프롬프트에 넣을 예시 3개 (사용자 제공 원문 — 그대로 씁니다)

### 예시 A — 본부 손익 현황 (표 중심 p)
1. 핵심 내용
* '26년 6월 누계 실적 및 7월 추정 실적 모두 전년 대비 성장, 계획 대비 초과 달성하며 양호한 수익성을 기록 중.
* 다수 팀의 흑자전환 및 목표 초과 달성이 실적을 견인 중이나, 일부 팀(GFS, FW 부문 등)은 추가 개선 필요.
2. 주요 수치 및 현황
* 6월 누계 실적: 매출액 9,099억 원(계획비 107.2%), 영업이익 327억 원(계획비 118.3%)
* 7월 누계 추정 실적: 매출액 10,787억 원(전년비 +9.7%, 계획비 107.3%), 영업이익 402억 원(전년비 +17.6%, 계획비 117.2%)
* 주요 팀별 특이사항:
   * TLS운영1팀: 영업이익 106억 원(흑자전환)
   * 유통3팀: 영업이익 112억 원(계획비 212.6% 달성)
   * GFS: 영업이익 106억 원(계획비 75.5%로 미달성)
3. 비고
* 6월 2차 확정 영업이익은 46억 원으로 1차 확정 대비 7억 원 증가함.
* 동남권/덕평센터 사용률 조정(17억 원) 미반영 시 본부 7월 누계 영업이익은 419억 원(계획비 121.9%)으로 추산됨.

### 예시 B — 2PL 운영 및 3PL 영업 현황 (표 2~3개 + 글머리)
1. 핵심 내용
* 하반기 운임 인상 요구에 대해 적절히 방어하며 지속적인 원가 절감 추진 중.
* 3PL 신규 수주가 다수 발생하여 매출 확대에 기여 중이며, 대형 고객사 대상 견적 조율 활발히 진행 중.
2. 주요 수치 및 현황
* 하반기 운영 이슈 (원가 방어 및 절감):
   * 운임 인상: 화물연대 요구안(55.6억 원) 대비 4% 인상 수준인 25.2억 원으로 협의 진행 중(13.7억 원 방어)
   * 원가절감: K-7 배송코스 효율화 및 3PL 영역 확장을 통해 연간 3.9억 원 규모 절감 진행
   * 수수료 협의: 총 32건 계약 중 26건(81.3%) 동결 협의 완료
* 3PL 수주 및 영업 현황 (8월 누계):
   * 총 수주 규모: 매출 261억 원, 이익 11.8억 원 달성 (우아한 청년들 220억 원 등)
   * 진행 중인 주요 영업: 동원홈푸드(매출 30억 규모, 견적 조율 완료), 위펀(매출 15억 규모, 제안 예정)
3. 비고
* 외부 원가 인상 리스크(운임 등) 대비 실제 반영 비율을 낮춰 이익 훼손을 최소화하고 있음.

### 예시 C — TLS영업부문 중점 영업 사항 (카드형 p)
1. 핵심 내용
* 더파운더즈, 신성통상, 한화퓨어플러스 등 3개 핵심 타겟 고객사 대상 맞춤형 전략(자동화, 노무 리스크 헷지, 네트워크 활용)을 통한 제안 진행 중.
2. 주요 수치 및 현황
* 더파운더즈 (연 192억 규모):
   * 현황: 숏리스트 진입 완료
   * 영업 전략: 지역 4개 센터를 1개 통합센터(20,000평 규모)로 통합 운영 제안, 3D Loop Sorter 등 B2C 부분 자동화를 통한 CAPA 확대 제안
   * 일정: 8월 10일 제안 PT, 8월 13일 현장 실사 진행
* 신성통상 (연 700억 규모):
   * 현황: 지인(대리점협력팀장) 영업 진행 중
   * 영업 전략: 직고용 직원 노무 Risk 최소화를 위한 3PL 전환 제안. 단계별 운영 확대(Step 1 천안, Step 2 안성) 전략 활용
* 한화퓨어플러스 (연 20억 규모):
   * 현황: 現 대표 소개를 통한 진입
   * 영업 전략: OEM 및 PB 사업 확대 니즈에 맞춘 운송 제안
   * 일정: 8월 24일 칠성 OEM 미팅 및 제안 예정
3. 비고
* 고객사별 Pain Point(물량 증가 대응, 노무 이슈, 사업 확대)를 정확히 타겟팅하여 구체적인 물류 솔루션(자동화 설비, 단계별 거점 활용) 제시 중.

---

## 5. 진행 기록

| 단계 | 상태 | 날짜 | 메모 |
|---|---|---|---|
| 1 | 완료 | 2026-09-18 | `AI_NUM_RULES`·`renderPageJpeg`·`AS_LIM/AS_SHAPE/AS_EXAMPLES`·`aiSumPrompt/aiSumParse/aiSumToText`·`pageImageOne`·`aiSumReady`·`makeAiSum`·`S.as*` 추가. 새 블록은 `makeAiNote` 바로 뒤에 한 덩어리로 둠. 파서·프롬프트는 브라우저에서 단위 확인, 실제 제미나이 호출은 사용자 콘솔 확인 대기 |
| 2 | 완료 | 2026-09-18 | `aiSumBlock(d, pageNo)` 활성화(상태줄·Generate/Regenerate·lock·bad), `paneSum` 을 p별 상자(`sumP`, 읽기 전용)+`.scpage` ‹ › 로 교체(옛 ex/asText/sumTools 선언은 남김, `mode` 는 `"text"` 고정), `body.dataset.page`·`syncScriptPane` 을 sum 탭까지 확장(`rtabOf` 로 정규화), `[data-aisum]` 클릭 위임(이미 있으면 confirm 후 덮어쓰기, ‹ › 는 기존 `data-scp` 재사용), 설정 hint 문구 수정. esprima 로 구문 확인만 했고 실제 클릭 확인은 사용자 대기 |
| 3 | 완료 | 2026-09-18 | `paneSum` 의 `.aihead` 에 `lockBtn("P", scHas(pgText), S.editP)` 추가, `sumBox("sumP", …)` 를 `S.editP` 로 편집 가능하게 바꾸고 편집 중 tip 문구 추가. `S` 초기값에 `editP:false`. `SUMBOX` 에 `"sumP"` 추가(Ctrl+B/U·Enter·붙여넣기 처리 자동 적용). `#rbody` input 핸들러에 `sumP` 분기(다른 자료 id로 쓰지 않고 `KV.sums[id].pg[page]` 에 `editedByUser:true` 로 저장). `data-lock` 클릭 핸들러의 `which`/`focusSum` 매핑에 `"P"→"editP"` 추가(`focusSum = "sum"+k` 로 단순화, 기존 A/B/S/M 도 동일 동작). `editA/B/S/M=false` 로 한꺼번에 잠그는 5곳(탭 전환·자료 선택·자료 닫기·자료 삭제·동기화로 자료 사라짐) 모두에 `S.editP=false` 추가. `syncRenderSoon` 의 `editing()` 에 `S.editP` 추가. `aiSumBlock` 의 stat 줄(`· 수정함`)은 1단계에서 이미 구현돼 있어 손대지 않음. `syncScriptPane` 은 쪽 번호가 바뀔 때만 다시 그리므로(입력 중엔 쪽이 안 바뀜) 추가 가드 없이도 편집 중 값이 사라지지 않음(확인만 하고 코드 변경 없음). 실제 클릭·Edit·완료 왕복 확인은 사용자 대기 |
| 4 | 완료 | 2026-09-18 | 오류 경로(`aiErrMsg`)·원본 없는 자료(글자만, `src` 표기)·글자·원본 모두 없는 p 는 이미 1단계 `makeAiSum` 에서 처리돼 있음을 코드로 재확인(추가 수정 없음). 백업 export/import 는 `meta.kv.sums`·`SYNC_KV_KEYS` 에 이미 포함(재확인만). 자료 삭제 시 `delete KV.sums[id]`(6421행)로 `pg` 도 통째 삭제됨을 확인. `설치-사용-안내.html` 에 "AI 요약 — SUMMARY 탭 → Generate AI Summary" 행 추가. 메모리 `ai-summary-rework.md` 갱신. 커밋 예정 |
