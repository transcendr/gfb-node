const sdk = require("facebook-nodejs-business-sdk");
import fb from "./sdk";
import { isArray } from "util";

export const retrieveSdkAccount = async () => {
  
  let details = await fb.accessToken()
  console.log('retrieveSdkAccount: SDK Details: ', details)

  sdk.FacebookAdsApi.init(details.accessToken);
  const AdAccount = sdk.AdAccount;
  
  const account = new AdAccount('act_'+details.accountId);
  
  return account
}

export const getCampaignsIds = async () => {
  const account = await retrieveSdkAccount()
  const campaigns = await account.getCampaigns();
  const mapIds = item => item.id;
  const ids = campaigns.map(mapIds);
  return ids;
};

export const getAdImages = async fields => {
  const account = await retrieveSdkAccount()
  const adImages = await account.getAdImages(fields);
  return adImages;
};

export const getAds = async fields => {
  const account = await retrieveSdkAccount()
  const adNodes = await account.getAds(fields);
  let ads = adNodes.map(x => x);
  while (adNodes.hasNext()) {
    let nextAdNode = await adNodes.next();
    ads = ads.concat(nextAdNode);
  }
  return ads;
};

export const getCreatives = async fields => {
  const account = await retrieveSdkAccount()
  fields = !!fields && isArray(fields) && fields.length > 0 ? fields : ["id"];
  const nodes = await account.getAdCreatives(fields);
  let items = nodes.map(x => x);
  while (nodes.hasNext()) {
    let nextNode = await nodes.next();
    items = items.concat(nextNode);
  }
  return items;
};

export const getCreativesWithImages = async fields => {
  fields = !!fields && isArray(fields) && fields.length > 0 ? fields : [];
  let creatives: any = await getCreatives(["image_url"].concat(fields));
  const hasImage = c => !!c.image_url;
  let filtered = creatives.filter(hasImage);
  return filtered;
};

export const buildGatsbySourceData = async () => {
  const validCreatives = await getCreativesWithImages(["title", "body"]);
  const structureData = (structured, { id, image_url, title, body }) => {
    structured.push({ id, image_url, title, body });
    return structured;
  };
  const sourceData = validCreatives.reduce(structureData, []);
  return sourceData;
};

// (async function() {
//   const sourceData = await buildGatsbySourceData();
//   console.log(JSON.stringify(sourceData));
// })();

export default buildGatsbySourceData