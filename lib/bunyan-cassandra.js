'use strict';

var cql = require('node-cassandra-cql');
var objectPath = require('object-path');

function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

/**
 * Main module constructor
 *
 * Constructor is accepting object with module options
 */
function BunyanCassandra(opts) {
  opts = opts || {};

  this.hosts = opts.hosts || ['localhost'];
  this.keyspace = opts.keyspace || 'logs';
  this.username = opts.username || 'cassandra';
  this.password = opts.password || 'cassandra';
  this.query = opts.query || 'INSERT INTO logs (id) VALUES (uuid())';
  this.args = opts.args || [];
  this.callback = opts.callback;
  this.transform = opts.transform;

  this.client = new cql.Client({
    hosts: this.hosts,
    keyspace: this.keyspace,
    username: this.username,
    password: this.password
  });
}

/**
 * Fucntion for parsing and saving raw log data to cassandra
 *
 * @params {Object} row Raw bunyan log data
 */
BunyanCassandra.prototype.write = function (row) {
  if (isFunction(this.transform)) {
    row = this.transform(row);
  }

  var ctx = this;
  var argsValues = this.args.map(function (arg) {
    return objectPath.get(row, arg);
  });

  this.client.execute(this.query, argsValues, function () {
    if (isFunction(ctx.callback)) {
      ctx.callback.apply(this, arguments);
    }
  });
};

module.exports = BunyanCassandra;
