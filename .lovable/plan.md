# Plan: shipping checkout + admin settings

## Goal
Add a full shipping-address form to the cart/order flow, calculate shipping transparently by city/region, and let admins manage shipping rates and business hours — all kept RTL and mobile-friendly.

## What will be built

### 0. Store website URL
Add the store website address exactly as `www.takshakhkids.ir` to the footer, the contact page, and any store-information section before the rest of the plan is implemented.

### 1. Database schema (migration)
New tables:
- `orders` — guest checkout: recipient name, mobile, province, city, region/neighborhood, full address, building number, unit, postal code, shipping cost, total amount, status.

- `order_items` — line items per order (product name, price, qty, size).
- `shipping_rates` — editable rates: label, province, city, region, cost, free-shipping threshold.
- `settings` — simple key/value store for business hours and the global free-shipping threshold.

Access:
- Anyone can create an order.
- Only admins can read/update orders, rates, and settings.
- GRANTs and RLS policies follow the existing project pattern.
- Seed sample shipping rates and business hours.

### 2. Cart / checkout flow
- Extend `src/routes/cart.tsx` with a shipping form.
- Fetch shipping rates from Supabase and pick the matching rate based on city + region.
- Show product total, shipping cost, and final total before the submit button.
- On submit, insert the order + items, clear the cart, and show a confirmation.
- Mobile-first stacked form with Persian labels and validation.

### 3. Admin panel additions
- New "Shipping rates" section in `src/routes/_authenticated/admin.tsx` to add/edit/delete rates.
- New "Store settings" section to edit business hours and the free-shipping threshold.
- Queries/mutations use the existing Supabase browser client (admin route is already protected).

### 4. Footer & contact page
- Read business hours from `settings` instead of hard-coded text.
- Update `src/components/SiteFooter.tsx` and `src/routes/contact.tsx` to display the live hours.
- Keep the clickable phone number and full address already added.

### 5. Verification
- Run typecheck, build, and a quick Playwright check on `/cart` and `/contact` to confirm the form and footer render correctly.

## Out of scope
- Payment gateway integration (orders are saved as "pending").
- SMS/email notifications.
- User-account order history.

## Technical details
- New query in `src/lib/catalog.ts` for `shipping_rates` and `settings`.
- Use Supabase public-read policies for `shipping_rates` and `settings` so the cart can fetch them without auth.
- Cart inserts orders via the public `orders` INSERT policy.
- Forms use controlled inputs with native validation; order payload is assembled client-side before sending to Supabase.
