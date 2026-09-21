# AI SCRIPT (발표 스크립트 생성) — 작업계획 · 인수인계 문서

작성 2026-09-21. Script 탭의 'Generate AI SCRIPT' 를 살려, 팝업에서 발표자·청중·어조·분량·범위를 고르면
제미나이가 자료(글자 + p 그림)를 읽고 쪽마다 발표 스크립트를 써 주고, 팝업에서 고친 뒤 **Input** 을 누르면
오른쪽 Script 탭의 p별 글상자(`KV.scripts[자료 id][p]`)에 들어가는 기능입니다.

---

## 0. 이 앱에 대해 꼭 먼저 알 것

- 앱 본체는 **`whats-the-strategy.html` 단일 파일**(HTML+CSS+JS 한 덩어리, 약 12,000행)입니다. 여기만 고칩니다.
- **반드시 `file://` 로 열어서 확인합니다.** localhost 로 열면 IndexedDB 출처가 달라 자료가 하나도 안 보입니다.
  실제 주소: `file:///D:/Documents/Coding%20Projects/Strategy%20Library/whats-the-strategy.html`
- 주석은 **한국어 · 존댓말 · 비개발자도 읽히는 말투**로 씁니다. **라운드(border-radius)는 어디에도 쓰지 않습니다.**
- 행 번호는 2026-09-21 기준 근사치입니다. 반드시 `grep` 으로 다시 찾고 시작하세요.

## 0-1. 확정된 결정사항 (2026-09-21 사용자 승인)

1. **범위는 팝업에서 선택** — `이 p만`(기본, 지금 보는 쪽) / `전체 자료` / `p 범위(from~to)`. 전체·범위면 결과가 p별로 나뉘고 Input 시 각 p에 저장.
2. **팝업 1개, 2단계 전환** — 옵션 화면 → 생성 중 → 결과 화면(쪽별 수정 가능 글상자, `‹ 옵션` · `다시 만들기` · `Input`).
3. **Input 때 그 p에 이미 글이 있으면 confirm 한 번 후 덮어쓰기.** 취소하면 아무것도 안 함.
4. **마지막 발표자·청중·어조·분량은 기기별로 기억** — `KV.scriptOpts`. `SYNC_KV_KEYS`·백업 내보내기에는 넣지 않음. 범위는 기억하지 않음.
5. 어조 선택지: 전문적인 · 설득력 있게 · 단호하게 · 객관적인 · 설명적인 · 친근한 · 대화하는 듯한 · 열정적인 · 영감을 주는 (복수) + 기타(주관식).
   분량 선택지: 1분 · 2분 · 3분 · 5분 · 10분 (단일) + 기타(주관식, "90초"·"7분" 처럼 적으면 분으로 읽음).

### 구현하면서 정한 가정
- **분량은 선택한 범위 전체의 발표 시간**(쪽당 아님). 분당 270자 기준으로 목표 글자 수를 프롬프트에 주되, **쪽당 최소 120자** 바닥을 둡니다
  (바닥이 이기면 실제 분량이 늘어나고, 옵션 화면 힌트에 "실제 약 N분" 으로 보여 줍니다).
- **스크립트에는 만든 시각·모델을 저장하지 않습니다.** `KV.scripts` 값이 문자열이라 넣을 자리가 없고, 형식을 바꾸면 저장·백업·동기화 전부를 건드려야 합니다.
  결과 메타(`at`·`model`·`src`)는 `S.sc.res` 에만 있는 화면 상태입니다.
- 제미나이 호출은 **한 번**(범위 전체를 한 요청에) — 첫 p 인사·마지막 p 마무리·쪽 사이 연결을 위해 나누지 않습니다. 그림은 `AI_IMG_PAGES`(20)쪽까지만.
- 만드는 중에도 헤더 단추가 눌립니다(팝업에서 진행 상태를 보여 줌). 창을 닫아도 계속 만들고, 끝나면 toast + 헤더 단추가 "결과 보기" 로 바뀝니다.

## 0-2. 절대 하지 말 것

- `callAI()` 를 직접 부르지 마세요 — `callAINote()`(모델 폴백 사다리)만 씁니다.
- `AI_SUMMARY_ENABLED` 를 `true` 로 바꾸지 마세요. `makeSummary/aiPrompt/AI_SHAPE` 를 재사용하지 마세요.
- 팝업의 결과 글상자에 `sumBox()` / `id="sumS"` 를 쓰지 마세요 — `#rbody` 의 input 핸들러가 그 id 로 스크립트를 저장합니다. 팝업은 `data-scbox="p"` 를 씁니다.
- `KV.scriptOpts` 를 `SYNC_KV_KEYS`·`exportBackup` 에 넣지 마세요 (기기별).
- `KV.scripts` 값 형식(문자열)을 바꾸지 마세요.

## 0-3. 코드 지도 (2026-09-21 기준)

| 항목 | 위치 |
|---|---|
| 상태 | `const S` 안 `sc:{ open, view, docId, page, opts, busy, step, err, res }` (약 2969행). `KV_DEFAULT.scriptOpts:{}` + `loadKV` 얕은 복사 (약 2825·2856행) |
| 헤더 단추 | `aiScriptBlock(d, pageNo)` (약 3768행) — `renderRight()` 의 `paneScript` 에서 `aiScriptBlock(d, curPg)`. `.stat` 은 `Np · 스크립트 있음/없음` / 생성 단계 / `결과 준비됨 · N쪽 · 생성 시각 · 모델` |
| 클릭 위임 | `#rbody` click 안 `[data-aiscript]` (약 6792행) → `openAiScript(S.sel, pg)` |
| 그림 라벨 | `callAI` 의 `o.pageNos` (약 7195행) — 있으면 `[3p]` 처럼 실제 쪽 번호, 없으면 예전처럼 `[1쪽]` (기존 호출 불변) |
| 상수·도우미 | `SC_TONES · SC_LENGTHS · SC_CPM · SC_MIN_PP · SC_LIM · SC_SHAPE`, `scTargetChars` · `scParseMinutes` · `scMinutesOf` · `scLastPage` · `scPageNosOf` (약 8400행~) |
| 그림 여러 쪽 | `pageImagesOf(doc, pageNos, onStep)` (약 8457행) — 뷰어의 `S.pdf` 를 붙잡아 쓰다 닫히면 IDB 원본을 한 번 열어 이어감 |
| 프롬프트 | `aiScriptPrompt(doc, pages, opts, imgPageNos, meta)` (약 8494행). 쪽당 글자 클립 `max(textMin, textTotal/쪽수)`, 전체 `textCap` |
| 파싱 | `aiScriptParse(text, pageNos)` (약 8562행) → `{ scripts:{p:글}, cut }`. 마크다운 마커·글머리 제거, 요청한 쪽만 |
| 생성 | `makeAiScript(docId, opts)` (약 8605행). 콘솔: `await makeAiScript(S.sel, { range:"page", page:S.page, minutes:1, tones:["전문적인"] })` |
| 팝업 HTML/CSS | `#aiscriptbg` (약 2166행), CSS `/* AI SCRIPT 팝업 */` (약 1145행) — `.sctog · .scchips · .scrange · .schint · .scmeta · .scres · .scph` |
| 팝업 JS | `scDefaultOpts · openAiScript · closeAiScript · readScOpts · scHintText · renderAiScript · scGenerate · scInput` + `#aiscriptbg` click/input/keydown/paste 위임 (약 8978~9230행) |
| Esc | 전역 keydown 체인에 `#aiscriptbg` (약 11878행, `#ainotebg` 다음) |

## 1. 단계 (모두 완료)

| 단계 | 내용 | 상태 |
|---|---|---|
| 1 | 상태 `S.sc` · `KV.scriptOpts` | 완료 |
| 2 | `callAI` 실제 쪽 번호 라벨(`pageNos`) | 완료 |
| 3 | 백엔드 — 상수·`pageImagesOf`·`aiScriptPrompt`·`aiScriptParse`·`makeAiScript` | 완료 |
| 4 | 헤더 단추 활성화 + 클릭 위임 | 완료 |
| 5 | 팝업 HTML·CSS·JS(옵션/결과 화면, Input, Esc) | 완료 |
| 6 | 검증(가짜 제미나이로 흐름 전부) · 커밋 | 완료 |

## 2. 진행 기록

### 2026-09-21 — 전체 구현
- localhost 에서 가짜 `callAINote` 로 확인한 것: 옵션 칩(어조 복수·분량 단일·범위 단일, 기타 입력 시 분량 칩 해제, 범위 칩에서 from~to 노출),
  분량 힌트 계산, 생성 중 헤더 "생성 중…" + 팝업 `.aibusy`, 만드는 중 Esc 로 닫고 다른 자료에서 열면 toast, 실패 시 헤더 `.bad` + 다시 시도 → 팝업 오류 상자,
  결과 화면(쪽별 상자, "이미 있음" 배지, 건너뛴 쪽 안내), 상자 고친 뒤 `‹ 옵션` → `결과 보기 ›` 로 돌아와도 유지, 비운 상자는 Input 때 건너뜀,
  Input 의 confirm(취소 → 그대로 / 승인 → 덮어씀), Input 후 팝업 닫힘·`S.editS=false`·SCRIPTED 칩 갱신·한 쪽이면 그 쪽으로 이동, 옵션 기억(재열기 시 채워짐).
- 실제 제미나이 호출·PDF 그림(`pageImagesOf`)은 file:// 에서 사용자가 직접 확인해야 합니다 (localhost 엔 자료가 없음).

### 남은 확인 (사용자)
1. file:// 로 열어 Script 탭 → Generate AI SCRIPT → 이 p만 · 3분 → 결과가 구어체 존댓말 문단인지, 810자 안팎인지, `**`·글머리표가 없는지.
2. 범위 3~5p → 첫 p 인사·마지막 p 마무리·연결어. PDF 원본 있는 자료에서 그림이 같이 가는지(결과 머리 "글자+그림").
3. 결과가 자주 틀을 어기면(`AI가 스크립트 틀을 지키지 못했습니다`) `aiScriptPrompt` 의 "결과 틀" 문구를 보강합니다.
