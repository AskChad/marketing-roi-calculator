# SMS Consent Data in GoHighLevel - Setup Guide

> How to configure GoHighLevel custom fields to receive SMS consent data from the ROI Calculator

**Created**: 2025-11-16
**Related**: [SMS_COMPLIANCE_GUIDE.md](../SMS_COMPLIANCE_GUIDE.md)

---

## Overview

When users opt-in to receive SMS messages on the ROI Calculator contact form, the following SMS consent data is automatically synced to GoHighLevel:

1. **SMS Opt-In Status** - Whether the user checked the SMS opt-in box
2. **SMS Consent Text** - The exact text shown to the user at time of consent
3. **SMS Opt-In Timestamp** - When the user provided consent
4. **SMS Consent IP Address** - IP address at time of consent

This data is critical for **A2P 10DLC compliance** (TCPA/CTIA) and must be stored in GoHighLevel.

---

## Required GoHighLevel Custom Fields

### Step 1: Create Custom Fields in GHL

In your GoHighLevel location, create the following **custom fields**:

| Field Name | Field Type | GHL Key | Description |
|-----------|-----------|---------|-------------|
| SMS Opt-In | Checkbox/Boolean | `sms_opt_in` | Whether user consented to SMS |
| SMS Consent Text | Text Area | `sms_consent_text` | Exact consent text shown to user |
| SMS Opted In At | Date/Time | `sms_opted_in_at` | Timestamp of consent |
| SMS Consent IP | Text (Single Line) | `sms_consent_ip` | IP address at time of consent |

### Step 2: How to Create Custom Fields in GHL

1. **Login to GoHighLevel**
2. **Navigate to**: Settings → Custom Fields
3. **Click**: "+ Add Custom Field"
4. **For each field above**:
   - Enter the **Field Name** exactly as shown
   - Select the appropriate **Field Type**
   - Set the **Key** to the value shown in "GHL Key" column
   - Save the field

---

## Default Field Mappings

The ROI Calculator uses these **default mappings** when syncing to GHL:

```typescript
{
  // SMS Consent fields (A2P 10DLC compliance)
  smsOptIn: 'sms_opt_in',
  smsConsentText: 'sms_consent_text',
  smsOptedInAt: 'sms_opted_in_at',
  smsConsentIp: 'sms_consent_ip',

  // ROI Calculator fields (existing)
  currentLeads: 'roi_current_leads',
  currentSales: 'roi_current_sales',
  // ... other ROI fields
}
```

---

## What Data is Sent to GHL

### When User OPTS IN to SMS:

```json
{
  "email": "john@company.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1 (555) 123-4567",
  "companyName": "Acme Inc.",
  "customFields": {
    "sms_opt_in": true,
    "sms_consent_text": "I agree to receive text messages from ROI Calculator. Message frequency varies. Message and data rates may apply. Text STOP to cancel, HELP for help. Terms & Privacy Policy apply.",
    "sms_opted_in_at": "2025-11-16T18:30:00.000Z",
    "sms_consent_ip": "192.168.1.100"
  },
  "tags": ["roi-calculator", "lead-capture"]
}
```

### When User DOES NOT Opt In to SMS:

```json
{
  "email": "jane@company.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1 (555) 987-6543",
  "companyName": "Example Corp.",
  "customFields": {
    // No SMS fields are sent
    "roi_current_leads": 5000,
    // ... other ROI data
  },
  "tags": ["roi-calculator", "lead-capture"]
}
```

---

## Using SMS Data in GHL Notes

You can include SMS consent data in your GHL notes template using these placeholders:

### Available SMS Placeholders:

- `{{smsOptIn}}` - Shows "Yes" or "No"
- `{{smsConsentText}}` - The exact consent text
- `{{smsOptedInAt}}` - Timestamp of consent
- `{{smsConsentIp}}` - IP address at consent

### Example Note Template:

```
New ROI Calculator Lead - {{date}}

Contact Information:
- Name: {{firstName}} {{lastName}}
- Email: {{email}}
- Phone: {{phone}}
- Company: {{companyName}}

SMS Consent Status:
- Opted In: {{smsOptIn}}
- Consent Given: {{smsOptedInAt}}
- Consent Text: "{{smsConsentText}}"
- IP Address: {{smsConsentIp}}

ROI Data:
- Current Leads: {{currentLeads}}
- Current Sales: {{currentSales}}
- Target CR: {{targetCR}}%
```

---

## Customizing Field Mappings (Advanced)

If you want to use **different field keys** in GoHighLevel, you can update the field mappings in the ROI Calculator admin panel:

1. **Login to ROI Calculator** as admin
2. **Navigate to**: `/admin`
3. **Go to**: GoHighLevel Settings
4. **Click**: "Configure Field Mappings"
5. **Update** the SMS field mappings:
   ```json
   {
     "smsOptIn": "your_custom_sms_optin_field",
     "smsConsentText": "your_custom_consent_text_field",
     "smsOptedInAt": "your_custom_timestamp_field",
     "smsConsentIp": "your_custom_ip_field"
   }
   ```
6. **Save** the mappings

---

## Compliance Requirements

### Why This Data is Important:

1. **Legal Requirement**: TCPA requires proof of consent for SMS marketing
2. **Carrier Requirement**: A2P 10DLC registration requires consent tracking
3. **Audit Trail**: You need to prove when and how consent was obtained
4. **Dispute Resolution**: Consent records protect against complaints

### What to Do With This Data:

✅ **DO**:
- Store all SMS consent data in GHL
- Keep consent records for at least 4 years
- Include consent data in any compliance audits
- Use consent timestamp to track message frequency

❌ **DO NOT**:
- Delete SMS consent records
- Share consent data with unauthorized parties
- Use phone numbers without verified consent
- Send SMS to contacts where `sms_opt_in` is false or missing

---

## Troubleshooting

### Issue: SMS fields not appearing in GHL

**Solution**:
1. Verify custom fields are created in GHL Settings
2. Check that field keys match exactly (case-sensitive)
3. Ensure GHL integration is connected in ROI Calculator admin
4. Test with a new lead submission

### Issue: Empty SMS consent text

**Solution**:
1. Verify the contact form has the SMS opt-in checkbox
2. Ensure user actually checked the SMS opt-in box
3. Check browser console for any JavaScript errors
4. Review server logs for API errors

### Issue: Field mappings not working

**Solution**:
1. Go to `/admin` → GoHighLevel Settings
2. Click "Reset to Default Mappings"
3. Re-configure your custom mappings if needed
4. Test with a new lead

---

## Testing Your Setup

### Test Checklist:

1. ✅ Create all 4 SMS custom fields in GHL
2. ✅ Submit a test form WITH SMS opt-in checked
3. ✅ Verify contact appears in GHL with SMS data populated
4. ✅ Submit a test form WITHOUT SMS opt-in checked
5. ✅ Verify contact appears in GHL without SMS fields
6. ✅ Check GHL notes include SMS placeholders
7. ✅ Verify timestamp format is correct

---

## Support

For issues with:
- **SMS Compliance**: See [SMS_COMPLIANCE_GUIDE.md](../SMS_COMPLIANCE_GUIDE.md)
- **GHL Integration**: See [GHL_SETUP.md](./GHL_SETUP.md)
- **Field Mappings**: Contact ROI Calculator support

---

**Last Updated**: 2025-11-16
**Version**: 1.0.0
