# EventEase - Testing Log

Ye file frontend aur backend ki manual testing ka record hai.

## Test Log

| Date | Feature Tested | Steps | Expected Result | Actual Result | Status |
|------|----------------|-------|------------------|----------------|--------|
| 2026-09-10 | Home Page | Home page open kiya | Content, images, buttons sahi load hon | Sab kuch sahi load hua | ✅ Pass |
| 2026-09-10 | Services Page | Navbar se Services click kiya | Services data dikhna chahiye | Data sahi dikha | ✅ Pass |
| 2026-09-10 | Vendors Page | Navbar se Vendors click kiya | Vendors list dikhni chahiye | (yahan result likhein) | |
| 2026-09-10 | Vendors/VendorProfile Page | Vendors page open kiya | Page load ho | "Failed to resolve import react-calendar" error aayi | ❌ Fail → Fixed |

## Fixes Applied
- VendorProfile.jsx mein react-calendar aur react-leaflet packages missing the (git pull ke baad naye dependencies add hui thin lekin npm install nahi chalaya tha). Fix: npm install dobara chalaya.

## Known Issues

- Backend abhi  mara system se connect nahi ho raha (MongoDB IP whitelist issue) — testing partially blocked isi wajah se.
