import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Rebuilds public/data/metro.json from raw TDX v2 Rail/Metro responses saved in data/,
// so no TDX credentials are needed. Expected files per operator:
//   data/<operator>-line.json             -> /v2/Rail/Metro/Line/<RailSystem>
//   data/<operator>-station.json          -> /v2/Rail/Metro/Station/<RailSystem>
//   data/<operator>-station-of-line.json  -> /v2/Rail/Metro/StationOfLine/<RailSystem> (optional)
// Lines not covered by local files are preserved from the existing metro.json.

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

const LINE_ORDER = ["BR", "R", "G", "O", "BL", "Y", "A"];

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

// Per-line ordering comes from the StationOfLine response when available.
// Without it, station codes still encode the order: letters pick the line,
// digits the position, and an "A" suffix marks branch stops (R22A, G03A).
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

  const byPrefix = new Map();
  for (const station of stations) {
    const prefix = String(station.StationID).match(/^[A-Z]+/i)?.[0] ?? "";
    if (!byPrefix.has(prefix)) byPrefix.set(prefix, []);
    byPrefix.get(prefix).push(station);
  }

  return lineMetadata
    .map((line) => {
      const members =
        orderByLine.get(line.LineID) ??
        (byPrefix.get(line.LineID) ?? []).sort(
          (a, b) =>
            stationNumber(a.StationID) - stationNumber(b.StationID) ||
            String(a.StationID).localeCompare(b.StationID),
        );
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
      const segments = buildSegments(line.lineId, stationIds);
      return { ...line, segments, gameStationIds: segments[0] };
    });
}

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(here, "../data");
const outputDir = path.resolve(here, "../public/data");
const outputPath = path.join(outputDir, "metro.json");

const files = await readdir(dataDir);
const operators = [
  ...new Set(
    files
      .map((file) => file.match(/^([a-z]+)-(?:line|station)\.json$/i)?.[1])
      .filter(Boolean),
  ),
];
if (!operators.length)
  throw new Error(
    `No <operator>-line.json / <operator>-station.json pairs found in ${dataDir}.`,
  );

const readJson = async (file) =>
  JSON.parse(await readFile(path.join(dataDir, file), "utf8"));

const built = [];
for (const operator of operators) {
  const operatorId = operator.toUpperCase();
  const hasStationOfLine = files.includes(`${operator}-station-of-line.json`);
  const [lineMetadata, stations, stationOfLine] = await Promise.all([
    readJson(`${operator}-line.json`),
    readJson(`${operator}-station.json`),
    hasStationOfLine ? readJson(`${operator}-station-of-line.json`) : null,
  ]);
  built.push(...buildLines(operatorId, lineMetadata, stations, stationOfLine));
  console.log(
    `Built ${operatorId}: ${lineMetadata.length} lines, ${stations.length} stations` +
      `${hasStationOfLine ? " (official station order)" : " (order derived from station codes)"}.`,
  );
}

const builtLineIds = new Set(built.map((line) => line.lineId));
let preserved = [];
try {
  const existing = JSON.parse(await readFile(outputPath, "utf8"));
  preserved = (existing.lines ?? []).filter(
    (line) => !builtLineIds.has(line.lineId),
  );
  if (preserved.length)
    console.log(
      `Preserved from existing metro.json: ${preserved.map((line) => line.lineId).join(", ")}.`,
    );
} catch {
  // No existing metro.json to merge; output only the locally built lines.
}

const order = (line) => {
  const index = LINE_ORDER.indexOf(line.lineId);
  return index === -1 ? LINE_ORDER.length : index;
};
const lines = [...built, ...preserved].sort((a, b) => order(a) - order(b));

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
  lines.flatMap((line) => line.stations.map((station) => station.stationId)),
).size;
console.log(
  `Wrote ${lines.length} lines and ${stationCount} unique stations to public/data/metro.json.`,
);
