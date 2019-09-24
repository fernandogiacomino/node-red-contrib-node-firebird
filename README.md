node-red-contrib-node-firebird
========================

This is a fork of [node-red-node-firebird](https://github.com/phantom21/node-red-node-firebird)

A <a href="http://nodered.org" target="_new">Node-RED</a> node to read and write to a Firebird database.

Install
-------

Run the following command in your Node-RED user directory - typically `~/.node-red`

    npm install node-red-contrib-node-firebird


Usage
-----

Allows basic access to a Firebird database.

This node uses the <b>query</b> operation against the configured database. This does allow both INSERTS and DELETES.

By it's very nature it allows SQL injection... so <i>be careful out there...</i>

For <b>Query type</b> = <b>Simple query</b>:
    The `msg.topic` must hold the <i>query</i> for the database, and the result is returned in `msg.payload`.
    
For <b>Query type</b> = <b>Transaction</b>:
    The `msg.topic` may hold the <i>array of queries</i> in one string, divided by ";" or the <i>simple query</i>. The result for the <b>last querry</b> is returned in `msg.payload`.

Typically the returned payload will be an array of the result rows.

If nothing is found for the key then <i>null</i> is returned.