# Instructions

## System Configuration

### Developer workstation

- [Node.js LTS](https://nodejs.org/)
- [Git](https://git-scm.com/)
- Power Apps [CLI](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli) installed globally:

  ```bash
  npm install --global @microsoft/power-apps-cli
  ```

### Power Platform Environment

- Dataverse enabled
- Code Apps enabled

## Deployment Options

1. **Compiled**: If you want to leverage the compiled code app and don't plan on changing any code.
  - Import solution [CreditCalculatorBase_1_0_0_0.zip](solutions/CreditCalculatorBase_1_0_0_0.zip)
  - Import solution [CreditCalculatorApp_1_0_0_0_managed.zip](solutions/CreditCalculatorApp_1_0_0_0_managed.zip)
2. **Clone**: If you want to adjust the source of the Code App and deploy to your environments.
  - Import solution [CreditCalculatorBase_1_0_0_0.zip](solutions/CreditCalculatorBase_1_0_0_0.zip)

## Getting Started

### Security role assignments

The app uses Dataverse security roles to control access to admin features. After the solutions are installed, a user with the **System Administrator** security role will need to assign users and teams to the **Copilot Credit Calculator Administrator** and **Copilot Credit Calculator User** security roles from the [Power Platform Admin Center](https://aka.ms/ppac).

### Initialization

For deployment option 2, use the `pa` commands to initialize, run, and deploy the code app. If you are using deployment option 1, skip to the [Importing Template Data](#importing-template-data) section.

Sign in through your system browser before initializing the app:

```bash
pa auth login
```

Use `pa auth status` to view the signed-in accounts and the active account. To work with another signed-in tenant account, run `pa auth switch` and select the account, or specify it directly:

```bash
pa auth switch --account user@contoso.com
```

Run `pa auth logout` only when you want to remove all saved sign-in information.

Clone this project template and navigate to the folder

```bash
npx degit github:bcaauwe/CodeApps/CreditCalculator my-creditCalculator
cd my-creditCalculator
```

#### Install dependencies

Make sure you are in the project folder and use `npm` install

```bash
npm install
```

#### Initialize Code App

Initialize the project as a Code App tied to your dataverse environment.  This will generate the power.config.json file tied to your environment:

```bash
pa app init --display-name "Copilot Credit Calculator" --environment-id <your-environment-id>
```

#### Add Data Sources

Run the following commands from the project root folder to add each Dataverse table. You need your environment organization URL (for example, `https://org***.crm.dynamics.com`). The `--table` value is the Dataverse table's logical name.

##### Calculator Estimate

```bash
pa app add data-source --connector dataverse --table gbb_calculatorestimate --org-url <your-org-url>
```

##### Calculator Estimate Line

```bash
pa app add data-source --connector dataverse --table gbb_calculatorestimateline --org-url <your-org-url>
```

##### Calculator Persona

```bash
pa app add data-source --connector dataverse --table gbb_calculatorpersona --org-url <your-org-url>
```

##### Calculator Persona Complexity

```bash
pa app add data-source --connector dataverse --table gbb_calculatorpersonacomplexity --org-url <your-org-url>
```

##### Calculator Pricing

```bash
pa app add data-source --connector dataverse --table gbb_calculatorpricing --org-url <your-org-url>
```

##### Calculator Product

```bash
pa app add data-source --connector dataverse --table gbb_calculatorproduct --org-url <your-org-url>
```

##### Calculator Product Estimate

```bash
pa app add data-source --connector dataverse --table gbb_calculatorproductestimate --org-url <your-org-url>
```

##### Calculator Setting

```bash
pa app add data-source --connector dataverse --table gbb_calculatorsetting --org-url <your-org-url>
```

#### Add Dataverse Actions

Run the following command to register the dataverse actions

##### WhoAmI

`WhoAmI` is an unbound Dataverse action used to get the system user id for the running user

```bash
pa app add dataverse-api --api-name WhoAmI
```

##### RetrieveUserPrivileges

`RetrieveUserPrivileges` is a bound Dataverse action to the `systemuser` table that returns all privileges for the user based on their user id

```bash
pa app add dataverse-api --api-name RetrieveUserPrivileges
```

### Run Locally

Start the Power Apps local host:

```bash
pa app run
```

This will provide the local play URL with live connections to your Power Platform environment.

### Build

Build the app to prepare it for deployment:

```bash
npm run build
```

This compiles TypeScript and bundles the app into the `dist` folder.

### Push to Environment

When ready to deploy you can push the app to the managed host.

```bash
pa app push
```

## Importing Template Data

1. Open the Copilot Credit Calculator app
2. Open the Settings Hub from the home page (this will show whenever configurations are still required)
![Configuration Needed](screenshots/ConfigurationNeeded.png)
3. Import data from the `templateData` folder in this repository into the following settings pages
  - **Products**: import `products-export.zip` using the **Import ZIP** button
  - **Personas**: import `personas.csv` using the **Import CSV** button
  - **Pricing**: import `pricing-data.csv` using the **Import CSV** button
  - **Calculator Settings**: import `calculator-settings.csv` using the **Import CSV** button and hit **Save Changes**

After data has been imported, adjust any settings based on your organizational requirements. At any time from each of the settings pages you can export files based on your current configuration to use deploying to other environments or to archive.

Once you head back to the home page, you are now ready to enter your first estimate.