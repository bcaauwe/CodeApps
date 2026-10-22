# Yard Check-In

> [!IMPORTANT]
> **AI-Generated Code Notice**
>
> This sample was generated using GitHub Copilot to demonstrate AI-assisted development workflows with Power Apps Code Apps. The code has been created for **educational and demonstration purposes only** and has not undergone detailed manual code review or security auditing.
>
> Please use this sample at your own risk and ensure proper code review, testing, and security validation before using any patterns or code in production environments.

A Power Apps Code App for checking rental equipment back into the yard. Staff select a return booking, identify the equipment, capture inspection evidence, review AI-generated findings, and obtain a customer signature before confirming the return. Return details and condition photos are saved in Dataverse.

Built with React, TypeScript, Vite, and Fluent UI React v9, the app uses a tablet-first layout with responsive mobile support and Summit Equipment sample branding.

## App Overview

### Outstanding Returns

The landing page displays active **Pending** and **Confirmed** return bookings, sorted by requested return time.

- **Booking Context** - Shows the booking reference, linked rental agreement, and customer account.
- **Start Check-In** - Opens the selected booking's guided equipment return workflow.

**Data connections:** Dataverse (Return Bookings, Rental Agreements, Accounts)

---

### Identify Equipment

The first step verifies that the equipment being returned matches the asset on the rental agreement.

- **Rental Agreement** - Loads the agreement linked to the selected return booking.
- **QR/Barcode Scanning** - Uses the device camera and ZXing to read the manufacturer's serial number, with manual entry available when scanning is unavailable.
- **Asset Validation** - Checks the scanned or entered serial number against the agreement's asset.
- **Check-In Contact** - Selects the customer contact who is returning the equipment.

**Data connections:** Dataverse (Rental Agreements, Assets, Contacts)

---

### Walk-Around Capture

![Yard Check-In walk-around capture](yardcheckin-asset-media-desktop.png)

Capture inspection evidence while walking around the equipment:

- **Asset Photos** - Take multiple photos, browse them in a preview carousel, and remove unwanted captures. Each photo is analyzed and saved as a related Condition Photo record, including its image, angle, analysis result, and summary.
- **Consolidated Analysis** - The **Analyze Photos** action combines the saved photo analysis results into an overall condition result and summary on the Return Booking.
- **Walk-Around Video** - Record and preview video directly in the app on devices that support the browser's `MediaRecorder` API.
- **Hour Meter** - Photograph the meter and use the image-analysis flow to extract a reading. The meter image and result are saved as a Condition Photo.
- **Fuel Receipt** - Optionally photograph a fuel receipt and extract its amount, displayed in US currency format. The receipt image and result are saved as a Condition Photo.
- **Condition Notes** - Dictate notes using browser speech recognition or enter and edit the transcript manually. A phone-recorded audio file can also be selected.

Asset image analysis runs as photos are captured. Before proceeding to review, the app requires a meter reading and completed consolidated asset photo analysis; video alone does not satisfy the photo-analysis requirement.

**Data connections:** Dataverse (Return Bookings, Condition Photos), Power Automate image-analysis and consolidation flows

---

### Review & Confirm

The review screen brings together the identified equipment, captured media, consolidated condition summary, meter reading, fuel amount, and condition notes.

- **Overage Calculation** - Calculates excess hours against the agreement's contracted hours and applies its overage rate when available.
- **Human Review** - Staff review the findings and can return to capture to make corrections before confirming.
- **Customer Signature** - Requires a signature drawn with a finger, stylus, or mouse.
- **Save & Verify** - Saves return hours, applicable overage charges, the selected contact, customer signature, and the reviewed voice-note transcript to the Return Booking. Sets the booking to **Arrived** and every related Condition Photo to **Submitted**, then reads the records back to verify the saved values and statuses.

An online connection is required to confirm the return. Validation and save errors are shown in the app rather than treating an unsuccessful save as a completed check-in.

**Data connections:** Dataverse (Return Bookings, Condition Photos)

---

### Shared Header

- **Current User** - Loads the signed-in user's display name through Office 365 Users, with profile photos on supported desktop clients and an initials fallback.
- **Local Weather** - Shows current weather from MSN Weather for a user-entered location, using imperial units.
- **Connection Status** - Indicates whether the browser is online or offline.

**Data connections:** Office 365 Users, MSN Weather

## Data Connections

### Dataverse Tables

The app expects the following tables and their associated columns, relationships, and choices in the target environment:

| Table | Logical name | Purpose |
| --- | --- | --- |
| Return Bookings | `msftmfm_returnbooking` | Return queue, requested return slots, rental agreement links, consolidated image analysis, return hours and charges, return contact, signature, voice notes, and booking status |
| Rental Agreements | `msftmfm_rentalagreement` | Agreement number, customer and asset links, contracted hours, and overage rate |
| Accounts | `account` | Customer account details displayed in the return queue |
| Assets | `msftmfm_asset` | Equipment identification, manufacturer serial number, and asset details |
| Contacts | `contact` | Customer check-in contact details |
| Condition Photos | `msftmfm_conditionphoto` | Booking-linked images, capture times, angle types, analysis results and summaries, photo IDs, and submission status |

Dataverse access uses the generated TypeScript models and services in [src/generated](src/generated/).

### Connectors & Cloud Flows

| Connection | Purpose |
| --- | --- |
| Microsoft Dataverse | Reads and updates business records and condition photos |
| Office 365 Users | Retrieves the current user's profile and photo |
| MSN Weather | Retrieves current weather for an entered location |
| Equipment Reimagined: Analyze Image | Analyzes asset photos, hour meter images, and fuel receipts |
| Equipment Reimagined: Analyze Consolidated Image Results | Combines individual asset photo results into an overall condition result and summary |

The image-analysis flow accepts a file with base64 content and an image type of `Asset`, `Meter`, or `Receipt`. It returns `result` and `description`; asset descriptions must use the `angle;summary` format, with an angle matching the Condition Photo angle choices.

The consolidation flow accepts the individual analysis results as text and returns `consolidatedresult` and `consolidatedsummary`. The generated flow contracts are available in [src/generated/models](src/generated/models/).

## Getting Started

### Prerequisites

- A current [Node.js LTS](https://nodejs.org/) version compatible with Vite 7 and npm.
- A Power Platform environment with Dataverse and Power Apps Code Apps enabled.
- The Dataverse schema listed above, including the image columns, photo ID autonumber, status choices, and relationships used by the generated models.
- Rental agreements linked to customer accounts and assets, customer contacts, and pending or confirmed return bookings to exercise the workflow.
- The two cloud flows described above, with matching request and response contracts.
- Connections and permissions for Dataverse, Office 365 Users, MSN Weather, and the cloud flows.
- A camera-capable device and permission to access the camera; microphone permission is also needed for dictation or audio/video recording.

### Environment Configuration

The checked-in [power.config.json](power.config.json) contains the original sample app's environment, app, connection, and workflow references. **Reconfigure these for your target environment before running or deploying your own copy.** Installing npm dependencies does not provision the Dataverse schema or cloud flows.

Use the Power Apps CLI to initialize or bind your own app and configure its data sources. Keep the generated service names and contracts aligned with the imports used by this sample; do not manually edit generated services to substitute connection IDs.

See Microsoft's [Power Apps Code Apps documentation](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/) and [Connect to data in Code Apps](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data) for environment setup, authentication, data-source configuration, and deployment guidance.

### Local Development

From the repository root:

```powershell
cd .\YardCheckin
npm install
npm run dev -- --port 3000 --strictPort
```

The port matches the local app URL configured in [power.config.json](power.config.json). Use the Power Apps development experience provided by the Vite plugin and sign in to the configured environment to exercise connector-backed features.

### Validation & Build

```powershell
npm run lint
npm run build
```

The build runs TypeScript project checks and creates the production bundle in `dist`. `npm run preview` can preview the built frontend, but does not replace Power Apps authentication or provision backend dependencies.

## Current Limitations

- **No offline submission or local recovery** - Confirmation is disabled while offline. Check-in data is not persisted in browser storage for later recovery; unsaved in-memory captures and edits can be lost when leaving or reloading the app.
- **Video and audio are session-only** - Walk-around video and selected audio files can be previewed or represented in the current session, but do not have a Dataverse upload integration. The reviewed text transcript is persisted, not the audio recording.
- **Confirmation delivery is a UI demonstration** - The success screen offers text-message and email choices, but **Send confirmation** only updates local UI state. It does not send an SMS or email.
- **Browser capabilities vary** - Camera capture requires a secure context and device permissions. Video recording and speech recognition depend on browser and Power Apps mobile WebView support; manual serial-number and transcript entry remain available.
- **AI findings require human review** - Image analysis and extracted values depend on the configured flows and image quality. Treat them as inspection assistance, not a substitute for a physical inspection or staff judgment.
- **Writes happen during capture** - Photos and analysis results are saved before final confirmation. Cancelling a check-in is not a rollback of all previously saved records, and final confirmation spans multiple Dataverse updates rather than one atomic transaction.

## Security & Production Considerations

- Grant users only the Dataverse privileges required to read bookings, agreements, accounts, assets, and contacts, update return bookings, and create, read, update, or delete related Condition Photos as needed by the workflow.
- Ensure users are authorized to invoke the analysis flows and that connection sharing and environment data policies permit the required connectors.
- Review access controls and retention policies for customer signatures, contact information, inspection images, and voice-note transcripts.
- Test camera, microphone, scanning, and signature capture on the actual devices and Power Apps clients used in the yard before deployment.
