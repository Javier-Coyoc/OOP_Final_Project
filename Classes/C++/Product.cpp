#include "Product.h"

Product::Product(int id, string name, string sku, float price, string category) {
    this->id       = id;
    this->name     = name;
    this->sku      = sku;
    this->price    = price;
    this->category = category;
}

Product::~Product() {}

// Getters
int    Product::getId()       { return id; }
string Product::getName()     { return name; }
string Product::getSku()      { return sku; }
float  Product::getPrice()    { return price; }
string Product::getCategory() { return category; }

// Setters
void Product::setName(string name)         { this->name     = name; }
void Product::setSku(string sku)           { this->sku      = sku; }
void Product::setPrice(float price)        { this->price    = price; }
void Product::setCategory(string category) { this->category = category; }
