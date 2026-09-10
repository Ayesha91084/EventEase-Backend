# EventEase - Testing Log

Ye file frontend aur backend ki manual testing ka record hai.

## Test Log

| Date | Feature Tested | Steps | Expected Result | Actual Result | Status |
|------|----------------|-------|------------------|----------------|--------|
| 2026-09-10 | Home Page | Home page open kiya | Content, images, buttons sahi load hon | Sab kuch sahi load hua | ✅ Pass |
| 2026-09-10 | Services Page | Navbar se Services click kiya | Services data dikhna chahiye | Data sahi dikha | ✅ Pass |
| 2026-09-10 | Vendors Page | Navbar se Vendors click kiya | Vendors list dikhni chahiye | (yahan result likhein) | |
| 2026-09-10 | Vendors Page | Navbar se Vendors click kiya | Vendors list dikhni chahiye | Page sahi load hua, list khaali hai (data/vendors add nahi hain abhi) | ✅ Pass |
| 2026-09-10 | Sign Up Form - Empty Submit | Sab fields khaali chor kar Create Account click kiya | Error/validation message aana chahiye | "Please fill out this form" message aaya (browser validation) | ✅ Pass |
| 2026-09-10 | Sign Up Form - Invalid Email | Email field mein "abc" (bina @) likh kar submit kiya | Error message aana chahiye | "Please include an @ in the email address" error aaya | ✅ Pass |
| 2026-09-10 | Sign Up Form - Valid Data (Customer) | Sahi details bhar kar Create Account click kiya | Account create hona chahiye, OTP aana chahiye | "Sending OTP" dikha phir 2-3 sec baad fail ho gaya | ❌ Fail (Backend not connected - MongoDB issue) |
| 2026-09-10 | Sign Up Form - Valid Data (Vendor) | Vendor role select kar ke sahi details bhar ke Create Account click kiya | Account create hona chahiye, OTP aana chahiye | "Sending OTP" dikha phir fail ho gaya (same as Customer) | ❌ Fail (Backend not connected) |
| 2026-09-10 | Login/Signup - Google Sign In | "Sign in with Google" button click kiya | Google login popup khulna chahiye | "Error 400: origin_mismatch" - Access blocked | ❌ Fail |
## Fixes Applied
- VendorProfile.jsx mein react-calendar aur react-leaflet packages missing the (git pull ke baad naye dependencies add hui thin lekin npm install nahi chalaya tha). Fix: npm install dobara chalaya.
- Backend abhi mera system se MongoDB se connect nahi ho raha (IP whitelist issue) — is wajah se Sign Up, Login, aur database-dependent saare features test nahi ho sakte.
- Google OAuth "Error 400: origin_mismatch": localhost:5173 ko Google Cloud Console mein Authorized JavaScript Origins mein add karna hoga (jisne bhi Google OAuth setup kiya, unse contact karna hoga).


## Known Issues

- Backend abhi  mara system se connect nahi ho raha (MongoDB IP whitelist issue) — testing partially blocked isi wajah se.
