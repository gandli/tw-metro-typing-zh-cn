import { ArrowLeft, ArrowRight } from "lucide-react";
import { MetroMap } from "./MetroMap";

export function GameScreen({
  mapModel,
  line,
  stations,
  mode,
  stationIndex,
  typedIndex,
  target,
  typingLanguage,
  compositionText,
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
  const targetCharacters = [...target];
  const trainProgress = targetCharacters.length
    ? typedIndex / targetCharacters.length
    : 0;
  const isChinese = typingLanguage === "zh";
  return (
    <section className="game" style={{ "--active-route": line.color }}>
      <p className="screen-reader-status" aria-live="polite" aria-atomic="true">
        目前車站 {station.nameZh}，請輸入{" "}
        {isChinese ? station.nameZh : station.nameEn}
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
        <Metric label="速度" value={metrics.speed} unit={metrics.speedUnit} />
        <Metric label="正確率" value={metrics.accuracy} unit="%" />
      </div>
      <article
        className={`station-card${shake ? " shake" : ""}`}
        onClick={onFocusTyping}
      >
        <div className="station-meta">
          <span>{String(stationIndex + 1).padStart(2, "0")}</span>
          <span title={station.address}>{station.address}</span>
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
        <div className={`typing-area${isChinese ? " is-chinese" : ""}`}>
          <div
            className="typing-target"
            style={{
              "--fit-font": `calc((min(760px, 94vw) - 48px) / ${(targetCharacters.length * (isChinese ? 1 : 0.65)).toFixed(2)})`,
            }}
            aria-label={`請輸入 ${isChinese ? station.nameZh : station.nameEn}`}
          >
            {targetCharacters.map((character, index) => (
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
          {isChinese ? (
            <p
              id="typing-instruction"
              className={`composition-status${compositionText ? " is-composing" : ""}`}
            >
              {compositionText ? (
                <>
                  選字中 · <strong>{compositionText}</strong>
                </>
              ) : (
                "使用輸入法選字"
              )}
            </p>
          ) : (
            <span id="typing-instruction" className="screen-reader-status">
              直接輸入畫面上的英文站名
            </span>
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
