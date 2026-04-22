#include "CashPayment.h"
#include <iostream>
#include <iomanip>

CashPayment::CashPayment(float amount) : Payment(amount) {
    change_due = 0.0f;
}

CashPayment::~CashPayment() {}

float CashPayment::getChangeDue() { return change_due; }

float CashPayment::calculateChange(float total) {
    change_due = getAmount() - total;
    if (change_due < 0) {
        cout << "Insufficient funds. Short by $" << fixed << setprecision(2) << (change_due * -1) << endl;
        change_due = 0.0f;
        return 0.0f;
    }
    return change_due;
}

bool CashPayment::processPayment() {
    cout << "Cash payment processed." << endl;
    return true;
}

void CashPayment::displayPaymentInfo() {
    cout << fixed << setprecision(2);
    cout << "Cash Tendered:  $" << getAmount()  << endl;
    cout << "Change Due:     $" << change_due    << endl;
}
