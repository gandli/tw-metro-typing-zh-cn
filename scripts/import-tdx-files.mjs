import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Rebuilds public/data/metro.json from raw TDX v2 Rail/Metro responses saved in data/,
// so no TDX credentials are needed. Expected files per operator:
//   data/<operator>-line.json             -> /v2/Rail/Metro/Line/<RailSystem>
//   data/<operator>-station.json          -> /v2/Rail/Metro/Station/<RailSystem>
//   data/<operator>-station-of-line.json  -> /v2/Rail/Metro/StationOfLine/<RailSystem>

const OPERATOR_NAMES = {
  TRTC: "台北捷運",
  TYMC: "桃園捷運",
  NTMC: "新北捷運",
  NTDLRT: "淡海輕軌",
  NTALRT: "安坑輕軌",
  KRTC: "高雄捷運",
  KLRT: "高雄輕軌",
  TMRT: "台中捷運",
};

const LINE_ORDER = [
  "TRTC-BR",
  "TRTC-R",
  "TRTC-G",
  "TRTC-O",
  "TRTC-BL",
  "NTMC-Y",
  "TYMC-A",
  "TMRT-G",
  "KRTC-R",
  "KRTC-O",
  "KLRT-C",
];
const REQUIRED_OPERATORS = ["trtc", "ntmc", "tymc", "tmrt", "krtc", "klrt"];

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
  C: "#78b82a",
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
    .replace(/[-–—/().]/g, " ")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function stationNumber(id) {
  return Number(String(id).match(/\d+/)?.[0] ?? 0);
}

function buildSegments(operatorId, lineId, stationIds) {
  if (operatorId === "TRTC" && lineId === "R")
    return [stationIds.filter((id) => id !== "R22A"), ["R22", "R22A"]];
  if (operatorId === "TRTC" && lineId === "G")
    return [stationIds.filter((id) => id !== "G03A"), ["G03", "G03A"]];
  if (operatorId === "TRTC" && lineId === "O") {
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

function buildMapSegments(operatorId, lineId, stationIds, segments) {
  if (operatorId === "KLRT" && lineId === "C" && stationIds.length > 1)
    return [[...stationIds, stationIds[0]]];
  return segments;
}

// Per-line ordering comes from the official StationOfLine response.
function buildLines(operatorId, lineMetadata, stations, stationOfLine) {
  const details = new Map(
    stations.map((station) => [station.StationID, station]),
  );
  const orderByLine = new Map(
    (stationOfLine ?? []).map((line) => [
      line.LineID,
      [...(line.Stations ?? [])]
        .sort((a, b) => Number(a.Sequence) - Number(b.Sequence))
        .map((station) => ({
          ...(details.get(station.StationID) ?? {}),
          StationID: station.StationID,
          StationName:
            station.StationName ?? details.get(station.StationID)?.StationName,
        })),
    ]),
  );

  return lineMetadata
    .map((line) => {
      const members = orderByLine.get(line.LineID) ?? [];
      const suppliedColor = String(line.LineColor ?? "").replace(/^#/, "");
      return {
        id: `${operatorId}-${line.LineID}`,
        operatorId,
        operatorName: OPERATOR_NAMES[operatorId] ?? operatorId,
        lineId: line.LineID,
        lineName: text(line.LineName) || line.LineID,
        color: /^[0-9a-f]{6}$/i.test(suppliedColor)
          ? `#${suppliedColor}`
          : (lineColors[line.LineID] ?? lineColors[line.LineNo] ?? "#6959d1"),
        updatedAt: line.SrcUpdateTime ?? line.UpdateTime ?? null,
        stations: members
          .map((station, index) => {
            const name = station.StationName ?? {};
            const position = station.StationPosition ?? {};
            return {
              id: station.StationID,
              stationId: station.StationID,
              sequence: index + 1,
              nameZh: text(name),
              nameEn: name.En ?? text(name),
              target: target(name.En ?? text(name)),
              address: text(station.StationAddress ?? ""),
              lat: Number(position.PositionLat) || null,
              lon: Number(position.PositionLon) || null,
            };
          })
          .filter((station) => station.target),
      };
    })
    .filter((line) => line.stations.length > 1)
    .map((line) => {
      const stationIds = line.stations.map((station) => station.stationId);
      const segments = buildSegments(operatorId, line.lineId, stationIds);
      const mapSegments = buildMapSegments(
        operatorId,
        line.lineId,
        stationIds,
        segments,
      );
      return {
        ...line,
        segments,
        ...(mapSegments === segments ? {} : { mapSegments }),
        gameStationIds: segments[0],
      };
    });
}

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(here, "../data");
const outputDir = path.resolve(here, "../public/data");
const outputPath = path.join(outputDir, "metro.json");

const files = await readdir(dataDir);
const requiredFiles = REQUIRED_OPERATORS.flatMap((operator) => [
  `${operator}-line.json`,
  `${operator}-station.json`,
  `${operator}-station-of-line.json`,
]);
const missingFiles = requiredFiles.filter((file) => !files.includes(file));
if (missingFiles.length)
  throw new Error(
    `Missing required TDX data files: ${missingFiles.join(", ")}.`,
  );

const readJson = async (file) =>
  JSON.parse(await readFile(path.join(dataDir, file), "utf8"));

const built = [];
for (const operator of REQUIRED_OPERATORS) {
  const operatorId = operator.toUpperCase();
  const [lineMetadata, stations, stationOfLine] = await Promise.all([
    readJson(`${operator}-line.json`),
    readJson(`${operator}-station.json`),
    readJson(`${operator}-station-of-line.json`),
  ]);
  built.push(...buildLines(operatorId, lineMetadata, stations, stationOfLine));
  console.log(
    `Built ${operatorId}: ${lineMetadata.length} lines, ${stations.length} stations (official station order).`,
  );
}

const builtLineIds = new Set(built.map((line) => line.id));
const missingLines = LINE_ORDER.filter((lineId) => !builtLineIds.has(lineId));
if (missingLines.length)
  throw new Error(
    `Missing required TDX metro lines: ${missingLines.join(", ")}.`,
  );

const order = (line) => {
  const index = LINE_ORDER.indexOf(line.id);
  return index === -1 ? LINE_ORDER.length : index;
};
const lines = built
  .filter((line) => LINE_ORDER.includes(line.id))
  .sort((a, b) => order(a) - order(b));

const output = {
  source: "TDX 運輸資料流通服務（本地 data/ 檔案匯入）",
  sourceUrl: "https://tdx.transportdata.tw/",
  license: "政府資料開放授權條款第 1 版",
  generatedAt: new Date().toISOString(),
  lines,
};

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);

const stationCount = new Set(
  lines.flatMap((line) =>
    line.stations.map((station) => `${line.operatorId}-${station.stationId}`),
  ),
).size;
console.log(
  `Wrote ${lines.length} lines and ${stationCount} unique stations to public/data/metro.json.`,
);
