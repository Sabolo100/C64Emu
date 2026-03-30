# C64 BASIC Emulator

Commodore 64 hangulatu, 40x25-os, sor-szamozott BASIC kornyezet bongeszoben.

Nyelv / Language: [Magyar (default)](#c64-basic-emulator) | [English](#english)

## Inditas

Nyisd meg az [index.html](/Users/budahazyszabolcs/ChatGPT Codex/C64 Emulator/index.html) fajlt.

### Stabil inditas (ajanlott)

- Futtasd: `./start-local.sh`
- Nyisd meg: `http://localhost:8000/index.html`
- Igy a `file://` browser security limitacio nem zavar be.

### AI fejlesztoi inditas (nem 3000-es port)

- Futtasd: `./start-vercel.sh`
- Ez fixen `3131` portra inditja a Vercel dev szervert.
- Nyisd meg: `http://localhost:3131`

## Vercel deploy (GitHub)

Ha nem localhostkent, hanem publikus weboldalkent akarod futtatni:

1. Tedd fel ezt a mappat egy GitHub repositoryba.
2. Vercelben `Add New Project` -> importald a repositoryt.
3. Ha a repository gyokerében nem ez a projekt van, `Root Directory`-nek allitsd:
   `ChatGPT Codex/C64 Emulator`
4. Framework preset: `Other`.
5. Build command: uresen hagyhato.
6. Output directory: uresen hagyhato (statikus fajlok kozvetlenul szolgálva).
7. Deploy.

Fontos:
- A projekt tartalmaz `vercel.json`-t, ami a gyoker URL-t az `index.html`-re iranyitja.
- `LOAD/SAVE/VERIFY` tovabbra is a bongeszo `localStorage`-ba ment (domainhez kototten).

## C64 oldalrol elerheto README

- A C64 kepernyo aljan a `README` link nyitja: [readme.html](/Users/budahazyszabolcs/ChatGPT Codex/C64 Emulator/readme.html)

## Programozasi mod

- Sorszamos sor (`10 ...`) Enterre mentodik, de nem fut le.
- A kod futtatasa `RUN` paranccsal tortenik.
- `SHIFT+ENTER`: kovetkezo sor automatikus felajanlasa (`+10`).
- Programozasi modban nem sorszamos sorra: `?LINE NUMBER EXPECTED`.
- A kepernyotartalom + program allapot automatikusan mentodik bongeszo `localStorage`-ba, igy README megnyitasa vagy lap ujratoltes utan visszaall.

## Kepernyo scroll

- `ArrowUp` / `ArrowDown`: programsorok kozti lepkedes szerkeszteshez (`10 ...`, `20 ...` stb.).
- Ha a legutolso programsoron vagy, `ArrowDown` visszavisz az also parancssorra.
- `LIST` utan egy sorszamozott sorra kattintva betolti szerkesztesre.
- Programsor-szerkesztes kozben, ha nem programsorra kattintasz, visszalep a parancssorra.
- Szerkesztes Enterre helyben frissul (nem duplazza kulon uj sorba a kijelzesben).
- `Alt+ArrowUp` / `Alt+ArrowDown`: scroll vissza/elore a kepernyobufferben.
- `PageUp` / `PageDown`: gyors scroll.
- Egergorgo is tamogatott.

## Nezet valtas

- `MAX NEZET` gomb: nagy befoglalo meret, ugyanazzal a font merettel.
- `NORMAL NEZET` gombbal visszaall a normal meret.
- Gyorsbillentyu: `F9`.

## Kiemelt parancsok

- Programkezeles: `LIST`, `RUN [sor]`, `NEW`, `CONT`, `HELP`, `TESTPACK`
- Tarolas (lokalis): `SAVE "nev",8`, `LOAD "nev",8`, `LOAD "*",8,1`, `VERIFY "nev",8`
- Csatorna: `OPEN`, `CLOSE`, `CMD`, `PRINT#`, `INPUT#`, `GET#`
- BASIC: `PRINT`, `INPUT`, `READ`, `DATA`, `RESTORE`, `LET`, `IF/THEN/ELSE`, `GOTO`, `GOSUB`, `RETURN`, `ON ... GOTO/GOSUB`, `FOR/NEXT`, `STOP`, `END`, `REM`, `POKE`, `WAIT`, `GET`, `CLR`, `DIM`, `DEF FN`, `SYS`
- Grafika (C128 stilus is): `GRAPHIC`, `SCNCLR`, `COLOR`, `DRAW`, `BOX`, `CIRCLE`, `PAINT`, valamint `PLOT`, `LINE`, `RECT`, `CLSG`
- Kepernyotorles: `CLS` (text), `CLSG` (grafika)
- AI: footer `AI` gomb -> feladatbol BASIC program generalasa, automatikus betoltes + mentes

## AI BASIC generator

- A footerben van egy `AI` gomb.
- Kattintas utan promptban megadhatsz feladatot (pelda: `csinalj amoba jatekot basicben`).
- A generalt program:
  - bekerul az editorba (sorszamozott sorokkal),
  - azonnal szerkesztheto,
  - automatikusan mentodik `AI-...` nevvel localStorage-ba.
- Ha nincs backend API kulcs, a gomb `AI OFF` es inaktiv.
- Az AI backend csak tamogatott parancsokat enged at; ismeretlen statementre a valasz elutasitasra kerul.
- Az AI prompt parancslistaja backend oldali whitelistbol epul (`api/generate-basic.js`), es valaszkor kulon validacio ellenorzi a soronkenti statementeket.

Vercel env valtozok:
- `OPENAI_API_KEY` (szukseges az AI funkciohoz)
- `OPENAI_MODEL` (opcionalis, alap: `gpt-4.1-mini`)

## Szintaxis referencia (tamogatott forma)

- `LIST [kezdo[-zaro]]`
- `RUN [sorszam]`
- `NEW`
- `HELP`
- `CONT`
- `TESTPACK` (demo programcsomag telepitese localStorage-ba)
- `CLS`
- `SAVE "NEV"[ ,eszkoz]`
- `LOAD "NEV"[ ,eszkoz][ ,mod]`
- `LOAD "*",8,1` (utolso mentett)
- `VERIFY "NEV"[ ,eszkoz]`
- `OPEN csatorna,eszkoz[,masodlagos][,"parancs"]`
- `CLOSE csatorna`
- `CMD [csatorna]`
- `SYS cim[,A][,X][,Y]`
- `PRINT [kifejezes][;|, ...]`
- `PRINT# csatorna[,kifejezes][;|, ...]`
- `INPUT ["szoveg";]valtozo[,valtozo...]`
- `INPUT# csatorna,valtozo[,valtozo...]`
- `GET valtozo[,valtozo...]`
- `GET# csatorna,valtozo[,valtozo...]`
- `READ valtozo[,valtozo...]`
- `DATA ertek[,ertek...]`
- `RESTORE [sorszam]`
- `LET valtozo=kifejezes` (vagy roviden: `A=10`)
- `IF feltetel THEN utasitas|sorszam [ELSE utasitas|sorszam]`
- `GOTO sorszam`
- `GOSUB sorszam`
- `RETURN`
- `ON index GOTO sorszam[,sorszam...]`
- `ON index GOSUB sorszam[,sorszam...]`
- `FOR V=kezdo TO veg [STEP lepes]`
- `NEXT [valtozo[,valtozo...]]`
- `STOP`
- `END`
- `REM megjegyzes`
- `POKE cim,ertek`
- `WAIT cim,maszk[,ertek]`
- `CLR`
- `DIM TOMB(meret[,meret...])`
- `DEF FNnev(parameter)=kifejezes`
- `GRAPHIC mode[,c][,s]` vagy `GRAPHIC CLR`
- `SCNCLR [mode]`
- `COLOR szin` (legacy)
- `COLOR source,color` (C128 stilus)
- `DRAW [source],x1,y1 [TO x2,y2] ...`
- `BOX [source],x1,y1[,x2,y2][,angle][,paint]`
- `CIRCLE [source],x,y,xr[,yr][,sa][,ea][,angle][,inc]`
- `PAINT [source],x,y[,mode]`
- `PLOT X,Y[,szin]`
- `LINE X1,Y1,X2,Y2[,szin]`
- `RECT X,Y,SZEL,MAG[,szin] [FILL]`
- `CIRCLE X,Y,R[,szin] [FILL]` (legacy kompatibilitas)
- `CLSG`

## Parancs ellenorzes (parser audit)

- A fenti parancslista az `app.js` parser/végrehajtó ágain lett ellenorizve:
  - `executeImmediate(...)`
  - `executeStatement(...)`
  - egyedi `execute...` parse fuggvenyek
- A README jelen listaja a kodban tenylegesen elfogadott/tamogatott parancsokra lett igazítva.
- Kulonbseg:
  - Vannak azonnali (prompt) parancsok: pl. `LIST`, `RUN`, `NEW`, `CONT`, `SAVE`, `LOAD`, `VERIFY`, `HELP`, `TESTPACK`.
  - Es vannak programsorba irhato utasitasok (RUN alatt vegrehajtva): pl. `PRINT`, `IF`, `FOR`, `GOTO`, `DATA`, grafikai utasitasok, stb.

## Parameter formatumok (pontositva)

- Valtozonev:
  - Numerikus: `A`, `X1`, `INDEX`
  - Sztring: `$` vegu nev, pl. `A$`, `NEV$`
- Tomb indexeles:
  - Elemhivatkozas: `A(I)` vagy `A(I,J)`
  - `DIM` merethatar inclusive: `DIM A(10)` -> `0..10`
- Kifejezes:
  - Szamok, valtozok, fuggvenyek, operatorok (`+ - * / ^`, `AND OR NOT`, osszehasonlitok)
- Sorszam:
  - Pozitiv egesz, ajanlott 10-es lepeskozzel (`10`, `20`, `30`)

Reszletes parancsparameterek:

- `DIM TOMB(meret[,meret...])`
  - Pelda: `DIM A(10)`, `DIM M(5,5)`, `DIM N$(20)`
- `DEF FNnev(param)=kifejezes`
  - Pelda: `DEF FNA(X)=X*X`
- `IF feltetel THEN utasitas|sorszam [ELSE utasitas|sorszam]`
  - Pelda: `IF A>10 THEN 200`
  - Pelda: `IF A>10 THEN PRINT "OK" ELSE PRINT "NEM"`
- `ON index GOTO s1[,s2...]`
  - Pelda: `ON K GOTO 100,200,300`
- `ON index GOSUB s1[,s2...]`
  - Pelda: `ON K GOSUB 100,200,300`
- `FOR V=kezdo TO veg [STEP lepes]`
  - Pelda: `FOR I=1 TO 10 STEP 2`
- `NEXT [V[,V2...]]`
  - Pelda: `NEXT`, `NEXT I`, `NEXT I,J`
- `OPEN csatorna,eszkoz[,masodlagos][,"parancs"]`
  - Pelda: `OPEN 1,8,0,"MEM"`
- `CMD [csatorna]`
  - Pelda: `CMD 1` (kimenet csatornara), `CMD` (vissza alap kimenetre)
- `SYS cim[,A][,X][,Y]`
  - Pelda: `SYS 49152,1,2,3`
- `INPUT ["prompt";]valtozo[,valtozo...]`
  - Pelda: `INPUT "NEV";N$`
- `PRINT [expr][;|, ...]`
  - Pelda: `PRINT "A=";A`
  - `? expr` ugyanaz, mint `PRINT expr`
- `WAIT cim,maszk[,ertek]`
  - Pelda: `WAIT 53265,128`
- `GRAPHIC mode[,c][,s]`
  - `mode`: `0..5`
  - `c`: `0` vagy `1`
  - `s`: split kezdo sor (`0..25`)
- `SCNCLR [mode]`
  - mode nelkul az aktualis modra torol
- `COLOR source,color`
  - `source`: `0..6`
  - `color`: `1..16` (C128 stilus)
- `DRAW [source],x1,y1 [TO x2,y2] ...`
  - Pelda: `DRAW 1,10,10 TO 100,100 TO 150,40`
- `BOX [source],x1,y1[,x2,y2][,angle][,paint]`
  - `paint`: `0` korvonal, `1` kitoltott
- `CIRCLE [source],x,y,xr[,yr][,sa][,ea][,angle][,inc]`
  - `yr` hianyaban: `yr=xr`
  - `sa/ea`: fok
  - `inc`: fokos mintavetelezesi lepes
- `PAINT [source],x,y[,mode]`
  - `mode`: `0` vagy `1`

## Tesztprogram csomag

- Ird be: `TESTPACK`
- Ez 11 mintaprogramot telepit:
  - `TP00-INDEX` (lista + gyors indulasi tipp)
  - `TP01-BASIC`
  - `TP02-DATA-FN`
  - `TP03-FLOW`
  - `TP04-DRAW`
  - `TP05-BOX-PAINT`
  - `TP06-CIRCLE`
  - `TP07-SPLIT`
  - `TP08-PAINT-MODE`
  - `TP09-CHANNEL`
  - `TP10-STOP-CONT`
- Hasznalat:
  - `LOAD "TP00-INDEX",8`
  - `RUN`
  - vagy direkt: `LOAD "TP04-DRAW",8` majd `RUN`

## C128 grafikai parancsok - emulalt viselkedes

- `GRAPHIC mode[,c][,s]`:
  - `mode`: `0..5`
  - `c`: `0` (ne toroljon) vagy `1` (toroljon), alapertelmezett: `1`
  - `s`: split kezdo sor (0..25), csak `mode 2/4` esetben hasznos
- `GRAPHIC CLR`: visszaall text modra es torli a grafikus reteget.
- `SCNCLR [mode]`: text modban text torles, bitmap modban grafikai torles.
- `COLOR source,color`:
  - `source`: `0..6` (C128 forrasok szerint)
  - `color`: `1..16` (C128 stilus)
- `DRAW [source],x1,y1 [TO x2,y2] ...`: pont/vonal rajz, `source` tartomany `0..3`.
- `BOX [source],x1,y1[,x2,y2][,angle][,paint]`:
  - `paint`: `0` korvonal, `1` kitoltott
  - ha `x2,y2` hianyzik, az aktualis pixelkurzor poziciojat hasznalja.
- `CIRCLE [source],x,y,xr[,yr][,sa][,ea][,angle][,inc]`:
  - `yr` hianyaban kor (`yr=xr`)
  - `sa/ea`: kezdo/veg szog fokban
  - `angle`: elforgatas fokban
  - `inc`: iv rajzolas lepesszog fokban
  - javasolt explicit `source`-ot adni, mert a legacy `CIRCLE X,Y,R[,szin] [FILL]` forma is tamogatott
- `PAINT [source],x,y[,mode]`:
  - `mode 0`: klasszikus flood fill a kattintott teruleten
  - `mode 1`: csak hatterszin-terulet kitoltese (nem-hatter szin a hatar)

Megjegyzesek:
- A C128 grafika itt browser-canvas emulacio, nem 1:1 hardver implementacio.
- `GRAPHIC 5` (80 oszlop) funkcio csak mod-jelzeskent van emulalva; a BASIC text viewport tovabbra is C64-szeru.

## Beepitett fuggvenyek

`SGN`, `INT`, `ABS`, `USR`, `FRE`, `POS`, `SQR`, `RND`, `LOG`, `EXP`, `COS`, `SIN`, `TAN`, `ATN`, `PEEK`, `LEN`, `VAL`, `ASC`, `STR$`, `CHR$`, `LEFT$`, `RIGHT$`, `MID$`, valamint `TI`, `TI$`, `ST`.

## Fontos

- Ez nem CPU-szintu C64 hardveremulacio, hanem C64 BASIC-szeru interpreter es terminal UI.
- `SAVE/LOAD/VERIFY` bongeszo `localStorage` alapuan mukodik.

## English

Commodore 64 style, 40x25, line-numbered BASIC environment in the browser.

### Startup

Open [index.html](/Users/budahazyszabolcs/ChatGPT Codex/C64 Emulator/index.html).

Stable local startup (recommended):
- Run: `./start-local.sh`
- Open: `http://localhost:8000/index.html`
- This avoids `file://` browser security issues.

AI development startup (not port 3000):
- Run: `./start-vercel.sh`
- It starts Vercel dev on fixed port `3131`.
- Open: `http://localhost:3131`

### Vercel Deploy (GitHub)

If you want a public website instead of localhost:
1. Push this folder to a GitHub repository.
2. In Vercel: `Add New Project` -> import the repository.
3. If this project is not repository root, set `Root Directory` to:
   `ChatGPT Codex/C64 Emulator`
4. Framework preset: `Other`.
5. Build command: leave empty.
6. Output directory: leave empty.
7. Deploy.

Notes:
- `vercel.json` routes root URL to `index.html`.
- `LOAD/SAVE/VERIFY` still use browser `localStorage` (domain-scoped).

### README from C64 page

- The `README` link at the bottom of the C64 screen opens [readme.html](/Users/budahazyszabolcs/ChatGPT Codex/C64 Emulator/readme.html).

### Programming Mode

- Numbered line (`10 ...`) is stored on Enter, not executed.
- Program runs only with `RUN`.
- `SHIFT+ENTER`: prefill next program line (`+10`).
- In programming mode, a non-numbered line returns `?LINE NUMBER EXPECTED`.
- Screen + program state are auto-saved to `localStorage`, so state is restored after opening README or page reload.

### Screen Navigation

- `ArrowUp` / `ArrowDown`: move between program lines for editing.
- On last program line, `ArrowDown` returns to bottom command line.
- After `LIST`, clicking a numbered line loads it for editing.
- During program-line editing, clicking non-program text returns to command line.
- Edit updates in place on Enter (no duplicate visual lines).
- `Alt+ArrowUp` / `Alt+ArrowDown`: scroll back/forward in screen buffer.
- `PageUp` / `PageDown`: fast scroll.
- Mouse wheel scrolling is supported.

### View Toggle

- `MAX NEZET`: larger container area, same font size.
- `NORMAL NEZET`: switch back to normal size.
- Hotkey: `F9`.

### Highlighted Commands

- Program management: `LIST`, `RUN [line]`, `NEW`, `CONT`, `HELP`, `TESTPACK`
- Local storage: `SAVE "name",8`, `LOAD "name",8`, `LOAD "*",8,1`, `VERIFY "name",8`
- Channel I/O: `OPEN`, `CLOSE`, `CMD`, `PRINT#`, `INPUT#`, `GET#`
- BASIC: `PRINT`, `INPUT`, `READ`, `DATA`, `RESTORE`, `LET`, `IF/THEN/ELSE`, `GOTO`, `GOSUB`, `RETURN`, `ON ... GOTO/GOSUB`, `FOR/NEXT`, `STOP`, `END`, `REM`, `POKE`, `WAIT`, `GET`, `CLR`, `DIM`, `DEF FN`, `SYS`
- Graphics: `GRAPHIC`, `SCNCLR`, `COLOR`, `DRAW`, `BOX`, `CIRCLE`, `PAINT`, plus `PLOT`, `LINE`, `RECT`, `CLSG`
- Screen clear: `CLS` (text), `CLSG` (graphics)
- AI: footer `AI` button generates BASIC program from text prompt, auto-loads and auto-saves it

### AI BASIC Generator

- Use the `AI` button in footer.
- Enter task text (example: `make a gomoku game in basic`).
- Generated program:
  - is inserted into editor with line numbers,
  - is immediately editable,
  - is auto-saved with `AI-...` name in localStorage.
- If backend API key is missing, button is `AI OFF` and disabled.
- Backend allows only supported commands; unsupported statements are rejected.
- AI prompt command list is built from backend whitelist (`api/generate-basic.js`), and output lines are validated statement-by-statement.

Vercel env vars:
- `OPENAI_API_KEY` (required for AI)
- `OPENAI_MODEL` (optional, default: `gpt-4.1-mini`)

### Syntax Reference (Supported Forms)

- `LIST [start[-end]]`
- `RUN [lineNumber]`
- `NEW`
- `HELP`
- `CONT`
- `TESTPACK` (install demo program pack to localStorage)
- `CLS`
- `SAVE "NAME"[ ,device]`
- `LOAD "NAME"[ ,device][ ,mode]`
- `LOAD "*",8,1` (load last saved)
- `VERIFY "NAME"[ ,device]`
- `OPEN channel,device[,secondary][,"command"]`
- `CLOSE channel`
- `CMD [channel]`
- `SYS addr[,A][,X][,Y]`
- `PRINT [expr][;|, ...]`
- `PRINT# channel[,expr][;|, ...]`
- `INPUT ["prompt";]var[,var...]`
- `INPUT# channel,var[,var...]`
- `GET var[,var...]`
- `GET# channel,var[,var...]`
- `READ var[,var...]`
- `DATA value[,value...]`
- `RESTORE [lineNumber]`
- `LET var=expr` (or short: `A=10`)
- `IF cond THEN stmt|line [ELSE stmt|line]`
- `GOTO lineNumber`
- `GOSUB lineNumber`
- `RETURN`
- `ON index GOTO line[,line...]`
- `ON index GOSUB line[,line...]`
- `FOR V=start TO end [STEP step]`
- `NEXT [var[,var...]]`
- `STOP`
- `END`
- `REM comment`
- `POKE addr,value`
- `WAIT addr,mask[,value]`
- `CLR`
- `DIM ARR(size[,size...])`
- `DEF FNname(param)=expr`
- `GRAPHIC mode[,c][,s]` or `GRAPHIC CLR`
- `SCNCLR [mode]`
- `COLOR color` (legacy)
- `COLOR source,color` (C128 style)
- `DRAW [source],x1,y1 [TO x2,y2] ...`
- `BOX [source],x1,y1[,x2,y2][,angle][,paint]`
- `CIRCLE [source],x,y,xr[,yr][,sa][,ea][,angle][,inc]`
- `PAINT [source],x,y[,mode]`
- `PLOT X,Y[,color]`
- `LINE X1,Y1,X2,Y2[,color]`
- `RECT X,Y,W,H[,color] [FILL]`
- `CIRCLE X,Y,R[,color] [FILL]` (legacy compatibility)
- `CLSG`

### Command Audit (Parser)

- The command list above is verified against `app.js` parser/execution branches:
  - `executeImmediate(...)`
  - `executeStatement(...)`
  - dedicated `execute...` parse handlers
- README command list is aligned with actually accepted/implemented commands.
- There are:
  - immediate commands at prompt (for example `LIST`, `RUN`, `NEW`, `CONT`, `SAVE`, `LOAD`, `VERIFY`, `HELP`, `TESTPACK`)
  - program-line statements executed under `RUN` (for example `PRINT`, `IF`, `FOR`, `GOTO`, `DATA`, graphics commands)

### Parameter Formats (Detailed)

- Variable names:
  - numeric: `A`, `X1`, `INDEX`
  - string: names ending with `$`, for example `A$`, `NAME$`
- Array indexing:
  - element access: `A(I)` or `A(I,J)`
  - `DIM` bounds are inclusive: `DIM A(10)` -> `0..10`
- Expressions:
  - numbers, variables, functions, operators (`+ - * / ^`, `AND OR NOT`, comparisons)
- Line numbers:
  - positive integers, recommended spacing by 10 (`10`, `20`, `30`)

Detailed examples:
- `DIM ARR(size[,size...])`
  - examples: `DIM A(10)`, `DIM M(5,5)`, `DIM N$(20)`
- `DEF FNname(param)=expr`
  - example: `DEF FNA(X)=X*X`
- `IF cond THEN stmt|line [ELSE stmt|line]`
  - examples: `IF A>10 THEN 200`, `IF A>10 THEN PRINT "OK" ELSE PRINT "NO"`
- `ON index GOTO l1[,l2...]`
  - example: `ON K GOTO 100,200,300`
- `ON index GOSUB l1[,l2...]`
  - example: `ON K GOSUB 100,200,300`
- `FOR V=start TO end [STEP step]`
  - example: `FOR I=1 TO 10 STEP 2`
- `NEXT [V[,V2...]]`
  - examples: `NEXT`, `NEXT I`, `NEXT I,J`
- `OPEN channel,device[,secondary][,"command"]`
  - example: `OPEN 1,8,0,"MEM"`
- `CMD [channel]`
  - examples: `CMD 1` (output redirected), `CMD` (return to default output)
- `SYS addr[,A][,X][,Y]`
  - example: `SYS 49152,1,2,3`
- `INPUT ["prompt";]var[,var...]`
  - example: `INPUT "NAME";N$`
- `PRINT [expr][;|, ...]`
  - example: `PRINT "A=";A`
  - `? expr` equals `PRINT expr`
- `WAIT addr,mask[,value]`
  - example: `WAIT 53265,128`
- `GRAPHIC mode[,c][,s]`
  - `mode`: `0..5`
  - `c`: `0` or `1`
  - `s`: split start row (`0..25`)
- `SCNCLR [mode]`
  - without mode, clears current mode target
- `COLOR source,color`
  - `source`: `0..6`
  - `color`: `1..16` (C128 style)
- `DRAW [source],x1,y1 [TO x2,y2] ...`
  - example: `DRAW 1,10,10 TO 100,100 TO 150,40`
- `BOX [source],x1,y1[,x2,y2][,angle][,paint]`
  - `paint`: `0` outline, `1` filled
- `CIRCLE [source],x,y,xr[,yr][,sa][,ea][,angle][,inc]`
  - if `yr` omitted: `yr=xr`
  - `sa/ea`: degrees
  - `inc`: degree step
- `PAINT [source],x,y[,mode]`
  - `mode`: `0` or `1`

### Test Program Pack

- Type: `TESTPACK`
- Installs 11 sample programs:
  - `TP00-INDEX` (list + quick start)
  - `TP01-BASIC`
  - `TP02-DATA-FN`
  - `TP03-FLOW`
  - `TP04-DRAW`
  - `TP05-BOX-PAINT`
  - `TP06-CIRCLE`
  - `TP07-SPLIT`
  - `TP08-PAINT-MODE`
  - `TP09-CHANNEL`
  - `TP10-STOP-CONT`
- Usage:
  - `LOAD "TP00-INDEX",8`
  - `RUN`
  - or directly: `LOAD "TP04-DRAW",8` then `RUN`

### C128 Graphics Commands - Emulated Behavior

- `GRAPHIC mode[,c][,s]`:
  - `mode`: `0..5`
  - `c`: `0` (no clear) or `1` (clear), default `1`
  - `s`: split start row (`0..25`), mainly useful in `mode 2/4`
- `GRAPHIC CLR`: switches back to text mode and clears graphics layer.
- `SCNCLR [mode]`: in text modes clears text; in bitmap modes clears graphics.
- `COLOR source,color`:
  - `source`: `0..6` (C128 style sources)
  - `color`: `1..16` (C128 style)
- `DRAW [source],x1,y1 [TO x2,y2] ...`: point/line drawing, `source` range `0..3`.
- `BOX [source],x1,y1[,x2,y2][,angle][,paint]`:
  - `paint`: `0` outline, `1` filled
  - if `x2,y2` is omitted, current graphics cursor is used.
- `CIRCLE [source],x,y,xr[,yr][,sa][,ea][,angle][,inc]`:
  - if `yr` omitted -> circle (`yr=xr`)
  - `sa/ea`: start/end angles in degrees
  - `angle`: rotation in degrees
  - `inc`: segment step in degrees
  - explicit `source` is recommended because legacy `CIRCLE X,Y,R[,color] [FILL]` is also supported
- `PAINT [source],x,y[,mode]`:
  - `mode 0`: classic flood fill
  - `mode 1`: fills only background area (non-background colors treated as boundary)

Notes:
- This C128 graphics layer is browser-canvas emulation, not 1:1 hardware implementation.
- `GRAPHIC 5` (80 columns) is mode-signaled only; BASIC text viewport remains C64-style.

### Built-in Functions

`SGN`, `INT`, `ABS`, `USR`, `FRE`, `POS`, `SQR`, `RND`, `LOG`, `EXP`, `COS`, `SIN`, `TAN`, `ATN`, `PEEK`, `LEN`, `VAL`, `ASC`, `STR$`, `CHR$`, `LEFT$`, `RIGHT$`, `MID$`, plus `TI`, `TI$`, `ST`.

### Important

- This is not a CPU-level C64 hardware emulator; it is a C64-BASIC-like interpreter and terminal UI.
- `SAVE/LOAD/VERIFY` use browser `localStorage`.
