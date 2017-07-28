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
                const bucket = user.conversions[conversion];
                const currencies = conversion.split(':');
                const fromCurr = currencies[0];
                const toCurr = currencies[1];
                const delta = (currencyData[fromCurr][toCurr].CHANGEPCT24HOUR);
                handlePush(token, bucket, delta, fromCurr, toCurr);
            }
        }
    }
}, errorObject => console.log('The read failed: ' + errorObject.code));

//helper functions

function handlePush(token, userPref, delta, fromCurr, toCurr) {
    if (delta < 0 && userPref.pushDecreased && -delta > userPref.thresholdDecreased) {
        sendNotification(token, fromCurr + decreaseText[0] + toCurr + decreaseText[1] + (-delta).toPrecision(4)
                                + decreaseText[2]);
    } else if (userPref.pushIncreased && delta > userPref.thresholdIncreased) {
        sendNotification(token, fromCurr + increaseText[0] + toCurr + increaseText[1] + delta.toPrecision(4)
                                + increaseText[2]);
    }
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
    console.log(payload);

}
