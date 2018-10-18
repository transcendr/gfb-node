const sdk = require("facebook-nodejs-business-sdk");
const storage = require('node-persist');

const accessToken = async function() {
  await storage.init();
  const accessToken = await storage.getItem('fbauth-ll-token')
  const accountId = await storage.getItem('fbauth-acctid')
  return {accessToken, accountId};
}

export default { sdk, accessToken };
