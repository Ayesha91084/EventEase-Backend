# EventEase - Testing Log

Ye file frontend aur backend ki manual testing ka record hai.

## Test Log

| Date | Feature Tested | Steps | Expected Result | Actual Result | Status |
|------|----------------|-------|------------------|----------------|--------|
| 2026-09-10 | Home Page | Home page open kiya | Content, images, buttons sahi load hon | Sab kuch sahi load hua | ✅ Pass |
| 2026-09-10 | Home Page - Search Filter (Cascading Dropdowns) | Country, Province, City select kar ke Search click kiya | Cascading logic sahi kaam kare (Province disabled bina Country ke, City disabled bina Province ke), Search se Vendors page khule | Sab sahi kaam kiya — Country select na hone tak Province/City disabled the, Province select karne pe Cities show hui, Search se Vendors page (venues ke sath) khula, Country/Province change karne pe neeche wale dropdowns reset ho gaye | ✅ Pass |
| 2026-09-10 | Home Page - "View All Vendors" Link | "View All Vendors" link click kiya | Vendors page khulna chahiye | Vendors page sahi khula (data khaali hai, vendors abhi add nahi hue) | ✅ Pass |
| 2026-09-10 | Home Page - Mobile Responsive View | Chrome DevTools se mobile view (600px width) mein Home page check kiya | Layout sahi adjust hona chahiye, hamburger menu dikhna chahiye | Hero, Services, Vendors, Footer sab sahi responsive the. Navbar links hamburger (☰) menu mein chale gaye the, click karne pe sab links (Home, Services, Vendors, About Us) sahi khule | ✅ Pass |
| 2026-09-10 | Services Page - Search Bar | "photographer" likh kar Search button click kiya | Search results dikhne chahiye | Pehle button static tha (onClick missing), FIXED: ab Vendors page pe navigate karta hai search text ke sath | ✅ Pass (Fixed) |
| 2026-09-10 | Services Page | Navbar se Services click kiya | Services data dikhna chahiye | Data sahi dikha | ✅ Pass |
| 2026-09-10 | Services - Category: Venues & Halls | Venues & Halls icon click kiya | Vendors page khulna chahiye | Vendors page sahi khula | ✅ Pass |
| 2026-09-10 | Services - Category: Marquees | Marquees icon click kiya | Vendors page khulna chahiye | Vendors page sahi khula | ✅ Pass |
| 2026-09-10 | Services - Category: Photographers | Photographers icon click kiya | Photographers ki real list ya vendors page pe filtered results aane chahiye | Ek static/hardcoded demo vendor page khula ("Royal Marquee Gardens", "Demo mode active" likha hua) jo Vendors page ki real listing se match nahi karta | ❌ Fail (Static/demo data, not connected to real vendor data — inconsistent with actual Vendors listing) |
| 2026-09-10 | Services - Category: Decorators | Decorators icon click kiya | Decorators ki real list ya Vendors page se match honi chahiye | Static/hardcoded demo vendor dikha ("Hanif Rajput Design", 1 decorator available) jo Vendors page ki khaali listing se match nahi karta | ❌ Fail (Same pattern as Photographers — static demo data, not synced with real Vendors data) |
| 2026-09-10 | Services - How It Works Section | 3 steps (Browse, Compare, Book) pe click karke dekha | Ye informational cards hain, click action expected nahi | Click karne pe kuch nahi hota, page same rehta hai | ✅ Pass (Expected - not clickable, purely informational) |
| 2026-09-10 | Services - Featured This Week Section | 4 event cards (Wedding, Corporate, Party, Gala) pe click karke dekha | Ye showcase cards hain, click action expected nahi | Images sahi load hui, click karne pe kuch nahi hota | ✅ Pass (Expected - informational showcase) |
| 2026-09-10 | Services - Stats Bar | Section pe scroll kiya (50+ Vendors, 6 Cities, 4.8 Rating) | Values sahi dikhni chahiye | Animated counter effect sahi kaam kar raha hai — 0 se increase ho kar fix value pe settle hota hai | ✅ Pass |
| 2026-09-10 | Services - FAQ Section | 3 FAQ questions pe click karke dekha | Click karne pe answer expand/collapse hona chahiye | Sahi kaam kiya - click se khula, dobara click se band hua | ✅ Pass |
| 2026-09-10 | Services - CTA Banner "Get started" Button | "Get started" button click kiya | Sign Up page khulni chahiye | Sign Up page sahi khula | ✅ Pass |
| 2026-09-10 | Vendors Page | Navbar se Vendors click kiya | Vendors list dikhni chahiye | (yahan result likhein) | |
| 2026-09-10 | Vendors Page - Search by Name Filter | "Photographer" likh kar search box mein | No results dikhna chahiye (data khaali hai), koi crash na ho | "0 results found" wahi raha, koi error nahi aayi | ✅ Pass |
| 2026-09-10 | Vendors Page - Category Pills Filter | Photographers, Caterers, Decorators, Venues & Marquees pills pe click karke dekha | Click karne pe highlight hona chahiye, results filter hone chahiye (data na hone se 0 rahega) | Sab pills sahi golden highlight ho rahi hain, "0 results found" aa raha hai (expected, data khaali hai) | ✅ Pass |
| 2026-09-10 | Vendors Page - Country/Province/City Cascading Dropdowns | Country, Province, City select kar ke change karke dekha | Province/City reset hona chahiye jab upar wala change ho | Sahi kaam kiya - Province change karne pe City reset hui, Country change karne pe Province reset hui | ✅ Pass |
| 2026-09-10 | Vendors Page - Max Budget Slider | Slider ko left-right drag kiya | Value update honi chahiye, results filter hone chahiye (data na hone se 0 rahega) | Slider ki value sahi kam/zyada ho rahi hai, results khaali hain (expected, data nahi hai) | ✅ Pass |
| 2026-09-10 | Vendors Page - Reset Filters Button | Kuch filters select karke Reset Filters click kiya | Sab filters default pe wapis aane chahiye | Sahi kaam kiya - sab filters (search, category, country, province, city, budget) default position pe wapis aaye | ✅ Pass |
| 2026-09-10 | Vendors Page - Sort By Dropdown | Relevance, Top Rated, Price Low-High, Price High-Low select karke dekha | Dropdown sahi select ho, koi error na aaye | Sab options sahi select ho rahe hain, koi crash nahi, filtering visible nahi (expected, data khaali hai) | ✅ Pass |
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
| 2026-09-10 | About Us - Stats Section (500+ Events, 50+ Venues, 10k+ Users, 4.8 Rating) | Page load hote waqt stats section dekha | Animated counter effect hona chahiye | Sahi kaam kiya - counter animate hota hai, sahi values pe settle hota hai | ✅ Pass |
| 2026-09-10 | About Us - Our Mission & Vision Section | Content dekha | Static informational text hona chahiye | Sahi text load hua, static content hai (koi interaction expected nahi) | ✅ Pass |
| 2026-09-10 | About Us - Our Story Section (Timeline) | Content dekha | Static informational timeline hona chahiye | Sahi text load hua, static hai (koi interaction expected nahi) | ✅ Pass |
| 2026-09-10 | About Us - Our Services Section (4 cards) | Cards pe click/hover kiya | Static content, koi navigation expected nahi | Content static hai, cards hover pe zoom effect dikhate hain (UI polish) | ✅ Pass |
| 2026-09-10 | About Us - What People Say (Testimonials) | Content dekha | Static testimonial cards | Sahi load hue, static hain (koi interaction expected nahi) | ✅ Pass |
| 2026-09-10 | About Us - Meet The Team Section | Team cards (Mahroosh, Ayesha Bibi, Asma Noreen) pe click kiya | Static content, koi navigation expected nahi | Cards static hain (koi interaction/profile link) | ✅ Pass |
| 2026-09-10 | About Us - "Sign Up Free" CTA Button | Button click kiya | Sign Up page khulni chahiye | Sign Up page sahi khula | ✅ Pass |
## Fixes Applied
- VendorProfile.jsx mein react-calendar aur react-leaflet packages missing the (git pull ke baad naye dependencies add hui thin lekin npm install nahi chalaya tha). Fix: npm install dobara chalaya.
- Backend abhi mera system se MongoDB se connect nahi ho raha (IP whitelist issue) — is wajah se Sign Up, Login, aur database-dependent saare features test nahi ho sakte.
- Google OAuth "Error 400: origin_mismatch": localhost:5173 ko Google Cloud Console mein Authorized JavaScript Origins mein add karna hoga (jisne bhi Google OAuth setup kiya, unse contact karna hoga).
- Services page ka Search button kaam nahi kar raha tha kyunke onClick handler missing tha. Fix: navigate() function add kiya jo Vendors page pe le jata hai search query ke sath.

## Known Issues

- Backend abhi  mara system se connect nahi ho raha (MongoDB IP whitelist issue) — testing partially blocked isi wajah se.
- Photographers category (/photographer route) ek static demo page dikhata hai jo real vendor data se connect nahi hai — Asma se confirm karna hoga ke ye intentional placeholder hai ya isay dynamic banana baaki hai.
- Photographers aur Decorators categories (/photographer aur /decorators routes) static/hardcoded demo vendors dikhate hain jo real Vendors page data se match nahi karte. Ye ek design pattern lagta hai (dono categories mein same tarah ka issue) — Asma se confirm karna hoga.


## Recommendations for Team

- Photographers aur Decorators pages (`Photographer.jsx`, `Decorators.jsx`) abhi `VendorsData.jsx` file se static/hardcoded dummy data use karte hain. Iske against, main Vendors listing page (`Venuepage.jsx`) sirf real backend API (`/vendors/search`) se live data fetch karti hai — is liye jab tak backend MongoDB se connect nahi hota, ye page hamesha khaali/"Getting things ready" dikhata hai.
- **Decision needed:** Team ne decide kiya hai ke dummy data ko permanently hatana hai aur uski jagah real vendor accounts database mein add karne hain (dummy delete nahi karna abhi tak, kyunke Photographer/Decorators pages abhi bhi isi data pe depend hain).
- **Iske liye 2 steps zaroori hain:**
  1. Backend ko MongoDB se connect karna hoga (abhi bhi "CRITICAL: DB Connection Failed" error aa raha hai — MongoDB Atlas Network Access mein IP whitelist karna hoga, Ayesha ke access se).
  2. Backend connect hone ke baad, 3-4 real vendor accounts Sign Up (Vendor role) se create karne honge taake Venuepage.jsx ko real data mil sake. Uske baad Photographer.jsx aur Decorators.jsx ko bhi is real data se connect karna hoga (abhi dummy data use kar rahe hain), aur `VendorsData.jsx` ko delete kiya ja sakta hai.
- **Status:** Ye fix abhi testing scope se bahar hai (backend connectivity aur data-entry ka kaam hai) — isay backend/dev team ke sath discuss karna hoga.