import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const API_ROOT = "https://tdx.transportdata.tw/api/basic/v2/Rail/Metro";
const TOKEN_URL =
  "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token";
const OPERATORS = [
  { id: "TRTC", name: "台北捷運" },
  { id: "TYMC", name: "桃園捷運" },
  { id: "NTMC", name: "新北捷運" },
  { id: "NTDLRT", name: "淡海輕軌" },
  { id: "NTALRT", name: "安坑輕軌" },
];

const lineColors = {
  BR: "#c48c31",
  R: "#e54b4b",
  G: "#168c61",
  O: "#f49a32",
  BL: "#2775c9",
  Y: "#f0c537",
  A: "#8d5aa7",
  V: "#e86c8d",
  K: "#67a848",
  LB: "#6cb7d8",
};

function text(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value.Zh_tw ?? value.En ?? "";
}

function target(value) {
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
  return Number(String(id).match(/\d+/)?.[0] ?? 0);
}

function buildSegments(lineId, stationIds) {
  if (lineId === "R")
    return [stationIds.filter((id) => id !== "R22A"), ["R22", "R22A"]];
  if (lineId === "G")
    return [stationIds.filter((id) => id !== "G03A"), ["G03", "G03A"]];
  if (lineId === "O") {
    const trunk = stationIds.filter((id) => stationNumber(id) <= 21);
    return [
      trunk,
      [
        ...trunk.filter((id) => stationNumber(id) <= 12),
        ...stationIds.filter((id) => stationNumber(id) >= 50),
      ],
    ];
  }
  return [stationIds];
}

let accessToken = null;

async function authorize() {
  const clientId = process.env.TDX_CLIENT_ID;
  const clientSecret = process.env.TDX_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!response.ok)
    throw new Error(`TDX authorization failed: ${response.status}`);
  return (await response.json()).access_token;
}

async function getJson(pathname) {
  const response = await fetch(`${API_ROOT}/${pathname}?$format=JSON`, {
    headers: {
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
  if (!response.ok) throw new Error(`${pathname}: ${response.status}`);
  return response.json();
}

async function loadOperator(operator) {
  try {
    const [lines, stations, lineMetadata] = await Promise.all([
      getJson(`StationOfLine/${operator.id}`),
      getJson(`Station/${operator.id}`),
      getJson(`Line/${operator.id}`),
    ]);

    const stationDetails = new Map(
      stations.map((station) => [station.StationID, station]),
    );
    const lineDetails = new Map(
      lineMetadata.map((line) => [line.LineID, line]),
    );
    return lines
      .map((line) => {
        const detail = lineDetails.get(line.LineID) ?? {};
        const suppliedColor = String(detail.LineColor ?? "").replace(/^#/, "");
        return {
          id: `${operator.id}-${line.LineID}`,
          operatorId: operator.id,
          operatorName: operator.name,
          lineId: line.LineID,
          lineName: text(detail.LineName) || text(line.LineName) || line.LineID,
          color: /^[0-9a-f]{6}$/i.test(suppliedColor)
            ? `#${suppliedColor}`
            : (lineColors[line.LineID] ?? lineColors[line.LineNo] ?? "#6959d1"),
          updatedAt: line.SrcUpdateTime ?? line.UpdateTime ?? null,
          stations: (line.Stations ?? [])
            .map((station) => {
              const detail = stationDetails.get(station.StationID) ?? {};
              const name = station.StationName ?? detail.StationName ?? {};
              const position = detail.StationPosition ?? {};
              const address = detail.StationAddress ?? "";
              return {
                id: `${operator.id}-${station.StationID}`,
                stationId: station.StationID,
                sequence: Number(station.Sequence),
                nameZh: text(name),
                nameEn: name.En ?? text(name),
                target: target(name.En ?? text(name)),
                address: text(address),
                lat: Number(position.PositionLat) || null,
                lon: Number(position.PositionLon) || null,
              };
            })
            .filter((station) => station.target),
        };
      })
      .filter((line) => line.stations.length > 1);
  } catch (error) {
    console.warn(`Skip ${operator.id}: ${error.message}`);
    return [];
  }
}

accessToken = await authorize();
const results = await Promise.all(OPERATORS.map(loadOperator));
const seen = new Set();
const lines = results
  .flat()
  .filter((line) => {
    const signature = line.stations
      .map((station) => station.stationId)
      .join(",");
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  })
  .map((line) => {
    const stationIds = line.stations.map((station) => station.stationId);
    const segments = buildSegments(line.lineId, stationIds);
    return { ...line, segments, gameStationIds: segments[0] };
  });

if (!lines.length)
  throw new Error("TDX did not return any northern Taiwan metro lines.");

const output = {
  source: "TDX 運輸資料流通服務",
  sourceUrl: "https://tdx.transportdata.tw/",
  license: "政府資料開放授權條款第 1 版",
  generatedAt: new Date().toISOString(),
  lines,
};

const here = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(here, "../public/data");
await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "metro.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);

const stationCount = new Set(
  lines.flatMap((line) => line.stations.map((station) => station.id)),
).size;
console.log(
  `Synced ${lines.length} lines and ${stationCount} unique stations.`,
);
