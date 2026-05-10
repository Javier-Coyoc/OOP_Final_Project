// POS functionality for Receipt Generator
console.log('pos.js - STARTING LOAD');

window.pos = {
    // Cart state
    cart: [],
    
    // Render cart view
    renderCart() {
        console.log('renderCart called, cart length:', this.cart.length);
        const cartList = document.getElementById('cart-list');
        const cartEmpty = document.getElementById('cart-empty');
        const cartTotals = document.getElementById('cart-totals');
        
        if (!cartList) return;
        
        if (this.cart.length === 0) {
            if (cartList) cartList.style.display = 'none';
            if (cartEmpty) cartEmpty.style.display = 'flex';
            if (cartTotals) cartTotals.style.display = 'none';
            return;
        }
        
        if (cartList) cartList.style.display = 'block';
        if (cartEmpty) cartEmpty.style.display = 'none';
        if (cartTotals) cartTotals.style.display = 'block';
        
        // Render cart items
        cartList.innerHTML = this.cart.map(item => `
            <div class="cart-row">
                <div>
                    <div class="cart-item-name">${item.product.name}</div>
                    <div class="cart-item-sku">${item.product.sku}</div>
                </div>
                <div class="qty-ctrl">
                    <button class="qty-btn" onclick="pos.updateQuantity(${item.product.id}, ${item.qty - 1})">-</button>
                    <span class="qty-num">${item.qty}</span>
                    <button class="qty-btn" onclick="pos.updateQuantity(${item.product.id}, ${item.qty + 1})">+</button>
                </div>
                <div class="cart-line-total">$${(item.product.price * item.qty).toFixed(2)}</div>
                <button class="cart-remove" onclick="pos.removeFromCart(${item.product.id})">✕</button>
            </div>
        `).join('');
        
        this.updateTotals();
        this.updateReceiptPreview(); // Call preview update
    },
    
    // Update cart totals
    updateTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
        const tax = subtotal * 0.08;
        const total = subtotal + tax;
        
        const ctSubtotal = document.getElementById('ct-subtotal');
        const ctTax = document.getElementById('ct-tax');
        const ctGrand = document.getElementById('ct-grand');
        
        if (ctSubtotal) ctSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (ctTax) ctTax.textContent = `$${tax.toFixed(2)}`;
        if (ctGrand) ctGrand.textContent = `$${total.toFixed(2)}`;
    },
    
    // Update receipt preview (THIS WAS MISSING!)
    updateReceiptPreview() {
        console.log('updateReceiptPreview called, cart length:', this.cart.length);
        const preview = document.getElementById('rb-preview');
        const totalsDiv = document.getElementById('rb-totals');
        
        if (!preview) {
            console.error('rb-preview element not found!');
            return;
        }
        
        if (this.cart.length === 0) {
            preview.innerHTML = `
                <div class="rp-title">RECEIPT GENERATOR</div>
                <div style="text-align:center;color:#bbb;font-size:8px;padding:12px 0">Add items to preview</div>
            `;
            if (totalsDiv) totalsDiv.style.display = 'none';
            return;
        }
        
        if (totalsDiv) totalsDiv.style.display = 'block';
        
        let itemsHtml = '';
        let subtotal = 0;
        
        this.cart.forEach(item => {
            const lineTotal = item.product.price * item.qty;
            subtotal += lineTotal;
            itemsHtml += `
                <div class="rp-row">
                    <span>${item.qty}× ${item.product.name}</span>
                    <span>$${lineTotal.toFixed(2)}</span>
                </div>
            `;
        });
        
        const promoCode = document.getElementById('rb-promo')?.value || '';
        let discount = 0;
        let discountPercent = 0;
        
        // Apply promo if valid
        const promoMap = { WELCOME10: 0.10, SUMMER25: 0.25, STAFF_DISC: 0.50 };
        if (promoCode && promoMap[promoCode.toUpperCase()]) {
            discountPercent = promoMap[promoCode.toUpperCase()];
            discount = subtotal * discountPercent;
        }
        
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * 0.08;
        const total = afterDiscount + tax;
        
        preview.innerHTML = `
            <div class="rp-title">RECEIPT GENERATOR</div>
            ${itemsHtml}
            ${discount > 0 ? `<div class="rp-row rp-tax"><span>Discount (${promoCode})</span><span>-$${discount.toFixed(2)}</span></div>` : ''}
            <div class="rp-row rp-tax"><span>Tax (8%)</span><span>$${tax.toFixed(2)}</span></div>
            <div class="rp-total"><span>TOTAL</span><span>$${total.toFixed(2)}</span></div>
            <div class="rp-thanks">Thank you for your visit!</div>
        `;
        
        // Update totals display
        const rbTax = document.getElementById('rb-tax');
        const rbGrand = document.getElementById('rb-grand');
        const rbDiscountRow = document.getElementById('rb-discount-row');
        const rbDiscount = document.getElementById('rb-discount');
        
        if (rbTax) rbTax.textContent = `$${tax.toFixed(2)}`;
        if (rbGrand) rbGrand.textContent = `$${total.toFixed(2)}`;
        
        if (discount > 0) {
            if (rbDiscountRow) rbDiscountRow.style.display = 'flex';
            if (rbDiscount) rbDiscount.textContent = `-$${discount.toFixed(2)}`;
        } else {
            if (rbDiscountRow) rbDiscountRow.style.display = 'none';
        }
        
        // Handle cash/change and enable button
        const payType = document.getElementById('rb-pay-type')?.value;
        const cashTendered = parseFloat(document.getElementById('rb-cash')?.value || 0);
        const rbChangeRow = document.getElementById('rb-change-row');
        const rbChange = document.getElementById('rb-change');
        const processBtn = document.getElementById('process-btn');
        
        if (payType === 'CASH' && cashTendered >= total) {
            const change = cashTendered - total;
            if (rbChangeRow) rbChangeRow.style.display = 'flex';
            if (rbChange) rbChange.textContent = `$${change.toFixed(2)}`;
            if (processBtn) processBtn.disabled = false;
        } else if (payType === 'CASH') {
            if (rbChangeRow) rbChangeRow.style.display = 'none';
            if (processBtn) processBtn.disabled = true;
        } else {
            if (rbChangeRow) rbChangeRow.style.display = 'none';
            const last4 = document.getElementById('rb-card-last4')?.value;
            if (processBtn) processBtn.disabled = !last4 || last4.length !== 4;
        }
    },
    
    // Add product to cart
    addToCart(product) {
        console.log('addToCart called for:', product.name);
        const existing = this.cart.find(item => item.product.id === product.id);
        if (existing) {
            existing.qty++;
        } else {
            this.cart.push({ product, qty: 1 });
        }
        this.renderCart();
        this.updateProductsGrid();
    },
    
    // Remove from cart
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.product.id !== productId);
        this.renderCart();
        this.updateProductsGrid();
        if (window.toast) window.toast.show('Item removed from cart', 'info');
    },
    
    // Update quantity
    updateQuantity(productId, newQty) {
        if (newQty <= 0) {
            this.removeFromCart(productId);
            return;
        }
        const item = this.cart.find(item => item.product.id === productId);
        if (item) {
            item.qty = newQty;
            this.renderCart();
            this.updateProductsGrid();
        }
    },
    
    // Toggle product in cart (from products grid)
    toggleProduct(productId) {
        console.log('toggleProduct called for productId:', productId);
        const product = window.appState.products.find(p => p.id === productId);
        if (!product) return;
        
        const inCart = this.cart.find(item => item.product.id === productId);
        if (inCart) {
            this.removeFromCart(productId);
        } else {
            this.addToCart(product);
        }
    },
    
    // Update products grid to show which items are in cart
    updateProductsGrid() {
        if (window.products && window.products._renderGrid) {
            const filtered = window.products._filteredProducts || window.appState.products;
            window.products._renderGrid(filtered);
        }
    },
    
    // Toggle payment fields
    togglePayFields() {
        const payType = document.getElementById('rb-pay-type')?.value;
        const cashFields = document.getElementById('rb-cash-fields');
        const cardFields = document.getElementById('rb-card-fields');
        
        if (cashFields && cardFields) {
            if (payType === 'CASH') {
                cashFields.style.display = 'block';
                cardFields.style.display = 'none';
            } else {
                cashFields.style.display = 'none';
                cardFields.style.display = 'block';
            }
        }
        this.updateReceiptPreview();
    },
    
    // Recalculate totals (called on input changes)
    recalc() {
        console.log('recalc called');
        this.updateTotals();
        this.updateReceiptPreview();
    },
    
    // Submit receipt
    async submit() {
        if (this.cart.length === 0) {
            if (window.toast) window.toast.show('Cart is empty', 'error');
            return;
        }
        
        const payType = document.getElementById('rb-pay-type')?.value;
        const promoCode = document.getElementById('rb-promo')?.value;
        const subtotal = this.cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
        
        const promoMap = { WELCOME10: 0.10, SUMMER25: 0.25, STAFF_DISC: 0.50 };
        const discountPercent = promoCode && promoMap[promoCode.toUpperCase()] ? promoMap[promoCode.toUpperCase()] : 0;
        const discount = subtotal * discountPercent;
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * 0.08;
        const total = afterDiscount + tax;
        
        const items = this.cart.map(item => ({
            product_id: item.product.id,
            quantity: item.qty,
            price_at_purchase: item.product.price
        }));
        
        const receiptData = {
            items,
            promo_code: promoCode || null,
            tax_rate: 0.08,
            discount_percent: discountPercent,
            payment_type: payType?.toLowerCase(),
            total_amount: total
        };
        
        if (payType === 'CASH') {
            receiptData.cash_tendered = parseFloat(document.getElementById('rb-cash')?.value || 0);
        } else {
            receiptData.card_last4 = document.getElementById('rb-card-last4')?.value;
            receiptData.card_type = document.getElementById('rb-card-type')?.value;
        }
        
        try {
            const res = await fetch('/receipts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(receiptData)
            });
            
            if (res.ok) {
                if (window.modal) {
                    window.modal.openSuccess(total, promoCode, payType, [...this.cart]);
                }
                this.clearCart();
            } else {
                const error = await res.json();
                if (window.toast) window.toast.show(error.error || 'Failed to process receipt', 'error');
            }
        } catch (err) {
            console.error('Submit error:', err);
            if (window.toast) window.toast.show('Server error', 'error');
        }
    },
    
    // Clear cart
    clearCart() {
        this.cart = [];
        this.renderCart();
        this.updateProductsGrid();
        if (window.toast) window.toast.show('Cart cleared', 'success');
    },
    
    // Start new sale
    newSale() {
        this.clearCart();
        const rbPromo = document.getElementById('rb-promo');
        const rbCash = document.getElementById('rb-cash');
        const rbCardLast4 = document.getElementById('rb-card-last4');
        const rbPayType = document.getElementById('rb-pay-type');
        
        if (rbPromo) rbPromo.value = '';
        if (rbCash) rbCash.value = '';
        if (rbCardLast4) rbCardLast4.value = '';
        if (rbPayType) rbPayType.value = 'CASH';
        
        this.togglePayFields();
        if (window.modal) window.modal.closeSuccess();
    }
};

console.log('pos.js - LOADED SUCCESSFULLY');
console.log('pos.updateReceiptPreview is a function:', typeof window.pos.updateReceiptPreview);