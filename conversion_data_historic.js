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
const MAX_CURRENCY_TOS = 7;
const PAUSE_TIME = 150;

function copyChild(refOld, refNew)
{
    refOld.once('value', (snapshot) => {
        refNew.set(snapshot.val(), (error) => {
            if(error && typeof(console) !== 'undefined' && console.error)
                console.error(error);
        });
    });
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://coin-push.firebaseio.com'
});

const db = admin.database();
const ref = db.ref(admin.databaseURL).child('conversionData').child('historical');
const now = (new Date()).getTime() / 1000 | 0;

async function pushData(time, day, data)
{
    for(const currencyFrom of currencies.CRYPTOCURRENCIES)
    {
        if(typeof data[currencyFrom] === 'undefined')
            data[currencyFrom] = {};
        let currencyTos = [];
        for(let i = 0; i < currencies.ALL_CURRENCIES.length; ++i)
        {
            currencyTos.push(currencies.ALL_CURRENCIES[i]);
            if(i % MAX_CURRENCY_TOS === MAX_CURRENCY_TOS - 1 || i === currencies.ALL_CURRENCIES.length - 1)
            {
                getConversion(currencyFrom, currencyTos, day, time, data);
                currencyTos = [];
                await new Promise(resolve => setTimeout(resolve, PAUSE_TIME));
            }
        }
    }
}

function getConversion(currencyFrom, currencyTos, day, time, data)
{
    const URL = `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${currencyFrom}&tsyms=${currencyTos}&ts=${time}`;
    request({
        url: URL,
        json: true
    }, (error, response, body) => {
        if (!error && response.statusCode === 200)
            for(const currencyTo of currencyTos)
            {
                if(typeof data[currencyFrom][currencyTo] === 'undefined')
                    data[currencyFrom][currencyTo] = {};
                data[currencyFrom][currencyTo][day] = {
                    PRICE: (currencyFrom === currencyTo) ? 1 : body[currencyFrom][currencyTo],
                    timestamp: time * 1000 
                };
            }
    });
}

async function main()
{
    const data = {};
    
    await pushData(now -    SECS_PER_DAY, 'day1', data);
    await pushData(now -  2*SECS_PER_DAY, 'day2', data);
    await pushData(now -  3*SECS_PER_DAY, 'day3', data);
    await pushData(now -  4*SECS_PER_DAY, 'day4', data);
    await pushData(now -  5*SECS_PER_DAY, 'day5', data);
    await pushData(now -  6*SECS_PER_DAY, 'day6', data);
    await pushData(now -  7*SECS_PER_DAY, 'day7', data);
    
    //copyChild(ref.child('day7'), ref.child('week1'));
    await pushData(now - 14*SECS_PER_DAY, 'week2', data);
    await pushData(now - 21*SECS_PER_DAY, 'week3', data);
    await pushData(now - 28*SECS_PER_DAY, 'week4', data);
    await pushData(now - 35*SECS_PER_DAY, 'week5', data);
    await pushData(now - 42*SECS_PER_DAY, 'week6', data);
    await pushData(now - 49*SECS_PER_DAY, 'week7', data);
    await pushData(now - 56*SECS_PER_DAY, 'week8', data);
    await pushData(now - 63*SECS_PER_DAY, 'week9', data);
    await pushData(now - 70*SECS_PER_DAY, 'week10', data);
    await pushData(now - 77*SECS_PER_DAY, 'week11', data);
    await pushData(now - 84*SECS_PER_DAY, 'week12', data);
    
    ref.update(data);
    admin.app().delete();
}

main();
