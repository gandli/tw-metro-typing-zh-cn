import { ArrowLeft, ArrowRight } from "lucide-react";
import { MetroMap } from "./MetroMap";

export function GameScreen({
  mapModel,
  line,
  stations,
  mode,
  stationIndex,
  typedIndex,
  completed,
  remaining,
  elapsed,
  metrics,
  shake,
  onBack,
  onFocusTyping,
}) {
  const station = stations[stationIndex];
  const next = stations[stationIndex + 1] ?? null;
  const trainProgress = station.target.length
    ? typedIndex / station.target.length
    : 0;
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
        trainProgress={trainProgress}
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
        className={`station-card${shake ? " shake" : ""}`}
        onClick={onFocusTyping}
      >
        <div className="station-meta">
          <span>{String(stationIndex + 1).padStart(2, "0")}</span>
          <span>{station.address}</span>
        </div>
        <div className="station-main">
          <div>
            <p>NOW ARRIVING</p>
            <h2>{station.nameZh}</h2>
          </div>
          <div className={`next-station${next ? "" : " is-terminal"}`}>
            <span>{next ? "下一站" : "終點站"}</span>
            <strong>{next?.nameZh ?? "本線終點"}</strong>
            {next ? (
              <b>
                <ArrowRight size={22} />
              </b>
            ) : null}
          </div>
        </div>
        <div
          className="typing-target"
          style={{
            "--fit-font": `calc((min(760px, 94vw) - 48px) / ${(station.target.length * 0.65).toFixed(2)})`,
          }}
          aria-label={`請輸入 ${station.nameEn}`}
        >
          {[...station.target].map((character, index) => (
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
          ))}
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
