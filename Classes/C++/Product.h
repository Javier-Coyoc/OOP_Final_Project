#ifndef PRODUCT_H
#define PRODUCT_H

#include <string>
using namespace std;

class Product {
private:
    int    id;
    string name;
    string sku;
    float  price;
    string category;

public:
    Product(int id, string name, string sku, float price, string category);
    ~Product();

    int    getId();
    string getName();
    string getSku();
    float  getPrice();
    string getCategory();

    void setName(string name);
    void setSku(string sku);
    void setPrice(float price);
    void setCategory(string category);
};

#endif

