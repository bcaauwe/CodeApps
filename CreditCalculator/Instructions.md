# Instructions

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm (included with Node.js)
- A Power Platform environment with Dataverse enabled
- The Power Apps CLI (`pac`) installed and authenticated

## Getting Started

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Start the local dev server:

   ```bash
   npm run dev
   ```

3. The app will be available at `http://localhost:3000`.

## Importing the Solution

<!-- TODO: Add screenshot of solution import -->

1. Navigate to [make.powerapps.com](https://make.powerapps.com) and select your target environment.
2. Go to **Solutions** → **Import solution**.
3. Upload the managed or unmanaged solution `.zip` file.
4. Follow the import wizard — map any connection references when prompted.
5. Once imported, the Dataverse tables and security roles will be provisioned automatically.

## Setting Up Dataverse Tables

<!-- TODO: Add screenshot of Dataverse tables -->

The solution includes the following custom tables that are created on import:

- Calculator Products
- Calculator Personas
- Calculator Persona Complexities
- Calculator Pricings
- Calculator Settings
- Calculator Estimates
- Calculator Product Estimates
- Calculator Estimate Lines

If you need to seed initial data, see the CSV files in the `templateData/` folder.

## Importing Template Data

1. Open the **Calculator Settings** admin page and configure global settings (app title, working days per month).
2. Use the CSV files in `templateData/` to bulk-import reference data:
   - `calculator-settings.csv` → Calculator Settings table
   - `personas.csv` → Calculator Personas table
   - `pricing-data.csv` → Calculator Pricings table

<!-- TODO: Add screenshot of data import -->

## Deploying to Power Apps

1. Ensure `power.config.json` is configured with your environment ID and app ID.
2. Build the production bundle:

   ```bash
   npm run build
   ```

3. Deploy using the Power Apps CLI:

   ```bash
   pac code-app deploy
   ```

<!-- TODO: Add screenshot of successful deployment -->

## Security Configuration

The app uses Dataverse security roles to control access to admin features. Assign the appropriate role to users who need to manage products, personas, and pricing:

1. In [make.powerapps.com](https://make.powerapps.com), navigate to **Settings** → **Security** → **Security roles**.
2. Assign the calculator admin role to the relevant users or teams.
3. Standard users only need read access to configuration tables and read/write access to estimate tables.

<!-- TODO: Add screenshot of security role assignment -->
