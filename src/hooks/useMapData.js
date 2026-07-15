import { useEffect, useState } from "react";

// 数据保持 TDX 官方原样 (繁体), 展示与匹配层按用户所选语言 (en / zh-Hans / zh-Hant) 转换
// 之前把数据前置转成简体的做法已撤销, 让"繁体档"能显示真正的繁体
export function useMapData() {
  const [state, setState] = useState({
    data: null,
    topology: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("./data/metro.json").then((response) => {
        if (!response.ok) throw new Error("无法加载捷运数据");
        return response.json();
      }),
      fetch("./data/taiwan-counties.topo.json").then((response) => {
        if (!response.ok) throw new Error("无法加载台湾行政区图");
        return response.json();
      }),
    ])
      .then(([data, topology]) => {
        if (cancelled) return;
        setState({
          data,
          topology,
          error: null,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(error);
        setState({ data: null, topology: null, error });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
