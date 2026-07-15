import { useEffect, useState } from "react";
import { Converter } from "opencc-js";

// 简体化转换器: 台湾繁体 → 大陆简体 (兼容词汇: 車站→车站, 資料→数据, 網→网 等)
// 只在展示层做, 源数据文件保持 TDX 官方原样, 不做写回
const toSimplified = Converter({ from: "tw", to: "cn" });

// 递归遍历对象/数组的所有中文字符串字段, 保留结构与 key
function convertZh(node) {
  if (node == null) return node;
  if (typeof node === "string") return toSimplified(node);
  if (Array.isArray(node)) return node.map(convertZh);
  if (typeof node === "object") {
    const out = {};
    for (const k of Object.keys(node)) {
      // 保留 nameEn / id / stationId / 数值类字段 (无中文)
      const v = node[k];
      out[k] = /Zh$|name$|title$|desc/i.test(k) || typeof v === "object"
        ? convertZh(v)
        : v;
    }
    return out;
  }
  return node;
}

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
        if (!data.lines?.length) throw new Error("捷运资料是空的");
        // 站名/线路名/县市名 一次性简化, 供整个 app 消费
        const simplifiedData = convertZh(data);
        const simplifiedTopology = convertZh(topology);
        setState({ data: simplifiedData, topology: simplifiedTopology, error: null });
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
  if (!response.ok) throw new Error(`资料载入失败（${response.status}）`);
  return response.json();
}
