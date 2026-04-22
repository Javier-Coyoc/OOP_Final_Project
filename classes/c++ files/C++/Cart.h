#ifndef CART_H
#define CART_H

#include <vector>
#include <string>
#include "Product.h"
using namespace std;

struct CartItem {
    Product product;
    int     quantity;
};

class Cart {
private:
    vector<CartItem> items;
    string promo_code;
    float  tax_rate;
    float  discount_percent;

public:
    Cart();
    ~Cart();

    void addItem(Product p, int qty);
    void removeItem(int product_id);
    bool applyPromoCode(string code);
    void clear();

    vector<CartItem> getItems();
    string getPromoCode();
    float  getTaxRate();
    float  getDiscountPercent();
    float  getSubtotal();
    float  getDiscount();
    float  getTaxAmount();
    float  getTotal();

    void setTaxRate(float rate);
};

#endif

