# Prompt Log

This file contains a log of all prompts used in this project.

## 2026-01-24

### Add Redacted Regiment Premium Warbond
**Prompt:** I want to add this warbond: https://helldivers.wiki.gg/wiki/Redacted_Regiment_Premium_Warbond  Only care about weapons, armors, and stratagems. Add these to either items.json or @stratagems.json

**Actions Taken:**
- Fetched information from the Helldivers wiki about the Redacted Regiment Premium Warbond
- Added the following items to `items.json`:
  - **Primary Weapons:**
    - R-72 Censor (Marksman Rifle)
    - AR-59 Suppressor (Assault Rifle)
  - **Secondary Weapons:**
    - P-35 Re-Educator (Pistol)
  - **Grenades/Throwables:**
    - TM-1 Lure Mine
  - **Armor:**
    - RS-89 Shadow Paragon (Light Armor)
    - RS-67 Null Cipher (Medium Armor)
- Added the following stratagem to `stratagems.json`:
  - **Support Stratagems:**
    - B/MD C4 Pack

All items were tagged with `"warbond": "Redacted Regiment"` to match the existing format.

## 2026-04-06

### Add Entrenched Division Premium Warbond
**Prompt:** We have a new warbond to add. Please take a look at https://helldivers.wiki.gg/wiki/Entrenched_Division_Premium_Warbond and add any weapons, armor, throwables, and strategems that you find

**Actions Taken:**
- Used Helldivers wiki (MediaWiki API parse) for the warbond reward tables.
- Added to `items.json` with `"warbond": "Entrenched Division"`:
  - **Primary:** SMG/FLAM-34 Stoker
  - **Secondary:** CQC-73 Entrenchment Tool, P-69 Veto
  - **Grenades (throwables):** G-48 Giga Grenade
  - **Armor:** CPH-26 Commandant (Light), CPG-48 Sapper (Medium)
- Added to `stratagems.json`:
  - **DEFENSE:** A/GM-17 Gas Mortar Sentry
  - **SUPPORT:** B/FLAM-80 Cremator
- Added `tests/consistency.spec.js` check that these entries exist.

## 2026-07-07

### Add Exo Experts Premium Warbond
**Prompt:** need to add a new warbond called "Exo Experts". here is the webpage for it. Pull in all primary, secondary weapons, gernades, armors, and stratagems. https://helldivers.wiki.gg/wiki/Exo_Experts_Premium_Warbond

**Actions Taken:**
- Fetched reward tables from the Helldivers wiki for the Exo Experts Premium Warbond.
- Added to `items.json` with `"warbond": "Exo Experts"`:
  - **Primary:** SMG-203 Gallant
  - **Secondary:** P-33 Missile Pistol
  - **Armor:** O-3 Free Spirit (Light), O-2 Heavy Operator (Heavy)
  - **Grenades (throwables):** none in this warbond
- Added to `stratagems.json`:
  - **SUPPORT:** MGX-42 Bullet Storm, EXO-51 Lumberer Exosuit, EXO-55 Breakthrough Exosuit
- Added `tests/consistency.spec.js` check that these entries exist.

## 2026-09-22

### Add Ironclad Democracy Premium Warbond
**Prompt:** Please add new warbond items for the Ironclad Democracy warbond. Details on this page: https://helldivers.wiki.gg/wiki/Ironclad_Democracy_Premium_Warbond I'm just interested in primary/secondary weapons, throwables, armor sets, and stratagems. (Follow-up: also add boosters.)

**Actions Taken:**
- Fetched reward tables from the Helldivers wiki for the Ironclad Democracy Premium Warbond.
- Added to `items.json` with `"warbond": "Ironclad Democracy"`:
  - **Primary:** AR-11 Arbitrator, GL-15 Evictor
  - **Secondary:** P-34 Breacher
  - **Grenades (throwables):** G-8 Immolation, G-60 Anti-Tank Seeker
  - **Armor:** BFM-16 Tanker (Light), BFM-220 Ironclad (Heavy)
  - **Boosters:** Surplus EAT Allocation, Integrated Extinguishers
- Stratagems: none in this warbond (per wiki).
- Downloaded matching wiki icons into `public/images/{primary,secondary,grenade,boosters}/`.
- Added `tests/consistency.spec.js` check that these entries exist.

### Explore warbond item storage and display
**Prompt:** Explore the codebase at c:\personalGitHub\strategem-randomizer to understand how warbond items are stored and displayed. Focus on: (1) stratagems definition, (2) weapons/throwables/armor, (3) warbonds/categories, (4) existing warbond addition patterns, (5) icon naming conventions. Return key paths, schemas, icon refs, and tests to update.

**Actions Taken:**
- Explored `items.json`, `stratagems.json`, `server.js`, `public/script.js`, and Playwright tests.
- Documented schemas, warbond discovery via `/api/warbonds`, icon path conventions, and consistency-test patterns from Entrenched Division / Exo Experts.
