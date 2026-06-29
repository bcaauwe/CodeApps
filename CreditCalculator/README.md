# Copilot Credit Calculator

> [!IMPORTANT]
> 🤖 **AI-Generated Code Notice**
>
> This template was generated using GitHub Copilot to demonstrate AI-assisted development workflows with Power Apps Code Apps. The code has been created for **educational and demonstration purposes only** and has not undergone detailed manual code review or security auditing.
>
> Please use this sample at your own risk and ensure proper code review, testing, and security validation before using any patterns or code in production environments.

This template allows users to create estimates for Copilot Credits based on different products, personas, and personalized pricing — all saved and managed in Dataverse.

## App Overview

The app provides a streamlined calculator experience for estimating Copilot Credit consumption. Users select products and personas, configure complexity levels, and generate credit estimates. An admin settings hub allows management of products, personas, and pricing data. The app supports theming (including dark mode) via Fluent UI React v9.

### Calculator

![Calculator](screenshots/Calculator.png)

The main calculator interface where users build credit estimates:

- **Product Selection** — Choose from available Copilot products to estimate credits for
- **Persona Selection** — Assign personas to each product to model different usage patterns
- **Estimate Table** — View calculated credit ranges based on persona complexity and usage frequency
- **Save & Load Estimates** — Persist estimates to Dataverse and reload them later

**Data connections:** Dataverse (Calculator Products, Calculator Estimates, Calculator Estimate Lines)

---

### Settings Hub

![Settings Hub](screenshots/SettingsHub.png)

A centralized administration area for managing all calculator configuration:

- **Calculator Settings** — Configure global settings such as app title and working days per month
- **Admin Navigation** — Quick access to manage products, personas, and pricing

**Data connections:** Dataverse (Calculator Settings)

---

### Admin — Products

![Admin Products](screenshots/AdminProducts.png)

Manage the list of Copilot products available in the calculator:

- **Add / Edit / Delete** — Full CRUD operations for product definitions
- **Product Configuration** — Define product names and associated settings

**Data connections:** Dataverse (Calculator Products)

---

### Admin — Personas

![Admin Personas](screenshots/AdminPersonas.png)

Define and manage user personas that model different usage patterns:

- **Persona Management** — Create and edit personas representing different user types
- **Complexity Levels** — Configure credit ranges (min/max) per complexity tier (Low, Medium, High, Very High)

**Data connections:** Dataverse (Calculator Personas, Calculator Persona Complexities)

---

### Admin — Pricing

![Admin Pricing](screenshots/AdminPricing.png)

Configure personalized pricing data for credit calculations:

- **Pricing Rules** — Define pricing tiers and credit multipliers
- **Per-Product Pricing** — Set pricing specific to individual products

**Data connections:** Dataverse (Calculator Pricings)

---

### Save & Load Estimates

![Save Load](screenshots/SaveLoad.png)

Persist and retrieve credit estimates:

- **Save Estimate** — Save the current estimate configuration with a custom name
- **Load Estimate** — Browse and reload previously saved estimates
- **Per-Product Estimates** — Each product maintains its own saved estimate history

**Data connections:** Dataverse (Calculator Product Estimates, Calculator Estimate Lines)

---

## Data Connections

All data is stored and managed in Dataverse using the following custom tables:

| Table | Purpose |
| --- | --- |
| Calculator Products | Available Copilot products |
| Calculator Personas | User persona definitions |
| Calculator Persona Complexities | Credit ranges per persona per complexity level |
| Calculator Pricings | Pricing configuration |
| Calculator Settings | Global app settings |
| Calculator Product Estimates | Saved estimate headers |
| Calculator Estimate Lines | Individual estimate line items |

## Security

The app uses the **WhoAmI** and **RetrieveUserPrivileges** Dataverse actions to determine the current user and enforce role-based access to admin features.
