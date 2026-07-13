import { useEffect, useState } from "react";

export function useMapData() {
  const [state, setState] = useState({
    data: null,
    topology: null,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    Promise.all([
      fetch("/data/metro.json", options).then(checkResponse),
      fetch("/data/taiwan-counties.topo.json", options).then(checkResponse),
    ])
      .then(([data, topology]) => {
        if (!data.lines?.length) throw new Error("捷運資料是空的");
        setState({ data, topology, error: null });
      })
      .catch((error) => {
        if (error.name !== "AbortError")
          setState({ data: null, topology: null, error });
      });
    return () => controller.abort();
  }, []);

  return state;
}

async function checkResponse(response) {
  if (!response.ok) throw new Error(`資料載入失敗（${response.status}）`);
  return response.json();
}
