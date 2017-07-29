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

const admin = require('firebase-admin');
const serviceAccount = require('./coin-push-firebase-adminsdk-5s3qb-8b77683674.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://coin-push.firebaseio.com'
});

const db = admin.database();
const ref = db.ref(admin.databaseURL).child('users');
 
if(require.main === module)
{
    ref.on('value', users => users.forEach((user) => {
        const childRef = ref.child(user.key);
        const conversionsRef = childRef.child('conversions');
        
        if(user.child('timeAdded').val() === null)
            childRef.child('timeAdded').set((new Date()).getTime());
        if(user.child('naggedOn').val() === null)
            childRef.child('naggedOn').set(0);
        users.child(user.key).child('conversions').forEach((conversion) => {
            if(conversion.child('timeLastPushed').val() === null)
                conversionsRef.child(conversion.key).child('timeLastPushed').set(0);
        })
    }));
}
