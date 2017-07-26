const admin = require('firebase-admin');
const serviceAccount = require('./coin-push-firebase-adminsdk-5s3qb-8b77683674.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://coin-push.firebaseio.com'
});
// Get a database reference to our posts
const db = admin.database();
const ref = db.ref(admin.databaseURL);

if (require.main === module) {
    // Attach an asynchronous callback to read the data at our posts reference
    ref.child('users').once('value', (snapshot) => {
        snapshot.forEach( (user) => {
            console.log(user.val());
        });

    }, (errorObject) => {
        console.log('The read failed: ' + errorObject.code);
    });
}
