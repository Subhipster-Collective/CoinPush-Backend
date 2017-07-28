#!/usr/bin/node
'use strict';

const UPDATE_DELAY = 10000;
const CRYPTOCURRENCIES = ['ETH', 'BTC', 'LTC', 'DASH', 'XMR', 'NXT', 'ZEC', 'DGB', 'XRP', 'ETC'];
const ALL_CURRENCIES = CRYPTOCURRENCIES.concat(['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF']);
const URL = 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=' + CRYPTOCURRENCIES + '&tsyms=' + ALL_CURRENCIES;

const admin = require('firebase-admin');
const serviceAccount = require('./coin-push-firebase-adminsdk-5s3qb-8b77683674.json');
const request = require('request');
const AsyncPolling = require('async-polling');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://coin-push.firebaseio.com'
});

const db = admin.database();
const ref = db.ref(admin.databaseURL).child('conversionData');

const updater = AsyncPolling((end) => {
    request({
        url: URL,
        json: true
    }, (error, response, body) => {
        if (!error && response.statusCode === 200)
        {
            const raw = body.RAW;
            const data = {};
            for(const currencyFrom of CRYPTOCURRENCIES)
            {
                data[currencyFrom] = {};
                const dataFrom = data[currencyFrom];
                const cryptocompareFrom = raw[currencyFrom];
                for(const currencyTo of ALL_CURRENCIES)
                {
                    dataFrom[currencyTo] = {
                        PRICE: cryptocompareFrom[currencyTo].PRICE,
                        CHANGEPCT24HOUR: cryptocompareFrom[currencyTo].CHANGEPCT24HOUR
                    };
                }
            }
            ref.update(data);
            ref.update({timestamp: (new Date()).getTime()});
        }
    });
    end();
}, UPDATE_DELAY);
updater.run();
