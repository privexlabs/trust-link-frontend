## Issue #43: Write E2E test for buyer payment flow
Description: Playwright E2E test for the buyer payment path: visit escrow link → connect wallet → sign payment → see confirmation.

### Acceptance Criteria:
- Navigates to /pay/:escrowId with a test escrow
- Connects mock wallet
- Signs and submits mock transaction
- Asserts confirmation UI appears with tx hash
- Asserts tracking page is linked

## Issue #44: Implement mobile bottom navigation bar
Description: On mobile screens, replace the desktop header nav with a bottom navigation bar with icons for: Dashboard, Create Link, Track Order, Profile.

### Acceptance Criteria:

- Visible only on screens < 768px
- Active state highlights current section
- Accessible with ARIA nav role and labels
- No overlap with content (proper padding-bottom on pages)
- Unit tested

## Issue #45: Add QR code generation to link success page
Description: After escrow link creation, render a scannable QR code that encodes the buyer payment URL. Should be downloadable as a PNG image.

### Acceptance Criteria:

- Uses qrcode.react or equivalent
- QR code is sized correctly for mobile scanning
- "Download QR" button saves as PNG with escrow ID in filename
- QR code encodes the full payment URL

## Issue #46: Add i18n support — French language (West Africa)

Description: Set up next-intl or react-i18next and add French translations for all UI strings. French is widely spoken across West Africa, a key TrustLink market.

### Acceptance Criteria:

- i18n framework installed and configured
- English (en) remains the default
- French (fr) translations for all strings in payment page and tracking page (minimum)
- Language switcher in footer
- Date and currency formatted for locale