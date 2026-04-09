RECEIPT GENERATOR

-------------------------------------------------------------------------------------------------------------------
What This Program Does:
-------------------------------------------------------------------------------------------------------------------
The Receipt Generator is a C++ point-of-sale (POS) system that models the complete checkout flow of a retail transaction. It covers three stages:

1. Catalogue — Products are created with a name, price, SKU, and category.

2. Shopping — A Cart holds those products, tracks quantities, applies promo codes, and computes totals (subtotal, discount, tax, grand total).

3. Checkout — A Receipt finalizes the sale: it records cash tendered, calculates change, timestamps the transaction, prints it, and saves it to a database.

-------------------------------------------------------------------------------------------------------------------
 Entities & Data Model
-------------------------------------------------------------------------------------------------------------------
Three entities exist. One struct supports the Cart.

--------------------------
-    CartItem  (struct)  -
--------------------------

A lightweight container defined in Cart.h. 

It pairs a Product with an integer quantity — this is the line-item unit inside a cart.

--------------------------
-   Product  (class)     -
--------------------------

Represents one catalogue item. Identified by a unique integer ID (read-only after construction). All other fields are mutable via setters.