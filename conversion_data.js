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

const UPDATE_DELAY = 10000;
const CRYPTOCURRENCIES = ['ETH', 'BTC', 'LTC', 'DASH', 'XMR', 'NXT', 'ZEC', 'DGB', 'XRP', 'BCH', 'ETC', 'DOGE'];
const ALL_CURRENCIES = CRYPTOCURRENCIES.concat(['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF']);
const URL = 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=' + CRYPTOCURRENCIES + '&tsyms=' + ALL_CURRENCIES;

const admin = require('firebase-admin');
const serviceAccount = require('./coin-push-firebase-adminsdk-5s3qb-8b77683674.json');
const request = require('request');
const asyncPolling = require('async-polling');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://coin-push.firebaseio.com'
});

const db = admin.database();
const ref = db.ref(admin.databaseURL).child('conversionData');

const updater = asyncPolling((end) => {
    request({
        url: URL,
        json: true
    }, (error, response, body) => {
        if (!error && response.statusCode === 200)
        {
            const data = {};
            for(const currencyFrom of CRYPTOCURRENCIES)
            {
                data[currencyFrom] = {};
                for(const currencyTo of ALL_CURRENCIES)
                {
                    try
                    {
                        data[currencyFrom][currencyTo] = {
                            PRICE: body.RAW[currencyFrom][currencyTo].PRICE,
                            CHANGEPCT24HOUR: body.RAW[currencyFrom][currencyTo].CHANGEPCT24HOUR
                        };
                    }
                    catch(err)
                    {
                        console.log('body: ');
                        console.log(body);
                        console.log('response: ');
                        console.log(response);
                        console.log('error: ');
                        console.log(error);
                    }
                }
            }
            ref.update(data);
            ref.update({timestamp: (new Date()).getTime()});
        }
    });
    end();
}, UPDATE_DELAY);
updater.run();
