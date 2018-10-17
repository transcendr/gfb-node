import fb from "./sdk";
import { isArray } from "util";

const account = fb.account;

export const getCampaignsIds = async () => {
  const campaigns = await account.getCampaigns();
  const mapIds = item => item.id;
  const ids = campaigns.map(mapIds);
  return ids;
};

export const getAdImages = async fields => {
  const adImages = await account.getAdImages(fields);
  return adImages;
};

export const getAds = async fields => {
  const adNodes = await account.getAds(fields);
  let ads = adNodes.map(x => x);
  while (adNodes.hasNext()) {
    let nextAdNode = await adNodes.next();
    ads = ads.concat(nextAdNode);
  }
  return ads;
};

export const getCreatives = async fields => {
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

(async function() {
  const sourceData = await buildGatsbySourceData();
  console.log(JSON.stringify(sourceData));
})();

module.exports = buildGatsbySourceData;
