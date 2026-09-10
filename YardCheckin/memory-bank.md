# Yard Check-In — Memory Bank

## Project

- Path: C:\development\CodeApps\YardCheckin
- App name: Yard Check-In
- Environment ID: a8995412-eaba-ed8a-bb79-85561816011c
- App ID: Not deployed yet

## Completed

- [x] Power Apps Code App React/Vite project
- [x] Fluent UI tablet-first design
- [x] QR/barcode scanning with manual fallback
- [x] Mobile Power Apps WebView scanner compatibility via ZXing
- [x] Camera capture for damage, hour meter, and fuel receipt
- [x] Browser speech recognition with editable transcript fallback
- [x] Editable human-confirmation summary
- [x] Low-confidence damage warning
- [x] Offline queue metadata in local storage
- [x] Responsive tablet/mobile layout
- [x] Production build and lint validation

## Current Integration State

- Capture capabilities use browser media APIs.
- Barcode decoding uses a lazily loaded ZXing multi-format reader instead of the inconsistently supported native `BarcodeDetector` API.
- OCR, damage detection, and receipt extraction are representative client-side results pending AI service integration.
- Dataverse tables and generated Power Apps services are not connected yet.
- Offline queue stores condition metadata; captured image persistence and sync require Dataverse/file storage integration.

## Planned Data Sources

- Dataverse: Asset Register, Rental Agreement, Condition Log, file attachments
- AI processing endpoint or connector: damage detection, OCR, document extraction, and signal fusion

## Next Steps

- Add Dataverse tables and generate Power Apps data services.
- Add the approved AI processing connector or cloud flow.
- Replace representative extraction values with service responses.
- Persist image blobs in IndexedDB for production-grade offline capture.
- Build and deploy after explicit approval.
