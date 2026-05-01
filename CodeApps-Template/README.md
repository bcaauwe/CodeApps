# Code Apps Demo Template

This template provides a minimal setup to get a Code App running for demonstration with live data sources.

## Prerequisites

- Node.js >= 22
- A Power Platform environment with Dataverse enabled
- Connections configured for:
  - Office 365 Outlook
  - Office 365 Users
  - Dataverse
  - TMDB (custom connector)

## Getting Started

### 1. Initialize the Code App

Clone this repository, navigate to the project folder, and install dependencies:

```bash
cd CodeApps-Template
npm install
```

If starting from scratch (empty folder), initialize a new Code App project:

```bash
npx power-apps init
```

### 2a. Add Data Sources - Office 365 Sources

Run the following commands from the project root to add each data source. The CLI will prompt you interactively to select your connection and configure options.

#### Office 365 Outlook

```bash
npx power-apps add-data-source --api-id shared_office365 --connection-id <your-office365outlook-connectionid>
```

#### Office 365 Users

```bash
npx power-apps add-data-source --api-id shared_office365users --connection-id <your-office365users-connectionid>
```

#### Microsoft Teams

```bash
npx power-apps add-data-source --api-id shared_teams --connection-id <your-teams-connectionid>
```

#### Microsoft SharePoint - Global Country Holidays

```bash
npx power-apps add-data-source --api-id shared_sharepointonline --connection-id <your-sharepoint-connectionid> --dataset <your-sharepoint-site-url> --resource-name <your-sharepoint-list-name>
```

### 2b. Add Data Sources - Dataverse

Run the following commands from the project root to add each Dataverse table. When connecting to Dataverse you will need your organization url (e.g. https://org***.crm.dynamics.com)

#### Dataverse — Account table

```bash
npx power-apps add-data-source --api-id dataverse --resource-name account --org-url <your-org-url>
```

#### Dataverse — Contact table

```bash
npx power-apps add-data-source --api-id dataverse --resource-name contact --org-url <your-org-url>
```

### 2c. Add Data Sources - Custom Connectors

Run the following commands from the project root to add each custom conncetor. 

#### TMDB

For custom connectors, you will need the API ID of your TMDB custom connector. 

```bash
npx power-apps add-data-source --api-id <your-tmdb-custom-connector-api-id> --connection-id <your-tmdb-connectionid>
```

### 3. Run Locally

Start the development server:

```bash
npx power-apps run
```

This launches the app at `http://localhost:3000` with live connections to your Power Platform data sources.

### 4. Push to Power Platform

When ready to deploy:

```bash
npx power-apps push
```

