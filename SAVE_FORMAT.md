# Save Format

This document describes the JSON schema used by OpenPublica when saving and loading a city.

## Overview

Save data is stored as a JSON string in `localStorage` under the key `micropolisJSGame`.
When the player clicks **Save**, the same JSON is also downloaded as `city3d.json`.

---

## Top-level fields

| Field | Type | Description |
|---|---|---|
| `saveVersion` | `number` | Schema version of the save format (see [Versioning](#versioning)). Introduced in save schema v1. |
| `version` | `number` | Internal game/simulation version (matches `Micro.CURRENT_VERSION`). Used by `transitionOldSave` for legacy field migrations. |
| `name` | `string` | City name. |
| `speed` | `number` | Simulation speed (0 = paused, 1–4 = slow→ultra). |
| `difficulty` | `number` | Difficulty level (0 = easy, 1 = medium, 2 = hard). |
| `everClicked` | `boolean` | Whether the player has ever interacted with the map. |
| `city` | `array` | Serialized 3-D building state produced by `View.saveCityBuild()`. |
| `cityTime` | `number` | Simulation tick counter. |
| `map` | `object` | Tile data and map metadata (width, height, island flag, tile array). |
| `census` | `object` | Population and history arrays. |
| `budget` | `object` | Financial state (funds, tax rate, spending percentages, etc.). |
| `evaluation` | `object` | City class and score. |

Additional sub-system fields (traffic, sprites, power grid, etc.) may be present depending on the game state at save time.

---

## Versioning

Two version numbers coexist in a save file:

* **`version`** – tracks breaking changes to the *simulation data model* (e.g. new tile properties). Handled by `Storage.transitionOldSave()`.
* **`saveVersion`** – tracks breaking changes to the *save schema itself* (e.g. renamed top-level keys, restructured arrays). Handled by `Storage.migrate()`.

Both constants live in `src/micro/Micro.js`:

```js
CURRENT_VERSION : 3,   // simulation version
SAVE_VERSION    : 1,   // save schema version
```

### Migration entry point

`Storage.migrate(savedGame)` upgrades a parsed save object in-place:

```js
static migrate = function(savedGame) {
    var from = savedGame.saveVersion || 0;
    // v0 → v1: saveVersion field did not exist; nothing structural to transform.
    if (from < 1) {
        savedGame.saveVersion = 1;
    }
    // Future versions: add additional upgrade steps here.
}
```

Saves that predate `saveVersion` (i.e. `saveVersion` is absent) are treated as schema version 0 and are upgraded transparently — no data is lost.

---

## Backward compatibility

* **Old saves (no `saveVersion`)** load safely; `migrate()` assigns `saveVersion = 1`.
* **Old saves (wrong `version`)** are patched by `transitionOldSave()` before `migrate()` runs.
* **Corrupt saves** (invalid JSON) log a clear error and abort the load rather than crashing silently.

---

## Adding new fields in the future

1. Add the field to the relevant `save()` method.
2. If loading an old save without that field would break anything, add a new `if (from < N)` block in `Storage.migrate()` and bump `Micro.SAVE_VERSION` to `N`.
3. Update this document.
