#include "Payment.h"

Payment::Payment(float a) {
    amount = a;
}

Payment::~Payment() {}

float Payment::getAmount()          { return amount; }
void  Payment::setAmount(float a)   { amount = a; }
