#!/usr/bin/node
'use strict';

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
        if(user.child('added').val() === null)
            childRef.child('added').set((new Date()).getTime());
        if(user.child('askedForSupport').val() === null)
            childRef.child('askedToSupport').set(false);
    }));
}
