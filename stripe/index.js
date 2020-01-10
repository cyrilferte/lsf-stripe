
const stripe = require('stripe')('sk_test_nfB8A9gJfMWOFA0IfvEjXBJW');
var AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-3'});
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = (event, context, callback) => {
    const customer =  stripe.customers.create({
        payment_method: event.paymentMethod,
        email: event.email,
        invoice_settings: {
            default_payment_method: event.paymentMethod,
        },
    }).then(res =>{
        console.log(res)
        stripe.subscriptions.create(
            {
                customer: res.id,
                items: [{plan: 'plan_GWC315PYcRqB8b'}],
            },
            (err, subscription) => {
                // asynchronously called
                console.log(subscription)
                var params = {
                    TableName: 'lsf-user',
                    Item: {
                        'email' : {S: event.email},
                        'firstName': {S: event.firstName},
                        'lastName': {S: event.lastName},
                        'grossRevenue': {S: event.grossRevenue},
                        'level': {S: event.level},
                        'peopleNum': {S: event.peopleNum},
                        'subscribe': {B: true},
                    }
                };
                ddb.putItem(params, function(err, data) {
                    if (err) {
                        console.log("Error", err);
                    } else {
                        console.log("Success", data);
                    }
                });


            }
        );
    });
}


