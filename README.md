# Florea prototype

## Run locally

Run `npm install` and `npm run dev`, then open `http://localhost:3000/florea-prototype.html`.
Local orders, inventory and product ratings use browser storage and are only shared between tabs in the same browser.

## Deploy a free Render demo

The existing Render Static Site (`https://florea.onrender.com`) serves the frontend.
The Render Web Service (`https://florea-api.onrender.com`) runs the Node.js API, and
the free Render PostgreSQL database stores API data. The frontend is configured to
call that API, including for orders, inventory, ratings, feedback, notifications,
and uploaded product images. The existing Netlify deployment continues to use
Netlify Blobs.

**Free-tier limitations:** Render Free web services sleep after 15 minutes without
traffic and can take about a minute to wake. Free Render Postgres is limited to 1 GB
and expires 30 days after creation; after the grace period, Render deletes the
database and its data. Use this setup only for a temporary demo with noncritical
data. Do not migrate live Netlify orders or inventory to this expiring database.

1. Push the project to GitHub, then create a Render Blueprint from the repository's
   `render.yaml`. It creates the `florea-api` web service and a Free PostgreSQL
   database. The web service allows credentialed browser requests only from the
   configured `FRONTEND_ORIGIN` (`https://florea.onrender.com`).
2. Set strong, unique admin and cashier passwords and session secrets in Render.
   The API starts with `API_MAINTENANCE_MODE=false` for an empty demo database.
3. If you later migrate Netlify data, first upgrade Render Postgres to a plan that
   does not expire. Do not copy live data to Free Postgres. Before migrating, set
   `API_MAINTENANCE_MODE=true` on the Render Web Service and Netlify site, then wait
   for the Netlify deploy. This pauses its API so no orders or inventory changes
   are missed during the copy. The Netlify site remains the source and is not
   modified by the migration script.
4. From Netlify's site settings, get the source **Site ID** and create a
   **Personal access token**. From Render's database settings, copy the external
   database connection string. Run the migration from this project in PowerShell;
   enter the token and database URL only at the secure prompts:

   ```powershell
   function Set-SecureEnv([string]$Name, [string]$Prompt) {
       $secure = Read-Host $Prompt -AsSecureString
       $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
       try {
           Set-Item -Path "Env:$Name" -Value ([Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer))
       } finally {
           [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
       }
   }
   $env:NETLIFY_SITE_ID = Read-Host "Netlify source Site ID"
   $env:NETLIFY_SOURCE_URL = "https://flore3aaa.netlify.app"
   $env:CONFIRM_NETLIFY_READ_ONLY = "YES"
   Set-SecureEnv "NETLIFY_AUTH_TOKEN" "Netlify personal access token"
   Set-SecureEnv "DATABASE_URL" "Render external PostgreSQL connection string"
   npm run migrate:netlify
   Remove-Item Env:NETLIFY_AUTH_TOKEN, Env:DATABASE_URL, Env:NETLIFY_SITE_ID, Env:NETLIFY_SOURCE_URL, Env:CONFIRM_NETLIFY_READ_ONLY
   ```

   The script checks that the Site ID belongs to `flore3aaa.netlify.app`, copies
   every configured data store, verifies each copied value, and leaves Netlify
   data intact. If interrupted, keep both sites in maintenance mode and rerun it.
5. After the migration reports success, verify the Render API and switch
   `API_MAINTENANCE_MODE` to `false` in Render. Update customer links/QR codes to
   the frontend URL `https://florea.onrender.com`. Keep the Netlify site in
   maintenance mode until the cutover is complete. Do not remove the old site or
   database backups until the data has been checked.

The API service reads `PORT` from Render and listens on all interfaces. Check
`https://florea-api.onrender.com/health` before switching customers to the API;
it should return `ok` after the service and database are ready.
Optional push notifications need `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and
`VAPID_SUBJECT`; optional SMS needs the Twilio variables documented below. Never
put these secrets in Git or share them in chat.

## Publish and share orders across devices

Deploy this project to Netlify. The Netlify build publishes only the frontend files
from `dist` and deploys the API functions from `netlify/functions`. Orders and
per-item ratings are saved in Netlify Blobs, so they are shared across devices.
Customers can select Small, Medium, or Large for drinks and Hot or Iced for
coffee; Small is ₱10 less than Medium, and drinks without listed size prices
use the listed price for Medium and add ₱10 for Large. Their choices and prices
appear in the cashier order details. Customers can choose Dine-in or Takeout and
leave optional special instructions when sending an order. Customers
can also update their own rating for each product from its catalog card or
product details. Customers can send written feedback from the welcome, menu, or
order confirmation screens; the cashier can review those messages in the
Customer Feedback section. Feedback is shared through Netlify Blobs and is
available to cashiers only after sign-in. Cashier screens refresh shared orders
and feedback every three seconds.
Customer orders atomically deduct their menu stock and configured ingredient estimates
when submitted. The Inventory screen reads shared Netlify Blobs stock and supports
adjustments; the opening quantities and starter recipes are demo estimates and must
be checked against actual counts and recipes.

The drink catalog follows the printed menus: Coffee (10 items), Matcha (8
items), and Refreshers (9 Soda Refresher flavors, 11 Milk Based Latte flavors,
and Coke Float). Rice Meals, Finger Foods, and Pasta also follow the printed
menus and prices. Existing browser-saved catalogs and shared inventory are
migrated to include missing menu items without replacing saved product prices,
custom catalog entries, or current stock. New food inventory starts at a demo
estimate of 20 items per product with a reorder level of 4; verify these
quantities against actual stock. Each menu item has its own cropped product
image in `assets/products/`, used on catalog cards and product details.

The integrated cashier dashboard is designed for order processing, payment
verification, order history, and daily paid-sales totals. Cashier status changes,
payment verification, cancellation, and deletion require the server-side cashier
session. Configure `CASHIER_PASSWORD` and a `CASHIER_SESSION_SECRET` with at least
32 characters in the Netlify site environment before enabling hosted cashier
sign-in. Product-image uploads are stored as original files in Netlify Blobs and
require the server-side admin session. Product catalog records, including the
image URLs, continue to use this prototype's existing browser storage and are not
synchronized between browsers. Orders can still be read publicly for customer
and admin views. Hosted image uploads support JPG, PNG, and WEBP files up to
5 MB; local static development stores images in browser storage and limits them
to 1 MB. Do not use this system for real customer data or payments until public
data access and production data protections are reviewed.

The staff sign-in pages open directly at `/admin` and `/cashier`, without the
prototype navigation rail. Their dashboards still require the appropriate
server-side staff session.

## Cashier new-order bell

On the integrated cashier dashboard, click **Enable sound** once after signing
in. The dashboard then plays a short bell for incoming orders, payment updates,
ready orders, and cancellations. Browsers require this click before they allow
the page to play sound; use the sound control to mute it.

## Order status phone notifications

Customers can opt in to native push notifications when they submit an order. Alerts
can appear when the site is closed or the customer is using another app, as long as
the device and browser support web push and notification permission is granted.
The cashier's **Confirm Order** and **Mark as Ready** actions send a phone banner
to the device registered for that order. The customer must allow browser notifications and keep
the site deployed over HTTPS. On iPhone (iOS 16.4 or later), they must add the site
to the Home Screen before subscribing; Android browsers can subscribe from the HTTPS
site. Notifications are delivered by the phone's browser/operating system, not shown
as a popup inside the customer dashboard. Push delivery is sent with high urgency and
is retained by the push service for up to 24 hours. A powered-off or offline device
cannot display alerts until it is back on and connected; delivery after reconnection
is best-effort and depends on the browser and operating system.
If the customer has the order page open, it also checks for status changes every
2 seconds and uses the service worker to show a phone notification if needed.

### SMS updates without installing the site

Customers can also choose SMS updates at checkout and enter their phone number in
international format (for example, `+639171234567`). They must explicitly opt in.
Twilio sends one SMS when the order is accepted and another when it is ready. This
works on iPhone without adding the site to the Home Screen, but requires a Twilio
account, a supported sender, and may incur message charges.

Configure these Netlify environment variables to enable SMS:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN` (keep this secret; never commit it)
- `TWILIO_FROM_NUMBER` (your Twilio sender number in international format)

Do not put Twilio credentials in frontend code or send them in chat. Test delivery
to the intended countries and review Twilio's destination, sender-registration, and
messaging rules before enabling this for customers. This public demo does not include
SMS-specific rate limiting or staff authentication; do not enable paid SMS for public
production use until those protections are added.

Before deploying, configure these environment variables for the Netlify site:

- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET` (at least 32 characters; keep this secret and never commit it)
- `CASHIER_PASSWORD`
- `CASHIER_SESSION_SECRET` (at least 32 characters; keep this secret and never commit it)
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY` (keep this secret; never commit it)
- `VAPID_SUBJECT` (for example, `mailto:owner@example.com`)

Generate a key pair locally with
`node -e "console.log(require('web-push').generateVAPIDKeys())"` and add the public
and private values as Netlify environment variables. Keep the private key only in
Netlify's environment settings. If the VAPID key pair is changed, existing customers
must opt in to notifications again on a new order; orders already submitted with
the previous subscription may not receive push alerts. Order submission still works
if browser notifications are unavailable or permission is declined.
