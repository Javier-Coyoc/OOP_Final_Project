#ifndef CASHPAYMENT_H
#define CASHPAYMENT_H

#include "Payment.h"

class CashPayment : public Payment {
private:
    float change_due;

public:
    CashPayment(float amount);
    ~CashPayment();

    float getChangeDue();
    float calculateChange(float total);

    bool processPayment();
    void displayPaymentInfo();
};

#endif
