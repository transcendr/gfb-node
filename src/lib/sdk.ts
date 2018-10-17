const sdk = require("facebook-nodejs-business-sdk");
const accessToken =
  "EAAn4L3S8ykMBAG2u7a14KZAeuZA2K2lfPg8g5mVp4unBszGuNdpWwz9NifKbLlD33FZC2e5rfnKbYYtjSoOfDCavfZAZBFM9YKZA9l6SYHEOkAtne3AfVUKZBs52oFQMZAmJG0qT3eXGGEvv2rH4FWLgYNnQq3eedZAuVZCo3twKKCqmk0qEp23XsTpKUTGBtZAgRqoeP1YwDYFtQZDZD";
sdk.FacebookAdsApi.init(accessToken);
const AdAccount = sdk.AdAccount;

// const account = new AdAccount("act_10100943203320082");
const account = new AdAccount("act_1804348333164926");

export default { sdk, account };
