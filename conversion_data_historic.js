#!/usr/bin/node
'use strict';

/*
 * Copyright 2017  Subhipster Collective
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

const admin = require('firebase-admin');
const serviceAccount = require('./coin-push-firebase-adminsdk-5s3qb-8b77683674.json');
const request = require('request');
const currencies = require('./currencies.js');

const SECS_PER_DAY = 86400;

/*function copyChild(refOld, refNew)
{
    refOld.once('value', (snapshot) => {
        refNew.set(snapshot.val(), (error) => {
            if(error && typeof(console) !== 'undefined' && console.error)
                console.error(error);
        });
    });
}*/

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://coin-push.firebaseio.com'
});

const db = admin.database();
const ref = db.ref(admin.databaseURL).child('conversionData');
const now = (new Date()).getTime() / 1000 | 0;

async function pushData(time, dayRef)
{
    const data = {};
    for(const currencyFrom of currencies.CRYPTOCURRENCIES)
    {
        data[currencyFrom] = {};
        for(const currencyTo of currencies.ALL_CURRENCIES)
        {
            getConversion(currencyFrom, currencyTo, time, data);
            await new Promise(resolve => setTimeout(resolve, 150));
        }
    }
    dayRef.update(data);
    dayRef.update({timestamp: time * 1000});
}

function getConversion(currencyFrom, currencyTo, time, data)
{
    const URL = `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${currencyFrom}&tsyms=${currencyTo}&ts=${time}`;
    request({
        url: URL,
        json: true
    }, (error, response, body) => {
        if (!error && response.statusCode === 200)
            data[currencyFrom][currencyTo] = { PRICE: (currencyFrom === currencyTo) ? 1 : body[currencyFrom][currencyTo] };
    });
}

async function main()
{
    await pushData(now -   SECS_PER_DAY, ref.child('day1'));
    await pushData(now - 2*SECS_PER_DAY, ref.child('day2'));
    await pushData(now - 3*SECS_PER_DAY, ref.child('day3'));
    await pushData(now - 4*SECS_PER_DAY, ref.child('day4'));
    await pushData(now - 5*SECS_PER_DAY, ref.child('day5'));
    await pushData(now - 6*SECS_PER_DAY, ref.child('day6'));
    await pushData(now - 7*SECS_PER_DAY, ref.child('day7'));
    
    admin.app().delete();
}

main();
