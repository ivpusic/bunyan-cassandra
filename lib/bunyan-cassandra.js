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
 * Options are:
 * 		hosts     - default ['localhost']
 * 		keyspace 	- default 'logs'
 * 		username 	- default 'cassandra'
 * 		password 	- default 'cassandra'
 * 		query 		- default 'INSERT INTO logs (id) VALUES (uuid())'
 * 		args 			- default []
 */
function BunyanCassandra(opts) {
  this.hosts = opts.hosts || ['localhost'];
  this.keyspace = opts.keyspace || 'logs';
  this.username = opts.username || 'cassandra';
  this.password = opts.password || 'cassandra';
  this.query = opts.query || 'INSERT INTO logs (id) VALUES (uuid())';
  this.args = opts.args || [];

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
 * @params {Function} fn Callback which will be called after CQL query is executed
 */
BunyanCassandra.prototype.write = function (row, fn) {
  var argsValues = this.args.map(function (arg) {
    return objectPath.get(row, arg);
  });

  this.client.execute(this.query, argsValues, function () {
    if (isFunction(fn)) {
      fn.apply(this, arguments);
    }
  });
};

module.exports = BunyanCassandra;
