const express = require("express");
const util = require('ethereumjs-util')

const app = express();
const port = 3000;

app.use(express.json())

app.use((req, res, next) => {
  // Set CORS header to allow access from frontend.
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  next()
})

app.get("/token", (req, res) => {
  let nonce = Math.floor(Math.random() * 1000000).toString(); // in a real life scenario we would random this after each login and fetch it from the db as well
  return res.send(nonce);
});
app.post("/auth", (req, res) => {
  const { address, signature, nonce } = req.body;

  // On frontend, we use `web3.eth.personal.sign()` to calculate a signature,
  // and it adds a prefix to the message to make the calculated signature
  // recognisable as an Ethereum specific signature.
  const payload = util.keccak(Buffer.from(`\x19Ethereum Signed Message:\n${nonce.toString().length}${nonce}`))
  const { v, r, s } = util.fromRpcSig(signature)
  const pubKey  = util.ecrecover(util.toBuffer(payload), v, r, s)
  const recoveredAddress = util.bufferToHex(util.pubToAddress(pubKey))

  if (recoveredAddress !== address) {
    return res.status(401).send();
  }

  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
