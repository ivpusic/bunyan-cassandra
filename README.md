bunyan-cassandra
================

Bunyan stream for saving logs to Cassandra

## Installation
```shell
npm install bunyan-cassandra
```

## Example

Basic example:

```Javascript
var CassandraStream = require('bunyan-cassandra');

var logger = bunyan.createLogger({
  src: true,
  name: 'name',
  streams: [{
    level: 'debug',
    stream: new CassandraStream({
      hosts: ['localhost'],
      keyspace: 'mykeyspace',
      username: 'myuser',
      password: 'mypass',
      query: 'INSERT INTO log (id, message) VALUES(uuid(), ?)',
      args: ['msg']
    })
  }]
});

// this mesage will be saved to cassandra
logger.debug('some log message');
```

Advanced example:

```Javascript
var CassandraStream = require('bunyan-cassandra');

var logger = bunyan.createLogger({
  src: true,
  name: 'name',
  streams: [{
    stream: process.stdout,
    level: 'debug'
  }, {
    type: 'raw',
    level: 'debug',
    stream: new CassandraStream({
      hosts: ['localhost'],
      keyspace: 'mykeyspace',
      username: 'myuser',
      password: 'mypass',
      query: 'INSERT INTO log (id, message, ip, date, user, line, file, func) VALUES(uuid(), ?, ?, ?, ?, ?, ?, ?)',
      args: ['msg', 'ctx.ip', 'time', 'ctx.session.user.id', 'src.line', 'src.file', 'src.func'],
      callback: function (err, res) {
        // this callback is optional
        // here you can do something with query results
        // or catch possible Cassandra errors
      }
    })
  }]
});

// ctx can be express request object for example
// it is completely up to you, you just need to configure ``query`` and ``args`` option
// to support provided object
logger.debug({
  ctx: {
    ip: '127.0.0.1',
    session: {
      user: {
        id: 1
      }
    }
  }
},'this is some log message');
```

## Configuration

You can pass following options

#### hosts
Array with cassandra hosts

**default** ``['localhost']``

#### keyspace
Name of keyspace to use

**default** ``'logs'``

#### username
Cassandra username to use

**default** ``'cassandra'``

#### username
Cassandra password to use

**default** ``'cassandra'``

#### query
Query for inserting data to Cassandra. 
This will be executed for each log.

**default** ``'INSERT INTO logs (id) VALUES (uuid())'``

#### args
Array of object paths. When new log will be added to Cassandra, module will look
for values on provided paths inside ``args`` option, and after that values with
CQL query will be passed to Cassandra, and new record will be added.

For example if your bunyan log entry looks like this:
```
{
  msg: 'this is some log message',
  ctx: {
    ip: '127.0.0.1',
    session: {
      id: 2
    }
  },
  level: 20
}
```

Then if you have CQL query like this:
```
query: 'INSERT INTO logs (id, msg, ip, sessionid, level) VALUES (uuid(), ?, ?, ?, ?)'
```
you can populate ``?`` with values if value of your ``args`` option is something like this:
```
args: ['msg', 'ctx.ip', 'ctx.session.id', 'level']
```

**default** ``[]``

#### callback
After query is executed ``callback`` function will be called (if is defined).
You can catch possible Cassandra errors here, or see result of operation.

**default** ``undefined``
