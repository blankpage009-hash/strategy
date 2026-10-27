# 자료 관리 팝업 v2 — 작업계획 (인수인계 문서)

작성 2026-10-27. 이 문서 하나만 읽으면 새 창에서 바로 단계 작업을 시작할 수 있습니다.

---

## 0. 이 앱에 대해 꼭 먼저 알 것

- 앱 본체는 **`whats-the-strategy.html` 단일 파일**(HTML+CSS+JS 한 덩어리, 약 13,800행)입니다. 여기만 고칩니다.
- 새 창은 **저장소 루트**(`D:\Documents\Code\Strategy Library`)에서 시작합니다. 하위 폴더에서 시작하면 `.claude/launch.json`·서버 경로가 어긋납니다.
- 주석은 **한국어 · 존댓말 · 비개발자도 읽히는 말투**로 씁니다(기존 파일 전체가 그 문체). **라운드(border-radius)는 쓰지 않습니다.** 디자인 토큰은 앱 `:root` 것을 씁니다(`--accent --accent-ink --accent-soft --accent-line --line --hairline --panel --panel2 --surface --muted --bad --ink` 등 — 시안과 같은 계열).
- 디자인 원본: `design_handoff_strategy_viewer/9-manage-v2-static.html` (번들 시안 `자료관리 팝업 v2 (standalone).html` 을 `tools/unpack-bundle.py` 로 푼 것). 폰트가 data URI 로 박혀 커서(3MB) 통째로 읽지 말고, 맨 아래 `<style>` 의 `:root{--bg…` 블록과 `<script>` 의 `render()` 부분만 `grep -n` 으로 찾아 읽으세요.
- **작업 트리에 이번 일과 무관한 변경**(`.gitignore`, 지운 html, `Logo.png`, `배포/` 등)이 있습니다. 커밋은 **`whats-the-strategy.html` · `PLAN-MANAGE-V2.md` 만 지정해서** 스테이징합니다(`git add -A`/`commit -a` 금지).

## 0-1. 현재 코드에서 이미 확인된 사실 (다시 조사하지 말 것) — 행 번호는 작성 시점 기준

| 항목 | 위치 · 내용 |
|---|---|
| CSS | `/* ---------- 자료 관리(Manage) ---------- */` 1532~1579행. `#mghintbtn` 은 1543~1549행에서 **모바일에서만** 보임. 모바일 화면 가득 규칙 1988~1993행(`body.m[data-mscr="manage"]`). |
| HTML | `<!-- 자료 관리 -->` 2935~2970행. `#managebg > .modal.wide` · 머리 `.hd-t`(`.hd-k`/`.hd-n`) + `#mgclose` + `#mghintbtn` · `#mghint` · `#mgfilters`(영역 `#mgfarea` / 폴더 `#mgffolder` / 종류 `#mgfcat` / 연도 `#mgfyear` / 월 `#mgfmonth`, 각 `.mgfgroup #mgg-*`) · `#mgtools`(`#mgsearch` · 체크박스 `#mgnopdf` · 체크박스 `#mgall` · `#mgcount`) · `#mglist` · footer(`#mgdetachsel` · `#mgdelsel` · `#mgdone`) |
| JS 구획 | `4-2) 자료 관리(Manage)` 6711~6991행. `mgCatOptions` · `mgYearOptions` · `mgMeta` · `mgCatList` · `mgYearList` · `mgFilterSelects` · `mgRows` · `mgChecked`(DOM 체크 기준) · `mgSyncSel` · `mgMoving`(Set) · `mgFolderPick` · `mgBot(d)`(줄 아래 드롭다운 / 이동 칸) · `mgRender` · `mgSaveDoc(d)` · `openManage` · `closeManage` · 최상위 리스너(6869~6888) · `#mglist` change(6890~6922: title/folder/cat/year·month·week 즉시 저장) · `#mglist` click(6924~6973: 이동·다운로드·원본 비우기·삭제) · `#mgdelsel`/`#mgdetachsel` onclick |
| 재사용할 것 | `mgSaveDoc(d)`(실패 시 되돌림·목록 다시 그림), `removeDoc(id)` + `saveKV("tasks"/"sums"/"scripts")`, `detachPdf(id)`, `downloadPdfOf(d)`, `pickFolder(v)`(셀렉트의 `새 폴더…` 처리), `docDataDesc(d)`, `folderOptions/catOptions/yearOptions/monthOptions/weekOptions`, `yearOf/monthOf/weekOf/mkDate/weekOfDate`, `isProj(d)`, `projFolderList()`(`{id,name}`) · `projFolderOf(d)`, `projOpenKey(id)` + `S.open` + `KV.folders`, `revealDoc(id)`, `renderAll/renderTree/renderRight/updateBars`, `toast`, `esc`, `sel`, `$`/`$$` |
| 바깥에서 부르는 이름 | `openManage()` · `closeManage()` · `mgRender()` — 6621·6633행(열려 있으면 다시 그림), 13728행 모바일 화면 표(`manage: { bg:"#managebg", open, close }`), `#btn-manage`. **이름을 바꾸지 마세요.** |
| 문서 필드 | 회의자료: `d.cat`, `d.date`, `d.week`. 프로젝트: `d.folder`(폴더 id), `d.cat=""`. 원본 유무 `d.hasPdf`, 쪽수 `d.pages`. `yearOf/monthOf/weekOf` 는 **문자열일 수 있음** → 비교 전 `+` 변환. |
| 도움말 | 13265행(Upload 안내 중 "자료 관리 에서 … 옮길 수 있습니다"), 13428행 `no:"10", nav:"자료 관리"` 항목, 13506행 `자료 관리 → 선택 원본 비우기` |

## 0-2. 확정된 결정사항

1. **줄 편집은 시안대로** — 줄에는 이름 칸만(즉시 저장). 종류·날짜·폴더 변경은 줄 끝 `자료 이동` 패널에서 `옮기기` 로 적용. 패널에서 같은 영역(회의→회의, 프로젝트→프로젝트)도 고를 수 있음.
2. **정렬은 시안대로** — 연도는 최신순, 연도 안의 월·주차는 오름차순(4월→10월), 같은 주차는 제목순.
3. **모바일도 이번에 함께 맞춤**(4단계).
4. 선택은 상태 `Set`(`MG.sel`)으로 들고 다님 — 묶음을 접어도 유지. 단, **`mgRows()` 결과(필터·검색 통과)에 없는 id 는 선택에서 뺌** — 안 보이는 자료가 `선택 삭제`에 섞이지 않게(시안과 다른 유일한 점).
5. 단추 이름은 시안대로: `PDF 원본만 삭제`, `자료 이동`, `삭제`, `선택 PDF 원본만 삭제 (n개)`, `선택 삭제 (n개)`. 확인창(confirm) 문구는 지금 앱 것을 살려 이름만 맞춤.
6. 설명(`#mghint`)은 시안 문구를 그대로 쓰지 않음(시안은 종류·날짜도 즉시 저장이라 결정 1과 어긋남). 3단계 문구 참고.

---

## 1. 전체 단계 (6단계, 모두 같은 파일이라 순서대로 한 창씩)

| # | 단계 | 난이도 | 추천 모델 / 노력 |
|---|---|---|---|
| 0 | 시안 풀기 · 이 문서 작성 | 하 | Opus 5.5 / 중간 |
| 1 | 머리 i 단추 · 탭 · 칩 필터 · 도구 줄 + 상태 객체 | 중 | Sonnet 5.5 / 높음 |
| 2 | 목록 — 연·월/폴더 묶음 · 접기 · 선택 줄 · 한 줄 행 · 아래 단추 | 상 | Opus 5.5 / 높음 |
| 3 | `자료 이동` 패널 — 세그먼트 · 같은 영역 변경 · 저장 연결 · 설명 문구 | 중 | Sonnet 5.5 / 높음 |
| 4 | 모바일(`body.m`) 맞춤 — 두 줄 행 · 칩 가로 넘김 · 손가락 크기 | 중 | Sonnet 5.5 / 중간 |
| 5 | 통합 점검 · 도움말 문구 정리 · 마무리 커밋 | 하 | Sonnet 5.5 / 중간 |

**각 단계는 한 창에서 하나만 합니다. 끝나면 아래 진행 현황 표를 채우고 커밋합니다. 다음 단계를 몰아서 하지 마세요.**

---

## 1-1. 진행 현황

| 단계 | 상태 | 커밋 | 남긴 것 |
|---|---|---|---|
| 0 | ✅ 완료 | — | `design_handoff_strategy_viewer/9-manage-v2-static.html` 생성, 이 문서 작성 |
| 1 | ✅ 완료 | `2898690` | **상태** `const MG = { tab, on:{meet,proj}, known:{meet,proj}, q, nopdf, closed:Set, sel:Set, moving:Set }` — `on[탭]===null` 이 "칩 전부 켜짐(거르지 않음)", 칩을 전부 켜면 다시 null 로 돌아감. `known` 은 칩으로 본 키 집합이라 새 종류·새 폴더는 일부만 켠 상태에서도 켜진 채 들어옴(`mgSyncKeys()`, `mgRender` 첫 줄). `closed`·`sel` 은 아직 `openManage`/탭 전환에서 비우기만 하고 **2단계에서 쓰기 시작**(선택은 지금도 DOM 체크 기준 `mgChecked()`). **함수** `mgKeys(tab)` · `mgKeyName(tab,k)` · `mgKeyOf(d)` · `mgTabDocs(tab)` · `mgSyncKeys()` · `mgChips()`(칩 HTML) · `mgRows()`(탭→칩→원본없음→검색, 정렬은 옛 그대로 날짜 내림차순) · `mgRender()`(탭 개수·라벨·칩·`원본 없는 자료만` 토글·`n개 표시` 갱신 후 옛 두 줄 행을 그림). `mgFilterSelects`·`mgYearList` 삭제, `mgMoving` → `MG.moving`. **id** `#mghint`(머리 아래 밴드, `.open` 이면 표시) · `#mghintbtn`(머리 ✕ 앞, 모바일은 옛 위치 유지) · `.mgtabs > button[data-mgtab]` + `#mgn-meet #mgn-proj` · `.mgfilt > #mgflabel + #mgchips`(`.mgchip[data-k]`, 전체 칩 `.mgchip.all[data-all]`) · `#mgtools`: `#mgsearch` `#mgnopdf`(토글 `button.mgtbtn.on`) `#mgfold`(**`hidden` — 2단계에서 보이게 하고 동작 연결**) `#mgcount`. 지운 id(`#mgfarea #mgffolder #mgfcat #mgfyear #mgfmonth #mgall #mgg-*`, 체크박스 `#mgnopdf`) grep 0건, 로드·열기 콘솔 오류 0. 탭 바꾸면 `MG.sel/moving` 비움. 목록 행은 아직 옛 두 줄 그대로. |
| 2 | ✅ 완료 | (이 단계 커밋) | **창 배치** `#managebg .modal` 980px · 높이 `min(860px,88vh)` 고정, `#managebg .content` 는 굴러가지 않는 세로 flex(padding 0) — 탭·칩·도구 줄은 제자리, **`#mglist` 만 굴러감**(`.mgfilt`/`#mgtools` 는 margin 대신 padding, `#mgtools` 아래 굵은 선). **정렬** `mgRows()` 안에서: 회의 `+yearOf` 내림 → `monthOf` 오름 → `+weekOf` 오름 → 제목(`localeCompare ko numeric`), 프로젝트 `projFolderList()` 순서 → 제목. **묶음 키** `mgYKey(d)`=`y2026`(날짜 없으면 `y0`, 라벨 `날짜 없음`) · `mgMKey(d)`=`y2026m10` · `mgFKey(d)`=`f<폴더id>` · `mgInGroup(d,g)` · `mgGroupKeys(rows)`(접힌 연도 안 월 키까지 — 모두 접기/라벨은 DOM 이 아니라 이걸로). **그리기** `mgGroupH(cls,g,label,items)`(`.mgyr`/`.mggrp[data-g]` > `.mgcar` ▼ · `input.mggchk` · 이름 · `.n`) · `mgRowH(d)`(`.mgrow[data-id]` > `.mgchk` · `.mgwk`(회의만) · `.mgname[data-f=title]` · `.meta`(`<b>종류</b>`(빈 종류는 `종류 없음`) · `글자만`) · `.mgrb.mgdown` · `.mgrb.mgdetach` · `.mgrb.mgmove(.on)` · `.mgrb.mgdel`, 원본 없으면 앞 둘 disabled). 맨 위 sticky `.mgselbar` > `#mgall`(보이는 자료 = `mgRows()` 전부, 접힌 것 포함) · `.n` `n개 선택됨` · `#mgclr`. **선택** `MG.sel` 기준, `mgChecked = () => [...MG.sel]`. `mgRender` 첫머리에서 `mgRows()` 에 없는 id 만 뺌(접어도 유지 · 칩/검색/원본없음으로 숨으면 빠짐 — 확인함). `mgSyncSel` 은 없애고 아래 단추 문구는 `mgRender` 끝에서 갱신. `#mgdetachsel` 뒤 `MG.sel.clear()`, `#mgdelsel`·줄 삭제 뒤 해당 id 를 `sel`/`moving` 에서 뺌. **접기** 머리 클릭(`.mggchk` 클릭 제외)으로 `MG.closed` 토글, `#mgfold` 보이게 · 지금 목록 키 중 하나라도 접혀 있으면 `모두 펼치기`(→ `closed.clear()`), 아니면 `모두 접기`(→ `mgGroupKeys` 전부 추가), 목록이 비면 disabled. **이벤트** `#mglist` change 하나(`#mgall` · `.mggchk`(키로 `mgRows()` 를 걸러 켜고 끔) · `.mgchk` · `data-f=title` 즉시 저장, 빈 이름 막기) / click 하나(`#mgclr` → 묶음 머리 → `closest("[data-id]")` 로 자료 찾음). 옛 줄 드롭다운(`data-f=cat|year|month|week|folder`) 처리 코드와 `mgMeta`·`.mgtop` CSS 는 지움. **3단계에 넘길 것** `자료 이동` 은 지금 옛 이동 칸을 그대로 씀: `mgBot(d)`(이동 중 갈래만 남김, `mgFolderPick` 사용)를 `mgRowH` 가 줄 **바로 다음 형제** `<div class="mgbot" data-id>` 로 붙이고, `.mgmoveok/.mgmovecancel` 은 `host = closest("[data-id]")` 에서 `destcat/destyear/destmonth/destweek/destfolder` 를 찾음 — 3단계는 이 `mgBot`·`.mgbot`·`.mgmoveok/.mgmovecancel` CSS 와 click 의 `mgmoveok` 갈래를 `mgMoveP(d)` 로 바꾸면 됨. `.mgmove` 는 이미 토글(다시 누르면 닫힘). `mgCatOptions`·`mgYearOptions` 는 지금 안 쓰지만 3단계용으로 남김. 줄 `.mgmove` title 은 아직 `회의 자료 ↔ 프로젝트로 옮기기`(3단계에서 고칠 것). **문구** 확인창·토스트를 `PDF 원본만 삭제`/`PDF 원본을 삭제했습니다`/`PDF 원본 n개를 삭제했습니다` 로 맞춤. 도움말 13559·13562·13628행 `선택 원본 비우기` 는 5단계 몫으로 남김. **토큰** `--del` 이 앱에 없어 삭제 빨강은 `--bad`(채운 상태 글자 `--surface`), `자료 이동.on` 은 `--areabar/--areabar-ink`. **모바일** 아직 손대지 않음 — 375px 에서 한 줄 행이 넘침(4단계). **확인** 가짜 DOCS(2025·2026 여러 월·종류, 문자열 주차, 원본 없음 2, 종류 빈 것 1, 프로젝트 폴더 2)로 정렬·묶음·접기·모두 접기/펼치기·묶음/전체 선택·필터로 숨으면 선택 빠짐·접어도 유지·탭 전환 시 선택 비움·행 단추 4개(원본 없으면 비활성)·아래 단추 개수 문구·이동 칸 열기/취소/옮기기(회의→프로젝트)·이름 저장/빈 이름 막기·다크 테마, 콘솔 오류 0. **덧붙임** 1단계 탭의 `var(--ink,#222)` 는 앱에 `--ink` 토큰이 없어 다크에서 켜진 탭이 회색으로 흐림 — 5단계 점검 때 `--areabar/--areabar-ink` 로 바꿀 것. |
| 3 | ⬜ 대기 | | |
| 4 | ⬜ 대기 | | |
| 5 | ⬜ 대기 | | |

---

## 2. v2 시안 요약

- 머리: `자료 관리` + **i 단추**(설명 펼침, 데스크톱에도) + ✕
- **탭 2칸**: `회의자료 n` / `프로젝트 n`(영역 드롭다운 대체). 켜진 탭은 검정 바탕 흰 글씨. 탭을 바꾸면 선택·이동 중 상태를 비움.
- **칩 필터**(여러 개 켜고 끄기): 라벨 `종류`(회의자료) / `폴더`(프로젝트), 칩마다 개수, 맨 앞에 **전체 켜기/끄기 칩**(체크 두 개 SVG 아이콘). 켜진 칩 = `--accent-soft` 바탕 · `--accent` 테두리 · `--accent-ink` 글씨. 연도·월 드롭다운은 없어짐.
- 도구 줄: 검색칸(`이름으로 걸러내기`) · `원본 없는 자료만`(토글 단추) · `모두 접기`/`모두 펼치기` · `n개 표시`
- 목록: 회의자료 = **연도(`.yr`, 회색 띠 15px 800) → 월(`.grp`, 13.5px 700)** 묶음, 프로젝트 = **폴더(`.yr` 모양)** 묶음. 묶음 머리 = ▼(접히면 -90°) · 묶음 전체 선택 체크 · 이름 · 오른쪽 개수.
  맨 위 sticky 선택 줄: `보이는 자료 전체 선택` · (오른쪽) `n개 선택됨` · `선택 해제`
- 자료 한 줄(`.row`, 왼쪽 40px 들여쓰기): 체크 · `W주차` 태그(30×20, 회의자료만) · 이름 입력칸(42%) · 메타(`<b>종류</b> · 글자만`) · `다운로드` · `PDF 원본만 삭제` · `자료 이동`(펼치면 검정) · `삭제`(빨강 `--del` 테두리, hover 채움). 원본 없으면 앞 두 단추 disabled. 선택된 줄은 `--accent-soft` 바탕.
- `자료 이동` 패널(`.movep`, 줄 아래 흰 띠): `이동 위치` 라벨 · `회의자료 | 프로젝트` 세그먼트 → 회의자료면 종류·연·월·주차 셀렉트, 프로젝트면 폴더 셀렉트 → 오른쪽 `취소` / `옮기기`(accent 채움).
- 아래 줄: `선택 PDF 원본만 삭제 (n개)` · `선택 삭제 (n개)`(빨강 채움) · 오른쪽 끝 `닫기`. 선택이 없으면 disabled.

---

## 3. 단계별 상세

### 1단계 — 머리 · 탭 · 칩 · 도구 줄 (Sonnet 5.5 / 높음)
1. HTML: `#mgfilters` 통째 삭제 → `.mgtabs`(`<button data-mgtab="meet">회의자료 <span class="n" id="mgn-meet"></span></button>` · proj 동일) + `.mgfilt`(`<span class="mgflabel" id="mgflabel">종류</span><div id="mgchips"></div>`) 신설. `#mgtools` 는 `#mgsearch` · `#mgnopdf`(**`<button>` 토글**, `.on`) · `#mgfold`(모두 접기/펼치기, 동작은 2단계에서) · `#mgcount`. `#mgall` 체크박스 삭제(2단계 선택 줄이 대신).
2. `#mghintbtn` 데스크톱에서도 보이게: 머리 오른쪽 ✕ 앞. `#mghint` 기본 숨김, `.open` 이면 표시(모바일 규칙과 합쳐 정리).
3. 상태: `const MG = { tab:"meet", on:{meet:null, proj:null}, q:"", nopdf:false, closed:new Set(), sel:new Set(), moving:new Set() };` — `on[tab]` 이 `null` 이면 전체. `mgMoving` 은 `MG.moving` 으로 바꿔 씀.
4. `mgFilterSelects()` 폐지 → `mgChips()`: 회의자료 키 = `mgCatList()`, 프로젝트 키 = `projFolderList()` 의 id(이름 표시). 칩 개수 = 그 탭 안 그 키 자료 수. 전체 칩은 시안의 SVG 그대로.
5. `mgRows()` 다시 쓰기: 탭(`isProj`) → 칩 → 원본없음 → 검색(이름·종류·폴더 이름). **칩 키가 전부 켜져 있으면 거르지 않음**(종류가 빈 회의자료, 목록에 없는 폴더 자료가 사라지지 않게). 새 폴더가 생기면 켜진 집합에 자동 추가.
6. **이 커밋에서 앱이 깨지면 안 됩니다.** `openManage` 초기화(6856~6859)와 최상위 리스너(6878~6888)가 지운 id(`#mgfarea #mgffolder #mgfcat #mgfyear #mgfmonth #mgall`, 그리고 `#mgnopdf.checked`)를 읽습니다. 남겨 두면 로드 때 `null.addEventListener` 로 멈춰 그 뒤 코드(`selectDoc`·목록 클릭)가 통째로 안 돕니다. `mgRows`·`mgChecked`·`mgBot`·`#mglist` change 까지 **같은 커밋에서 전부 정리**. 확인: `grep -n "mgfarea\|mgffolder\|mgfcat\|mgfyear\|mgfmonth\|mgall\|mgg-"` 0건 + 새로고침 콘솔 오류 0.
7. 목록은 이 단계에서는 옛 두 줄 행 그대로 두어도 됩니다(2단계에서 교체).

### 2단계 — 목록 · 선택 · 아래 단추 (Opus 5.5 / 높음)
1. `mgRender()` 를 시안 `render()` 구조로: 탭 개수·칩·도구 줄 갱신 → sticky 선택 줄 → 묶음 머리(`.mgyr` 연도/폴더, `.mggrp` 월, `data-g` 키 `y2026`/`y2026m10`/`f<폴더id>`) → 한 줄 행 `.mgrow`. 빈 결과면 `#mgempty`(자료가 하나도 없을 때 문구는 지금 것 유지).
2. 정렬: 연도 내림차순, 월·주차 오름차순, 같은 주차는 제목순. **`+yearOf(d)` 처럼 숫자로 바꿔 비교.** 프로젝트는 `projFolderList()` 순서 → 제목순.
3. 행: `.mgchk` · `.mgwk`(`W${weekOf(d)}`, 회의자료만) · `.mgname`(`data-f="title"`) · `.meta`(종류 굵게 · 글자만) · `.mgdown` · `.mgdetach` · `.mgmove`(이동 중이면 `.on`) · `.mgdel`(텍스트 `삭제`). 원본 없으면 `.mgdown`·`.mgdetach` disabled.
4. 선택: `MG.sel` 기준. `mgChecked()` → `[...MG.sel]`. 그리기 전 **`mgRows()` 결과에 없는 id 만** `MG.sel` 에서 제거(DOM 기준이면 묶음을 접을 때 선택이 풀림). 묶음 체크(`.mggchk`, 묶음 안 전부 켜기/끄기) · `보이는 자료 전체 선택`(`#mgall` 새로) · `선택 해제`(`#mgclr`). 선택된 줄 `.sel`.
5. 접기: `MG.closed` 키 토글(묶음 머리 클릭, 체크 클릭은 제외). `#mgfold` = 하나라도 접혀 있으면 `모두 펼치기`(전부 해제), 아니면 `모두 접기`(보이는 모든 `data-g` 추가).
6. 아래 줄: `#mgdetachsel` `선택 PDF 원본만 삭제 (n개)`(원본 있는 것만 셈), `#mgdelsel` 빨강 채움 `선택 삭제 (n개)`, `#mgdone` 오른쪽 끝(`margin-left:auto`). 삭제·원본삭제 뒤 `MG.sel` 정리.
7. 이벤트: `#mglist` click/change 위임 하나씩으로 정리. 이름 즉시 저장(빈 이름 막기)은 유지. 옛 줄 드롭다운(`data-f="cat|year|month|week|folder"`) 처리 코드는 이 단계에서 지워도 되고 3단계에서 지워도 됨(행에 그 칸이 더는 없음).
8. CSS: 옛 `.mgtop/.mgbot` 규칙 정리, 시안 `.yr .grp .car .row .wk .name .meta .rb .selbar` 를 `mg` 접두로 옮김.

### 3단계 — 자료 이동 패널 (Sonnet 5.5 / 높음)
1. `mgBot()` 폐지 → `mgMoveP(d)`: `MG.moving` 에 있는 줄 아래에 펼침. 세그먼트 기본값 = **반대 영역**(시안: `d.mvTo`). 회의자료 셀렉트 기본값 = 그 자료의 현재 종류·연·월·주차(프로젝트에서 오면 `KV.cats[0]` · 오늘 연·월 · 그 달 1일의 주차 — 지금 6799~6804행 방식), 폴더 셀렉트 기본값 = 현재 폴더(없으면 `폴더 고르기`). `mgCatOptions` · `mgYearOptions` · `monthOptions` · `weekOptions` · `folderOptions` 재사용.
2. `옮기기` 4갈래를 한 함수로: 회의→회의(종류·날짜만, `d.date = mkDate(y,m,w); d.week = w`), 회의→프로젝트(`d.folder=id; d.cat=""; delete d.week`), 프로젝트→회의(`delete d.folder; d.cat=…; d.date; d.week`), 프로젝트→프로젝트(폴더만). 폴더는 `pickFolder(v)` 로(새 폴더… 취소 시 중단). 폴더가 바뀌면 `S.open.add(projOpenKey(id)); KV.folders=…; saveKV("folders")`. 그 뒤 `mgSaveDoc(d)` 한 번, 보고 있던 자료면 `revealDoc`·`renderTree`(6945행). 토스트는 영역이 바뀌었으면 `프로젝트로 옮겼습니다`/`회의 자료로 옮겼습니다`, 아니면 `저장했습니다`. 아무것도 안 바뀌면 패널만 닫음.
3. 탭을 바꾸면 `MG.moving` 비움(1단계 상태 규칙). 영역이 바뀐 자료는 지금 탭에서 사라지므로 `MG.sel` 에서도 빠짐(2단계 정리 규칙으로 자동).
4. `#mghint` 문구: "이름은 **고치는 즉시 저장**됩니다. 종류·날짜·폴더 변경과 회의 자료 ↔ 프로젝트 이동은 줄 끝 **자료 이동**에서 **옮기기**를 눌러 적용합니다. 종류나 날짜를 바꾸면 연결되는 회의록도 그 날짜의 것으로 함께 바뀝니다."

### 4단계 — 모바일 (Sonnet 5.5 / 중간)
- `body.m[data-mscr="manage"]` 기준(1988~1993행 규칙 유지). 행을 두 줄로: 1줄 체크 · W · 이름(16px, iOS 확대 방지) / 2줄 메타 + 단추 넷(줄바꿈 허용, 최소 32px 높이). 칩 줄은 한 줄 가로 스크롤(스크롤바 숨김). 탭·묶음 머리·체크 손가락 크기(44px 근처). 이동 패널 셀렉트 줄바꿈, 왼쪽 들여쓰기 축소. sticky 선택 줄이 머리 아래 제자리에 붙는지 확인. `#mghintbtn` 모바일 위치(머리 오른쪽 아래)는 지금처럼.
- `resize_window` mobile(375px)로 확인 — 가로 스크롤 생기면 안 됨.

### 5단계 — 통합 점검 · 마무리 (Sonnet 5.5 / 중간)
- 도움말 13265 · 13428 · 13506행 문구를 새 이름(`자료 이동`, `PDF 원본만 삭제`, `선택 PDF 원본만 삭제`, 탭·칩·묶음 접기)에 맞춤.
- `grep -n "원본 비우기\|mgfarea\|mgfcat\|mgbot\|mgBot\|mgMoving\|mgFilterSelects"` 로 옛 참조 0 확인(토스트 문구 포함).
- 아래 검증 전부 → 진행 현황 ✅ → 커밋. 사용자에게 `file://` 실사용 확인 요청.

---

## 4. 검증 방법 (각 단계 공통)

- `preview_start {name:"static"}`(포트 8765) → `http://localhost:8765/whats-the-strategy.html`.
- **localhost 에서는 IndexedDB 자료가 안 보이고 `dbPut` 이 실패합니다**(저장 실패 토스트는 정상). 콘솔에서 가짜 `DOCS` 를 넣고(`DOCS.push({...})` — 회의자료 여러 연·월·종류, 원본 없는 것, 종류 빈 것 + 프로젝트 폴더 둘 이상) `openManage()` 로 확인합니다.
- 확인 항목: 탭 개수·전환 시 선택 비움 / 칩 켜기·끄기·전체 / 검색·원본없음 / 묶음 접기·모두 접기 / 묶음·전체 선택, 필터로 숨으면 선택 빠짐, 접어도 선택 유지 / 행 단추 4개(원본 없으면 비활성) / 이동 패널 4갈래 / 아래 단추 개수 문구 / Esc·바깥 클릭·✕·닫기 / 콘솔 오류 0 / 375px 레이아웃.
- 마지막에 사용자가 `file://` 로 실제 자료에서 이름 저장 · 이동 · 원본 삭제 · 삭제를 한 바퀴 확인합니다.
