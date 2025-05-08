class LoginPage {
  login(username, password) {
    cy.getByData('username').type(username);
    cy.getByData('password').type(password);
    cy.getByData('login-button').click();
  }
}

export default LoginPage;
