var Wit = require('node-wit').Wit;
var uuid = require('node-uuid');
var redis = require("redis");
var exports = module.exports = {};

const firstEntityValue = (entities, entity) =>{
    //console.log(entity + "-->");
    //console.log(entities[entity]);
    const val = entities && entities[entity] &&
            Array.isArray(entities[entity]) &&
            entities[entity].length > 0 &&
            entities[entity][0].value
        ;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
}

const allEntityValue = (entities, entity) =>{
    //console.log(entity + "-->");
    //console.log(entities[entity]);1
    if (entities && entities[entity] &&
        Array.isArray(entities[entity]) &&
        entities[entity].length > 0) {
        return entities[entity];
    }
    return null;
}

function parseIntend(entities, context) {
    var intend = firstEntityValue(entities, 'intend');
    if (intend) {
        context.intend = intend;
    }
}

function parseContacts(entities, context) {
    var contacts = allEntityValue(entities, 'contact');
    if (contacts) {
        context.contacts = contacts;
    }
}

function parseAmount(entities, context) {
    var amount = firstEntityValue(entities, 'amount_of_money');
    if (amount) {
        context.amount = amount;
    }
}

function parseMessage(entities, context) {
    var message = firstEntityValue(entities, 'message_subject');
    if (message) {
        context.message = message;
    }
}

function parseService(entities, context) {
    var service = firstEntityValue(entities, 'service');
    if (service) {
        context.service = service;
    }
}

function parseAccount(entities, context) {
    var account = firstEntityValue(entities, 'email');
    if (account) {
        context.account = account;
    }
}
function parseEnabled(entities, context) {
    var enabled = firstEntityValue(entities, 'on_off');
    if (enabled) {
        context.enabled = enabled;
    }
}
var client=null;
var context0;
var session;
var redisClient=null;

function initBot(mycb) {
    const actions = {
        say(sessionId, context, message, cb) {
            cb();
            mycb(message);
        },
        merge(sessionId, context, entities, message, cb) {
            if (context
                && context.intend
                && context.contacts
                && context.amount
                && context.service
                && context.account) {
                parseEnabled(entities, context);
            } else {
                parseIntend(entities, context);
                parseContacts(entities, context);
                parseAmount(entities, context);
                parseMessage(entities, context);
                parseService(entities, context);
                parseAccount(entities, context);
            }
            //console.log(entities);
            //console.log(context);
            cb(context);
        },
        error(sessionId, context, error) {
            //console.log(error.message);
        },
        sendBills(sessionId, context, cb) {
            cb(context);
        }
    };
    client = new Wit("B2VSXB5KNBO47O5P5ZVOZFVPUXEYKKOB", actions);
    redisClient = redis.createClient("redis://h:p1qess4qhifrue5o5q9v7pnvvkd@ec2-54-217-222-237.eu-west-1.compute.amazonaws.com",10349);
    redisClient.on('connect', function() {
        console.log('connected');
    });
    session = uuid.v1();
    context0 = {};
}

exports.runConversation = function (text,cb) {
    if (client === null) {
        console.log("initBot")
        initBot(cb);
        console.log(session)
    }

    client.runActions(session, text, context0, function (e, context0) {
        if (e) {
            console.log('Oops! Got an error: ' + e);
            return;
        }
        console.log('The session state is now: ' + JSON.stringify(context0));
    });
/*
    client.runActions(session, 'bill', context0, function (e, context0) {
        if (e) {
            console.log('Oops! Got an error: ' + e);
            return;
        }
        console.log('The session state is now: ' + JSON.stringify(context0));
        client.runActions(session, 'Engin', context0, function (e, context0) {
            if (e) {
                console.log('Oops! Got an error: ' + e);
                return;
            }
            console.log('The session state is now: ' + JSON.stringify(context0));
            client.runActions(session, '50€', context0, function (e, context0) {
                if (e) {
                    console.log('Oops! Got an error: ' + e);
                    return;
                }
                console.log('The session state is now: ' + JSON.stringify(context0));
                client.runActions(session, 'Paypal', context0, function (e, context0) {
                    if (e) {
                        console.log('Oops! Got an error: ' + e);
                        return;
                    }
                    console.log('The session state is now: ' + JSON.stringify(context0));
                    client.runActions(session, 'ed@ed.de', context0, function (e, context0) {
                        if (e) {
                            console.log('Oops! Got an error: ' + e);
                            return;
                        }
                        console.log('The session state is now: ' + JSON.stringify(context0));
                        client.runActions(session, 'Yes', context0, function (e, context0) {
                            if (e) {
                                console.log('Oops! Got an error: ' + e);
                                return;
                            }
                            console.log('The session state is now: ' + JSON.stringify(context0));
                        });
                    });
                });
            });
        });

    });*/
};
