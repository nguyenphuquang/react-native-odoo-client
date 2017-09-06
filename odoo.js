'use strict';

var Client = require('react-native-xmlrpc');
var Deserializer = require('react-native-xmlrpc/lib/Deserializer');

module.exports = Odoo;

function authenticate(url, db, username, password) {
  return new Promise(function (resolve, reject) {
    var client = new Client(`https://${url}/xmlrpc/2/common`);
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
    var client = new Client(`https://${url}/xmlrpc/2/object`);
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

function Odoo(options) {
    this.settings = options || {};
}

Odoo.prototype.authenticate = async function () {
    var self = this;
    return await authenticate(this.settings.url, this.settings.db, this.settings.username, this.settings.password);
}

Odoo.prototype.doAuthentication = async function () {
    if (!this.settings.uid) {
        console.log ('authenticating...');
        this.settings.uid = await this.authenticate();
        console.log ('uid===================', this.settings.uid);
    }
}

Odoo.prototype.search = async function (model, params, extra) {
    await this.doAuthentication();
    return await execute_kw(this.settings.url, this.settings.db, this.settings.uid, this.settings.password,
        model, "search", params, extra);
}

Odoo.prototype.search_count = async function (model, params) {
    await this.doAuthentication();
    return await execute_kw(this.settings.url, this.settings.db, this.settings.uid, this.settings.password,
        model, "search_count", params, {});
}

Odoo.prototype.read = async function (model, params, extra) {
    let ids = await this.search (model, params, extra);
    return await execute_kw(this.settings.url, this.settings.db, this.settings.uid, this.settings.password, model, "read", ids, {});
}

Odoo.prototype.fields_get = async function (model, attributes) {
    await this.doAuthentication();
    return await execute_kw(this.settings.url, this.settings.db, this.settings.uid, this.settings.password, model, "fields_get", [], attributes);
}

Odoo.prototype.search_read = async function (model, params, extra) {
    await this.doAuthentication();
    return await execute_kw(this.settings.url, this.settings.db, this.settings.uid, this.settings.password, model, "search_read", params, extra);
}

Odoo.prototype.create = async function (model, fields) {
    await this.doAuthentication();
    return await execute_kw(this.settings.url, this.settings.db, this.settings.uid, this.settings.password, model, "create", [fields]);
}

Odoo.prototype.update = async function (model, id, fields) {
    await this.doAuthentication();
    return await execute_kw(this.settings.url, this.settings.db, this.settings.uid, this.settings.password, model, "write", [[id], fields]);
}

Odoo.prototype.delete = async function (model, id) {
    await this.doAuthentication();
    return await execute_kw(this.settings.url, this.settings.db, this.settings.uid, this.settings.password, model, "unlink", [[id]]);
}
