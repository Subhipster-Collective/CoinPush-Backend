#!/usr/bin/node
'use strict';

const MS_PER_DAY = 86400000;

const admin = require('firebase-admin');
const serviceAccount = require('./coin-push-firebase-adminsdk-5s3qb-8b77683674.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://coin-push.firebaseio.com'
});

// Get a database reference to our posts
const db = admin.database();
const ref = db.ref(admin.databaseURL);

const decreaseText = [' to ', ' down ', '%'];
const increaseText = [' to ', ' up ', '%'];
let activeUsers = {};

ref.child('users').on('value', snapshot => activeUsers = snapshot.val());

ref.child('conversionData').on('value', (snapshot) => {
    const currencyData = snapshot.val();
    if (Object.keys(activeUsers).length !== 0) {
        for (const id in activeUsers) {
            const user = activeUsers[id];
            const token = user.token;
            for (const conversion in user.conversions) {
                const preference = user.conversions[conversion];
                if((new Date()).getTime() - preference.timeLastPushed < MS_PER_DAY) {
                    return;
                }
                const currencies = conversion.split(':');
                const fromCurr = currencies[0];
                const toCurr = currencies[1];
                const delta = (currencyData[fromCurr][toCurr].CHANGEPCT24HOUR);
                if (preference.pushDecreased && -delta > preference.thresholdDecreased) {
                    formatAndSendNotification(token, decreaseText, conversion, fromCurr, toCurr, -delta, id);
                } else if (preference.pushIncreased && delta > preference.thresholdIncreased) {
                    formatAndSendNotification(token, increaseText, conversion, fromCurr, toCurr, delta, id);
                }
            }
        }
    }
}, errorObject => console.log('The read failed: ' + errorObject.code));

//helper functions

function formatAndSendNotification(token, formatArray, conversion, fromCurr, toCurr, change, id)
{
    sendNotification(token, fromCurr + formatArray[0] + toCurr + formatArray[1] + change.toPrecision(4)
                            + formatArray[2]);
    ref.child('users').child(id).child('conversions').child(conversion).child('timeLastPushed').set((new Date()).getTime());
}

function sendNotification(token, messageText) {

    const payload = {
        notification: {
            title: 'alert',
            body: messageText
        }
    };
    
    admin.messaging().sendToDevice(token, payload).then(response =>
        console.log('Successfully sent message:', response)).catch(error =>
        console.log('Error sending message:', error));
    /*console.log(token);
    console.log(payload);
    console.log();*/

}
