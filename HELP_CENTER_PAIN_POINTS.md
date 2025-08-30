# Help Center Pain Points Guide

## Overview
The help center system now categorizes help requests by pain point (issue type) to provide appropriate solutions for each type of problem. This guide explains how admins should handle each category.

## Pain Point Categories

### 1. Password Reset (`password_reset`)
**Description**: User cannot access their account due to forgotten or locked password.

**Admin Actions**:
- **Accept Button**: ✅ Show - Generates help token to bypass security questions
- **Send Reset Form**: ✅ Show - Sends password reset link to user
- **Resolve Button**: ✅ Show - Marks as resolved after password is reset

**Solution Process**:
1. Verify user identity through email
2. Use "Accept" button to generate help token (user skips security questions)
3. Use "Send Reset Form" to send reset link
4. User resets password independently
5. Mark as "Resolved" when complete

**When to Use Each Action**:
- **Accept**: When user needs immediate access without security questions
- **Send Reset Form**: When user should reset password themselves
- **Resolve**: After password reset is completed

---

### 2. Login Issues (`login_issues`)
**Description**: User cannot log in due to account lockout, 2FA problems, or other authentication issues.

**Admin Actions**:
- **Accept Button**: ❌ Hide - Not applicable for general login issues
- **Send Reset Form**: ✅ Show - Can help with password-related login problems
- **Resolve Button**: ✅ Show - Marks as resolved after issue is fixed

**Solution Process**:
1. Investigate the specific login problem
2. Use "Send Reset Form" if password reset is needed
3. Provide guidance on resolving the specific issue
4. Mark as "Resolved" when user can log in successfully

---

### 3. Scholarship Help (`scholarship_help`)
**Description**: User needs assistance with scholarship applications, requirements, or eligibility.

**Admin Actions**:
- **Accept Button**: ❌ Hide - Not applicable for scholarship guidance
- **Send Reset Form**: ❌ Hide - Not applicable for scholarship help
- **Resolve Button**: ✅ Show - Marks as resolved after guidance provided

**Solution Process**:
1. Review the specific scholarship question
2. Provide detailed guidance and resources
3. Direct user to relevant documentation or support channels
4. Mark as "Resolved" after comprehensive assistance provided

---

### 4. Technical Support (`technical_support`)
**Description**: Website functionality issues, bugs, or technical problems.

**Admin Actions**:
- **Accept Button**: ❌ Hide - Not applicable for technical issues
- **Send Reset Form**: ❌ Hide - Not applicable for technical support
- **Resolve Button**: ✅ Show - Marks as resolved after issue is fixed

**Solution Process**:
1. Investigate the technical problem
2. Provide troubleshooting steps
3. Escalate to development team if needed
4. Mark as "Resolved" when issue is fixed or workaround provided

---

### 5. Account Issues (`account_issues`)
**Description**: Problems with account settings, profile updates, or account management.

**Admin Actions**:
- **Accept Button**: ❌ Hide - Not applicable for account management
- **Send Reset Form**: ❌ Hide - Not applicable for account issues
- **Resolve Button**: ✅ Show - Marks as resolved after issue is fixed

**Solution Process**:
1. Review the account-related problem
2. Provide guidance on account management
3. Make necessary account adjustments if required
4. Mark as "Resolved" when account issue is resolved

---

### 6. General Inquiry (`general_inquiry`)
**Description**: General questions about services, platform usage, or other inquiries.

**Admin Actions**:
- **Accept Button**: ❌ Hide - Not applicable for general questions
- **Send Reset Form**: ❌ Hide - Not applicable for general inquiries
- **Resolve Button**: ✅ Show - Marks as resolved after question is answered

**Solution Process**:
1. Review the general question
2. Provide comprehensive answer and resources
3. Direct user to relevant information
4. Mark as "Resolved" after question is fully answered

## Action Button Logic

### Accept Button
- **Shows for**: `password_reset` only
- **Purpose**: Generates help token to bypass security questions
- **Use case**: When user needs immediate access without answering security questions

### Send Reset Form Button
- **Shows for**: `password_reset`, `login_issues`
- **Purpose**: Sends password reset link to user
- **Use case**: When user should reset their password themselves

### Resolve Button
- **Shows for**: All pain point types
- **Purpose**: Marks help request as resolved
- **Use case**: After providing appropriate solution for the specific issue type

## Best Practices

1. **Always check the pain point** before deciding which actions to take
2. **Use appropriate action buttons** based on the issue type
3. **Provide targeted solutions** for each category
4. **Document the resolution process** in admin notes
5. **Follow up** to ensure the issue is truly resolved

## Example Workflows

### Password Reset Workflow
1. User submits help request with `password_reset` pain point
2. Admin verifies user identity
3. Admin uses "Accept" button to generate help token
4. Admin uses "Send Reset Form" to send reset link
5. User resets password using the link
6. Admin marks as "Resolved"

### Scholarship Help Workflow
1. User submits help request with `scholarship_help` pain point
2. Admin reviews the specific question
3. Admin provides detailed guidance and resources
4. Admin marks as "Resolved" after comprehensive assistance

### Technical Support Workflow
1. User submits help request with `technical_support` pain point
2. Admin investigates the technical issue
3. Admin provides troubleshooting steps or escalates to dev team
4. Admin marks as "Resolved" when issue is fixed

This system ensures that each help request receives the appropriate level of attention and the right tools for resolution based on the specific type of issue being reported.
