# Goal Description

Implement Phase 3: Historical Borders Feature. This will introduce interactive historical borders (via GeoJSON overlays) that update with the time slider, along with event banners for key historical moments.

## User Review Required

Please review the proposed mapping of GeoJSON files to historical periods. I noticed that some of the exact years requested in the prompt (e.g., 1 AD, 1991) are not present in your `client/src/data/` folder, but there are very close alternatives (like `world_bc1.geojson` and `world_1994.geojson`). I have adjusted the plan to use the existing files in the repository to avoid needing to download external files.

## Open Questions

- Should the `ne_110m_admin_0_countries.json` file be used for the modern era (2024)?
- Are there any specific styling adjustments you'd like for the borders beyond the default gold with 0.05 fill opacity?

## Proposed Changes

---

### UI Components

#### [MODIFY] [TimeSlider.jsx](file:///mnt/diskE/Practice%20web%20development/Epocha/client/src/components/Map/TimeSlider.jsx)
- Change slider minimum to -500.
- Update era labels formatting to reflect the new range ("Late Ancient World", "Early Ancient / Roman Era", etc.).

#### [NEW] [EventBanner.jsx](file:///mnt/diskE/Practice%20web%20development/Epocha/client/src/components/UI/EventBanner.jsx)
- Create a banner component that triggers when the slider hits a key historical year.
- Implement color coding, title, description, and an optional "View on Map" fly-to button.
- Auto-dismiss after 6 seconds.

#### [MODIFY] [FilterBar.jsx](file:///mnt/diskE/Practice%20web%20development/Epocha/client/src/components/Filters/FilterBar.jsx)
- Add a toggle button for borders (`Borders ON` / `Borders OFF`).

---

### Map Components

#### [NEW] [BorderOverlay.jsx](file:///mnt/diskE/Practice%20web%20development/Epocha/client/src/components/Map/BorderOverlay.jsx)
- Create a GeoJSON layer wrapper using `react-leaflet`.
- Use the `borderManager` to load and cache the appropriate border snapshot based on the current year.
- Handle guest logic (cap borders at 1945 if guest).
- Add hover tooltips for territory names.
- Display a small loading indicator/label for the active border snapshot.

#### [MODIFY] [MapView.jsx](file:///mnt/diskE/Practice%20web%20development/Epocha/client/src/components/Map/MapView.jsx)
- Import and render `BorderOverlay` inside the `MapContainer`.
- Render `EventBanner` outside the `MapContainer`.
- Implement `useRef` to track previous slider year and trigger `EventBanner` when historical event boundaries are crossed.
- Add `handleFlyTo` function.

---

### Data and Utilities

#### [NEW] [borderManager.js](file:///mnt/diskE/Practice%20web%20development/Epocha/client/src/utils/borderManager.js)
- Maintain an in-memory cache of loaded GeoJSON files.
- Export `BORDER_SNAPSHOTS` mapping (mapped to existing files in `client/src/data/`).
- Export `getNearestSnapshot` and `loadBorders` functions.

#### [NEW] [historicalEvents.js](file:///mnt/diskE/Practice%20web%20development/Epocha/client/src/data/historicalEvents.js)
- Add the `HISTORICAL_EVENTS` array containing key moments.
- Export `getEventForYear` helper to check if the slider crossed an event.

#### [MODIFY] [mapStore.js](file:///mnt/diskE/Practice%20web%20development/Epocha/client/src/store/mapStore.js)
- Add `bordersVisible` state (default true).
- Add `setBordersVisible` action.

#### [MODIFY] [tailwind.config.cjs](file:///mnt/diskE/Practice%20web%20development/Epocha/client/tailwind.config.cjs)
- Add `slide-down` keyframes and animation for the `EventBanner`.

#### [MODIFY] [index.css](file:///mnt/diskE/Practice%20web%20development/Epocha/client/src/index.css)
- Add `.border-tooltip` class for styling GeoJSON hover tooltips.

## Verification Plan

### Automated Tests
- No automated tests required for these UI/UX changes.

### Manual Verification
- Move the time slider and verify that the `BorderOverlay` requests the correct geojson files and fades them in.
- Move the time slider past an event year (e.g., 1492) and check that the `EventBanner` appears with correct styling and auto-dismisses.
- Click "View on Map" in the event banner and verify the map flies to the correct coordinates.
- Toggle the borders via the `FilterBar` and verify they hide/show.
- Verify that a Guest user cannot load borders past 1945.
