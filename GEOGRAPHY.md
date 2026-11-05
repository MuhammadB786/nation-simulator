# Province identities and geometry

This game bundles simplified first-level administrative (ADM1) geometry from the **geoBoundaries gbOpen** dataset. Each country's record in `province-geography.js` retains its boundary identifier, represented year, source, license and download URL. See [geoBoundaries](https://www.geoboundaries.org/) and its [data repository](https://github.com/wmgeolab/geoBoundaries).

The importer retrieves metadata from `https://www.geoboundaries.org/api/current/gbOpen/{ISO}/ADM1/`, then downloads the version-pinned simplified geometry identified by that metadata. Building the game requires no network access for province geometry.

| Campaign | Simulated administered units |
| --- | ---: |
| Pakistan | 7 |
| Germany | 16 |
| United States | 56 |
| China | 33 |
| Saudi Arabia | 13 |
| Brazil | 27 |

“Province” is the gameplay umbrella term. The US roster includes states, the federal district and territories; other countries use their equivalent ADM1 units. This is a simulation roster, not a claim that all units share the same constitutional status. Taiwan is not initialized as a player-administered Chinese province and remains a separate country in the existing world model. Border geometry is a presentation dataset, not an adjudication of territorial claims.

Stable IDs use ISO country codes plus normalized canonical names. Geographic source IDs and source-name aliases are retained. Obvious duplicated labels and spelling errors are normalized for display. Map loading never changes political or economic state.

`province-data.js` contains the lightweight identity roster. `province-geography.js` contains shapes rounded to four decimal places for distribution size. The map resolves shape-to-simulation matches by stable province ID.

## Refreshing deliberately

Run these separately from the project root when a geography refresh is intended:

```sh
node scripts/import-provinces.cjs
node scripts/prepare-provinces.cjs
```

Review identities and metadata before releasing a refreshed roster. A data refresh is not an automatic save migration.

## Economic data limitation

Provincial population weights, productive capacity, household indices, prices and construction costs are authored scenario abstractions. They are not measured census or economic data. Country population baselines are apportioned using explicit scenario weights. One building level represents a cluster of capacity, not a literal single factory or power station. The interface labels these as scenario economies.
