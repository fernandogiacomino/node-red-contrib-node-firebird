
module.exports = function(RED) {
    "use strict";
    var reconnect = RED.settings.firebirdReconnectTime || 20000;
    var firebirddb = require('node-firebird');

    function FirebirdNode(n) {
        RED.nodes.createNode(this,n);
        this.host = n.host;
        this.port = n.port;
        this.dbname = n.db;
        var node = this;
        this.query=function(query, requesttype, done){
            var result=null;
            firebirddb.attach({
                host: node.host,
                port: node.port,
                database: node.dbname,
                user: node.credentials.user,
                password: node.credentials.password,
                role: null,
                pageSize: 4096
            }, function(err,db) {
               if (err){
                   node.error(err);
                   done(err,result);
                   return;
               }
               
               if (requesttype === 'transaction') {
                   
                   query.trim();
                   let query_array = query.endsWith(';') ? query.slice(0,-1).split(';') : query.split(';');
                   
                   db.transaction(firebirddb.ISOLATION_READ_UNCOMMITTED, function(err, transaction) {
                       if (err) {
                           db.detach()
                           node.error(err);
                           done(err,result);
                           return;
                       }
                       function transaction_query_callback(err, result) {
                           if (err) {
                               transaction.rollback();
                               db.detach();
                               node.error(err);
                               done(err,result);
                           } else if (query_array.length > 0) {
                               transaction.query(query_array.shift(), transaction_query_callback);
                           } else {
                               transaction.commit(function(err) {
                                   if (err) {
                                       transaction.rollback();
                                       db.detach();
                                       node.error(err);
                                   } else {
                                       db.detach();
                                   }
                                   done(err,result);
                               });
                           }
                       }
                       transaction.query(query_array.shift(), transaction_query_callback);
                   });
                   
               } else 
               if (requesttype === 'subscription') {
                   
                   ////////
                   Firebird.attach(options, function(err, db) {

    if (err)
        throw err;

    db.on('row', function(row, index, isObject) {
        // index === Number
        // isObject === is row object or array?
    });

    db.on('result', function(result) {
        // result === Array
    });

    db.on('attach', function() {

    });

    db.on('detach', function(isPoolConnection) {
        // isPoolConnection == Boolean
    });

    db.on('reconnect', function() {

    });

    db.on('error', function(err) {

    });

    db.on('transaction', function(isolation) {
        // isolation === Number
    });

    db.on('commit', function() {

    });

    db.on('rollback', function() {

    });

    db.detach();
});
                   //////////
                   
                   
                   query.trim();
                   let query_array = query.endsWith(';') ? query.slice(0,-1).split(';') : query.split(';');
                   
                   db.transaction(firebirddb.ISOLATION_READ_UNCOMMITTED, function(err, transaction) {
                       if (err) {
                           db.detach()
                           node.error(err);
                           done(err,result);
                           return;
                       }
                       function transaction_query_callback(err, result) {
                           if (err) {
                               transaction.rollback();
                               db.detach();
                               node.error(err);
                               done(err,result);
                           } else if (query_array.length > 0) {
                               transaction.query(query_array.shift(), transaction_query_callback);
                           } else {
                               transaction.commit(function(err) {
                                   if (err) {
                                       transaction.rollback();
                                       db.detach();
                                       node.error(err);
                                   } else {
                                       db.detach();
                                   }
                                   done(err,result);
                               });
                           }
                       }
                       transaction.query(query_array.shift(), transaction_query_callback);
                   });
                   
               } else 
               {    
                   db.query(query, function(err,result) {
                       if (err) {
                           node.error(err);
                       }
                       db.detach();
                       done(err,result);
                   });
                   
               }
                
            });
        }

        this.on('close', function (done) {
            done();
        });
    }
    RED.nodes.registerType("firebird-database",FirebirdNode, {
        credentials: {
            user: {type: "text"},
            password: {type: "password"}
        }
    });


    function FirebirdDBNodeIn(n) {
        RED.nodes.createNode(this,n);
        this.firebirddb = n.firebirddb;
        this.requesttype = n.requesttype;
        this.firebirddbConfig = RED.nodes.getNode(this.firebirddb);

        if (this.firebirddbConfig) {
            var node = this;
            node.on("input", function(msg) {
            node.status({fill:"green",shape:"dot",text:"Query.."});
            if (typeof msg.topic === 'string') {
                //console.log("query:",msg.topic);
                var bind = Array.isArray(msg.payload) ? msg.payload : [];
                node.firebirddbConfig.query(msg.topic, node.requesttype, function(err, rows) {
                    if (err) {
                        node.error(err,msg);
                        node.status({fill:"red",shape:"ring",text:"Error"});
                    }
                    else {
                        msg.payload = rows;
                        node.send(msg);
                        node.status({fill:"green",shape:"dot",text:"OK"});
                    }
                });
            }
            else {
                if (typeof msg.topic !== 'string') { node.error("msg.topic : the query is not defined as a string"); }
            }
            });
        }
        else {
            this.error("Firebird database not configured");
        }
    }
    RED.nodes.registerType("firebird-db",FirebirdDBNodeIn);
}
