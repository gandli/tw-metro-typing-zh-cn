import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const STATIONS_URL =
  "https://raw.githubusercontent.com/repeat/northern-taiwan-metro-stations/main/output/northern-taiwan.geojson";
const TAIWAN_URL = "https://taiwan.md/assets/geo/taiwan-country.topo.json";

const LINE_INFO = {
  BR: { name: "文湖線", operator: "台北捷運", color: "#c48c31" },
  R: { name: "淡水信義線", operator: "台北捷運", color: "#e54b4b" },
  G: { name: "松山新店線", operator: "台北捷運", color: "#168c61" },
  O: { name: "中和新蘆線", operator: "台北捷運", color: "#f49a32" },
  BL: { name: "板南線", operator: "台北捷運", color: "#2775c9" },
  Y: { name: "環狀線", operator: "新北捷運", color: "#e6b928" },
  A: { name: "機場線", operator: "桃園捷運", color: "#8d5aa7" },
};

function normalizeTarget(value) {
  return value
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/[-–—/]/g, " ")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function stationNumber(id) {
  return Number(id.match(/\d+/)?.[0] ?? 0);
}

function buildSegments(lineId, ids) {
  if (lineId === "R")
    return [ids.filter((id) => id !== "R22A"), ["R22", "R22A"]];
  if (lineId === "G")
    return [ids.filter((id) => id !== "G03A"), ["G03", "G03A"]];
  if (lineId === "O") {
    const trunk = ids.filter((id) => stationNumber(id) <= 21);
    return [
      trunk,
      [
        ...trunk.filter((id) => stationNumber(id) <= 12),
        ...ids.filter((id) => stationNumber(id) >= 50),
      ],
    ];
  }
  return [ids];
}

const [stationResponse, taiwanResponse] = await Promise.all([
  fetch(STATIONS_URL),
  fetch(TAIWAN_URL),
]);
if (!stationResponse.ok || !taiwanResponse.ok)
  throw new Error("Open map data download failed.");

const [geojson, topology] = await Promise.all([
  stationResponse.json(),
  taiwanResponse.json(),
]);
const groups = Map.groupBy
  ? Map.groupBy(geojson.features, (feature) => feature.properties["路線編號"])
  : geojson.features.reduce((map, feature) => {
      const key = feature.properties["路線編號"];
      map.set(key, [...(map.get(key) ?? []), feature]);
      return map;
    }, new Map());

const lines = Object.entries(LINE_INFO).map(([lineId, info]) => {
  const stations = (groups.get(lineId) ?? []).map((feature, index) => {
    const properties = feature.properties;
    const [lon, lat] = feature.geometry.coordinates;
    return {
      id: properties["車站編號"],
      stationId: properties["車站編號"],
      sequence: index + 1,
      nameZh: properties["中文站名"],
      nameEn: properties["英譯站名"],
      target: normalizeTarget(properties["英譯站名"]),
      address: properties["地址"],
      lat,
      lon,
    };
  });
  const stationIds = stations.map((station) => station.stationId);
  const segments = buildSegments(lineId, stationIds);
  return {
    id: `${lineId}-network`,
    operatorId: lineId === "A" ? "TYMC" : lineId === "Y" ? "NTMC" : "TRTC",
    operatorName: info.operator,
    lineId,
    lineName: info.name,
    color: info.color,
    segments,
    gameStationIds: segments[0],
    stations,
  };
});

const output = {
  source: "repeat/northern-taiwan-metro-stations",
  sourceUrl: "https://github.com/repeat/northern-taiwan-metro-stations",
  license:
    "Public open geolocation dataset; original sources are the metro operators",
  generatedAt: null,
  lines,
};

const here = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(here, "../public/data");
await mkdir(outputDir, { recursive: true });
await Promise.all([
  writeFile(
    path.join(outputDir, "metro.json"),
    `${JSON.stringify(output, null, 2)}\n`,
  ),
  writeFile(
    path.join(outputDir, "taiwan-counties.topo.json"),
    `${JSON.stringify(topology)}\n`,
  ),
]);
console.log(
  `Imported ${lines.length} lines and ${lines.reduce((sum, line) => sum + line.stations.length, 0)} station records.`,
);
