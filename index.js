const express = require('express');
const { resolve } = require('path');
const CryptoJS = require('crypto-js');
const { log } = require('console');

/**
 * 1. Access '/' get token
 * 2. Access '/verify?token=YOUR-TOKEN'
 */

const app = express();
const port = 3010;

app.use(express.static('static'));

const JWT_SECRET =
  'QWe8oxm/c4LmjmFy/TbudH7e7cLLGzKxcxQkYEoiKwMndGLZAk+p0lEtqXQestsHn2CDadD8UR2JG0sZXNxQuPRdTXZEbm5GMiTJXWIPh/yztrKnhXfhMkpCBmk6+EJMUxl+XPlAZaRYUQAcL8wPHdzzposiA3Q9wqrddrOKWYMfPTTGpafoL4TMN99INoBfRA6gMSPxURhX+UHFmO0TZybL27lSS6mf+zOa1wavVV3qA70uMaJ3nfPjZPit5ocDpUBBxVb5NJ858bjnoyrewh63UYIccGD0r0KywMVpfe2xA7CuwtNXK2vAcEc12RPpbnJtLcntHDX/+t8mcXrv+Q==';

app.get('/', (req, res) => {
  // HEADER
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };
  const encodedHeader = btoa(JSON.stringify(header));

  // PAYLOAD
  const payload = {
    sub: 1, // DB
    exp: Date.now() + 1000 * 60 * 60,
  };
  const encodedPayload = btoa(JSON.stringify(payload));

  // SIGNATURE
  const signature = CryptoJS.HmacSHA256(
    `${encodedHeader}.${encodedPayload}`,
    JWT_SECRET
  );

  const jwtToken = `${encodedHeader}.${encodedPayload}.${signature}`;

  res.json({ jwtToken });
});

app.get('/verify', (req, res) => {
  const jwtToken = req.query.token;

  const [encodedHeader, encodedPayload, signature] = jwtToken.split('.');

  const validSignature = CryptoJS.HmacSHA256(
    `${encodedHeader}.${encodedPayload}`,
    JWT_SECRET
  );

  if (signature.toString() === validSignature.toString()) {
    const payload = JSON.parse(atob(encodedPayload));

    if (payload.exp < Date.now()) {
      res.status(401).json({ message: 'Token expired' });
      return;
    }

    // Get user from DB by "sub"
    const userId = payload.sub;

    res.json({ payload });
  } else {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
