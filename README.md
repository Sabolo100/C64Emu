# C64 BASIC Emulator

Commodore 64 hangulatu, 40x25-os, sor-szamozott BASIC kornyezet bongeszoben.

## Inditas

Nyisd meg az [index.html](/Users/budahazyszabolcs/ChatGPT Codex/C64 Emulator/index.html) fajlt.

### Stabil inditas (ajanlott)

- Futtasd: `./start-local.sh`
- Nyisd meg: `http://localhost:8000/index.html`
- Igy a `file://` browser security limitacio nem zavar be.

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

- Programkezeles: `LIST`, `RUN [sor]`, `NEW`, `CONT`, `TESTPACK`
- Tarolas (lokalis): `SAVE "nev",8`, `LOAD "nev",8`, `LOAD "*",8,1`, `VERIFY "nev",8`
- Csatorna: `OPEN`, `CLOSE`, `CMD`, `PRINT#`, `INPUT#`, `GET#`
- BASIC: `PRINT`, `INPUT`, `READ`, `DATA`, `RESTORE`, `LET`, `IF/THEN/ELSE`, `GOTO`, `GOSUB`, `RETURN`, `ON ... GOTO/GOSUB`, `FOR/NEXT`, `STOP`, `END`, `REM`, `POKE`, `WAIT`, `GET`, `CLR`, `DIM`, `DEF FN`, `SYS`
- Grafika (C128 stilus is): `GRAPHIC`, `SCNCLR`, `COLOR`, `DRAW`, `BOX`, `CIRCLE`, `PAINT`, valamint `PLOT`, `LINE`, `RECT`, `CLSG`
- AI: footer `AI` gomb -> feladatbol BASIC program generalasa, automatikus betoltes + mentes

## AI BASIC generator

- A footerben van egy `AI` gomb.
- Kattintas utan promptban megadhatsz feladatot (pelda: `csinalj amoba jatekot basicben`).
- A generalt program:
  - bekerul az editorba (sorszamozott sorokkal),
  - azonnal szerkesztheto,
  - automatikusan mentodik `AI-...` nevvel localStorage-ba.
- Ha nincs backend API kulcs, a gomb `AI OFF` es inaktiv.

Vercel env valtozok:
- `OPENAI_API_KEY` (szukseges az AI funkciohoz)
- `OPENAI_MODEL` (opcionalis, alap: `gpt-4.1-mini`)

## Szintaxis referencia (tamogatott forma)

- `LIST [kezdo[-zaro]]`
- `RUN [sorszam]`
- `NEW`
- `CONT`
- `TESTPACK` (demo programcsomag telepitese localStorage-ba)
- `SAVE "NEV"[ ,eszkoz]`
- `LOAD "NEV"[ ,eszkoz][ ,mod]`
- `LOAD "*",8,1` (utolso mentett)
- `VERIFY "NEV"[ ,eszkoz]`
- `OPEN csatorna,eszkoz[,masodlagos][,"parancs"]`
- `CLOSE csatorna`
- `CMD csatorna`
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
