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
        目前车站 {station.nameZh}，请输入{" "}
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
          <ArrowLeft size={15} /> 返回选线 <kbd>ESC</kbd>
        </button>
        <div className="route-pill" style={{ background: line.color }}>
          {line.lineName} · 往 {stations[stations.length - 1]?.nameZh}
        </div>
      </div>
      <div className="scorebar">
        <Metric
          label={mode === "timed" ? "剩余" : "经过"}
          value={mode === "timed" ? remaining : elapsed}
          unit="秒"
        />
        <Metric label="到站" value={completed} unit="站" />
        <Metric label="速度" value={metrics.speed} unit={metrics.speedUnit} />
        <Metric label="正确率" value={metrics.accuracy} unit="%" />
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
            {/* label 标注 h2 显示的是哪种语言, 与 typing-target 语言互补 */}
            <p>{isChinese ? "ENGLISH" : "中文站名"}</p>
            {/* 双语同屏: h2 显示"另一种语言"的对照, 与 typing-target 互补不重复
                中文模式打字时看英文名, 英文模式打字时看中文名 */}
            <h2>{isChinese ? station.nameEn : station.nameZh}</h2>
          </div>
          <div className={`next-station${next ? "" : " is-terminal"}`}>
            <span>{next ? "下一站" : "终点站"}</span>
            <strong>
              {next ? (isChinese ? next.nameEn : next.nameZh) : "本线终点"}
            </strong>
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
            aria-label={`请输入 ${isChinese ? station.nameZh : station.nameEn}`}
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
                  选字中 · <strong>{compositionText}</strong>
                </>
              ) : (
                "使用输入法选字"
              )}
            </p>
          ) : (
            <span id="typing-instruction" className="screen-reader-status">
              直接输入画面上的英文站名
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
