# SMS Compliance Guide - A2P 10DLC Requirements for New Opt-In Forms

> Complete guide for implementing TCPA/CTIA compliant NEW SMS opt-in forms with required Privacy Policy and Terms of Service pages

**Version**: 1.0.0
**Status**: Active
**Created**: 2025-11-16
**Compliance Standards**: A2P 10DLC / CTIA / TCPA

---

## ⚠️ Quick Reference

**This guide applies ONLY to:**
- Contact forms where users are providing **NEW** consent to receive SMS messages
- Forms where users are subscribing to SMS for the **first time**
- Forms where previously opted-out users are **re-subscribing**

**This guide does NOT apply to:**
- Internal system forms
- Forms without SMS functionality
- Forms for users who have already opted in
- Profile update forms (unless adding NEW SMS consent)

---

## 📋 Overview

All contact forms on the main website (not system forms) that collect new contact data and include **NEW SMS opt-in functionality** MUST follow these A2P 10DLC compliance requirements.

### Scope

- ✅ **Applies to**: Main website-facing contact forms collecting new leads with NEW SMS opt-in
- ✅ **Applies to**: Any form where users are giving NEW consent to receive text messages
- ✅ **Applies to**: Forms where users are subscribing to SMS for the first time
- ❌ **Does NOT apply to**: Internal system forms
- ❌ **Does NOT apply to**: Forms without SMS opt-in functionality
- ❌ **Does NOT apply to**: Forms for users who have already opted in to SMS

### What is a "New" Opt-In?

A NEW opt-in occurs when:
- ✅ A user provides their phone number for the first time
- ✅ A user checks a box to consent to receive SMS messages
- ✅ A user subscribes to a new SMS program or campaign
- ✅ A user who previously opted out is opting back in

A new opt-in is NOT required when:
- ❌ A user is updating their contact information (already opted in)
- ❌ A user is already receiving SMS messages and is filling out a different form
- ❌ A user is managing their existing SMS preferences

### Compliance Requirements

All NEW opt-in forms must:
1. Link to publicly accessible Privacy Policy
2. Link to publicly accessible Terms of Service
3. Use merge fields for business-specific data
4. Meet U.S. carrier compliance standards
5. Pass TCR (The Campaign Registry) verification

---

## 🧠 Master Prompt

**Prompt Title**: "Generate Fully Compliant A2P 10DLC SMS Privacy Policy and Terms of Service Pages Using Merge Fields"

### Prompt Body

You are an expert in U.S. SMS compliance (A2P 10DLC / CTIA / TCPA).
Create two standalone, publicly accessible web pages:

1. **A Privacy Policy page**
2. **A Terms of Service page**

Each must meet U.S. carrier compliance and TCR verification standards.
Use merge fields for all business-specific data.

---

## 🏷️ Merge Fields to Use

All business-specific information must use merge fields for easy customization:

| Merge Field | Description | Example |
|------------|-------------|---------|
| `{{company_name}}` | Legal business name | Goldmine AI LLC |
| `{{program_name}}` | SMS program name | Goldmine AI Alerts |
| `{{program_description}}` | Description of what messages are sent | marketing and customer support text updates |
| `{{support_email}}` | Contact email | support@email.com |
| `{{support_phone}}` | Contact phone | 555-555-5555 |
| `{{business_address}}` | Company mailing address | 123 Main St, Los Angeles, CA 90001 |
| `{{privacy_url}}` | URL for privacy policy | https://yourdomain.com/privacy |
| `{{terms_url}}` | URL for terms page | https://yourdomain.com/sms-terms |
| `{{message_frequency}}` | Message frequency disclosure | varies |
| `{{effective_date}}` | Date the policies go into effect | November 16, 2025 |

---

## 📜 Privacy Policy Template

### Full Page — Privacy Policy

```markdown
# Privacy Policy

**Effective Date**: {{effective_date}}

## 1. Introduction

{{company_name}} ("we," "our," "us") values your privacy.
This Privacy Policy explains how we collect, use, and protect information when you visit our website, enroll in our SMS program {{program_name}}, or interact with our services.

By using our website or opting in to receive text messages, you agree to this Privacy Policy.

## 2. Information We Collect

We may collect:

- Personal information (name, phone number, email, address) you provide when opting in or contacting support.
- Technical data (IP address, device type, browser type) collected automatically.
- Communication data related to your participation in {{program_name}} (e.g., opt-in status, delivery confirmations).

## 3. How We Use Your Information

We use your information to:

- Send {{program_description}} messages through our SMS program.
- Respond to customer inquiries.
- Improve our products and services.
- Comply with legal obligations.

## 4. Mobile Information and Text Messaging

**No mobile information will be shared with third parties/affiliates for marketing or promotional purposes.**

Information sharing to subcontractors in support services, such as customer service, is permitted.
All other use-case categories exclude text-messaging originator opt-in data and consent; this information will not be shared with any third parties, excluding aggregators and providers of the text-message services.

**Text-messaging originator opt-in data and consent will not be shared with any third parties except for aggregators and providers of the text-message services who enable delivery on our behalf.**

## 5. How We Share Information

We may share information only as follows:

- With service providers who perform operational tasks (hosting, analytics, messaging delivery).
- To comply with law, regulation, or legal process.
- In connection with a merger, sale, or asset transfer.

**All the above categories exclude text-messaging originator opt-in data and consent; this information will not be shared with any third parties, excluding aggregators and providers of the text-message services.**

## 6. Data Security

We implement reasonable security measures to protect your personal data from unauthorized access, disclosure, alteration, or destruction.

## 7. Your Rights and Choices

You may:

- Opt out of SMS messages by texting **STOP**.
- Request access, correction, or deletion of your data by contacting {{support_email}}.

## 8. Contact Us

For questions about this Privacy Policy or our data practices, contact:

**{{company_name}}**
{{business_address}}
Email: {{support_email}}
Phone: {{support_phone}}

## 9. Updates to This Policy

We may update this Privacy Policy periodically. Updates take effect on the Effective Date shown above.
```

---

## ⚖️ Terms of Service Template

### Full Page — SMS Terms of Service

```markdown
# SMS Terms of Service

**Effective Date**: {{effective_date}}

## 1. Program Description

The **{{program_name}}** offers {{program_description}} messages from {{company_name}} to users who opt in.

**Message frequency**: {{message_frequency}}.

By subscribing, you consent to receive recurring automated text messages. **Consent is not a condition of purchase.**

## 2. Opt-In

You may opt in by submitting your phone number through our website form, keyword, or written consent.

By opting in, you confirm ownership of the provided number and authorize {{company_name}} to send you SMS/MMS messages.

## 3. Opt-Out

You can cancel the SMS service at any time. **Text STOP** to the number or shortcode from which you receive messages.

After sending "STOP," you'll receive a final confirmation message that you've been unsubscribed.
After confirmation, you will no longer receive messages from us.

## 4. Rejoining the Program

To rejoin, opt in again using the same process you used originally.

## 5. Help and Support

If you experience issues, text **HELP** for assistance or contact us at {{support_email}} or {{support_phone}}.

## 6. Message and Data Rates

**Message and data rates may apply** for any messages sent to you from us and from you to us.

**Message frequency**: {{message_frequency}}.

For questions about your text plan or data plan, contact your wireless provider.

## 7. Carrier Liability Disclaimer

Wireless carriers are not liable for delayed or undelivered messages.

## 8. Eligibility

You must be at least **18 years old** (or of legal age in your jurisdiction) to participate in {{program_name}}.

## 9. Privacy

Your use of the {{program_name}} is subject to our [Privacy Policy]({{privacy_url}}).

## 10. Legal Compliance

This messaging program complies with CTIA, TCPA, and applicable U.S. laws.
You agree to use our messaging services only for lawful purposes.

## 11. Changes to Terms

{{company_name}} may modify these Terms at any time. Updates will be posted at {{terms_url}} and will take effect upon posting.

## 12. Contact Information

For any questions regarding these Terms or the {{program_name}}, contact:

**{{company_name}}**
{{business_address}}
Email: {{support_email}}
Phone: {{support_phone}}
```

---

## ✅ Implementation Checklist

Before launching any NEW SMS opt-in contact form, complete the following:

- [ ] **Publish Privacy Policy** at `{{privacy_url}}`
- [ ] **Publish Terms of Service** at `{{terms_url}}`
- [ ] **Ensure both pages are publicly accessible** (no login required)
- [ ] **Use the same `{{company_name}}` and domain** in your TCR registration
- [ ] **Link both pages beneath every SMS opt-in form**
- [ ] **Replace all merge fields** with actual business data
- [ ] **Test all links** to ensure they work
- [ ] **Verify mobile responsiveness** of both policy pages
- [ ] **Submit for TCR verification** (if applicable)
- [ ] **Document compliance date** in your records

---

## 🔧 Technical Implementation

> **Important**: These requirements apply ONLY to forms where users are providing NEW consent to receive SMS messages. If a user has already opted in, these requirements do not need to be repeated.

### Form Requirements

Every contact form with NEW SMS opt-in must include:

1. **Clear opt-in checkbox** (not pre-checked) - Users must actively check the box to consent
2. **Link to Privacy Policy** near the opt-in
3. **Link to Terms of Service** near the opt-in
4. **Disclosure text** about message frequency and rates

### Example Form Disclosure Text

```html
<label>
  <input type="checkbox" name="sms_opt_in" required />
  I agree to receive text messages from {{company_name}}. Message frequency {{message_frequency}}.
  Message and data rates may apply. Text STOP to cancel, HELP for help.
  <a href="{{terms_url}}" target="_blank">Terms</a> &
  <a href="{{privacy_url}}" target="_blank">Privacy Policy</a> apply.
</label>
```

### Database Fields

Store the following for compliance (ONLY for NEW opt-ins):

```typescript
interface SmsOptIn {
  user_id: string;
  phone_number: string;
  opted_in_at: Date; // Timestamp of NEW opt-in
  opt_in_source: string; // e.g., "contact-form", "landing-page"
  ip_address: string; // IP at time of NEW consent
  user_agent: string; // Browser/device at time of NEW consent
  consent_text: string; // The exact text shown at time of NEW opt-in
  terms_url: string; // URL to terms at time of NEW opt-in
  privacy_url: string; // URL to privacy policy at time of NEW opt-in
  is_new_consent: boolean; // Always true for NEW opt-ins
  previous_opt_out_date?: Date; // If user previously opted out and is re-subscribing
}
```

---

## 📊 Compliance Monitoring

### Regular Audits

Conduct quarterly audits to ensure:

- [ ] All forms still link to correct policy pages
- [ ] Policy pages are publicly accessible
- [ ] Merge fields are correctly populated
- [ ] Opt-out mechanism (STOP) is working
- [ ] Help mechanism (HELP) is working
- [ ] Consent records are properly stored

### Record Retention

Maintain records of:
- User opt-in timestamp
- IP address at time of opt-in
- Exact consent text shown
- URLs to policies at time of consent
- All opt-out requests

**Retention Period**: Minimum 4 years or as required by law

---

## 🚨 Non-Compliance Risks

Failure to comply with A2P 10DLC requirements can result in:

- ❌ Message blocking by carriers
- ❌ Account suspension
- ❌ TCPA violations ($500-$1,500 per violation)
- ❌ FCC fines
- ❌ Legal action from recipients
- ❌ Damage to sender reputation

---

## 📚 Additional Resources

### Regulatory Bodies

- **CTIA**: [Messaging Principles and Best Practices](https://www.ctia.org/)
- **FCC**: [TCPA Compliance Guide](https://www.fcc.gov/consumer-guide-tcpa)
- **TCR**: [The Campaign Registry](https://www.campaignregistry.com/)

### Best Practices

1. **Never purchase phone lists** for SMS marketing
2. **Always use double opt-in** when possible
3. **Honor opt-out requests immediately** (within 24 hours max)
4. **Include your business name** in every message
5. **Send during reasonable hours** (8am-9pm recipient's local time)
6. **Keep accurate records** of all opt-ins and opt-outs

---

## 🔗 Integration with Form Engine

### Database Schema Updates

Add to `forms` table:

```sql
ALTER TABLE forms ADD COLUMN sms_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE forms ADD COLUMN sms_program_name VARCHAR(255);
ALTER TABLE forms ADD COLUMN sms_program_description TEXT;
ALTER TABLE forms ADD COLUMN privacy_policy_url VARCHAR(500);
ALTER TABLE forms ADD COLUMN terms_service_url VARCHAR(500);
```

### API Endpoint

Create endpoint to validate SMS compliance:

```typescript
// GET /api/v1/forms/:formId/sms-compliance-check
{
  "compliant": boolean,
  "issues": string[],
  "checks": {
    "privacy_policy_accessible": boolean,
    "terms_service_accessible": boolean,
    "opt_in_text_present": boolean,
    "opt_out_mechanism": boolean
  }
}
```

---

## 📝 Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-16 | Initial SMS compliance guide created |

---

## 👥 Approval & Sign-Off

**Prepared by**: Development Team
**Reviewed by**: Legal/Compliance Team
**Approved by**: Project Manager
**Effective Date**: {{effective_date}}

---

**For questions about this compliance guide, contact the project team or refer to the main [README.md](./README.md).**

---

**Last Updated**: 2025-11-16
**Version**: 1.0.0
**Status**: Active ✅
