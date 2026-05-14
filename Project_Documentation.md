# OOP Final Project Documentation
## Point of Sale (POS) System with Receipt Generator

---

## 1. Introduction

### Project Name
**POS Receipt Generator System**

### Problem Being Solved
This system addresses the need for a modern, object-oriented Point of Sale (POS) application that handles:
- Product management and inventory tracking
- Shopping cart functionality with promotional code support
- Multiple payment methods (Cash and Card)
- Automated receipt generation
- User authentication and role-based access control
- Database persistence for transactions

The system provides a complete solution for retail environments where cashiers need to process sales, apply discounts, handle different payment types, and generate professional receipts for customers.

---

## 2. System Overview

### Architecture
The system follows a **four-tier architecture**:


┌─────────────────────────────────────────────────┐
│          1. FRONTEND LAYER (FE/)                │
│  HTML/CSS/JS - Login, Dashboard, POS Interface  │
│        Client-side logic & API calls            │
└─────────────────────┬───────────────────────────┘
                      │ HTTP/REST
┌─────────────────────▼───────────────────────────┐
│        2. CONTROLLER & ROUTES LAYER             │
│     Express.js - API Endpoints, Routing         │
│     Middleware (Auth, CORS), Request Handling   │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│          3. BUSINESS LAYER (Classes/)           │
│    TypeScript OOP Classes - Product, Cart,      │
│    Payment, Receipt, User - Business Logic      │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│           4. DATA LAYER (PostgreSQL)            │
│    Relational Database - Tables: users,         │
│    products, receipts, receipt_items, payments  │
│    ENUM types for payment validation            │
└─────────────────────────────────────────────────┘

1. **Frontend Layer (FE/)**
   - HTML pages for login, registration, dashboard, and POS interface
   - CSS styling for responsive design
   - JavaScript for client-side logic and API communication

2. **Controllers and Routes Layer (Node.js/Express)**
   - Express.js server handling HTTP requests
   - RESTful API endpoints for products, cart, receipts, and users
   - Middleware for authentication and CORS handling

3. **Backend Layer (PostgreSQL)**
   - Relational database with normalized schema
   - Tables for users, products, receipts, receipt items, and payments
   - ENUM types for payment method validation

### Key Features
- **User Authentication**: Login/register system with role-based access (Admin, Manager, Cashier)
- **Product Catalog**: SKU-based product management with categories and pricing
- **Shopping Cart**: Add/remove items, quantity management, real-time calculations
- **Promotional Codes**: Support for discount codes (SAVE10, SAVE20, WELCOME, HOLIDAY)
- **Tax Calculation**: Configurable tax rate with automatic computation
- **Multiple Payment Methods**: Cash (with change calculation) and Card payments
- **Receipt Generation**: Professional formatted receipts with itemized details
- **Database Persistence**: All transactions stored in PostgreSQL

### Target Users
- **Cashiers**: Process sales, apply discounts, handle payments
- **Managers**: View reports, manage products, oversee operations
- **Administrators**: Full system access including user management

---

## 3. Technical Breakdown

### Classes & Structure

#### Core TypeScript Classes (Classes/)

| Class | Purpose | Inherits From |
|-------|---------|---------------|
| `ProductDef` | Abstract base class defining product interface | None |
| `Product` | Concrete product implementation | ProductDef |
| `CartDef` | Abstract base class for cart operations | None |
| `Cart` | Shopping cart with promo/tax support | CartDef |
| `PaymentDef` | Abstract base class for payments | None |
| `CardPayment` | Card payment processing | PaymentDef |
| `CashPayment` | Cash payment with change calculation | PaymentDef |
| `ReceiptDef` | Abstract base class for receipts | None |
| `Receipt` | Receipt generation and storage | ReceiptDef |
| `UserDef` | Abstract base class for users | None |
| `User` | User authentication and management | UserDef |

#### C++ Implementation (Classes/c++ files/)
Parallel C++ implementations demonstrating cross-language OOP concepts:
- Auth classes with AuthService and User
- Payment, Product, Cart, and Receipt classes

---

## 4. Object-Oriented Programming Concepts

### 4.1 Abstraction (Abstract Classes)
The system uses abstract base classes to define interfaces without implementation:

```typescript
// ProductDef.ts - Abstract definition
export abstract class ProductDef {
  protected id!: number;
  protected name!: string;
  protected sku!: string;
  protected price!: number;
  protected category!: string;

  abstract getId(): number;
  abstract getName(): string;
  abstract getSku(): string;
  abstract getPrice(): number;
  abstract getCategory(): string;
  // ... more abstract methods
}
```

**Purpose**: Defines a contract that all concrete classes must follow, ensuring consistent API across implementations.

### 4.2 Inheritance
All concrete classes extend their respective abstract base classes:

```typescript
// Product.ts - Concrete implementation
export class Product extends ProductDef {
  constructor(id: number, name: string, sku: string, price: number, category: string) {
    super();
    this.setId(id);
    this.setName(name);
    this.setSku(sku);
    this.setPrice(price);
    this.setCategory(category);
  }
  // Implementation of abstract methods
}
```

**Benefits**:
- Code reuse through shared base class properties
- Consistent interface across all implementations
- Easy to add new product types or payment methods

### 4.3 Polymorphism
The payment system demonstrates runtime polymorphism:

```typescript
// Both CardPayment and CashPayment implement the same interface
abstract processPayment(): boolean;
abstract displayPaymentInfo(): void;

// Different implementations based on payment type
class CardPayment extends PaymentDef {
  processPayment(): boolean {
    return true; // Simulated card approval
  }
  displayPaymentInfo(): void {
    console.log(`Card Type: ${this.cardType}`);
    console.log(`Card Number: **** **** **** ${this.last4}`);
  }
}

class CashPayment extends PaymentDef {
  processPayment(): boolean {
    return true; // Cash always approved
  }
  displayPaymentInfo(): void {
    console.log(`Cash Tendered: $${this.amount.toFixed(2)}`);
    console.log(`Change Due: $${this.change_due.toFixed(2)}`);
  }
}
```

**Usage in Receipt**:
```typescript
// Receipt accepts any PaymentDef subclass
constructor(cart: Cart, payment: PaymentDef) {
  this.setPayment(payment); // Polymorphic assignment
}
generate(): void {
  this.payment.displayPaymentInfo(); // Dynamic dispatch
}
```

### 4.4 Encapsulation
All class properties are protected/private with public getter/setter methods:

```typescript
export abstract class CartDef {
  protected items!: CartItem[];
  protected promo_code!: string;
  protected tax_rate!: number;
  protected discount_percent!: number;

  // Public interface for controlled access
  abstract addItem(product: Product, qty: number): void;
  abstract getSubtotal(): number;
  abstract getTotal(): number;
}
```

**Benefits**:
- Internal state protected from direct modification
- Validation can be added to setters
- Implementation details hidden from consumers

### 4.5 Dynamic Memory Allocation
In TypeScript/JavaScript, memory allocation is handled automatically:

```typescript
// Dynamic array growth in Cart
addItem(product: Product, qty: number): void {
  const existing = this.items.find(i => i.product.getId() === product.getId());
  if (existing) {
    existing.quantity += qty; // Modify existing
  } else {
    this.items.push({ product, quantity: qty }); // Dynamic allocation
  }
}
```

In C++ implementations, explicit memory management would use `new`/`delete` operators.

### 4.6 Exception Handling
The system includes error handling patterns:

```typescript
// Promo code validation with boolean return
applyPromoCode(code: string): boolean {
  if (PROMO_CODES[code] !== undefined) {
    this.promo_code = code;
    this.discount_percent = PROMO_CODES[code];
    return true;
  }
  return false; // Invalid code handled gracefully
}

// Change calculation with boundary check
calculateChange(total: number): number {
  this.change_due = this.amount - total;
  if (this.change_due < 0) {
    this.change_due = 0;
    return 0; // Prevent negative change
  }
  return this.change_due;
}
```

Database constraints provide additional error handling:
```sql
-- CHECK constraints prevent invalid data
CHECK (quantity > 0),
CHECK (amount >= 0),
-- ENUM validation for payment types
type payment_method AS ENUM ('CASH', 'CARD')
```

---

## 5. Database Design

### Schema Overview
```
users ─────┬────────── receipts ───── receipt_items ── products
           │              │
           └────────── payments
```

### Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | User accounts | id, username, password_hash, role, email |
| `products` | Product catalog | id, sku, name, category, price |
| `receipts` | Transaction headers | id, user_id, timestamp, promo_code, tax_rate |
| `receipt_items` | Line items | receipt_id, product_id, quantity, price_at_purchase |
| `payments` | Payment details | receipt_id, amount, type, card_last4, change_due |

### Relationships
- **One-to-Many**: User → Receipts
- **One-to-Many**: Receipt → Receipt Items
- **One-to-One**: Receipt → Payment
- **Many-to-One**: Receipt Items → Products

---


## 7. Challenges & Solutions

### Challenge 1: Polymorphic Payment Handling
**Problem**: Need to handle different payment types (Cash/Card) with different data requirements.

**Solution**: Used abstract base class `PaymentDef` with concrete implementations:
- `CardPayment`: Stores card type and last 4 digits
- `CashPayment`: Calculates and stores change due

```typescript
// Polymorphic usage in Receipt
constructor(cart: Cart, payment: PaymentDef) {
  this.setPayment(payment); // Works with any PaymentDef subclass
}
```

### Challenge 2: Cart Item Management
**Problem**: Efficiently handle adding duplicate products vs. new products.

**Solution**: Implemented lookup logic in `addItem()`:
```typescript
addItem(product: Product, qty: number): void {
  const existing = this.items.find(i => i.product.getId() === product.getId());
  if (existing) {
    existing.quantity += qty; // Update existing
  } else {
    this.items.push({ product, quantity: qty }); // Add new
  }
}
```

### Challenge 3: Database Constraint Validation
**Problem**: Ensure data integrity for payment types (cash needs change_due, card needs card info).

**Solution**: Used SQL CHECK constraints:
```sql
CONSTRAINT cash_payment_check CHECK (
  (type = 'CASH' AND card_last4 IS NULL AND card_type IS NULL) OR
  (type = 'CARD' AND change_due IS NULL)
)
```

### Challenge 4: Promo Code System
**Problem**: Flexible discount system that can be extended easily.

**Solution**: Centralized promo code dictionary with percentage values:
```typescript
const PROMO_CODES: { [key: string]: number } = {
  "SAVE10":  0.10,
  "SAVE20":  0.20,
  "WELCOME": 0.05,
  "HOLIDAY": 0.15
};
```

---

## 8. Demo Instructions

### Running the System

1. **Install Dependencies**
```bash
npm install
```

2. **Setup Database**
```bash
# Run schema.sql in PostgreSQL
psql -U postgres -d pos_system -f db/schema.sql
```

3. **Start Server**
```bash
node app.js
```

4. **Access Application**
- Login: http://localhost:3000/login.html
- Dashboard: http://localhost:3000/

### Sample Workflow
1. Login with credentials (e.g., cashier_01 / cashier123)
2. Add products to cart from the product list
3. Apply promotional code (e.g., SAVE10, WELCOME)
4. Select payment method (Cash or Card)
5. Complete transaction and view generated receipt

---

## 9. Conclusion

### What We Learned

1. **Object-Oriented Design Principles**
   - Abstract classes provide clean interfaces for extensibility
   - Inheritance reduces code duplication
   - Polymorphism enables flexible component interaction

2. **Full-Stack Development**
   - Connecting frontend UI to backend APIs
   - RESTful service design patterns
   - Database integration with Node.js

3. **Software Engineering Best Practices**
   - Separation of concerns (MVC pattern)
   - Input validation at multiple layers
   - Error handling and graceful degradation

4. **Team Collaboration**
   - Version control and code integration
   - Dividing responsibilities based on expertise
   - Communication and code review processes

### Future Enhancements
- Implement actual payment gateway integration
- Add inventory management with stock alerts
- Create reporting dashboard for sales analytics
- Implement barcode scanner integration
- Add customer loyalty program

---

## Appendix: File Structure

```
OOP_Final_Project/
├── Classes/                 # TypeScript OOP classes
│   ├── Product.ts          # Product implementation
│   ├── ProductDef.ts       # Product abstract definition
│   ├── Cart.ts             # Shopping cart logic
│   ├── CartDef.ts          # Cart abstract definition
│   ├── PaymentDef.ts       # Payment abstract definition
│   ├── CardPayment.ts      # Card payment implementation
│   ├── CashPayment.ts      # Cash payment implementation
│   ├── Receipt.ts          # Receipt generation
│   ├── ReceiptDef.ts       # Receipt abstract definition
│   ├── User.ts             # User implementation
│   └── UserDef.ts          # User abstract definition
├── Controllers/             # Express controllers
├── Routes/                  # API route definitions
├── db/                      # Database schema and connection
├── FE/                      # Frontend assets
│   ├── HTML/
│   ├── CSS/
│   └── JS/
├── app.js                   # Main Express application
└── package.json             # Node.js dependencies
```

---
