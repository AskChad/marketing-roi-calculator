# A2P Registration Website Compliance Checklist

> Based on MarketingPlex A2P Registration Requirements
> Source: https://help.marketingplex.com/support/solutions/articles/70000674725-a2p-registration-website-requirements

**Date**: 2025-11-17
**Project**: Marketing ROI Calculator
**Status**: Partial Compliance - Action Required

---

## ✅ COMPLIANT ITEMS

### 1. Technical & Security Standards
- ✅ **HTTPS Enabled** - Vercel provides automatic HTTPS
- ✅ **Website Live & Functional** - Deployed at marketing-roi-calculator.vercel.app
- ✅ **No Broken Links** - All routes functional

### 2. Legal & Compliance Pages
- ✅ **Privacy Policy Page** - `/privacy` created
- ✅ **Terms of Service Page** - `/sms-terms` created
- ✅ **Privacy Policy SMS Statement** - Includes "SMS data not shared with third parties except providers"

### 3. Web Form Opt-In Requirements
- ✅ **Phone Field Optional** - Not required on contact form
- ✅ **Non-Preselected Checkboxes** - Both SMS checkboxes start unchecked
- ✅ **Separate Marketing/Transactional Checkboxes** - Two distinct consent options
- ✅ **Complete Consent Statement** - Includes:
  - ✅ Organization name (AskChad)
  - ✅ Message frequency disclosure
  - ✅ Fee disclosure (message & data rates may apply)
  - ✅ HELP for help, STOP to end
  - ✅ Links to Privacy Policy and Terms

### 4. Multi-Page Structure
- ✅ **Home Page** - Main landing page exists
- ✅ **4+ Pages** - Have Home, Privacy, Terms, Login, Register, Dashboard, Calculator, Admin

---

## ⚠️ GAPS / NON-COMPLIANT ITEMS

### 1. Core Business Information
- ❌ **Business Name Not Prominent** - Need to add company name in header/footer
- ❌ **Physical Address Missing** - Not displayed on website
- ❌ **Contact Details Missing** - No phone/email prominently shown
- ❌ **Business Name Consistency** - Need to ensure "AskChad" matches EIN/registration

### 2. Missing Required Pages
- ❌ **About Us Page** - Need to create with company details and mission
- ❌ **Contact Us Page** - Need dedicated page with:
  - Physical address
  - Phone number
  - Email address
  - Contact form

### 3. Footer Issues
- ❌ **No Footer Links to Privacy/Terms** - Footer only has copyright
- ❌ **Footer Missing Contact Info** - Need address, phone, email

### 4. Trust & Professional Elements
- ⚠️ **Limited Social Proof** - Have generic trust statement but no:
  - Customer testimonials
  - Social media links
  - Team information
  - Professional imagery

---

## 🔧 REQUIRED ACTIONS

### Priority 1: CRITICAL (Required for A2P Registration)

1. **Update Footer Component**
   - Add links to Privacy Policy and Terms of Service
   - Add business name: "AskChad" or "Marketing ROI Calculator"
   - Add physical address
   - Add contact phone and email

2. **Create Contact Us Page** (`/contact`)
   - Physical business address
   - Contact phone number
   - Contact email
   - Optional: Contact form

3. **Create About Us Page** (`/about`)
   - Company details
   - Mission statement
   - What we do / services
   - Team information (optional)

4. **Add Business Info to Header/Home**
   - Display business name prominently
   - Ensure brand consistency

### Priority 2: RECOMMENDED

5. **Enhance Privacy Policy**
   - ✅ Already states SMS data sharing policy correctly

6. **Add Trust Elements**
   - Customer testimonials (if available)
   - Social media links
   - Professional team photos

---

## 📋 IMPLEMENTATION CHECKLIST

- [ ] Create Footer component with required links and info
- [ ] Create `/contact` page with full contact details
- [ ] Create `/about` page with company information
- [ ] Update home page header with business name
- [ ] Verify business name matches A2P registration exactly
- [ ] Add physical address to footer
- [ ] Add contact phone/email to footer
- [ ] Test all footer links
- [ ] Verify Privacy Policy SMS statement
- [ ] Review Terms of Service completeness

---

## 📝 BUSINESS INFORMATION TO ADD

**Update these with actual business details:**

```
Business Name: AskChad (or Marketing ROI Calculator)
Physical Address: [REQUIRED - Add real address]
Phone Number: [REQUIRED - Add real phone]
Email: support@askchad.net or support@roicalculator.app
```

---

## 🎯 EXACT REQUIREMENTS FROM MARKETINGPLEX

### Web Form Opt-In (Already Compliant ✅)
- Phone/email fields must be optional ✅
- Non-preselected checkbox for SMS consent ✅
- **Separate checkboxes for marketing vs. non-marketing** ✅
- Consent statement must include:
  - Program name ✅
  - Organization ✅
  - Fees ✅
  - Frequency ✅
  - Help/opt-out info ✅
  - Privacy/Terms links ✅

### Privacy Policy Statement (Already Compliant ✅)
Must state: **"SMS data is not shared with third parties, except SMS providers"** ✅

Found in our Privacy Policy section 4:
> "Text-messaging originator opt-in data and consent will not be shared with any third parties except for aggregators and providers of the text-message services who enable delivery on our behalf."

---

## ✅ SUMMARY

**Current Compliance Score: 7/10**

**Compliant:**
- ✅ Form opt-in implementation (perfect)
- ✅ Privacy Policy and Terms pages
- ✅ HTTPS and security
- ✅ Multi-page structure

**Non-Compliant:**
- ❌ Missing business contact information
- ❌ Missing About Us page
- ❌ Missing Contact Us page
- ❌ Footer lacks required links and info

**Next Steps:**
1. Create Footer with contact info and links
2. Create /contact page
3. Create /about page
4. Update home page with prominent business name

---

**Last Updated**: 2025-11-17
**Version**: 1.0.0
