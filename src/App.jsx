import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { GameScreen } from "./components/GameScreen";
import { HomeScreen } from "./components/HomeScreen";
import { ResultScreen } from "./components/ResultScreen";
import { useMapData } from "./hooks/useMapData";
import { buildMapModel, getPlayableStations } from "./lib/map";

const TIMED_MS = 30000;

export default function App() {
  const { data, topology, error } = useMapData();
  const mapModel = useMemo(
    () => (data && topology ? buildMapModel(topology, data.lines) : null),
    [data, topology],
  );
  const [screen, setScreen] = useState("home");
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [runIndex, setRunIndex] = useState(0);
  const [mode, setMode] = useState("timed");
  const [dark, setDark] = useState(false);
  const [stationIndex, setStationIndex] = useState(0);
  const [typedIndex, setTypedIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [shake, setShake] = useState(false);
  const startTimeRef = useRef(0);
  const typingInputRef = useRef(null);
  // Typing progress can advance faster than React re-renders during fast bursts,
  // so input position and the active station are also tracked synchronously.
  const typedIndexRef = useRef(0);
  const stationIndexRef = useRef(0);

  const selectedLine =
    data?.lines.find((line) => line.id === selectedLineId) ?? null;
  const stations = useMemo(
    () => getPlayableStations(selectedLine, runIndex),
    [selectedLine, runIndex],
  );
  const attempts = correct + errors;
  const elapsed = Math.floor(elapsedMs / 1000);
  const remaining = Math.max(Math.ceil((TIMED_MS - elapsedMs) / 1000), 0);
  const metrics = {
    // Clamp to 2s so the first keystrokes don't show an absurd spike.
    wpm: Math.round(correct / 5 / (Math.max(elapsedMs, 2000) / 60000)),
    accuracy: attempts ? Math.round((correct / attempts) * 100) : 100,
  };
  const showSiteChrome = screen !== "game";

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);

  const startGame = useCallback(() => {
    if (!selectedLine) return;
    typingInputRef.current?.focus({ preventScroll: true });
    typedIndexRef.current = 0;
    stationIndexRef.current = 0;
    setStationIndex(0);
    setTypedIndex(0);
    setCorrect(0);
    setErrors(0);
    setCompleted(0);
    setElapsedMs(0);
    startTimeRef.current = performance.now();
    setScreen("game");
  }, [selectedLine]);

  const backToHome = useCallback(() => {
    typingInputRef.current?.blur();
    setSelectedLineId(null);
    setRunIndex(0);
    setScreen("home");
  }, []);

  const selectLine = useCallback((lineId) => {
    setSelectedLineId(lineId);
    setRunIndex(0);
  }, []);

  const finishGame = useCallback(() => {
    typingInputRef.current?.blur();
    // Capture the exact finish time instead of the last whole-second tick.
    const ms = performance.now() - startTimeRef.current;
    setElapsedMs(mode === "timed" ? Math.min(ms, TIMED_MS) : ms);
    setScreen("result");
  }, [mode]);

  useEffect(() => {
    if (screen !== "game") return undefined;
    const timer = setInterval(() => {
      const ms = performance.now() - startTimeRef.current;
      setElapsedMs(mode === "timed" ? Math.min(ms, TIMED_MS) : ms);
    }, 200);
    return () => clearInterval(timer);
  }, [mode, screen]);

  useEffect(() => {
    if (screen === "game" && mode === "timed" && elapsedMs >= TIMED_MS)
      finishGame();
  }, [elapsedMs, finishGame, mode, screen]);

  const advanceStation = useCallback(() => {
    const currentIndex = stationIndexRef.current;
    setCompleted((value) => value + 1);
    if (mode === "line" && currentIndex >= stations.length - 1) {
      finishGame();
      return;
    }
    const nextIndex = (currentIndex + 1) % stations.length;
    typedIndexRef.current = 0;
    stationIndexRef.current = nextIndex;
    setStationIndex(nextIndex);
    setTypedIndex(0);
  }, [finishGame, mode, stations.length]);

  const typeCharacter = useCallback(
    (character) => {
      if (screen !== "game" || character.length !== 1) return;
      const station = stations[stationIndexRef.current];
      if (!station) return;
      const expected = station.target[typedIndexRef.current];
      const typed = character.toLowerCase();
      if (typed === expected) {
        typedIndexRef.current += 1;
        setCorrect((value) => value + 1);
        if (typedIndexRef.current >= station.target.length) advanceStation();
        else setTypedIndex(typedIndexRef.current);
      } else {
        setErrors((value) => value + 1);
        setShake(false);
        requestAnimationFrame(() => setShake(true));
        setTimeout(() => setShake(false), 170);
      }
    },
    [advanceStation, screen, stations],
  );

  const handleTypingInput = useCallback(
    (event) => {
      const value = event.currentTarget.value;
      event.currentTarget.value = "";
      for (const character of value) typeCharacter(character);
    },
    [typeCharacter],
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        if (screen === "game") backToHome();
        else if (screen === "home" && selectedLineId) {
          setSelectedLineId(null);
          setRunIndex(0);
        }
        return;
      }
      if (
        screen !== "game" ||
        event.target === typingInputRef.current ||
        event.repeat ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.key.length !== 1
      )
        return;
      if (
        event.key === " " ||
        stations[stationIndex]?.target[typedIndexRef.current] === " "
      )
        event.preventDefault();
      typeCharacter(event.key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    backToHome,
    screen,
    selectedLineId,
    stationIndex,
    stations,
    typeCharacter,
  ]);

  return (
    <div className="app-shell">
      <input
        ref={typingInputRef}
        className="mobile-typing-input"
        type="text"
        inputMode="text"
        enterKeyHint="done"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        aria-label="打字輸入"
        onInput={handleTypingInput}
      />
      {showSiteChrome ? (
        <header className="topbar">
          <button
            className="brand"
            type="button"
            onClick={backToHome}
            aria-label="回到首頁"
          >
            <span>TAIWAN METRO TYPING</span>
          </button>
          <div className="top-actions">
            <button
              className="icon-button"
              type="button"
              aria-pressed={dark}
              aria-label="切換深色模式"
              onClick={() => setDark((value) => !value)}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>
      ) : null}
      <main>
        {error ? <DataError message={error.message} /> : null}
        {!error && (!data || !mapModel) ? (
          <div className="loading">
            <span />
            正在載入台灣路網…
          </div>
        ) : null}
        {data && mapModel && screen === "home" ? (
          <HomeScreen
            data={data}
            mapModel={mapModel}
            selectedLine={selectedLine}
            runIndex={runIndex}
            onRunChange={setRunIndex}
            mode={mode}
            onModeChange={setMode}
            onSelect={selectLine}
            onReset={() => {
              setSelectedLineId(null);
              setRunIndex(0);
            }}
            onStart={startGame}
          />
        ) : null}
        {data &&
        mapModel &&
        screen === "game" &&
        selectedLine &&
        stations.length ? (
          <GameScreen
            mapModel={mapModel}
            line={selectedLine}
            stations={stations}
            mode={mode}
            stationIndex={stationIndex}
            typedIndex={typedIndex}
            completed={completed}
            remaining={remaining}
            elapsed={elapsed}
            metrics={metrics}
            shake={shake}
            onBack={backToHome}
            onFocusTyping={() =>
              typingInputRef.current?.focus({ preventScroll: true })
            }
          />
        ) : null}
        {screen === "result" ? (
          <ResultScreen
            elapsed={elapsed}
            completed={completed}
            metrics={metrics}
            routeColor={selectedLine?.color}
            onBack={backToHome}
            onRetry={startGame}
          />
        ) : null}
      </main>
      {showSiteChrome ? (
        <footer>
          <div className="footer-brand">
            <span className="footer-wordmark">TAIWAN METRO TYPING</span>
            <span className="footer-lines" aria-hidden="true">
              {(data?.lines ?? []).map((line) => (
                <i key={line.id} style={{ background: line.color }} />
              ))}
            </span>
          </div>
          <div className="footer-meta">
            <p>
              <span className="footer-label">DATA</span>
              地圖{" "}
              <a
                href="https://taiwan.md/taiwan-shape/"
                target="_blank"
                rel="noreferrer"
              >
                Taiwan.md
              </a>
              <span className="footer-sep">·</span>
              站點{" "}
              <a
                href="https://tdx.transportdata.tw/"
                target="_blank"
                rel="noreferrer"
              >
                TDX 運輸資料流通服務
              </a>
            </p>
            <p>
              Built by{" "}
              <a href="https://yencheng.dev" target="_blank" rel="noreferrer">
                Yen Cheng
              </a>
              <span className="footer-sep">·</span>
              <a
                href="https://github.com/ridemountainpig/tw-metro-typing"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </p>
          </div>
        </footer>
      ) : null}
    </div>
  );
}

function DataError({ message }) {
  return (
    <div className="data-error">
      <strong>地圖資料載入失敗</strong>
      <span>{message}</span>
      <button type="button" onClick={() => location.reload()}>
        重新載入
      </button>
    </div>
  );
}
