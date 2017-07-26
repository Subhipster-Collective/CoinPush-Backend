const admin = require('firebase-admin');
<<<<<<< Updated upstream
const serviceAccount = require('./coin-push-firebase-adminsdk-5s3qb-8b77683674.json');
=======

const serviceAccount = require('./coin-push-firebase-adminsdk-5s3qb-8b77683674.json');

>>>>>>> Stashed changes
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
