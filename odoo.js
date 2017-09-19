'use strict';

var Client = require('react-native-xmlrpc');
var Deserializer = require('react-native-xmlrpc/lib/Deserializer');

module.exports = Odoo;

function authenticate(url, db, username, password) {
  return new Promise(function (resolve, reject) {
    var client = new Client(`${url}/xmlrpc/2/common`);
    client.call('authenticate', [db, username, password, {}], function (err, xml) {
      if (err) {
        reject(err);
      } else {
        var deserializer = new Deserializer();

        deserializer.deserializeMethodResponse(xml, function(err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      }
    });
  });
}

function execute_kw(url, db, uid, password, model, method, params, extra) {
  return new Promise(function (resolve, reject) {
    var client = new Client(`${url}/xmlrpc/2/object`);
    client.call('execute_kw', [db, uid, password,
      model, method, params, extra], function (err, xml) {
      if (err) {
        reject(err);
      } else {
        var deserializer = new Deserializer();

        deserializer.deserializeMethodResponse(xml, function(err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      }
    });
  });
}

/**
 * @class Odoo
 * @param {object} options The initial parameters
 * , e,g { url: 'http(s)://...', db: 'demo_db', username: 'test_user', password: 'secret' } 
 */
function Odoo(options) {
    this.settings = options || {};
}

/**
* Send authentication request to the server 
*/
Odoo.prototype.authenticate = async function () {
    return await authenticate(this.settings.url, this.settings.db, this.settings.username, this.settings.password);
}

/**
 * Send authentication request to the server and catch the id of login user
 */
Odoo.prototype.doAuthentication = async function () {
    if (!this.settings.uid) {
        this.settings.uid = await this.authenticate();
    }
}

/**
 * Search for the given model. It returns a list of ids
 * @param {string} model The model name
 * @param {array} params An array of filters (aka domain), e.g. [[['is_company', '=', True], ['customer', '=', True]]]
 * @param {object} extra An extra json parameter, e.g. { fields: [], offset: 0, limit: 1000 }
 */
Odoo.prototype.search = async function (model, params, extra) {
    await this.doAuthentication();
    return await execute_kw(this.settings.url, this.settings.db, this.settings.uid, this.settings.password,
        model, 'search', params, extra);
}

/**
 * Count the number of records for the given model
 * @param {string} model The model name
 * @param {array} params An array of filters (aka domain), e.g. [[['is_company', '=', True], ['customer', '=', True]]]
 */
Odoo.prototype.search_count = async function (model, params) {
    await this.doAuthentication();
    return await execute_kw(this.settings.url, this.settings.db, this.settings.uid, this.settings.password,
        model, 'search_count', params, {});
}

/**
 * Read the detials for the given model
 * @param {string} model The model name
 * @param {array} params An array of filters (aka domain), e.g. [[['is_company', '=', True], ['customer', '=', True]]]
 * @param {object} extra An extra json parameter, e.g. { fields: [], offset: 0, limit: 1000 }
 */
Odoo.prototype.read = async function (model, params, extra) {
    let ids = await this.search (model, params, extra);
    return await execute_kw(this.settings.url, this.settings.db, this.settings.uid, this.settings.password, model, 'read', ids, {});
}

/**
 * Get the properties of the given model
 * @param {string} model The model name
 * @param {object} attributes An extra json parameter, e.g. {'attributes': ['string', 'help', 'type']}
 */
Odoo.prototype.fields_get = async function (model, attributes) {
    await this.doAuthentication();
    return await execute_kw(this.settings.url, this.settings.db, this.settings.uid, this.settings.password, model, 'fields_get', [], attributes);
}

/**
 * An other implementation of read()
 */
Odoo.prototype.search_read = async function (model, params, extra) {
    await this.doAuthentication();
    return await execute_kw(this.settings.url, this.settings.db, this.settings.uid, this.settings.password, model, 'search_read', params, extra);
}

/**
 * Create a new record for the given model
 * @param {string} model The model name
 * @param {object} fields Details of the model
 */
Odoo.prototype.create = async function (model, fields) {
    await this.doAuthentication();
    return await execute_kw(this.settings.url, this.settings.db, this.settings.uid, this.settings.password, model, 'create', [fields]);
}

/**
 * Update a model for the given id
 * @param {string} model The model name
 * @param {object} fields Details of the model
 */
Odoo.prototype.update = async function (model, id, fields) {
    await this.doAuthentication();
    return await execute_kw(this.settings.url, this.settings.db, this.settings.uid, this.settings.password, model, 'write', [[id], fields]);
}

/**
 * Delete a model for the given id
 * @param {string} model The model name
 * @param {number} id The id of the model
 */
Odoo.prototype.delete = async function (model, id) {
    await this.doAuthentication();
    return await execute_kw(this.settings.url, this.settings.db, this.settings.uid, this.settings.password, model, 'unlink', [[id]]);
}

/**
 * Check access right of user on model
 * @param {string} model The model name
 */
Odoo.prototype.check_access_rights = async function (model, params, extra) {
    await this.doAuthentication();
    return await execute_kw(this.settings.url, this.settings.db, this.settings.uid, this.settings.password, model, 'check_access_rights', params, extra);
}
