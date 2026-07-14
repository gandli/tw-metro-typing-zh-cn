import { RotateCcw } from "lucide-react";

export function ResultScreen({
  elapsed,
  completed,
  metrics,
  routeColor,
  onBack,
  onRetry,
}) {
  return (
    <section className="results" style={{ "--result-route": routeColor }}>
      <div className="result-card">
        <span className="result-kicker">JOURNEY COMPLETE</span>
        <h2>這班車，跑得很順。</h2>
        <p>
          你在 {elapsed} 秒內通過了 {completed} 個車站。
        </p>
        <div className="result-metrics">
          <div>
            <strong>{completed}</strong>
            <span>通過站數</span>
          </div>
          <div>
            <strong>{metrics.speed}</strong>
            <span>平均 {metrics.speedUnit}</span>
          </div>
          <div>
            <strong>{metrics.accuracy}%</strong>
            <span>正確率</span>
          </div>
        </div>
        <div className="result-actions">
          <button className="secondary-button" type="button" onClick={onBack}>
            重新選線
          </button>
          <button className="start-button" type="button" onClick={onRetry}>
            <span>再跑一次</span>
            <b>
              <RotateCcw size={19} />
            </b>
          </button>
        </div>
      </div>
    </section>
  );
}
