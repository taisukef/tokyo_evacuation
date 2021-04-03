import { CSV } from "https://js.sabae.cc/CSV.js";
import { fetchTextCurl } from "https://js.sabae.cc/fetchCurl.js";

const urls = [
  "https://www.opendata.metro.tokyo.lg.jp/soumu/130001_evacuation_center.csv",
  "https://www.opendata.metro.tokyo.lg.jp/soumu/130001_evacuation_area.csv",
];
for (const url of urls) {
  const text = await fetchTextCurl(url);
  console.log(text);

  // patch
  const text2 = text.replace(
    "旧坪田中学校グラウンド,133817,東京都,三宅村,東京都三宅島三宅村坪田3034,34/059147,139.546787",
    "旧坪田中学校グラウンド,133817,東京都,三宅村,東京都三宅島三宅村坪田3034,34.059147,139.546787"
  );

  const csv = CSV.decode(text2);
  await Deno.writeTextFile("download" + url.substring(url.lastIndexOf("/")), CSV.encode(csv));
}
