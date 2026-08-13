#!/bin/bash
# ======================================================================
#  KATTINTS RÁ DUPLÁN — parancssor nem kell.
#
#  Ez a fájl elkészíti a Birodalom Launcher .dmg telepítőjét. Mindent
#  maga intéz: ellenőrzi a Node.js-t, letölti a szükséges részeket, és
#  összeállítja a telepítőt.
#
#  ELSŐ HASZNÁLAT ELŐTT egyszer futtatnod kell a Terminálban:
#      chmod +x TELEPITO-KESZITES.command
#  (Vagy: jobb gomb a fájlon → Megnyitás.)
# ======================================================================
cd "$(dirname "$0")"

echo
echo "  ===================================================="
echo "     BIRODALOM — a telepítő elkészítése"
echo "  ===================================================="
echo

# --- 1. Van-e Node.js? ---
if ! command -v node >/dev/null 2>&1; then
  echo "  [!] Nem találom a Node.js-t."
  echo
  echo "  A telepítő elkészítéséhez egyszer szükség van rá."
  echo "  Töltsd le innen, telepítsd, majd indítsd újra ezt a fájlt:"
  echo
  echo "      https://nodejs.org"
  echo
  echo "  (Az \"LTS\" jelölésű változat kell.)"
  echo
  read -p "  Nyomj Entert a nodejs.org megnyitásához."
  open https://nodejs.org
  exit 1
fi
echo "  Node.js: $(node --version)  (rendben)"
echo

# --- 2. A szükséges részek letöltése ---
if [ -d "node_modules/electron-builder" ]; then
  echo "  A szükséges részek már megvannak — ezt a lépést átugrom."
else
  echo "  A szükséges részek letöltése… (egyszeri, kb. egy perc)"
  echo
  if ! npm install --no-audit --no-fund; then
    echo
    echo "  [!] A letöltés nem sikerült. Ellenőrizd az internetkapcsolatot,"
    echo "      és futtasd újra ezt a fájlt."
    echo
    read -p "  Nyomj Entert a bezáráshoz."
    exit 1
  fi
fi
echo

# --- 3. A telepítő összeállítása ---
echo "  A telepítő összeállítása…"
echo "  (Elsőre letölti az Electront, kb. 100 MB — legyél türelmes.)"
echo
if ! npm run mac; then
  echo
  echo "  [!] Az összeállítás megakadt."
  echo
  echo "  A leggyakoribb ok a sérült gyorsítótár. Töröld ezt a mappát,"
  echo "  és futtasd újra:"
  echo
  echo "      ~/Library/Caches/electron-builder"
  echo
  read -p "  Nyomj Entert a bezáráshoz."
  exit 1
fi

# --- 4. Kész ---
echo
echo "  ===================================================="
echo "     KÉSZ"
echo "  ===================================================="
echo
ls kimenet/*.dmg 2>/dev/null | while read f; do echo "  A telepítő:  $(basename "$f")"; done
echo
echo "  Megnyitom a mappát. Erre a fájlra kattints duplán a"
echo "  telepítéshez — és ezt küldheted a barátaidnak is."
echo
echo "  Az első indításnál a macOS figyelmeztetni fog, hogy"
echo "  ismeretlen fejlesztőtől származik. Ez nálunk normális"
echo "  (nincs megvásárolt Apple-tanúsítványunk):"
echo "  jobb gomb az alkalmazáson → Megnyitás → Megnyitás."
echo
open kimenet
read -p "  Nyomj Entert a bezáráshoz."
