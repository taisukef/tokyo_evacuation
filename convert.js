import { CSV } from "https://js.sabae.cc/CSV.js";
import { Geo3x3 } from "https://taisukef.github.io/Geo3x3/Geo3x3.mjs";

/*
const code = "E55555555555555555555555555555";
for (let i = 1; i <= code.length; i++) {
    const c = code.substring(0, i);
    //const pos = Geo3x3.decode(c);
    //console.log(pos.unit);
    const mesh = Geo3x3.getMeshSize(c);
    console.log(c.length, mesh);

}
Deno.exit(0);
*/

const GEO3X3_LEVEL = 15; // meshsize 4m


const assertLatLng = (lat, lng) => {
    const isFloat = (s) => {
        const r = s.match(/^(\d+\.\d+)$/);
        if (!r) {
            return false;
        }
        //console.log(r[1]);
        return true;
    };
    if (!isFloat(lat) || lat < -90 || lat > 90) {
        throw new Error("illegal lat: " + lat);
    }
    if (!isFloat(lng) || lng < -180 || lng > 180) {
        throw new Error("illegal lng: " + lng);
    }
};

const ns = [
    { prefix: "ic", url: "http://imi.go.jp/ns/core/rdf#" },
    { prefix: "schema", url: "http://schema.org/" },
    { prefix: "odp", url: "http://odp.jig.jp/odp/1.0#" },
    { prefix: "sabae", url: "https://rdf.sabae.cc/#" },
];

const map = {
    "避難場所_名称": [ "ic:名称", { "ic:種別": "避難場所" }],
    "避難所_名称": [ "ic:名称", { "ic:種別": "避難所" }],
    "地方公共団体コード": "odp:standardAreaCode",
    "都道府県": "ic:都道府県",
    "指定区市町村名": "ic:市区町村",
    "住所": "schema:address",
    "緯度": "ic:緯度",
    "経度": "ic:経度",
};
const convertHead = csv => {
    const head = csv[0];
    const appenddata = [];
    const head2 = [];
    for (let i = 0; i < head.length; i++) {
        const name = head[i];
        const d = map[name];
        if (!d) {
            throw new Error("not fonud in map: " + name);
        }
        if (typeof d == "object") {
            appenddata.push(d[1]);
            head[i] = d[0];
        } else {
            head[i] = d;
        }
    }
    for (const data of appenddata) {
        for (const name in data) {
            csv[0].unshift(name);
            const d = data[name];
            for (let i = 1; i < csv.length; i++) {
                csv[i].unshift(d);
            }
        }
    }
};
const addGeo3x3 = data => {
    const data2 = [];
    for (const d of data) {
        const lat = d["ic:緯度"];
        const lng = d["ic:経度"];
        assertLatLng(lat, lng);
        const geo3x3 = Geo3x3.encode(lat, lng, GEO3X3_LEVEL);
        d["sabaecc:geo3x3"] = geo3x3;
    }
};

const data = [];
for await (const f of await Deno.readDir("download")) {
    if (!f.name.endsWith(".csv")) {
        continue;
    }
    console.log(f.name);
    const csv = CSV.decode(await Deno.readTextFile("download/" + f.name));
    convertHead(csv);
    for (let i = 0; i < 10; i++) {
        console.log(csv[i]);
    }
    const d = CSV.toJSON(csv);
    addGeo3x3(d);
    d.forEach(d => data.push(d));
}

const write = async (fn, json) => {
    await Deno.writeTextFile(fn + ".csv", CSV.encode(CSV.fromJSON(json)));
    await Deno.writeTextFile(fn + ".json", JSON.stringify(json, null, 2));
}

await write("data/130001_evacuation", data);
await write("data/schema", ns);

// writeJSONLD // todo
