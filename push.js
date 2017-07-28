const admin = require('firebase-admin');
const serviceAccount = require('./coin-push-firebase-adminsdk-5s3qb-8b77683674.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://coin-push.firebaseio.com'
});

// Get a database reference to our posts
const db = admin.database();
const ref = db.ref(admin.databaseURL);

const decreaseText = ['The current value of ',' has fallen ', ' percent.'];
const increaseText = ['The current value of ',' has increased ', ' percent.'];
let activeUsers = {};


ref.child('users').on('value', (snapshot) =>  {
    activeUsers = snapshot.val();
});

ref.child('conversionData').on('value', (snapshot) => {
    const currencyData = snapshot.val();
    if (Object.keys(activeUsers).length !== 0) {
        for (const id in activeUsers) {
            const token = activeUsers[id].token;
            for (const currencies in activeUsers[id].conversions) {
                const bucket = activeUsers[id].conversions[currencies];
                const fromCurr = currencies.split(':')[0];
                const toCurr = currencies.split(':')[1];
                const delta = (currencyData[fromCurr][toCurr].CHANGEPCT24HOUR);
                handlePush(token,bucket,delta,fromCurr);
            }
        }
    }

}, (errorObject) => {
    console.log('The read failed: ' + errorObject.code);

});


//helper functions

function handlePush(token, userPref, delta, fromCurr) {
    console.log(delta.toString().substring(1));
    if (hasDecreased(delta) && userPref.pushDecreased
    && delta < userPref.thresholdDecreased ) {
        delta = Number(delta.toString().substring(1));
        sendNotification(token,decreaseText[0]
                        + fromCurr + decreaseText[1]
                        + userPref.thresholdDecreased + decreaseText[2]);

    } else if (!hasDecreased(delta) && userPref.pushIncreased
    &&  delta > userPref.thresholdIncreased) {
        delta = Number(delta.toString().substring(1));
        sendNotification(token,increaseText[0]
                        + fromCurr + increaseText[1]
                        + userPref.thresholdIncreased + increaseText[2]);
    }
}

function sendNotification(token,messageText){

    const payload = {
        notification: {
            title: 'alert',
            body: messageText
        }
    };
    
    admin.messaging().sendToDevice(token, payload)
  .then((response) => {
      console.log('Successfully sent message:', response);
  })
  .catch((error) => {
      console.log('Error sending message:', error);
  });

}

function hasDecreased(delta) {
    const temp = delta.toString();
    return (temp[0] === '-');
}
