# Yard Check-In — Memory Bank

## Project

- Path: C:\development\CodeApps\YardCheckin
- App name: Yard Check-In
- Environment ID: a8995412-eaba-ed8a-bb79-85561816011c
- App ID: 75fe70f4-1825-4c07-95a2-45bf4a3d8dde
- App URL: https://apps.powerapps.com/play/e/a8995412-eaba-ed8a-bb79-85561816011c/app/75fe70f4-1825-4c07-95a2-45bf4a3d8dde
- Last deployed: 2026-09-25T15:13:37-05:00

## Completed

- [x] Power Apps Code App React/Vite project
- [x] Fluent UI tablet-first design
- [x] Summit Equipment red, black, and white brand system with logo lockup
- [x] Office 365 Users connector for current-user profile photo with initials fallback
- [x] MSN Weather connector for device-location current weather in the shared header
- [x] Dataverse return booking, rental agreement, account, asset, and contact tables with generated models and CRUD services
- [x] QR/barcode scanning with manual fallback
- [x] Mobile Power Apps WebView scanner compatibility via ZXing
- [x] Direct in-app mobile walk-around video recording via MediaRecorder
- [x] Repeat camera capture with asset photo carousel, preview, and delete
- [x] On-demand photo analysis after camera capture
- [x] Camera capture for hour meter and fuel receipt
- [x] Hour meter image validation through the Equipment Reimagined: Analyze Image workflow
- [x] Hour meter condition photo creation linked to the Return Booking, including image upload, analysis result, and Hour Meter angle type
- [x] Fuel receipt validation through the Equipment Reimagined: Analyze Image workflow with US currency formatting
- [x] Single-image preview and retake for hour meter and fuel receipt
- [x] Browser speech recognition with editable transcript fallback
- [x] Editable human-confirmation summary
- [x] Low-confidence damage warning
- [x] Browser storage and geolocation permission requests removed
- [x] Mobile startup defers Power Apps connector initialization until after initial render
- [x] Responsive tablet/mobile layout
- [x] Production build and lint validation

## Current Integration State

- Capture capabilities use browser media APIs.
- Barcode decoding uses a lazily loaded ZXing multi-format reader instead of the inconsistently supported native `BarcodeDetector` API.
- Office 365 Users is connected through connection `7410a93b-93d7-4b79-9214-5b7a27dbd7c6`; the header uses `MyProfile_V2` and `UserPhoto_V2` with initials fallback.
- MSN Weather is connected through connection `666f8b4e20b4467e9d014b63db43b85b`; the header uses a session-only user-entered location and `CurrentWeather` with imperial units.
- Dataverse table `msftmfm_returnbooking` is connected as data source `returnbookings` (`msftmfm_returnbookings` entity set).
- Dataverse tables `msftmfm_rentalagreement`, `account`, `msftmfm_asset`, and `contact` are connected as `rentalagreements`, `accounts`, `assetregisters`, and `contacts`.
- Generated CRUD services are `Msftmfm_returnbookingsService`, `Msftmfm_rentalagreementsService`, `AccountsService`, `Msftmfm_assetsService`, and `ContactsService`.
- Use generated services for all Dataverse operations; do not call the Dataverse Web API directly.
- CLI binary: grouped `pa`, invoked locally with `npx --no-install pa`.
- Hour meter photos are sent to `EquipmentReimagined_AnalyzeImageService.Run` as base64 file content with image type `Meter`; the returned `result` is shown as the validated meter reading.
- After successful hour meter analysis, `Msftmfm_conditionphotosService` creates a Return Booking-linked condition photo with angle type `Hour Meter`, Photo Status `Analyzed`, and the workflow result in `Analysis Result`; Dataverse supplies the autonumber Photo ID, then the app updates the `Captured Photo` image column with the JPEG's base64 data in a separate operation.
- Fuel receipt analysis uses the same Condition Photo persistence sequence with angle type `Fuel Receipt`, Photo Status `Analyzed`, the formatted workflow amount in `Analysis Result`, and the receipt JPEG in `Captured Photo`.
- Asset photo capture immediately sends each image to `EquipmentReimagined_AnalyzeImageService`, maps the returned `description` to the matching Condition Photo angle choice, and saves each verified result and JPEG separately with Photo Status `Captured`. The Analyze Photos action is enabled only after every image is persisted; it re-reads the ordered Analysis Result values from those Condition Photo records and sends them to `EquipmentReimagined_AnalyzeConsolidatedImageResultsService`. After saving and verifying `consolidatedSummary`/`consolidatedResult` in the Return Booking's `Image Analysis Summary`/`Image Analysis` fields, it updates and verifies each Condition Photo as `Analyzed`.
- Capture-time asset analysis retries one transient workflow failure, and Condition Photo ID recovery, image update, and read-back verification use bounded retries to accommodate Dataverse propagation without creating a second record. The carousel displays the selected image's persisted Photo ID and Analysis Summary.
- For asset images, the analyze workflow's `description` value is parsed as `angle;summary`. The angle is validated against the generated choice labels, and the summary is saved to the Condition Photo's `Analysis Summary` field. The review screen labels each image with its Dataverse autonumber `Photo ID` and shows the saved Analysis Summary as its description.
- Fuel receipt photos use the same workflow with image type `Receipt`; the returned `result` is formatted as USD and shown as the validated receipt amount.
- Offline confirmation is disabled; no check-in or location data is persisted in browser storage.
- Return confirmation saves the reviewed voice transcript (including typed edits) to the Return Booking's `Voice Notes` (`msftmfm_voicenotes`) column and verifies the saved text before showing success. An empty transcript clears the column.

## Planned Data Sources

- Dataverse: Asset Register, Rental Agreement, Condition Log, file attachments
- AI processing endpoint or connector: damage detection, OCR, document extraction, and signal fusion

## Next Steps

- Add Dataverse tables and generate Power Apps data services.
- Add the approved AI processing connector or cloud flow.
- Replace representative extraction values with service responses.
- Build and deploy after explicit approval.
