# 0.12.0 — provinces you can develop

- Added 152 stable administered province/state/territory identities across the six campaigns, with bundled ADM1 borders and retained source/license metadata.
- Added province economies with food, electricity, industry, services, freight and housing capacity; shortages affect output, employment, household costs and political pressure.
- Added location-specific construction with visible sites, stages, completion markers, recurring spending and two shared national construction crews.
- Added household compacts, local permits, imported construction inputs and work stoppages.
- Located national projects in selected provinces and applied their completed capacity locally.
- Added manufacturing investment competitions with rival countries. Winning creates an actual construction site; losing lets construction proceed abroad into operation.
- Added living-standard, electricity, industry, food and construction map layers. Fixed stale province-object bindings that could make updated state appear unchanged on the map.
- Added province selection/panning, building levels, household conditions, construction controls and development-first turn reports. Completed projects automatically highlight the affected province.
- Added province reality to Game Master context to constrain narrative claims about assets and investment winners.
- Added migration for older six-region saves without relying on map downloads to create simulation state.

Province economies are authored game scenarios, not census-based models. Browser rendering and live AI behavior still require playtesting.

# 0.11.0 — six governments, a moving world

- Restricted new campaign selection to Pakistan, Germany, the United States, China, Saudi Arabia and Brazil. Other countries remain in world data, diplomatic interactions and autonomous maneuvers. Existing saves outside the six still load with the original rules.
- Added two signature pressure meters, three governing bargains, four selectable promises and two deliverable projects per authored country.
- Added recurring country-specific dilemmas using the existing event-card pipeline and Game Master reaction system.
- Added procurement, construction and commissioning with operating benefits, carrying costs, delivery disruption and audit/expedite choices.
- Added persistent foreign agendas for eight governments and three non-state forces, bilateral relationships, counter-maneuvers, diplomacy windows, expiring offers and economic spillovers.
- Added an optional AI world-director call each turn. It receives the persistent world state and can author bounded developments; an outage leaves the autonomous simulation running.
- Added campaign promises to final scoring, meaningful legislative access and a US midterm seat adjustment.
- Added a campaign dashboard, visible world pressures, diplomatic offer controls, intelligence desk, map dispatch pins and responsive styling with larger labels and keyboard focus.
- Added AI request timeouts and atomic world-turn application.

Live AI behavior, browser rendering and gameplay balance still require playtesting. This is an implemented six-country slice, not a verified public release.

# 0.10.0 — simulation foundation

- Moved v9 resolution into the ending month, before reports and next-turn generation.
- Aligned election final scoring with the simulated election result.
- Routed democratic agenda enactment through parliament; prevented duplicate pending bills.
- Added validated AI-authored custom policies and a review/confirm flow.
- Applied custom policy effects and modifiers on assent, with report entries.
- Held incomplete legacy custom drafts for revision.
- Prevented repeated regime transition effects and corrected the rate-cut refusal calculation.
- Prevented duplicate AI effects and late replies crossing career boundaries.
- Added political pressures and queued consequences to Game Master context.
- Removed map-loading mutations of political state.
- Added a source-based deploy build and regression tests.

This is the first implementation milestone, not the completed redesign or public release.
