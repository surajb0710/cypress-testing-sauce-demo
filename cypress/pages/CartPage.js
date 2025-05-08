class CartPage {
  submitPersonalInfoForm(firstName, lastName, postalCode) {
    cy.getByData('firstName').type(firstName);
    cy.getByData('lastName').type(lastName);
    cy.getByData('postalCode').type(postalCode);
    cy.getByData('continue').click();
  }
}

export default CartPage;
