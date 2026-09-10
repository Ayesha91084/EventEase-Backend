# EventEase - Testing Log

Ye file frontend aur backend ki manual testing ka record hai.

## Test Log

| Date | Feature Tested | Steps | Expected Result | Actual Result | Status |
|------|----------------|-------|------------------|----------------|--------|
| 2026-09-10 | Home Page | Home page open kiya | Content, images, buttons sahi load hon | Sab kuch sahi load hua | ✅ Pass |
| 2026-09-10 | Home Page - Search Filter (Cascading Dropdowns) | Country, Province, City select kar ke Search click kiya | Cascading logic sahi kaam kare (Province disabled bina Country ke, City disabled bina Province ke), Search se Vendors page khule | Sab sahi kaam kiya — Country select na hone tak Province/City disabled the, Province select karne pe Cities show hui, Search se Vendors page (venues ke sath) khula, Country/Province change karne pe neeche wale dropdowns reset ho gaye | ✅ Pass |
| 2026-09-10 | Services Page | Navbar se Services click kiya | Services data dikhna chahiye | Data sahi dikha | ✅ Pass |
| 2026-09-10 | Vendors Page | Navbar se Vendors click kiya | Vendors list dikhni chahiye | (yahan result likhein) | |
| 2026-09-10 | Vendors Page | Navbar se Vendors click kiya | Vendors list dikhni chahiye | Page sahi load hua, list khaali hai (data/vendors add nahi hain abhi) | ✅ Pass |
| 2026-09-10 | Sign Up Form - Empty Submit | Sab fields khaali chor kar Create Account click kiya | Error/validation message aana chahiye | "Please fill out this form" message aaya (browser validation) | ✅ Pass |
| 2026-09-10 | Sign Up Form - Invalid Email | Email field mein "abc" (bina @) likh kar submit kiya | Error message aana chahiye | "Please include an @ in the email address" error aaya | ✅ Pass |
| 2026-09-10 | Sign Up Form - Valid Data (Customer) | Sahi details bhar kar Create Account click kiya | Account create hona chahiye, OTP aana chahiye | "Sending OTP" dikha phir 2-3 sec baad fail ho gaya | ❌ Fail (Backend not connected - MongoDB issue) |
| 2026-09-10 | Sign Up Form - Valid Data (Vendor) | Vendor role select kar ke sahi details bhar ke Create Account click kiya | Account create hona chahiye, OTP aana chahiye | "Sending OTP" dikha phir fail ho gaya (same as Customer) | ❌ Fail (Backend not connected) |
| 2026-09-10 | Login/Signup - Google Sign In | "Sign in with Google" button click kiya | Google login popup khulna chahiye | "Error 400: origin_mismatch" - Access blocked | ❌ Fail |
| 2026-09-10 | Login Form - Empty Submit | Sab fields khaali chor kar Login click kiya | Validation error aana chahiye | "Please fill out this form" message aaya | ✅ Pass |
| 2026-09-10 | Login Form - Invalid Email | Email mein "abc" likh kar submit kiya | Validation error aana chahiye | "Please include an @" error aaya | ✅ Pass |
| 2026-09-10 | Login Form - Wrong Credentials | Valid format email + random password se login try kiya | Clean error message aana chahiye | "Login failed" red text mein saaf dikha | ✅ Pass (error handling sahi hai) |
| 2026-09-10 | Login Form - Wrong Credentials | Valid format email + password se login try kiya (account signup incomplete tha backend issue ki wajah se) | Login fail hona chahiye (account exist nahi karta) | "Login failed" red text mein saaf dikha | ✅ Pass (expected behavior) |
| 2026-09-10 | Login Form - Wrong Credentials | Valid format email + password se login try kiya (account signup incomplete tha backend issue ki wajah se) | Login fail hona chahiye (account exist nahi karta) | "Login failed" red text mein saaf dikha | ✅ Pass (expected behavior) |
| 2026-09-10 | Forgot Password - Unregistered Email | Random/fake email likh kar Send Code click kiya | Clear error message aana chahiye (kyunke account exist nahi karta) | "This email is not registered. Please check and try again." message aaya | ✅ Pass |
| 2026-09-10 | Forgot Password - Empty Email | Email khaali chor kar Send Code click kiya | Validation error aana chahiye | "Please add registered email" jaisa message aaya | ✅ Pass |
| 2026-09-10 | Login Form - Password Visibility | Eye icon dhoonda password field mein | - | Login form mein password show/hide option nahi hai (Sign Up form mein tha) | ℹ️ Note (minor inconsistency, not a bug) |
| 2026-09-10 | About Us Page | Navbar se About Us click kiya | Page load ho, content sahi dikhe | Page sahi khula, content load hua | ✅ Pass |
## Fixes Applied
- VendorProfile.jsx mein react-calendar aur react-leaflet packages missing the (git pull ke baad naye dependencies add hui thin lekin npm install nahi chalaya tha). Fix: npm install dobara chalaya.
- Backend abhi mera system se MongoDB se connect nahi ho raha (IP whitelist issue) — is wajah se Sign Up, Login, aur database-dependent saare features test nahi ho sakte.
- Google OAuth "Error 400: origin_mismatch": localhost:5173 ko Google Cloud Console mein Authorized JavaScript Origins mein add karna hoga (jisne bhi Google OAuth setup kiya, unse contact karna hoga).


## Known Issues

- Backend abhi  mara system se connect nahi ho raha (MongoDB IP whitelist issue) — testing partially blocked isi wajah se.
