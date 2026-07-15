import { ArrowLeft, ArrowRight } from "lucide-react";
import { TaiwanMap } from "./TaiwanMap";
import { getLineRuns, getPlayableStations, ROUTE_DIRECTIONS } from "../lib/map";

export function HomeScreen({
  data,
  mapModel,
  selectedLine,
  runIndex,
  onRunChange,
  direction,
  onDirectionChange,
  mode,
  onModeChange,
  typingLanguage,
  onTypingLanguageChange,
  onSelect,
  onReset,
  onStart,
}) {
  const runs = getLineRuns(selectedLine);
  const selectedRun = runs[runIndex] ?? runs[0] ?? null;
  const playableStations = getPlayableStations(
    selectedLine,
    runIndex,
    direction,
  );
  return (
    <section className={`home-map-screen${selectedLine ? " focused" : ""}`}>
      <TaiwanMap
        mapModel={mapModel}
        selectedLineId={selectedLine?.id ?? null}
        onSelect={onSelect}
      />

      <div
        className="home-copy"
        aria-hidden={selectedLine ? "true" : undefined}
      >
        <div className="eyebrow">
          <span /> REAL ROUTES · REAL STATIONS
        </div>
        <h1>
          一站一站，<em>越打越顺。</em>
        </h1>
        <p className="lede">
          在真实台湾地图上选择路线，沿著精确站点位置完成英文或中文站名。每打对一个字，列车就会往下一站前进一段。
        </p>
        <div className="home-instruction">
          <b>01</b>
          <span>从地图或下方路线列选择路线</span>
        </div>
        <span className="data-status">
          {data.lines.length} 条路线 ·{" "}
          {data.lines.reduce((sum, line) => sum + line.stations.length, 0)}{" "}
          笔站点座标
        </span>
      </div>

      {selectedLine ? (
        <>
          <button className="map-reset" type="button" onClick={onReset}>
            <ArrowLeft size={15} /> 返回台湾全图 <kbd>ESC</kbd>
          </button>
          <div className="route-focus-card" aria-live="polite">
            <span className="focus-kicker">SELECTED ROUTE</span>
            <div className="focus-route-title">
              <span
                className="focus-line-code"
                style={{ "--focus-color": selectedLine.color }}
              >
                {selectedLine.lineId}
              </span>
              <div>
                <h2>{selectedLine.lineName}</h2>
                <p>
                  {selectedLine.operatorName} · {playableStations.length} 站
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <div className="home-control-deck">
        <div className="route-carousel" aria-label="可选择的捷运路线">
          {data.lines.map((line) => (
            <button
              key={line.id}
              className={`route-button${selectedLine?.id === line.id ? " selected" : ""}`}
              type="button"
              style={{ "--route": line.color }}
              onClick={() => onSelect(line.id)}
            >
              <span className="route-symbol">{line.lineId}</span>
              <span>
                <strong>{line.lineName}</strong>
                <small>
                  {line.operatorName} · {getPlayableStations(line).length} 站
                </small>
              </span>
            </button>
          ))}
        </div>

        {selectedLine ? (
          <div
            className="focus-actions"
            style={{ "--focus-color": selectedLine.color }}
          >
            {runs.length > 1 ? (
              <div className="run-picker" aria-label="选择行驶区间">
                <span className="control-label">区间</span>
                <div className="run-options">
                  {runs.map((run, index) => (
                    <label
                      key={run.label}
                      className={`run-option${runIndex === index ? " selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="run"
                        value={index}
                        checked={runIndex === index}
                        onChange={() => onRunChange(index)}
                      />
                      <span>
                        <b>{run.label}</b>
                        <small>{run.stations.length} 站</small>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
            {selectedRun ? (
              <DirectionPicker
                stations={selectedRun.stations}
                value={direction}
                onChange={onDirectionChange}
              />
            ) : null}
            <div className="option-toolbar">
              <SegmentedControl
                label="站名"
                name="typing-language"
                value={typingLanguage}
                onChange={onTypingLanguageChange}
                options={LANGUAGE_OPTIONS}
              />
              <SegmentedControl
                label="玩法"
                name="mode"
                value={mode}
                onChange={onModeChange}
                options={GAME_MODE_OPTIONS}
              />
              <button className="start-button" type="button" onClick={onStart}>
                <span>开始这条路线</span>
                <b>
                  <ArrowRight size={20} />
                </b>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DirectionPicker({ stations, value, onChange }) {
  const firstStation = stations[0];
  const lastStation = stations[stations.length - 1];
  const options = [
    {
      value: ROUTE_DIRECTIONS.FORWARD,
      origin: firstStation,
      destination: lastStation,
    },
    {
      value: ROUTE_DIRECTIONS.REVERSE,
      origin: lastStation,
      destination: firstStation,
    },
  ];

  return (
    <div className="direction-picker" role="radiogroup" aria-label="行驶方向">
      <span className="control-label">方向</span>
      <div className="direction-options">
        {options.map((option) => (
          <label
            key={option.value}
            className={`direction-option${value === option.value ? " selected" : ""}`}
          >
            <input
              type="radio"
              name="direction"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>
              <small>从 {option.origin.nameZh}</small>
              <b>
                往 {option.destination.nameZh}
                <ArrowRight size={14} aria-hidden="true" />
              </b>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

const LANGUAGE_OPTIONS = [
  { value: "en", label: "英文" },
  { value: "zh", label: "中文" },
];

const GAME_MODE_OPTIONS = [
  { value: "timed", label: "30 秒" },
  { value: "line", label: "全线" },
];

function SegmentedControl({ label, name, value, onChange, options }) {
  return (
    <div className="segmented-control" role="group" aria-label={label}>
      <span className="control-label">{label}</span>
      <div className="segmented-options">
        {options.map((option) => (
          <label
            key={option.value}
            className={`segment-option${value === option.value ? " selected" : ""}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
