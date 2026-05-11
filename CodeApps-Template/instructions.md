# Prerequisites

## System Configuration

- [Node.js LTS](https://nodejs.org/)
- [Git](https://git-scm.com/)

## Resource Requirements

- Azure Key Vault - for Custom Connector API Key
  - Register for a free API key at [The Movie Database (TMDB)](https://www.themoviedb.org/) under Settings > API
  - Create a new secret in your Azure Key Vault containing the TMDB API key
  - Link the Key Vault secret to the `gbb_tmdb_apikey` environment variable after importing the [`CodeAppsTemplateBase_1_0_0_0.zip`](solutions/CodeAppsTemplateBase_1_0_0_0.zip) solution
  - For more information on setting up Azure Key Vault and testing, see [Use Azure Key Vault secrets in environment variables](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/environmentvariables-azure-key-vault-secrets)
- Azure SQL Database - for Private movie reviews
  - Create an Azure SQL Database with Entra ID authentication
  - Open [`scripts/create-movieReviews-db.sql`](scripts/create-movieReviews-db.sql) and replace `<YOURDOMAIN>` with your Azure tenant domain (e.g. `M365x123456.onmicrosoft.com`)
  - Run the script against your database to create the `dbo.Reviews` table and insert sample data
- SharePoint List - for Company Holidays
  - Create a SharePoint list called **Global Country Holidays**
  - Add the following columns to the list:
    - **Date** — Date and Time field with format set to **Date Only**
    - **Holiday** — Single line of text field
  - Use the prompt in [`scripts/GenerateCompanyHolidays.md`](scripts/GenerateCompanyHolidays.md) with GitHub Copilot to generate the holiday dates for the current year
  - Copy the generated dates into the SharePoint list as new items

## Power Platform Environment

- Dataverse enabled
- Code Apps enabled
- Import solution [`CodeAppsTemplateBase_1_0_0_0.zip`](solutions/CodeAppsTemplateBase_1_0_0_0.zip) (includes)
  - TMDB Custom Connector
  - API Key environment variable
  - Cloud flow to obtain API key environment variable value
  - Copilot Studio agent
- Connections configured for:
  - Office 365 Outlook
  - Office 365 Users
  - Microsoft Teams
  - SharePoint Online
  - Dataverse
  - TMDB (custom connector)
- Content Security Policy (CSP)

In order for images (e.g. TMDB movie posters, OpenStreetMap tiles) and embedded videos (e.g. YouTube trailers) to render properly, you must update the Content Security Policy settings in the **Power Platform Admin Center** for your environment.

Navigate to **Environments → \<your environment\> → Settings → Product → Privacy + Security → Content Security Policy** and configure the following:

| Directive | Use Default | Sources |
|---|---|---|
| **img-src** | Off | `http://*.tmdb.org` `https://*.youtube.com` `https://*.openstreetmap.org` |
| **frame-src** | Off | `https://*.youtube.com` |

> **Note:** After updating these settings, it may take a few minutes for the changes to take effect.

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

Initialize the project as a Code App tied to your Dataverse environment.  This will generate the power.config.json file tied to your environment:

```bash
npx power-apps init --display-name "Code Apps Template" --environment-id <your environment id>
```

### 2. Add Data Sources

Each data source requires a connection ID. To learn more about connecting to data sources and where to find connection IDs, see [Connect to data in Code Apps](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data).

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
npx power-apps add-data-source --api-id shared_sharepointonline --connection-id <your-sharepoint-connectionid> --dataset <your-sharepoint-site-url> --resource-name "Global Country Holidays"
```

#### 2b. Dataverse tables

Run the following commands from the project root to add each Dataverse table. When connecting to Dataverse you will need your organization url (e.g. https://org***.crm.dynamics.com)

##### Account table

In order for the Customers to show on the map, Accounts will need populated latitude and longitude fields on their primary address.  You can use a coding agent or Copilot Studio with Code Interpreter to generate latitude and longitude based on address fields.

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

#### 2d. SQL Database

For movie reviews, you will need an Azure SQL Database using Entra ID authentication.

```bash
npx power-apps add-data-source --api-id shared_sql --connection-id <your-sqlconnector-id> --dataset <yourSQLServer.database.windows.net>,movieReviews --resource-name "[dbo].[Reviews]" --org-url <your-org-url>
```

#### 2e. Copilot Studio

For the agent panel, you will need a Copilot Studio connection to connect to the agent provided in the [`CodeAppsTemplateBase_1_0_0_0.zip`](solutions/CodeAppsTemplateBase_1_0_0_0.zip) solution. 

```bash
npx power-apps add-data-source --api-id shared_microsoftcopilotstudio --connection-id <your-copilotStudioConnector-id> --org-url <your-org-url>
```

The sample code uses the agent name from the solution, but you can change the agent by updating the `AGENT_NAME` variable in [`src/components/AgentPanel.tsx`](src/components/AgentPanel.tsx):

```typescript
const AGENT_NAME = 'gbb_CodeAppsAgent'
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

Run the following command to register the dataverse action `AISummarizeRecord` which is used to show an AI Summary on the [AccountDetailsModal.tsx](src/components/AccountDetailsModal.tsx) component

```bash
npx power-apps add-dataverse-api --api-name AISummarizeRecord
```

### 5. Run Locally

Start the development server:

```bash
npm run dev
```

This launches the app at `http://localhost:3000` with live connections to your Power Platform data sources.

### 6. Build

Build the app to prepare it for deployment:

```bash
npm run build
```

This compiles TypeScript and bundles the app into the `dist` folder.

### 7. Push to Power Platform

When ready to deploy you can push the app into a specific solution by specifying the solution name. The solution must already exist in your environment:

```bash
npx power-apps push --solution-name <your-solution-name>
```
