@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title Birodalom — telepítő készítése

REM ======================================================================
REM  KATTINTS RÁ DUPLÁN — parancssor nem kell.
REM
REM  Ez a fájl elkészíti a Birodalom Launcher telepítőjét. Mindent maga
REM  intéz: ellenőrzi, hogy megvan-e a Node.js, letölti a szükséges
REM  részeket, és összeállítja a telepítő exe-t.
REM
REM  Elsőre pár percig tart, mert le kell töltenie az Electront (~100 MB).
REM  Utána sokkal gyorsabb.
REM ======================================================================

cd /d "%~dp0"

REM --- Az ALAIRAS kikapcsolasa ---
REM  Nincs kodalairo tanusitvanyunk, tehat nem irunk ala semmit.
REM  Enelkul az electron-builder letoltene egy alairo csomagot, amiben
REM  macOS-es szimbolikus hivatkozasok vannak - azokat a Windows csak
REM  emelt joggal tudja kicsomagolni, es a folyamat elbukik rajta.
set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=
set CSC_LINK=

echo.
echo   ====================================================
echo      BIRODALOM — a telepítő elkészítése
echo   ====================================================
echo.

REM --- 1. Van-e Node.js? ---
where node >nul 2>nul
if errorlevel 1 (
  echo   [!] Nem találom a Node.js-t.
  echo.
  echo   A telepítő elkészítéséhez egyszer szükség van rá.
  echo   Töltsd le innen, telepítsd, majd indítsd újra ezt a fájlt:
  echo.
  echo       https://nodejs.org
  echo.
  echo   ^(A "LTS" jelölésű változat kell. A telepítőben mindent
  echo    hagyhatsz az alapértelmezetten - csak Tovább, Tovább.^)
  echo.
  set /p x=  Nyomj Entert a nodejs.org megnyitásához, vagy zárd be az ablakot.
  start https://nodejs.org
  exit /b 1
)

for /f "delims=" %%v in ('node --version') do set NODEV=%%v
echo   Node.js: !NODEV!  ^(rendben^)
echo.

REM --- 2. A szükséges részek letöltése ---
if exist "node_modules\electron-builder" (
  echo   A szükséges részek már megvannak - ezt a lépést átugrom.
) else (
  echo   A szükséges részek letöltése… ^(egyszeri, kb. egy perc^)
  echo.
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo   [!] A letöltés nem sikerült.
    echo.
    echo   Leggyakoribb ok: a víruskereső akadályozza. Próbáld úgy, hogy
    echo   ezt a mappát kiveszed a valós idejű vizsgálat alól, és futtasd
    echo   újra ezt a fájlt.
    echo.
    pause
    exit /b 1
  )
)
echo.

REM --- 3. A telepítő összeállítása ---
echo   A telepítő összeállítása…
echo   ^(Elsőre letölti az Electront, kb. 100 MB - legyél türelmes.^)
echo.
call npm run win
if errorlevel 1 (
  echo.
  echo   [!] Az összeállítás megakadt.
  echo.
  echo   A leggyakoribb ok a sérült gyorsítótár. Ilyenkor töröld ezt a
  echo   mappát, és futtasd újra ezt a fájlt:
  echo.
  echo       %%LOCALAPPDATA%%\electron-builder\Cache
  echo.
  pause
  exit /b 1
)

REM --- 4. Kész ---
echo.
echo   ====================================================
echo      KÉSZ
echo   ====================================================
echo.
for %%f in ("kimenet\*telepito.exe") do echo   A telepítő:  %%~nxf
echo.
echo   Megnyitom a mappát. Erre a fájlra kattints duplán a
echo   telepítéshez - és ezt küldheted a barátaidnak is.
echo.
echo   Az első indításnál a Windows figyelmeztetni fog, hogy
echo   ismeretlen a kiadó. Ez nálunk normális ^(nincs megvásárolt
echo   tanúsítványunk^): További információ - Futtatás mindenképp.
echo.
start "" "kimenet"
pause
