import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";

export const MAP_VIEWBOX = [200, 24, 640, 712];
export const ROUTE_DIRECTIONS = {
  FORWARD: "forward",
  REVERSE: "reverse",
};
const OFFSHORE_COUNTIES = new Set(["09007", "09020", "10016"]);
// Fit the projection to Taiwan proper; remote islets (e.g. 钓鱼台) would otherwise shrink the main island.
const TAIWAN_MAIN_BOUNDS = {
  type: "Polygon",
  coordinates: [
    [
      [119.98, 21.88],
      [119.98, 25.32],
      [122.05, 25.32],
      [122.05, 21.88],
      [119.98, 21.88],
    ],
  ],
};

export function buildMapModel(topology, lines) {
  const collection = feature(topology, topology.objects.map);
  const mainland = {
    type: "FeatureCollection",
    features: collection.features.filter(
      (county) => !OFFSHORE_COUNTIES.has(county.properties.id),
    ),
  };
  const projection = geoMercator().fitExtent(
    [
      [470, 44],
      [790, 716],
    ],
    TAIWAN_MAIN_BOUNDS,
  );
  const path = geoPath(projection);
  const counties = mainland.features.map((county) => ({
    id: county.properties.id,
    name: county.properties.name,
    path: path(county),
  }));

  const routes = lines.map((line) => {
    const pointsById = new Map(
      line.stations.map((station) => [
        station.stationId,
        projection([station.lon, station.lat]),
      ]),
    );
    const segments = (
      line.mapSegments ??
      line.segments ?? [line.stations.map((station) => station.stationId)]
    )
      .map((stationIds) =>
        stationIds.map((id) => pointsById.get(id)).filter(Boolean),
      )
      .filter((points) => points.length > 1);
    const stations = line.stations.map((station) => ({
      ...station,
      point: pointsById.get(station.stationId),
    }));
    return { ...line, pointsById, segments, stations };
  });

  return { counties, routes };
}

export function getRouteViewBox(route, minimumWidth = 270, padding = 42, aspectRatio = 0.72) {
  if (!route) return MAP_VIEWBOX;
  const points = route.segments.flat();
  if (!points.length) return MAP_VIEWBOX;
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rawW = maxX - minX + padding * 2;
  const rawH = maxY - minY + padding * 2;
  // 让 viewBox aspect (height/width) 匹配容器, 避免 preserveAspectRatio=meet 缩小路线
  // aspectRatio = 容器 height/width; 若 rawH/rawW < aspectRatio, 拉高 viewBox; 反之拉宽
  let width, height;
  if (rawH / rawW < aspectRatio) {
    width = Math.max(rawW, minimumWidth);
    height = width * aspectRatio;
  } else {
    height = rawH;
    width = Math.max(height / aspectRatio, minimumWidth);
  }
  return [(minX + maxX - width) / 2, (minY + maxY - height) / 2, width, height];
}

export function pointsToString(points) {
  return points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

// Each entry in line.segments is a real service pattern (trunk or branch),
// e.g. 中和新芦线 has 南势角→回龙 and 南势角→芦洲.
export function getLineRuns(line) {
  if (!line) return [];
  const stationById = new Map(
    line.stations.map((station) => [station.stationId, station]),
  );
  const segments = line.segments ?? [
    line.gameStationIds ?? line.stations.map((station) => station.stationId),
  ];
  return segments
    .map((stationIds, index) => {
      const stations = stationIds
        .map((id) => stationById.get(id))
        .filter(Boolean);
      return {
        index,
        stations,
        label: stations.length
          ? `${stations[0].nameZh} → ${stations[stations.length - 1].nameZh}`
          : "",
      };
    })
    .filter((run) => run.stations.length > 1);
}

export function getPlayableStations(
  line,
  runIndex = 0,
  direction = ROUTE_DIRECTIONS.FORWARD,
) {
  const runs = getLineRuns(line);
  const stations = (runs[runIndex] ?? runs[0])?.stations ?? [];
  return direction === ROUTE_DIRECTIONS.REVERSE
    ? [...stations].reverse()
    : stations;
}
