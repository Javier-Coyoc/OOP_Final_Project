#include "CardPayment.h"
#include <iostream>
#include <iomanip>

CardPayment::CardPayment(float amount, string last4Digits, string card) : Payment(amount) {
    last4    = last4Digits;
    cardType = card;
}

CardPayment::~CardPayment() {}

// Getters
string CardPayment::getLast4()    { return last4; }
string CardPayment::getCardType() { return cardType; }

// Setters
void CardPayment::setLast4(string last4)       { this->last4    = last4; }
void CardPayment::setCardType(string cardType) { this->cardType = cardType; }

bool CardPayment::processPayment() {
    cout << "Card approved." << endl;
    return true;
}

void CardPayment::displayPaymentInfo() {
    cout << fixed << setprecision(2);
    cout << "Card Type:    " << cardType         << endl;
    cout << "Card Number:  **** **** **** " << last4 << endl;
    cout << "Amount:       $" << getAmount()     << endl;
}
