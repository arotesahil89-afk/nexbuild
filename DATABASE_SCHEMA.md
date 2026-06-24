# Mumbai Cha Raja - Database Schema

## Overview

This document defines the database structure for the Mumbai Cha Raja application using PostgreSQL and Prisma ORM.

---

# 1. Admins

Stores admin login credentials and role-based permissions.

## Table: admins

| Column        | Type      |
| ------------- | --------- |
| id            | UUID      |
| name          | VARCHAR   |
| email         | VARCHAR   |
| password_hash | TEXT      |
| role          | VARCHAR   |
| is_active     | BOOLEAN   |
| created_at    | TIMESTAMP |
| updated_at    | TIMESTAMP |

### Example

```json
{
  "id": "1",
  "name": "Super Admin",
  "email": "admin@mumbaicharaja.com",
  "role": "super_admin"
}
```

---

# 2. Awards

Stores awards and recognitions.

## Table: awards

| Column        | Type      |
| ------------- | --------- |
| id            | UUID      |
| language      | VARCHAR   |
| heading       | VARCHAR   |
| title         | TEXT      |
| display_order | INTEGER   |
| created_at    | TIMESTAMP |
| updated_at    | TIMESTAMP |

### Example

```json
{
  "language": "en",
  "heading": "Awards & Recognition",
  "title": "Best Ganesh Mandal Award"
}
```

---

# 3. Events

Stores upcoming and past events.

## Table: events

| Column         | Type      |
| -------------- | --------- |
| id             | UUID      |
| title_en       | TEXT      |
| title_hi       | TEXT      |
| title_mr       | TEXT      |
| description_en | TEXT      |
| description_hi | TEXT      |
| description_mr | TEXT      |
| event_date     | DATE      |
| event_time     | TIME      |
| location       | TEXT      |
| image_url      | TEXT      |
| is_active      | BOOLEAN   |
| created_at     | TIMESTAMP |
| updated_at     | TIMESTAMP |

---

# 4. Donations

Stores donation transactions.

## Table: donations

| Column         | Type      |
| -------------- | --------- |
| id             | UUID      |
| donor_name     | VARCHAR   |
| email          | VARCHAR   |
| phone          | VARCHAR   |
| amount         | DECIMAL   |
| payment_id     | VARCHAR   |
| order_id       | VARCHAR   |
| status         | VARCHAR   |
| payment_method | VARCHAR   |
| message        | TEXT      |
| created_at     | TIMESTAMP |

### Status Values

* PENDING
* SUCCESS
* FAILED
* REFUNDED

---

# 5. Members

Stores membership registrations.

## Table: members

| Column          | Type      |
| --------------- | --------- |
| id              | UUID      |
| full_name       | VARCHAR   |
| email           | VARCHAR   |
| phone           | VARCHAR   |
| address         | TEXT      |
| membership_type | VARCHAR   |
| membership_fee  | DECIMAL   |
| payment_status  | VARCHAR   |
| created_at      | TIMESTAMP |

---

# 6. Merchandise

Stores products available for purchase.

## Table: merchandise

| Column         | Type      |
| -------------- | --------- |
| id             | UUID      |
| name           | VARCHAR   |
| description    | TEXT      |
| price          | DECIMAL   |
| stock_quantity | INTEGER   |
| image_url      | TEXT      |
| is_active      | BOOLEAN   |
| created_at     | TIMESTAMP |
| updated_at     | TIMESTAMP |

---

# 7. Orders

Stores merchandise orders.

## Table: orders

| Column         | Type      |
| -------------- | --------- |
| id             | UUID      |
| user_name      | VARCHAR   |
| email          | VARCHAR   |
| phone          | VARCHAR   |
| total_amount   | DECIMAL   |
| payment_status | VARCHAR   |
| order_status   | VARCHAR   |
| created_at     | TIMESTAMP |

---

# 8. Order Items

Stores products inside an order.

## Table: order_items

| Column     | Type    |
| ---------- | ------- |
| id         | UUID    |
| order_id   | UUID    |
| product_id | UUID    |
| quantity   | INTEGER |
| price      | DECIMAL |

### Relationship

Order
├── Product 1
├── Product 2
└── Product 3

---

# 9. Gallery

Stores gallery images.

## Table: gallery

| Column      | Type      |
| ----------- | --------- |
| id          | UUID      |
| title       | VARCHAR   |
| category    | VARCHAR   |
| image_url   | TEXT      |
| description | TEXT      |
| created_at  | TIMESTAMP |

### Categories

* Ganesh Festival
* Gun Gaurav
* Social Initiative
* Theme
* Events

---

# 10. Committee Members

Stores committee member information.

## Table: committee_members

| Column        | Type    |
| ------------- | ------- |
| id            | UUID    |
| name          | VARCHAR |
| designation   | VARCHAR |
| image_url     | TEXT    |
| display_order | INTEGER |
| is_active     | BOOLEAN |

---

# 11. Contact Messages

Stores messages submitted from the contact form.

## Table: contact_messages

| Column     | Type      |
| ---------- | --------- |
| id         | UUID      |
| name       | VARCHAR   |
| email      | VARCHAR   |
| phone      | VARCHAR   |
| subject    | VARCHAR   |
| message    | TEXT      |
| status     | VARCHAR   |
| created_at | TIMESTAMP |

### Status Values

* NEW
* READ
* REPLIED

---

# 12. Podcasts

Stores podcast information.

## Table: podcasts

| Column        | Type      |
| ------------- | --------- |
| id            | UUID      |
| title         | VARCHAR   |
| description   | TEXT      |
| youtube_url   | TEXT      |
| thumbnail_url | TEXT      |
| published_at  | TIMESTAMP |

---

# 13. Translations

Stores multilingual content.

## Table: translations

| Column   | Type    |
| -------- | ------- |
| id       | UUID    |
| key_name | VARCHAR |
| language | VARCHAR |
| value    | TEXT    |

### Example

```json
{
  "key_name": "navbar.home",
  "language": "mr",
  "value": "मुख्यपृष्ठ"
}
```

---

# 14. Payment Transactions

Stores payment gateway transaction information.

## Table: payment_transactions

| Column              | Type      |
| ------------------- | --------- |
| id                  | UUID      |
| reference_id        | UUID      |
| reference_type      | VARCHAR   |
| razorpay_order_id   | VARCHAR   |
| razorpay_payment_id | VARCHAR   |
| amount              | DECIMAL   |
| status              | VARCHAR   |
| created_at          | TIMESTAMP |

### Reference Types

* DONATION
* MEMBERSHIP
* ORDER
* EVENT

---

# 15. Activity Logs

Stores admin activity history.

## Table: activity_logs

| Column      | Type      |
| ----------- | --------- |
| id          | UUID      |
| admin_id    | UUID      |
| action      | VARCHAR   |
| entity_type | VARCHAR   |
| entity_id   | UUID      |
| details     | TEXT      |
| created_at  | TIMESTAMP |

### Examples

* Admin updated award
* Admin deleted event
* Admin added gallery image

---

# Database Tables Summary

1. admins
2. awards
3. events
4. donations
5. members
6. merchandise
7. orders
8. order_items
9. gallery
10. committee_members
11. contact_messages
12. podcasts
13. translations
14. payment_transactions
15. activity_logs

---

# Recommended Technology Stack

* Database: PostgreSQL
* ORM: Prisma
* Backend: Node.js + Express
* Authentication: JWT
* File Storage: Cloudinary
* Payment Gateway: Razorpay
