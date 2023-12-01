# Monkey
Self-hosted password manager tool.

## Running
This service is self-contained.

Sample .env:
```
NODE_PORT=3000
NODE_ENV=production
BCRYPT_SALT_ROUNDS=10
LOG_LEVEL=info
CRYPT_SIGNING_KEY=B78IXivcRANDOMKEYVALUEumoWG
CRYPT_INITIALIZATION_VECTOR=ccRANDOMHEXENCODEDVALUE698fce7deef6f
JWT_PUBLIC_KEY=LS0tLSFAKEBASE64MgS0VZLS0tLS0KTUZrd0V3WUhLb1pJemoFAKEUlLb1pJemowrrrrr0RRZ0FFcC84Yk1WSlk1N3ErWEdiYmJUaXRiWkhpWVNQTApzamovcWNZeVIwcTdZYi9SdGVJdmJ6R0lPc1J0VGozOGFkdEpaSHJNOERFa1pNcmszcHRuelIxcFVRPT0KLS0tFAKEDATAElDIEtFWS0tLS0t
JWT_PRIVATE_KEY=LS0tLS1CRUdJTiBFQyBQUklWQVRFFAKEDATAASUZHNWNpb1dMMkg1VHdrWk1rFAKEBASE641lSVHZweTVMMXVpeWtRaTl0b3dvQW9HQ0NxR1NNNDkKQXdFSG9VUURRZ0FFcC84Yk1WSlk1N3ErWEdiYmJUaXRiWkhpWVNQTHNqai9xY1l5UjBxN1liL1J0ZUl2YnpHSQpPc1J0VGozOGFkdEpaSHJNOERFAKEDATAcFVRPT0KLS0tLS1FTkQgRUMgUFS0tLQ
```
The JWT public key and JWT private key should be base-64 encoded rsa encryption keys.
The Crypt Signging Key can be any [random](https://passwordsgenerator.net/) key
THe Crypt Initialization vector can be generated as:
```js
import crypto from 'crypto';
console.log(crypto.randomBytes(16).toString('hex'));
```

```bash
$ cp .env.example > .env
# Make sure you change your configs to include the proper environment variables
$ yarn && yarn start
```

That's it.

It's _highly_ encouraged that you back your sqlite database and .env to some cloud repo like git.

--
