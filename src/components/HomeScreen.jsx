import { ArrowLeft, ArrowRight } from "lucide-react";
import { TaiwanMap } from "./TaiwanMap";
import { getLineRuns, getPlayableStations } from "../lib/map";

export function HomeScreen({
  data,
  mapModel,
  selectedLine,
  runIndex,
  onRunChange,
  mode,
  onModeChange,
  onSelect,
  onReset,
  onStart,
}) {
  const runs = getLineRuns(selectedLine);
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
          一站一站，<em>越打越順。</em>
        </h1>
        <p className="lede">
          在真實台灣地圖上選擇路線，沿著精確站點位置完成英文站名。每打對一個字，列車就會往下一站前進一段。
        </p>
        <div className="home-instruction">
          <b>01</b>
          <span>從地圖或下方路線列選擇路線</span>
        </div>
        <span className="data-status">
          {data.lines.length} 條路線 ·{" "}
          {data.lines.reduce((sum, line) => sum + line.stations.length, 0)}{" "}
          筆站點座標
        </span>
      </div>

      {selectedLine ? (
        <>
          <button className="map-reset" type="button" onClick={onReset}>
            <ArrowLeft size={15} /> 返回台灣全圖 <kbd>ESC</kbd>
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
                  {selectedLine.operatorName} ·{" "}
                  {getPlayableStations(selectedLine, runIndex).length} 站
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <div className="home-control-deck">
        <div className="route-carousel" aria-label="可選擇的捷運路線">
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
              <div className="run-modes" aria-label="選擇行駛區間">
                {runs.map((run, index) => (
                  <label
                    key={run.label}
                    className={`compact-mode${runIndex === index ? " selected" : ""}`}
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
            ) : null}
            <div className="compact-modes">
              <ModeOption
                value="timed"
                mode={mode}
                onChange={onModeChange}
                title="30 秒快打"
                subtitle="限時挑戰"
              />
              <ModeOption
                value="line"
                mode={mode}
                onChange={onModeChange}
                title="全線挑戰"
                subtitle="一路到終點"
              />
            </div>
            <button className="start-button" type="button" onClick={onStart}>
              <span>開始這條路線</span>
              <b>
                <ArrowRight size={20} />
              </b>
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ModeOption({ value, mode, onChange, title, subtitle }) {
  return (
    <label className={`compact-mode${mode === value ? " selected" : ""}`}>
      <input
        type="radio"
        name="mode"
        value={value}
        checked={mode === value}
        onChange={() => onChange(value)}
      />
      <span>
        <b>{title}</b>
        <small>{subtitle}</small>
      </span>
    </label>
  );
}
