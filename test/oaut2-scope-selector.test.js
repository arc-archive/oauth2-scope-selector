import {
  fixture,
  assert,
  nextFrame,
  html
} from '@open-wc/testing';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../oauth2-scope-selector.js';

describe('<oauth2-scope-selector>', function() {
  async function basicFixture() {
    return await fixture(html `
      <oauth2-scope-selector></oauth2-scope-selector>
    `);
  }

  async function allowedFixture() {
    return await fixture(html `
      <oauth2-scope-selector allowedscopes='["test"]' preventcustomscopes></oauth2-scope-selector>
    `);
  }

  async function valuesFixture() {
    return await fixture(html `
      <oauth2-scope-selector value='["test","test-2"]'></oauth2-scope-selector>
    `);
  }

  async function requiredFixture() {
    return await fixture(html `
      <oauth2-scope-selector required></oauth2-scope-selector>
    `);
  }

  async function autoValidateFixture() {
    return await fixture(html `
      <oauth2-scope-selector required autovalidate></oauth2-scope-selector>
    `);
  }

  async function autoValidateValueFixture() {
    return await fixture(html `
      <oauth2-scope-selector required autovalidate value='["test"]'></oauth2-scope-selector>
    `);
  }

  async function multiFixture() {
    return await fixture(html `
      <oauth2-scope-selector allowedscopes='[{"label":"test-label","description":"test-description"}]' preventcustomscopes></oauth2-scope-selector>
    `);
  }

  describe('basic', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Value is empty array by default', () => {
      assert.isArray(element.value, 'value is an array');
      assert.lengthOf(element.value, 0, 'value is empty');
    });

    it('Accepts scope value', () => {
      const input = element._inputTarget;
      input.value = 'test';
      MockInteractions.keyDownOn(input, 13, [], 'Enter');
      assert.isArray(element.value, 'value is an array');
      assert.lengthOf(element.value, 1, 'value has 1 item');
    });

    it('Clears input after enter', () => {
      const input = element._inputTarget;
      input.value = 'test';
      assert.equal(element.currentValue, 'test');
      MockInteractions.keyDownOn(input, 13, [], 'Enter');
      assert.equal(element.currentValue, '');
    });
  });

  describe('allowed scopes', () => {
    let element;
    beforeEach(async () => {
      element = await allowedFixture();
    });

    it('Accepts allowed scope', () => {
      const input = element._inputTarget;
      input.value = 'test';
      MockInteractions.keyDownOn(input, 13, [], 'Enter');
      assert.lengthOf(element.value, 1, 'value has 1 item');
    });

    it('Does not accept disallowed scope', () => {
      const input = element._inputTarget;
      input.value = 'tes';
      MockInteractions.keyDownOn(input, 13, [], 'Enter');
      assert.lengthOf(element.value, 0);
    });
  });

  describe('append()', () => {
    const scope = 'test-scope';
    it('Appends scope', async () => {
      const element = await basicFixture();
      element.append(scope);
      assert.deepEqual(element.value, [scope]);
    });

    it('Appends scope only once', async () => {
      const element = await basicFixture();
      element.append(scope);
      element.append(scope);
      assert.deepEqual(element.value, [scope]);
    });

    it('Does not append scope when prevented', async () => {
      const element = await allowedFixture();
      element.append(scope);
      assert.deepEqual(element.value, []);
    });

    it('Informs the user about error', async () => {
      const element = await allowedFixture();
      element.append(scope);
      const toast = element.shadowRoot.querySelector('paper-toast[dissalowed]');
      assert.isTrue(toast.opened);
    });
  });

  describe('_appendScope()', () => {
    it('Does not append empty scopes', async () => {
      const element = await basicFixture();
      element._appendScope();
      assert.deepEqual(element.value, []);
    });
    it('Informs the user about error', async () => {
      const element = await basicFixture();
      element._appendScope();
      const toast = element.shadowRoot.querySelector('paper-toast[missing-scope]');
      assert.isTrue(toast.opened);
    });

    it('Appends scope when value is entered', async () => {
      const element = await basicFixture();
      element.currentValue = 'test';
      element._appendScope();
      assert.deepEqual(element.value, ['test']);
    });

    it('Clears input when apends scope', async () => {
      const element = await basicFixture();
      element.currentValue = 'test';
      element._appendScope();
      assert.equal(element.currentValue, '');
    });
  });

  describe('_removeScope()', () => {
    it('Removes the scope', async () => {
      const element = await valuesFixture();
      const button = element.shadowRoot.querySelector('[data-action="remove-scope"]');
      MockInteractions.tap(button);
      assert.lengthOf(element.value, 1);
    });
  });

  describe('allowed scopes as object', () => {
    let element;
    beforeEach(async () => {
      element = await multiFixture();
    });

    it('Accepts alloowed scope', () => {
      const input = element._inputTarget;
      input.value = 'test-label';
      MockInteractions.keyDownOn(input, 13, [], 'Enter');
      assert.lengthOf(element.value, 1, 'value has 1 item');
    });

    it('Do not accepts disalloowed scope', () => {
      const input = element._inputTarget;
      input.value = 'test';
      MockInteractions.keyDownOn(input, 13, [], 'Enter');
      assert.lengthOf(element.value, 0);
    });
  });

  describe('Without validation enabled', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Is valid if not required', () => {
      assert.isFalse(element.invalid);
    });

    it('valudate() is true', () => {
      assert.isTrue(element.validate());
    });
  });

  describe('Required', () => {
    let element;
    beforeEach(async () => {
      element = await requiredFixture();
    });

    it('Is not invalid', () => {
      assert.isFalse(element.invalid);
    });

    it('valudate() is false', () => {
      assert.isFalse(element.validate());
    });

    it('Invalid is set after validation', () => {
      element.validate();
      assert.isTrue(element.invalid);
    });

    it('Invalid is false when adding value', () => {
      element.validate();
      element.value = ['test'];
      assert.isTrue(element.invalid);
      element.validate();
      assert.isFalse(element.invalid);
    });
  });

  describe('Auto validation', () => {
    it('Is valid when default empty', async () => {
      const element = await autoValidateFixture();
      assert.isFalse(element.invalid);
    });

    it('Is valid after providing value', async () => {
      const element = await autoValidateFixture();
      element.value = ['test'];
      assert.isFalse(element.invalid);
    });

    it('Invalid when removing the value', async () => {
      const element = await autoValidateValueFixture();
      const button = element.shadowRoot.querySelector('[data-action="remove-scope"]');
      MockInteractions.tap(button);
      await nextFrame();
      assert.isTrue(element.invalid);
    });
  });

  describe('compatibility mode', () => {
    it('sets compatibility on item when setting legacy', async () => {
      const element = await basicFixture();
      element.legacy = true;
      assert.isTrue(element.legacy, 'legacy is set');
      assert.isTrue(element.compatibility, 'compatibility is set');
    });

    it('returns compatibility value from item when getting legacy', async () => {
      const element = await basicFixture();
      element.compatibility = true;
      assert.isTrue(element.legacy, 'legacy is set');
    });
  });
});