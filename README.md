# SMR Everest — Premium Luxury Real Estate Website

A production-ready, luxury real estate single-page website built with pure **HTML5, CSS3, and JavaScript ES6+**.

---

## 🗂️ Folder Structure

```
SMR Everest/
├── index.html                   ← Main SPA (all sections)
├── assets/
│   ├── css/
│   │   ├── styles.css           ← Design system + all components
│   │   ├── animations.css       ← Keyframes, transitions, reveals
│   │   └── responsive.css       ← Mobile/tablet/desktop breakpoints
│   ├── js/
│   │   ├── main.js              ← Navbar, scroll, zoom modal, utilities
│   │   ├── slider.js            ← Swiper.js hero slider
│   │   ├── gallery.js           ← Custom lightbox + lazy loading
│   │   ├── forms.js             ← Lead forms, Google Sheets API
│   │   └── counters.js          ← Animated stat counters
│   └── images/                  ← (add local images here if needed)
├── sitemap.xml                  ← SEO sitemap
├── robots.txt                   ← Search engine crawl rules
└── README.md                    ← This file
```

---

## 🚀 Quick Start

**Option A — Open directly:**
```bash
# Just open index.html in any browser
start index.html
```

**Option B — Local server (recommended for Google Maps):**
```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .

# Using VS Code — install "Live Server" extension
```

Then visit: `http://localhost:8080`

---

## 🔗 Google Sheets Integration (Lead Management)

### Step 1 — Create the Google Sheet
1. Go to [Google Sheets](https://sheets.google.com) → New spreadsheet
2. Name it: **SMR Everest Leads**
3. Add headers in Row 1:
   ```
   Timestamp | Name | Phone | Email | City | Source | Floor Plan | Message
   ```

### Step 2 — Create the Google Apps Script
1. Go to [Google Apps Script](https://script.google.com)
2. Create new project → Name it **SMR Everest API**
3. Paste this code:

```javascript
const WYLTO_WEBHOOK_URL = 'https://server.wylto.com/webhook/ZXd6Pgnj8ASPwd43yO';

function doPost(e) {
  try {
    // 1. Connects directly to the active sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};

    // 2. Parse incoming payload safely
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var timestamp = data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    var name      = data.name || "";
    var phone     = data.phone || "";
    var email     = data.email || "";
    var city      = data.city || "";
    var source    = data.source || "Website Lead";
    var floorPlan = data.floorPlan || "";
    var message   = data.message || "";

    // 3. Appends matching your Sheet columns
    sheet.appendRow([timestamp, name, phone, email, city, floorPlan || source, message]);

    // 4. Forward to Wylto CRM Webhook
    try {
      var rawDigits = (phone || "").toString().replace(/\D/g, "");
      var formattedPhone = "";
      if (rawDigits.length === 10) {
        formattedPhone = "+91" + rawDigits;
      } else if (rawDigits.length === 12 && rawDigits.indexOf("91") === 0) {
        formattedPhone = "+" + rawDigits;
      } else if (phone && phone.toString().indexOf("+") === 0) {
        formattedPhone = phone.toString();
      } else {
        formattedPhone = rawDigits ? "+" + rawDigits : "";
      }

      var wyltoPayload = {
        name: name,
        phoneNumber: formattedPhone
      };

      if (email) wyltoPayload.email = email;
      if (city) wyltoPayload.city = city;
      if (source) wyltoPayload.source = source;
      if (floorPlan) wyltoPayload.floorPlan = floorPlan;
      if (message) wyltoPayload.message = message;

      UrlFetchApp.fetch(WYLTO_WEBHOOK_URL, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(wyltoPayload),
        muteHttpExceptions: true
      });
    } catch (webhookErr) {
      Logger.log("Wylto webhook error: " + webhookErr.toString());
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("SMR Everest API is active!");
}
```

### Step 3 — Deploy as Web App
1. Click **Deploy → New deployment**
2. Type: **Web App**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Click **Deploy** → Copy the Web App URL

### Step 4 — Update the website
Open `assets/js/forms.js` and replace:
```javascript
const GOOGLE_APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
```
With your deployed URL:
```javascript
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
```

---

## ⚡ Wylto CRM Webhook Integration

Leads captured via both the Lead Modal (floor plans, site visits, brochure downloads) and the Contact Form are dispatched to Wylto CRM via webhook.

### Webhook Endpoint:
```
POST https://server.wylto.com/webhook/ZXd6Pgnj8ASPwd43yO
Content-Type: application/json
```

### Payload Structure:
```json
{
  "name": "Full Name",
  "phoneNumber": "+919987543210",
  "email": "user@example.com",
  "city": "Hyderabad",
  "source": "Lead Modal / Floor Plan Modal / Contact Form",
  "floorPlan": "4 BHK 3220 Sft",
  "message": "Optional user query"
}
```

Configured in [forms.js](file:///d:/NexHouz/SMR%20Everest/assets/js/forms.js):
```javascript
const WYLTO_WEBHOOK_URL = 'https://server.wylto.com/webhook/ZXd6Pgnj8ASPwd43yO';
```

---

## 🗺️ Google Maps Integration

The map in the Location section uses a Google Maps embed. To use your own API key:

1. Replace the `<iframe>` src in `index.html` → Location section
2. Use your specific address coordinates

---

## 🎨 Design Customization

### Colors (in `assets/css/styles.css`)
```css
:root {
  --gold:     #C89B3C;    /* Primary accent */
  --charcoal: #1B1B1B;    /* Dark backgrounds */
  --white:    #FFFFFF;    /* Base */
  --off-white: #F8F8F8;   /* Section backgrounds */
}
```

### Content Changes
All content is in `index.html`:
- **Project name/tagline**: Search `SMR Everest`
- **Phone number**: Search `+918886000555`
- **Email**: Search `sales@smreverest.com`
- **Address**: Search `Kokapet`
- **Floor plan details**: Find `fp-card` sections

---

## 📱 Sections Included

| Section | Features |
|---------|----------|
| Navbar | Sticky, transparent→solid, hamburger, active links |
| Hero | Swiper.js fade slider, parallax, 3 slides |
| About | 2-column, floating card, RERA badge |
| Counters | 12 Acres · 4 Towers · 480+ Units · 40+ Amenities |
| Highlights | 6 luxury cards with hover lift |
| Amenities | 12 icon cards, glassmorphism hover |
| Master Plan | Zoom modal, pinch zoom, drag-to-pan |
| Floor Plans | 4 plans, blurred → lead modal → unlock |
| Gallery | Masonry, custom lightbox, swipe, keyboard |
| Location | Google Maps + 6 landmark cards |
| Contact | Form → Google Sheets |
| Footer | 4-column, social links, RERA box |
| Floating | Call, WhatsApp, Book Visit |

---

## 🚀 Deployment

### Hostinger
1. Upload all files to `public_html/`
2. Point your domain to the folder

### Netlify (free)
```bash
# Drag-and-drop the SMR Everest folder to netlify.com/drop
```

### Vercel (free)
```bash
npx vercel --prod
```

---

## ⚡ Performance Notes

- All images use `loading="lazy"` attribute
- Scripts are loaded with `defer`
- AOS animations use `once: true` (animate only on first entry)
- CSS uses `will-change` only on animated elements
- Fonts are preconnected for faster load
- No jQuery or heavy dependencies

---

## 🏗️ Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 88+     |
| Edge    | 88+     |
| Firefox | 85+     |
| Safari  | 14+     |
| Mobile  | iOS 14+ / Android 9+ |

---

## 📞 Support

For customization, additional pages, or backend integration:

**Email:** contact@smrholdings.in  
**Phone:** +91 888 600 0555

---

*© 2025 SMR Everest. All rights reserved.*
