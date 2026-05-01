# Code Apps Demo Template

This template provides a minimal setup to get a Code App running for demonstration with live data sources.

## Prerequisites

### System Configuration

- [Node.js LTS](https://nodejs.org/)
- [Git](https://git-scm.com/)

### Power Platform Environment

- Dataverse enabled
- Code Apps enabled
- Import solution CodeAppsTemplate
- Connections configured for:
  - Office 365 Outlook
  - Office 365 Users
  - Microsoft Teams
  - SharePoint Online
  - Dataverse
  - TMDB (custom connector)

## Getting Started

### 1. Initialization

Clone this repository, navigate to the project folder

#### 1a. Install dependencies

Make sure you are in the CodeApps-Template folder and use NPM install

```bash
cd CodeApps-Template
npm install
```

#### 1b. Initialize Code App

Initialize the project a  Code App tied to your Dataverse environment:

```bash
npx power-apps init --display-name "Code Apps Template" --environment-id <your environment id>
```
### 2. Add Data Sources

#### 2a. Office 365 Data Sources

Run the following commands from the project root to add each data source. The CLI will prompt you interactively to select your connection and configure options.

##### Office 365 Outlook

```bash
npx power-apps add-data-source --api-id shared_office365 --connection-id <your-office365outlook-connectionid>
```

##### Office 365 Users

```bash
npx power-apps add-data-source --api-id shared_office365users --connection-id <your-office365users-connectionid>
```

##### Microsoft Teams

```bash
npx power-apps add-data-source --api-id shared_teams --connection-id <your-teams-connectionid>
```

##### Microsoft SharePoint - Global Country Holidays

```bash
npx power-apps add-data-source --api-id shared_sharepointonline --connection-id <your-sharepoint-connectionid> --dataset <your-sharepoint-site-url> --resource-name <your-sharepoint-list-name>
```

#### 2b. Dataverse tables

Run the following commands from the project root to add each Dataverse table. When connecting to Dataverse you will need your organization url (e.g. https://org***.crm.dynamics.com)

##### Account table

```bash
npx power-apps add-data-source --api-id dataverse --resource-name account --org-url <your-org-url>
```

##### Contact table

```bash
npx power-apps add-data-source --api-id dataverse --resource-name contact --org-url <your-org-url>
```

#### 2c. Custom Connectors

Run the following commands from the project root to add each custom conncetor. 

##### TMDB

For custom connectors, you will need the API ID of your TMDB custom connector. 

```bash
npx power-apps add-data-source --api-id <your-tmdb-custom-connector-api-id> --connection-id <your-tmdb-connectionid>
```

### 3. Add Power Automate Flow

Run the following command to find the Power Automate flow IDs needed to register in the Code App

```bash
npx power-apps list-flows --search GetAPIKey
```

Run the following command to register the needed Power Automate flows

```bash
npx power-apps add-flow --flow-id <flow-id>
```

### 4. Add Dataverse Actions

Run the following command to register the dataverse action

```bash
npx power-apps add-dataverse-api --api-name <TBD>
```

### 5. Run Locally

Start the development server:

```bash
npm run dev
```

This launches the app at `http://localhost:3000` with live connections to your Power Platform data sources.

### 6. Push to Power Platform

When ready to deploy:

```bash
npx power-apps push
```

