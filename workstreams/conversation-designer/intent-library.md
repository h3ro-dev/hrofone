# HR of One Intent Library

## Overview
This document catalogs user intents for the HR of One conversational interface, organized by HR domain.

## Intent Structure
Each intent includes:
- **Intent Name**: Unique identifier
- **Description**: What the user wants to accomplish
- **Sample Utterances**: Example phrases users might say
- **Required Entities**: Information needed to fulfill the intent
- **Response Strategy**: How to handle this intent

---

## 🧑‍💼 Employee Management

### INTENT: Add_Employee
**Description**: User wants to add a new employee to the system
**Sample Utterances**:
- "I hired someone new"
- "Add a new employee"
- "We have a new team member starting"
- "I need to onboard someone"
- "Set up a new hire"

**Required Entities**:
- Employee name
- Start date
- Role/position
- Employment type (full-time/part-time/contractor)

**Response Strategy**: Guide through required information collection, then trigger onboarding workflow

### INTENT: Terminate_Employee
**Description**: User needs to process an employee termination
**Sample Utterances**:
- "I need to let someone go"
- "Process a termination"
- "An employee is leaving"
- "Handle an employee exit"
- "Someone resigned"

**Required Entities**:
- Employee name
- Last day
- Termination type (voluntary/involuntary)
- Reason category

**Response Strategy**: Express empathy, collect required info, provide termination checklist

### INTENT: Update_Employee_Info
**Description**: User wants to update employee information
**Sample Utterances**:
- "Change employee details"
- "Update [employee]'s information"
- "Someone got married and changed their name"
- "Update address for an employee"
- "Change someone's job title"

**Required Entities**:
- Employee identifier
- Field to update
- New value

**Response Strategy**: Confirm employee, show current info, process update

---

## 💰 Payroll & Compensation

### INTENT: Run_Payroll
**Description**: User wants to process payroll
**Sample Utterances**:
- "Run payroll"
- "Process paychecks"
- "It's time for payroll"
- "Pay my employees"
- "Submit payroll"

**Required Entities**:
- Pay period
- Confirmation of hours/salaries

**Response Strategy**: Check for pending items, confirm amounts, process or schedule

### INTENT: Give_Raise
**Description**: User wants to adjust employee compensation
**Sample Utterances**:
- "Give someone a raise"
- "Increase salary"
- "Adjust compensation"
- "Change pay rate"
- "Promote someone with a salary increase"

**Required Entities**:
- Employee name
- New salary/rate
- Effective date
- Reason/justification

**Response Strategy**: Confirm current rate, calculate increase percentage, update records

### INTENT: View_Payroll_History
**Description**: User wants to see past payroll information
**Sample Utterances**:
- "Show payroll history"
- "What did I pay last month?"
- "View past paychecks"
- "Payroll report for [time period]"
- "How much have I paid in payroll?"

**Required Entities**:
- Time period (optional)
- Employee (optional)

**Response Strategy**: Display summary with filtering options

---

## 🏖️ Time Off & Attendance

### INTENT: Request_Time_Off
**Description**: Employee or manager requesting time off
**Sample Utterances**:
- "I need time off"
- "Request vacation"
- "Take a sick day"
- "Book PTO"
- "I'll be out next week"

**Required Entities**:
- Employee (self or other)
- Start date
- End date
- Type (vacation/sick/personal)

**Response Strategy**: Check balance, verify dates, submit for approval if needed

### INTENT: Check_PTO_Balance
**Description**: View available time off
**Sample Utterances**:
- "How much PTO do I have?"
- "Check vacation balance"
- "Show time off available"
- "What's my sick leave balance?"
- "How many days off left?"

**Required Entities**:
- Employee (self or other)
- Type (optional)

**Response Strategy**: Display current balances by type with accrual info

### INTENT: Approve_Time_Off
**Description**: Manager approving time off requests
**Sample Utterances**:
- "Approve time off requests"
- "Review PTO requests"
- "Pending vacation approvals"
- "Handle time off requests"
- "Who wants time off?"

**Required Entities**:
- None (show all pending)

**Response Strategy**: List pending requests with approve/deny options

---

## 📋 Benefits Administration

### INTENT: Enroll_Benefits
**Description**: Enroll in or change benefits
**Sample Utterances**:
- "Enroll in benefits"
- "Change my health insurance"
- "Add dental coverage"
- "Benefits enrollment"
- "Update my benefits"

**Required Entities**:
- Employee
- Benefit type
- Coverage level
- Effective date

**Response Strategy**: Show current elections, guide through options, confirm changes

### INTENT: Benefits_Info
**Description**: Get information about benefits
**Sample Utterances**:
- "Explain our benefits"
- "What health plans do we offer?"
- "Tell me about 401k"
- "Benefits overview"
- "What's covered?"

**Required Entities**:
- Benefit type (optional)

**Response Strategy**: Provide overview or specific details based on query

### INTENT: Add_Dependent
**Description**: Add dependent to benefits
**Sample Utterances**:
- "Add my spouse to insurance"
- "New baby for benefits"
- "Add a dependent"
- "Include family member"
- "Cover my kids"

**Required Entities**:
- Dependent info
- Relationship
- Benefit plans to add

**Response Strategy**: Collect required info, explain qualifying events, process addition

---

## ⚖️ Compliance & Legal

### INTENT: Compliance_Check
**Description**: Verify compliance status
**Sample Utterances**:
- "Am I compliant?"
- "Check compliance status"
- "Any compliance issues?"
- "Legal requirements check"
- "What am I missing for compliance?"

**Required Entities**:
- Area (optional - general or specific)

**Response Strategy**: Run compliance audit, highlight any issues, provide remediation steps

### INTENT: File_Tax_Forms
**Description**: File or access tax forms
**Sample Utterances**:
- "File W2s"
- "Get tax forms"
- "1099 forms"
- "Tax documents"
- "Year end forms"

**Required Entities**:
- Form type
- Tax year

**Response Strategy**: Check deadlines, generate forms, provide filing instructions

### INTENT: Policy_Question
**Description**: Questions about company policies
**Sample Utterances**:
- "What's our policy on [topic]?"
- "Remote work policy"
- "Vacation policy"
- "Employee handbook"
- "Rules about [topic]"

**Required Entities**:
- Policy area

**Response Strategy**: Retrieve relevant policy, summarize key points, offer full document

---

## 📊 Reports & Analytics

### INTENT: Generate_Report
**Description**: Create HR reports
**Sample Utterances**:
- "Generate employee report"
- "Headcount report"
- "Turnover analytics"
- "Compensation analysis"
- "HR metrics"

**Required Entities**:
- Report type
- Time period
- Filters (optional)

**Response Strategy**: Clarify parameters, generate report, offer insights

### INTENT: View_Dashboard
**Description**: Access HR dashboard
**Sample Utterances**:
- "Show HR dashboard"
- "Key metrics"
- "HR overview"
- "Company stats"
- "How are we doing?"

**Required Entities**:
- None

**Response Strategy**: Display key metrics with drill-down options

---

## 🆘 Help & Support

### INTENT: Get_Help
**Description**: General help request
**Sample Utterances**:
- "Help"
- "I need help"
- "What can you do?"
- "I'm stuck"
- "Show me how"

**Required Entities**:
- None

**Response Strategy**: Offer categories, common tasks, or connect to human support

### INTENT: Contact_Support
**Description**: Reach human support
**Sample Utterances**:
- "Talk to a human"
- "Contact support"
- "I need a real person"
- "Escalate this"
- "Get me help"

**Required Entities**:
- Issue category (optional)

**Response Strategy**: Collect context, provide contact options, offer to schedule callback

---

## 🔄 Implementation Notes

### Fallback Strategy
When intent is unclear:
1. "I'm not quite sure what you're looking for. Are you trying to..."
2. Offer 3-4 most likely intents based on keywords
3. Always include "Something else" option
4. If still unclear, offer human support

### Context Handling
- Maintain conversation state for 30 minutes
- Remember last intent for follow-up questions
- Track employee context throughout conversation
- Clear context on explicit topic change

### Confidence Thresholds
- High (>0.8): Proceed with intent
- Medium (0.5-0.8): Confirm understanding
- Low (<0.5): Use fallback strategy