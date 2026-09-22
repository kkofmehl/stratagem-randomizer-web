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
