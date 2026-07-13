import { ArrowLeft, ArrowRight } from "lucide-react";
import { MetroMap } from "./MetroMap";

export function GameScreen({
  mapModel,
  line,
  stations,
  mode,
  stationIndex,
  trainIndex,
  typedIndex,
  completed,
  remaining,
  elapsed,
  metrics,
  moving,
  shake,
  onBack,
  onFocusTyping,
}) {
  const station = stations[stationIndex];
  const next = stations[(stationIndex + 1) % stations.length];
  return (
    <section className="game" style={{ "--active-route": line.color }}>
      <p className="screen-reader-status" aria-live="polite" aria-atomic="true">
        目前車站 {station.nameZh}，請輸入 {station.nameEn}
      </p>
      <MetroMap
        mapModel={mapModel}
        selectedLine={line}
        stations={stations}
        stationIndex={stationIndex}
        trainIndex={trainIndex}
      />
      <div className="game-chrome">
        <button className="back-button" type="button" onClick={onBack}>
          <ArrowLeft size={15} /> 返回選線 <kbd>ESC</kbd>
        </button>
        <div className="route-pill" style={{ background: line.color }}>
          {line.operatorName} · {line.lineName}
        </div>
      </div>
      <div className="scorebar">
        <Metric
          label={mode === "timed" ? "剩餘" : "經過"}
          value={mode === "timed" ? remaining : elapsed}
          unit="秒"
        />
        <Metric label="到站" value={completed} unit="站" />
        <Metric label="速度" value={metrics.wpm} unit="WPM" />
        <Metric label="正確率" value={metrics.accuracy} unit="%" />
      </div>
      <article
        className={`station-card${moving ? " in-transit" : ""}${shake ? " shake" : ""}`}
        aria-busy={moving}
        onClick={onFocusTyping}
      >
        <div className="station-meta">
          <span>{String(stationIndex + 1).padStart(2, "0")}</span>
          <span>
            {moving ? `列車行駛中 · 前往 ${next.nameZh}` : station.address}
          </span>
        </div>
        <div className="station-main">
          <div>
            <p>NOW ARRIVING</p>
            <h2>{station.nameZh}</h2>
          </div>
          <div className="next-station">
            <span>下一站</span>
            <strong>{next.nameZh}</strong>
            <b>
              <ArrowRight size={22} />
            </b>
          </div>
        </div>
        <div
          className="typing-target"
          style={{
            "--fit-font": `calc((min(760px, 94vw) - 48px) / ${(station.target.length * 0.65).toFixed(2)})`,
          }}
          aria-label={`請輸入 ${station.nameEn}`}
        >
          {moving ? (
            <span className="moving-copy">TRAIN IN MOTION</span>
          ) : (
            [...station.target].map((character, index) => (
              <span
                key={`${character}-${index}`}
                className={
                  index < typedIndex
                    ? "typed"
                    : index === typedIndex
                      ? "current"
                      : ""
                }
              >
                {character === " " ? "\u00A0" : character}
              </span>
            ))
          )}
        </div>
        <div className="line-strip">
          <i />
          <span>{line.lineName}</span>
        </div>
      </article>
    </section>
  );
}

function Metric({ label, value, unit }) {
  return (
    <div>
      <small>{label}</small>
      <strong>{value}</strong>
      <span>{unit}</span>
    </div>
  );
}
