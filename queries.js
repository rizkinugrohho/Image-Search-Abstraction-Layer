"use strict"
const mongo = require('mongodb').MongoClient;
function storeval(term) {
    mongo.connect(process.env.MONGOLOGIN, conn);
    function conn(err, client) {
        if (err) {
            throw err;
        }
        else {
            var db = client.db("gotohell");
            var collectn = db.collection("image_search");
            collectn.findOne({}, (e, result) => {
                if (e) throw e;
                result = result.value;
                let datestring = new Date().toString();
                result.push({ "term": term, "when": datestring });
                if (result.length > 10) {
                    result.shift();
                }
                collectn.update({}, { $set: { "value": result } });
                client.close();
            });
        }
    }
}
function resultFn(res) {
    let returnval=[];
    mongo.connect(process.env.MONGOLOGIN, conn);
    function conn(err, client) {
        if (err) {
            throw err;
        }
        else {
            var db = client.db("gotohell");
            var collectn = db.collection("image_search"); collectn.findOne({}, (e, result) => {
                if (e) throw e;
                res.json(result.value.reverse());
            });
        }
    }
}
module.exports = { "store": storeval ,"resultFn":resultFn};