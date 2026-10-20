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

## 2026-10-20

### Fix M-1000 Maxigun stratagem icon
**Prompt:** pull the icon for this gun and replace the use of helldivers_icon in @stratagems.json https://helldivers.wiki.gg/wiki/M-1000_Maxigun

**Actions Taken:**
- Downloaded `Maxigun_Stratagem_Icon.svg` from the Helldivers wiki.
- Updated M-1000 Maxigun in `stratagems.json` to use `/images/icons/Maxigun_Stratagem_Icon.svg`.

### Fix Maelstrom and Supply FRV stratagem icons
**Prompt:** please find the Maelstrom Tank and Supply FRV stratagems on the wiki, pull the icons, and update the icon path in @stratagems.json if needed

**Actions Taken:**
- Located wiki pages: [TD-110 Maelstrom](https://helldivers.wiki.gg/wiki/TD-110_Maelstrom), [M-103 Supply FRV](https://helldivers.wiki.gg/wiki/M-103_Supply_FRV), [TD-220 Bastion MK XVI](https://helldivers.wiki.gg/wiki/TD-220_Bastion_MK_XVI).
- Downloaded wiki stratagem SVGs: `Maelstrom_Stratagem_Icon.svg`, `Supply_FRV_Stratagem_Icon.svg`, `Bastion_MK_XVI_Stratagem_Icon.svg`.
- Added `Maelstrom` SUPPORT entry; pointed Supply FRV at `.svg`; fixed Bastion MK XVI (was incorrectly pointing at a missing Maelstrom `.png`).

### Add Scope of Authority Premium Warbond
**Prompt:** Same thing for https://helldivers.wiki.gg/wiki/Scope_of_Authority_Premium_Warbond

**Actions Taken:**
- Fetched reward tables from the Helldivers wiki for the Scope of Authority Premium Warbond.
- Added to `items.json` with `"warbond": "Scope of Authority"`:
  - **Primary:** R-40 Sightliner
  - **Secondary:** P-44 Mist
  - **Grenades (throwables):** G-11 Caltrops
  - **Armor:** SS-33 Mimetic Marshal (Light), SS-15 Focal Point (Medium)
  - **Boosters:** none in this warbond
- Added to `stratagems.json`:
  - **SUPPORT:** AMW-20 Apex, LAS-44 Nova
- Downloaded matching wiki icons into `public/images/{primary,secondary,grenade,icons}/`.
- Added `tests/consistency.spec.js` check that these entries exist.

## 2026-09-22

### Add Castellan's Creed Legendary Warbond
**Prompt:** Same thing for https://helldivers.wiki.gg/wiki/Castellan%27s_Creed_Legendary_Warbond

**Actions Taken:**
- Fetched reward tables from the Helldivers wiki for the Castellan's Creed Legendary Warbond.
- Added to `items.json` with `"warbond": "Castellan's Creed"`:
  - **Primary:** R/40-K Hot-Shot Marksman Rifle
  - **Secondary:** P/40-K Bolt Pistol
  - **Grenades (throwables):** G/40-K Melta Mine
  - **Armor:** TG-8 Sharpshooter (Medium), TG-122 Demo-Trooper (Heavy)
  - **Boosters:** none in this warbond
- Added to `stratagems.json`:
  - **SUPPORT:** 40-K Meltagun
- Downloaded matching wiki icons into `public/images/{primary,secondary,grenade,icons}/`.
- Added `tests/consistency.spec.js` check that these entries exist.

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
