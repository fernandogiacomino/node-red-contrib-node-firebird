
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
        this.query=function(query, done){
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
               db.transaction(firebirddb.ISOLATION_READ_UNCOMMITTED, function(err, transaction) {
                   if (err) {
                       node.error(err);
                       done(err,result);
                   }
                   transaction.query(query, function(err,result) {
                       if (err) {
                           transaction.rollback();
                           node.error(err);
                           done(err,result);
                           return;
                       }
                       transaction.commit(function(err) {
                           if (err) {
                               transaction.rollback();
                               node.error(err);
                               done(err,result);
                           }
                           else {
                               db.detach();
                           }
                           done(err,result);
                        });
                    });
                });
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
        this.firebirddbConfig = RED.nodes.getNode(this.firebirddb);

        if (this.firebirddbConfig) {
            var node = this;
            node.on("input", function(msg) {
            node.status({fill:"green",shape:"dot",text:"Query.."});
            if (typeof msg.topic === 'string') {
                //console.log("query:",msg.topic);
                var bind = Array.isArray(msg.payload) ? msg.payload : [];
                node.firebirddbConfig.query(msg.topic, function(err, rows) {
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
