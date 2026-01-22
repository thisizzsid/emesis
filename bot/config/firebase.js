const admin = require('firebase-admin');
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
let serviceAccount;

// Try to load from file first, then from environment variable
const keyPath = path.join(__dirname, '../serviceAccountKey.json');
if (fs.existsSync(keyPath)) {
  serviceAccount = require(keyPath);
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // Parse from environment variable (JSON string)
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} else {
  // Fallback: construct from individual env variables
  serviceAccount = {
    type: process.env.FIREBASE_TYPE || 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || 'AIzaSyCI2kwY-VdtU7cfSCCYyK8twNTAbH-14Ro',
    private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    client_email: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-00000@e2emesis.iam.gserviceaccount.com',
    client_id: process.env.FIREBASE_CLIENT_ID || '104944331781000000000',
    auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
    token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
  };
}

if (!serviceAccount || !serviceAccount.project_id) {
  throw new Error('Firebase service account credentials not found. Please add serviceAccountKey.json or set FIREBASE_SERVICE_ACCOUNT_KEY environment variable.');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
