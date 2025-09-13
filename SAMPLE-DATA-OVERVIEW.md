# 📊 Sample Data Overview

This document provides a comprehensive overview of all the sample data that gets created when you run `npm run db:setup`.

## 🏢 **Locations (8 offices)**

| Office | Slug | Timezone | Region |
|--------|------|----------|---------|
| New York Office | `ny_office` | America/New_York | North America |
| London Office | `london_office` | Europe/London | Europe |
| San Francisco Office | `sf_office` | America/Los_Angeles | North America |
| Tokyo Office | `tokyo_office` | Asia/Tokyo | Asia |
| Berlin Office | `berlin_office` | Europe/Berlin | Europe |
| Sydney Office | `sydney_office` | Australia/Sydney | Oceania |
| Toronto Office | `toronto_office` | America/Toronto | North America |
| Paris Office | `paris_office` | Europe/Paris | Europe |

## 👥 **Users (12 accounts)**

### **Owners (4)**
- Alice Johnson (`alice.owner@company.com`) - Primary owner
- Carol Davis (`carol.manager@company.com`) - Manager
- Grace Taylor (`grace.lead@company.com`) - Team lead
- James Thompson (`james.product@company.com`) - Product owner

### **Team Members (8)**
- Bob Smith (`bob.team@company.com`) - Team member
- David Wilson (`david.engineer@company.com`) - Engineer
- Emma Brown (`emma.designer@company.com`) - Designer
- Frank Miller (`frank.analyst@company.com`) - Analyst
- Henry Anderson (`henry.developer@company.com`) - Developer
- Isabella Rodriguez (`isabella.qa@company.com`) - QA Engineer
- Lisa Chen (`lisa.support@company.com`) - Support
- Mike Johnson (`mike.security@company.com`) - Security

## 🏷️ **Labels (10 departments)**

| Code | Name | Location | Synonyms | Status |
|------|------|----------|----------|---------|
| HR | Human Resources | NY Office | HR Dept, HumanRes, Personnel | Active |
| ENG | Engineering | London Office | Dev, Engineering Team, Software | Active |
| DESIGN | Product Design | SF Office | Design, UX, UI, Creative | Active |
| IT | Information Technology | Tokyo Office | IT Dept, Tech Support, Infrastructure | Active |
| MARKETING | Marketing & Sales | Berlin Office | Marketing, Sales, Promotion | Active |
| FINANCE | Finance & Accounting | Sydney Office | Finance, Accounting, Payroll | Active |
| LEGAL | Legal & Compliance | NY Office | Legal, Compliance, Regulatory | Active |
| OPS | Operations | London Office | Operations, Logistics, Process | Active |
| QA | Quality Assurance | Toronto Office | QA, Testing, Quality | Active |
| PRODUCT | Product Management | Paris Office | Product, PM, Strategy | Active |

## 📋 **Requests (12 service requests)**

| Request | Location | Status | Department |
|---------|----------|---------|------------|
| New employee onboarding materials | NY Office | Open | HR |
| New server setup and configuration | London Office | Open | Engineering |
| Design system update and brand guidelines | SF Office | Mapped | Design |
| IT infrastructure upgrade and network security | Tokyo Office | Open | IT |
| Marketing campaign materials and social media assets | Berlin Office | Closed | Marketing |
| Financial reporting system access and training | Sydney Office | Open | Finance |
| Legal document review and compliance check | NY Office | Mapped | Legal |
| Operations process documentation and workflow optimization | London Office | Open | Operations |
| Team building event planning and coordination | SF Office | Open | HR |
| Customer support ticket system implementation | Tokyo Office | Mapped | IT |
| QA testing environment setup and test data | Toronto Office | Open | QA |
| Product roadmap planning and stakeholder alignment | Paris Office | Mapped | Product |

## 🔐 **Team Pins (10 access pins)**

| Location | Pin Hash | Status | Notes |
|----------|----------|---------|-------|
| NY Office | `hashedpin123456789` | Active | Primary access |
| NY Office | `backup_pin_ny_2024` | Active | Backup access |
| London Office | `hashedpin987654321` | Active | Primary access |
| London Office | `backup_pin_london_2024` | Inactive | Backup access |
| SF Office | `hashedpin456789123` | Active | Primary access |
| Tokyo Office | `hashedpin789123456` | Inactive | Primary access |
| Berlin Office | `hashedpin321654987` | Active | Primary access |
| Sydney Office | `hashedpin654987321` | Active | Primary access |
| Toronto Office | `toronto_pin_2024` | Active | Primary access |
| Paris Office | `paris_pin_2024` | Inactive | Primary access |

## 📱 **Optins (12 phone subscriptions)**

| Location | Department | Phone | Status | Notes |
|----------|------------|-------|---------|-------|
| NY Office | HR | +15550001111 | Active | Primary contact |
| NY Office | Engineering | +15550009999 | Active | Engineering team |
| NY Office | Legal | +15550007777 | Unsubscribed | Former contact |
| London Office | Engineering | +44770002222 | Active | Primary contact |
| London Office | HR | +44770001000 | Alerted | High priority |
| London Office | Operations | +44770008888 | Active | Operations team |
| SF Office | Design | +14155503333 | Active | Design team |
| Tokyo Office | IT | +81555504444 | Alerted | System alerts |
| Berlin Office | Marketing | +49555505555 | Active | Marketing team |
| Sydney Office | Finance | +61555506666 | Active | Finance team |
| Toronto Office | QA | +14165501234 | Active | QA team |
| Paris Office | Product | +33155505678 | Alerted | Product updates |

## 📨 **Sends (15 message records)**

| Location | Department | User | Count | Role |
|----------|------------|-------|-------|------|
| NY Office | HR | Alice Johnson | 1 | Owner |
| NY Office | Legal | Alice Johnson | 1 | Owner |
| London Office | Engineering | Bob Smith | 2 | Team |
| London Office | Operations | Bob Smith | 3 | Team |
| London Office | Engineering | David Wilson | 2 | Team |
| London Office | HR | Bob Smith | 2 | Team |
| SF Office | Design | Carol Davis | 3 | Owner |
| SF Office | Design | Emma Brown | 1 | Team |
| Tokyo Office | IT | David Wilson | 1 | Team |
| Berlin Office | Marketing | Grace Taylor | 4 | Owner |
| Berlin Office | Marketing | Frank Miller | 5 | Team |
| Sydney Office | Finance | Bob Smith | 2 | Team |
| Toronto Office | QA | Isabella Rodriguez | 2 | Team |
| Paris Office | Product | James Thompson | 3 | Owner |

## 🔗 **Data Relationships**

### **One-to-Many Relationships**
- **Locations → Labels**: Each office has multiple departments
- **Locations → Requests**: Each office has multiple service requests
- **Locations → Team Pins**: Each office has access pins
- **Labels → Optins**: Each department has phone subscriptions
- **Users → Sends**: Each user can send multiple messages

### **Cross-Office Patterns**
- **NY Office**: HR, Legal focus (East Coast operations)
- **London Office**: Engineering, Operations focus (European hub)
- **SF Office**: Design focus (West Coast innovation)
- **Tokyo Office**: IT focus (Asian technology center)
- **Berlin Office**: Marketing focus (European marketing hub)
- **Sydney Office**: Finance focus (APAC financial center)
- **Toronto Office**: QA focus (North American quality assurance)
- **Paris Office**: Product focus (European product strategy)

## 🧪 **Testing Scenarios**

### **Status Distribution**
- **Requests**: 7 open, 4 mapped, 1 closed
- **Team Pins**: 8 active, 2 inactive
- **Optins**: 9 active, 3 alerted, 1 unsubscribed
- **Users**: 4 owners, 8 team members

### **Geographic Coverage**
- **North America**: 3 offices (NY, SF, Toronto)
- **Europe**: 3 offices (London, Berlin, Paris)
- **Asia**: 1 office (Tokyo)
- **Oceania**: 1 office (Sydney)

### **Department Coverage**
- **Technical**: Engineering, IT, QA
- **Business**: HR, Finance, Legal, Operations
- **Creative**: Design, Marketing, Product

## 📈 **Data Volume Summary**

| Entity | Count | Description |
|--------|-------|-------------|
| **Locations** | 8 | Global office network |
| **Users** | 12 | Cross-functional team |
| **Labels** | 10 | Department coverage |
| **Requests** | 12 | Service request examples |
| **Team Pins** | 10 | Access control examples |
| **Optins** | 12 | Communication preferences |
| **Sends** | 15 | Message tracking examples |

This comprehensive dataset provides a realistic foundation for testing your team management system with various scenarios, user roles, and business processes across multiple global locations.
