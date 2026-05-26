// #!/usr/bin/env node

// /**
//  * VAPID Key Generator for Push Notifications
//  * 
//  * Run this script to generate VAPID keys for push notifications:
//  * node scripts/generate-vapid-keys.js
//  * 
//  * Then add the output to your .env file:
//  * NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public_key>
//  * VAPID_PRIVATE_KEY=<private_key>
//  */

// const crypto = require('crypto');

// function generateVAPIDKeys() {
//   // Generate an ECDH key pair using the P-256 curve
//   const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
//     namedCurve: 'prime256v1',
//     publicKeyEncoding: {
//       type: 'spki',
//       format: 'der'
//     },
//     privateKeyEncoding: {
//       type: 'pkcs8',
//       format: 'der'
//     }
//   });

//   // Extract the raw public key (last 65 bytes of SPKI format)
//   const rawPublicKey = publicKey.slice(-65);
  
//   // Extract the raw private key (last 32 bytes of PKCS8 format)
//   const rawPrivateKey = privateKey.slice(-32);

//   // Convert to URL-safe base64
//   const publicKeyBase64 = rawPublicKey.toString('base64')
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=/g, '');
  
//   const privateKeyBase64 = rawPrivateKey.toString('base64')
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=/g, '');

//   return {
//     publicKey: publicKeyBase64,
//     privateKey: privateKeyBase64
//   };
// }

// const keys = generateVAPIDKeys();

// console.log('\n🔑 VAPID Keys Generated!\n');
// console.log('Add these to your .env file:\n');
// console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
// console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
// console.log('\n');
