import CartPage from '../pages/CartPage';
import LoginPage from '../pages/LoginPage';

describe('Login', () => {
  beforeEach(function () {
    cy.visit('https://www.saucedemo.com/');
    cy.viewport(1280, 720);
    cy.fixture('example').then(function (data) {
      this.data = data;
    });
  });

  it('Allow user to Login with valid credentials', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.standard_user.username,
      this.data.users.standard_user.password
    );
    cy.location('pathname').should('eq', '/inventory.html');
    cy.getByData('title').should('be.visible').should('contain', 'Products');
  });

  it('Do now allow locked out user to Login', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.locked_out_user.username,
      this.data.users.locked_out_user.password
    );
    cy.location('pathname').should('eq', '/');
    cy.getByData('error')
      .should('be.visible')
      .should('contain', 'Epic sadface: Sorry, this user has been locked out.');
  });

  it('User should be able to close error message when displayed for locked out user', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.locked_out_user.username,
      this.data.users.locked_out_user.password
    );
    cy.getByData('error-button').click();
    cy.getByData('error').should('not.exist');
  });

  it('Allow problem user to Login', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.problem_user.username,
      this.data.users.problem_user.password
    );
    cy.location('pathname').should('eq', '/inventory.html');
    cy.getByData('title').should('be.visible').should('contain', 'Products');
  });

  it('Allow perfrmance glitch user to Login', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.performance_glitch_user.username,
      this.data.users.performance_glitch_user.password
    );
    cy.location('pathname').should('eq', '/inventory.html');
    cy.getByData('title', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Products');
  });
});

describe('Happy Path', () => {
  beforeEach(function () {
    cy.visit('https://www.saucedemo.com/');
    cy.viewport(1280, 720);
    cy.fixture('example').then(function (data) {
      this.data = data;
    });
  });

  it('User should be able to purchase one product', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.standard_user.username,
      this.data.users.standard_user.password
    );

    cy.getByData('add-to-cart-sauce-labs-backpack').click();
    cy.getByData('shopping-cart-link').click();
    cy.getByData('checkout').click();

    const cartPage = new CartPage();
    cartPage.submitPersonalInfoForm(
      this.data.authUser.firstName,
      this.data.authUser.lastName,
      this.data.authUser.postalCode
    );
    cy.getByData('finish').click();
    cy.getByData('complete-header')
      .should('be.visible')
      .should('contain', 'Thank you for your order!');
    cy.getByData('complete-text')
      .should('be.visible')
      .should(
        'contain',
        'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
      );
  });

  it('User should be able to purchase multiple products', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.standard_user.username,
      this.data.users.standard_user.password
    );

    cy.getByData('add-to-cart-sauce-labs-backpack').click();
    cy.getByData('add-to-cart-sauce-labs-bike-light').click();
    cy.getByData('add-to-cart-sauce-labs-bolt-t-shirt').click();

    cy.getByData('shopping-cart-link').click();
    cy.getByData('checkout').click();

    const cartPage = new CartPage();

    cartPage.submitPersonalInfoForm(
      this.data.authUser.firstName,
      this.data.authUser.lastName,
      this.data.authUser.postalCode
    );

    cy.getByData('finish').click();
    cy.getByData('complete-header')
      .should('be.visible')
      .should('contain', 'Thank you for your order!');
    cy.getByData('complete-text')
      .should('be.visible')
      .should(
        'contain',
        'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
      );
  });
});

describe('Product List Page', () => {
  beforeEach(function () {
    cy.visit('https://www.saucedemo.com/');
    cy.viewport(1280, 720);
    cy.fixture('example').then(function (data) {
      this.data = data;
    });
  });
  it('All products should be visible', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.standard_user.username,
      this.data.users.standard_user.password
    );
    const itemNames = [];
    const expectedNames = this.data.products.map((product) => product.name);
    cy.getByData('inventory-item-name')
      .each(($el) => {
        itemNames.push($el.text().trim());
      })
      .then(() => {
        const sortedExpected = expectedNames.sort();
        const sortedActual = itemNames.sort();
        expect(sortedActual).to.deep.equal(sortedExpected);
      });
  });
  it('Add to Cart Button should not be visible and remove button should be visible once product is added to cart', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.standard_user.username,
      this.data.users.standard_user.password
    );
    cy.getByData('add-to-cart-sauce-labs-backpack').click();
    cy.getByData('shopping-cart-link').click();
    cy.getByData('inventory-item-name')
      .should('be.visible')
      .should('contain', 'Sauce Labs Backpack');
    cy.getByData('continue-shopping').click();
    cy.getByData('add-to-cart-sauce-labs-backpack').should('not.exist');
    cy.getByData('remove-sauce-labs-backpack').should('be.visible');
  });
  it('Remove Button should not be visible once product is removed from cart', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.standard_user.username,
      this.data.users.standard_user.password
    );
    cy.getByData('add-to-cart-sauce-labs-backpack').click();
    cy.getByData('remove-sauce-labs-backpack').click();
    cy.getByData('remove-sauce-labs-backpack').should('not.exist');
    cy.getByData('add-to-cart-sauce-labs-backpack').click();
    cy.getByData('shopping-cart-link').click();
    cy.getByData('remove-sauce-labs-backpack').click();
    cy.getByData('continue-shopping').click();
    cy.getByData('remove-sauce-labs-backpack').should('not.exist');
  });
  it('Items should be removed from cart once removed', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.standard_user.username,
      this.data.users.standard_user.password
    );
    cy.getByData('add-to-cart-sauce-labs-backpack').click();
    cy.getByData('remove-sauce-labs-backpack').click();
    cy.getByData('shopping-cart-link').click();
    cy.getByData('inventory-item-name').should('not.exist');
    cy.getByData('continue-shopping').click();
    cy.getByData('add-to-cart-sauce-labs-backpack').click();
    cy.getByData('shopping-cart-link').click();
    cy.getByData('remove-sauce-labs-backpack').click();
    cy.getByData('inventory-item-name').should('not.exist');
  });
  it('Cart item number notification should be visible when item is added to cart', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.standard_user.username,
      this.data.users.standard_user.password
    );
    cy.getByData('add-to-cart-sauce-labs-backpack').click();
    cy.getByData('shopping-cart-badge')
      .should('be.visible')
      .should('contain', 1);
    cy.getByData('add-to-cart-sauce-labs-bike-light').click();
    cy.getByData('shopping-cart-badge')
      .should('be.visible')
      .should('contain', 2);
    cy.getByData('add-to-cart-sauce-labs-fleece-jacket').click();
    cy.getByData('shopping-cart-badge')
      .should('be.visible')
      .should('contain', 3);
    cy.getByData('remove-sauce-labs-backpack').click();
    cy.getByData('shopping-cart-badge')
      .should('be.visible')
      .should('contain', 2);
    cy.getByData('remove-sauce-labs-bike-light').click();
    cy.getByData('shopping-cart-badge')
      .should('be.visible')
      .should('contain', 1);
    cy.getByData('remove-sauce-labs-fleece-jacket').click();
    cy.getByData('shopping-cart-badge').should('not.exist');
  });
  it('User should navigate to product page when clicked on product name', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.standard_user.username,
      this.data.users.standard_user.password
    );
    const targetName = 'Sauce Labs Backpack';
    cy.getByData('inventory-item-name').each(($el) => {
      if ($el.text().trim() === targetName) {
        cy.wrap($el).click();
        cy.getByData('inventory-item-name')
          .should('be.visible')
          .and('have.text', targetName);
        return false;
      }
    });
  });
  it('Should sort in reverse alphabetically order', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.standard_user.username,
      this.data.users.standard_user.password
    );
    const actualOrderArray = [];
    cy.getByData('product-sort-container').select('za');
    const expectedOrderArray = this.data.products
      .sort((a, b) => b.name.localeCompare(a.name))
      .map((product) => product.name);
    cy.getByData('inventory-item-name')
      .each(($el) => {
        actualOrderArray.push($el.text().trim());
      })
      .then(() => {
        expect(actualOrderArray).to.deep.equal(expectedOrderArray);
      });
  });
  it('Should sort in alphabetically order', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.standard_user.username,
      this.data.users.standard_user.password
    );
    const actualOrderArray = [];
    cy.getByData('product-sort-container').select('za');
    cy.getByData('product-sort-container').select('az');
    const expectedOrderArray = this.data.products
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((product) => product.name);
    cy.getByData('inventory-item-name')
      .each(($el) => {
        actualOrderArray.push($el.text().trim());
      })
      .then(() => {
        expect(actualOrderArray).to.deep.equal(expectedOrderArray);
      });
  });
  it('Should sort in price lower to higher order', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.standard_user.username,
      this.data.users.standard_user.password
    );
    const actualOrderArray = [];
    cy.getByData('product-sort-container').select('lohi');
    const expectedOrderArray = this.data.products
      .sort((a, b) => a.price - b.price)
      .map((product) => product.name);
    cy.getByData('inventory-item-name')
      .each(($el) => {
        actualOrderArray.push($el.text().trim());
      })
      .then(() => {
        expect(actualOrderArray).to.deep.equal(expectedOrderArray);
      });
  });
  it('Should sort in price higher to lower order', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.standard_user.username,
      this.data.users.standard_user.password
    );
    const actualOrderArray = [];
    cy.getByData('product-sort-container').select('hilo');
    const expectedOrderArray = this.data.products
      .sort((a, b) => b.price - a.price)
      .map((product) => product.name);
    cy.getByData('inventory-item-name')
      .each(($el) => {
        actualOrderArray.push($el.text().trim());
      })
      .then(() => {
        expect(actualOrderArray).to.deep.equal(expectedOrderArray);
      });
  });
});

describe('Problem User', () => {
  beforeEach(function () {
    cy.visit('https://www.saucedemo.com/');
    cy.viewport(1280, 720);
    cy.fixture('example').then(function (data) {
      this.data = data;
    });
  });

  it('Remove Button should not be visible once product is removed from cart', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.problem_user.username,
      this.data.users.problem_user.password
    );

    cy.getByData('add-to-cart-sauce-labs-backpack').click();
    cy.getByData('remove-sauce-labs-backpack').click();
    cy.getByData('remove-sauce-labs-backpack').should('not.exist');
  });

  it('User should be able to purchase one product', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.problem_user.username,
      this.data.users.problem_user.password
    );

    cy.getByData('add-to-cart-sauce-labs-backpack').click();
    cy.getByData('shopping-cart-link').click();

    cy.getByData('checkout').click();

    const cartPage = new CartPage();
    cartPage.submitPersonalInfoForm(
      this.data.authUser.firstName,
      this.data.authUser.lastName,
      this.data.authUser.postalCode
    );

    cy.getByData('finish').click();
    cy.getByData('complete-header')
      .should('be.visible')
      .should('contain', 'Thank you for your order!');
    cy.getByData('complete-text')
      .should('be.visible')
      .should(
        'contain',
        'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
      );
  });
});

describe('Error User', () => {
  beforeEach(function () {
    cy.visit('https://www.saucedemo.com/');
    cy.viewport(1280, 720);
    cy.fixture('example').then(function (data) {
      this.data = data;
    });
  });

  it('Remove Button should not be visible once product is removed from cart', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.error_user.username,
      this.data.users.error_user.password
    );

    cy.getByData('add-to-cart-sauce-labs-backpack').click();
    cy.getByData('remove-sauce-labs-backpack').click();
    cy.getByData('remove-sauce-labs-backpack').should('not.exist');
  });

  it('User should be able to purchase one product', function () {
    const loginPage = new LoginPage();
    loginPage.login(
      this.data.users.error_user.username,
      this.data.users.error_user.password
    );

    cy.getByData('add-to-cart-sauce-labs-backpack').click();
    cy.getByData('shopping-cart-link').click();

    cy.getByData('checkout').click();

    const cartPage = new CartPage();
    cartPage.submitPersonalInfoForm(
      this.data.authUser.firstName,
      this.data.authUser.lastName,
      this.data.authUser.postalCode
    );

    cy.getByData('finish').click();
    cy.getByData('complete-header')
      .should('be.visible')
      .should('contain', 'Thank you for your order!');
    cy.getByData('complete-text')
      .should('be.visible')
      .should(
        'contain',
        'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
      );
  });
});

describe('Security', () => {
  it('Loggedout user should not be able to access other pages', function () {
    cy.window().then((win) => {
      win.location.href = '/inventory.html';
    });
    cy.location('pathname').should('eq', '/');

    cy.window().then((win) => {
      win.location.href = '/cart.html';
    });
    cy.location('pathname').should('eq', '/');

    cy.window().then((win) => {
      win.location.href = '/checkout-step-one.html';
    });
    cy.location('pathname').should('eq', '/');

    cy.window().then((win) => {
      win.location.href = '/checkout-step-two.html';
    });
    cy.location('pathname').should('eq', '/');

    cy.window().then((win) => {
      win.location.href = '/checkout-complete.html';
    });
    cy.location('pathname').should('eq', '/');
  });
});
