#!/usr/bin/node
'use strict';

/*
 * Copyright 2017 Subhipster Collective
 *
 * This file is part of CoinPush-Backend.
 *
 * CoinPush-Backend is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CoinPush-Backend is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with CoinPush-Backend.  If not, see <http://www.gnu.org/licenses/>.
 */

const MS_PER_DAY = 86400000;
const TEXT_DECREASED = [' to ', ' is down ', '%'];
const TEXT_INCREASED = [' to ', ' is up ', '%'];

const admin = require('firebase-admin');
const serviceAccount = require('./coin-push-firebase-adminsdk-5s3qb-8b77683674.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://coin-push.firebaseio.com'
});

// Get a database reference to our posts
const db = admin.database();
const ref = db.ref(admin.databaseURL);

let activeUsers = {};

ref.child('users').on('value', snapshot => activeUsers = snapshot.val()), errorObject =>
    console.log('users read failed: ' + errorObject.code);

ref.child('conversionData').on('value', (snapshot) => {
    const currencyData = snapshot.val();
    if (Object.keys(activeUsers).length !== 0)
    {
        const now = (new Date()).getTime();
        for (const id in activeUsers)
        {
            const user = activeUsers[id];
            const token = user.token;
            for(const conversionStr in user.conversionPrefs)
            {
                const preference = user.conversionPrefs[conversionStr];
                if(now - user.timeLastPushed[conversionStr] < MS_PER_DAY)
                    continue;
                const currencies = conversionStr.split(':');
                const currencyFrom = currencies[0];
                const currencyTo = currencies[1];
                const change = (currencyData[currencyFrom][currencyTo].CHANGEPCT24HOUR);
                if (preference.pushDecreased && (-change) > preference.thresholdDecreased)
                    formatAndSendNotification(token, TEXT_DECREASED, conversionStr, currencyFrom, currencyTo, -change, id);
                else if (preference.pushIncreased && change > preference.thresholdIncreased)
                    formatAndSendNotification(token, TEXT_INCREASED, conversionStr, currencyFrom, currencyTo, change, id);
            }
        }
    }
}, errorObject => console.log('conversionData read failed: ' + errorObject.code));

//helper functions

function formatAndSendNotification(token, formatArray, conversion, currencyFrom, currencyTo, change, id)
{
    sendNotification(token, currencyFrom + formatArray[0] + currencyTo + formatArray[1] + change.toPrecision(4)
                            + formatArray[2]);
    ref.child('users').child(id).child('timeLastPushed').child(conversion).set((new Date()).getTime());
}

function sendNotification(token, messageText)
{
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
