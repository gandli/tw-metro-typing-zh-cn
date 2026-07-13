import { getRouteViewBox, pointsToString } from "../lib/map";

export function MetroMap({
  mapModel,
  selectedLine,
  stations,
  stationIndex,
  trainProgress,
}) {
  const route = mapModel.routes.find((item) => item.id === selectedLine.id);
  const routeViewBox = getRouteViewBox(route, 44, 7);
  routeViewBox[1] += routeViewBox[3] * 0.16;
  const viewBox = routeViewBox.join(" ");
  const nextIndex =
    stationIndex + 1 < stations.length ? stationIndex + 1 : null;
  const currentPoint = route.pointsById.get(stations[stationIndex].stationId);
  const nextPoint =
    nextIndex === null
      ? currentPoint
      : route.pointsById.get(stations[nextIndex].stationId);
  const journeyProgress =
    nextIndex === null ? 0 : Math.min(Math.max(trainProgress, 0), 1);
  const train = [
    currentPoint[0] + (nextPoint[0] - currentPoint[0]) * journeyProgress,
    currentPoint[1] + (nextPoint[1] - currentPoint[1]) * journeyProgress,
  ];
  const progressPoints = stations
    .slice(0, stationIndex + 1)
    .map((station) => route.pointsById.get(station.stationId))
    .filter(Boolean);
  if (journeyProgress > 0) progressPoints.push(train);

  return (
    <svg className="metro-map" viewBox={viewBox} aria-hidden="true">
      <g className="game-counties">
        {mapModel.counties.map((county) => (
          <path key={county.id} d={county.path} />
        ))}
      </g>
      {mapModel.routes.map((item) =>
        item.segments.map((points, index) => (
          <polyline
            key={`${item.id}-${index}`}
            className={`map-line ${item.id === route.id ? "selected" : "network"}`}
            points={pointsToString(points)}
            stroke={item.color}
          />
        )),
      )}
      {route.segments.map((points, index) => (
        <polyline
          key={index}
          className="map-casing"
          points={pointsToString(points)}
        />
      ))}
      {route.segments.map((points, index) => (
        <polyline
          key={index}
          className="map-line selected"
          points={pointsToString(points)}
          stroke={route.color}
        />
      ))}
      <polyline
        className="map-progress"
        points={pointsToString(progressPoints)}
        stroke={route.color}
      />
      {route.stations.map((station) => {
        const index = stations.findIndex(
          (item) => item.stationId === station.stationId,
        );
        const [x, y] = station.point;
        const state =
          index < stationIndex && index >= 0
            ? " is-passed"
            : index === stationIndex
              ? " is-current"
              : index === nextIndex
                ? " is-next"
                : "";
        return (
          <circle
            key={station.stationId}
            className={`map-node on-route${state}`}
            cx={x}
            cy={y}
            r=".24"
          />
        );
      })}
      <g
        className="map-train"
        style={{ transform: `translate(${train[0]}px, ${train[1]}px)` }}
      >
        <g className="map-train-icon" transform="scale(.03)">
          <circle className="train-halo" r="22" />
          <rect
            className="train-body"
            x="-18"
            y="-12"
            width="36"
            height="24"
            rx="7"
          />
          <rect
            className="train-window"
            x="-11"
            y="-6"
            width="8"
            height="7"
            rx="2"
          />
          <rect
            className="train-window"
            x="3"
            y="-6"
            width="8"
            height="7"
            rx="2"
          />
          <circle className="train-light" cx="-9" cy="7" r="2" />
          <circle className="train-light" cx="9" cy="7" r="2" />
        </g>
      </g>
    </svg>
  );
}
