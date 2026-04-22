#ifndef PAYMENT_H
#define PAYMENT_H

using namespace std;

class Payment {
private:
    float amount;

public:
    Payment(float amount);
    virtual ~Payment();

    float getAmount();
    void  setAmount(float amount);

    virtual bool processPayment() = 0;
    virtual void displayPaymentInfo() = 0;
};

#endif
