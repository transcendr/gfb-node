const sdk = require("facebook-nodejs-business-sdk");
const accessToken =
  "EAAn4L3S8ykMBAP7kCUyEqO1ZCrzG0kI30xAZCdToFwsrc9tZAdDu1yRo2tLqWENU0ul1ZCFMXQPRUqU2YpZAXGZBaJ4b2hY7spxkDpX2ul7W2kH9j1VknLSnvFDLkznfxdZCvmeDbqbO2QxSROjOPaKmi9U4KMpcb3tgMGrhwOjYRkuOGg5NZASaAt928s5V5bv6o29XvRP9OAZDZD";
sdk.FacebookAdsApi.init(accessToken);
const AdAccount = sdk.AdAccount;

// const account = new AdAccount("act_10100943203320082");
const account = new AdAccount("act_1804348333164926");

export default { sdk, account };
