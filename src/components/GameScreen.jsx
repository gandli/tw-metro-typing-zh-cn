import { ArrowLeft, ArrowRight } from "lucide-react";
import { MetroMap } from "./MetroMap";
import {
  TYPING_LANGUAGES,
  isChineseLanguage,
  localizeStationName,
  localizeText,
} from "../lib/i18n";

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
  const isChinese = isChineseLanguage(typingLanguage);
  // 打字目标语言的本地化名 (用于 SR 提示)
  const targetName = isChinese
    ? localizeStationName(station, typingLanguage)
    : station.nameEn;
  // 对照语言 (与 typing target 互补, 不重复)
  // 中文档打字 → h2 显英文; 英文档打字 → h2 显繁体 (原始 TDX)
  const oppositeName = isChinese
    ? station.nameEn
    : localizeStationName(station, TYPING_LANGUAGES.TRADITIONAL);
  const oppositeNext = next
    ? isChinese
      ? next.nameEn
      : localizeStationName(next, TYPING_LANGUAGES.TRADITIONAL)
    : null;
  // 语言 label (标注 h2 的语言)
  const oppositeLabel = isChinese
    ? "ENGLISH"
    : typingLanguage === TYPING_LANGUAGES.ENGLISH
      ? "中文站名"
      : "中文站名";
  // 终点站名 (用打字语言)
  const terminalName = isChinese
    ? localizeStationName(stations[stations.length - 1], typingLanguage)
    : stations[stations.length - 1]?.nameEn;
  return (
    <section className="game" style={{ "--active-route": line.color }}>
      <p className="screen-reader-status" aria-live="polite" aria-atomic="true">
        目前车站 {localizeStationName(station, typingLanguage)},请输入 {targetName}
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
          {localizeText(line.lineName, typingLanguage)} · 往 {terminalName}
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
            <p>{oppositeLabel}</p>
            {/* 双语同屏: h2 显示"另一种语言"的对照, 与 typing-target 互补不重复 */}
            <h2>{oppositeName}</h2>
          </div>
          <div className={`next-station${next ? "" : " is-terminal"}`}>
            <span>{next ? "下一站" : "终点站"}</span>
            <strong>{oppositeNext ?? "本线终点"}</strong>
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
            aria-label={`请输入 ${targetName}`}
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
