import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

// news.ceic.ac.cn 已关闭页面抓取（返回 405 invisible bucket，且证书过期），
// 改用 Wolfx 同步的中国地震台网(CENC)速报数据
const CENC_URL = "https://api.wolfx.jp/cenc_eqlist.json";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "earthquake",
    title: "中国地震台",
    type: "地震速报",
    link: "https://news.ceic.ac.cn/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

interface CencItem {
  type?: string;
  EventID: string;
  time: string;
  ReportTime?: string;
  location?: string;
  placeName?: string;
  magnitude: string;
  depth: string;
  latitude: string;
  longitude: string;
  intensity?: string;
}

const getList = async (noCache: boolean) => {
  const result = await get<Record<string, CencItem>>({
    url: CENC_URL,
    noCache,
    ttl: 300,
  });

  const list = Object.values(result.data || {});

  return {
    ...result,
    data: list.map((v) => {
      const place = v.placeName || v.location || "";
      const contentBuilder = [
        `发震时刻(UTC+8)：${v.time}`,
        `参考位置：${place}`,
        `震级(M)：${v.magnitude}`,
        `纬度(°)：${v.latitude}`,
        `经度(°)：${v.longitude}`,
        `深度(千米)：${v.depth}`,
        `录入时间：${v.ReportTime || ""}`,
      ];
      return {
        id: v.EventID,
        title: `${place}发生${v.magnitude}级地震`,
        desc: contentBuilder.join("\n"),
        timestamp: getTime(v.time),
        hot: undefined,
        url: `https://news.ceic.ac.cn/${v.EventID}.html`,
        mobileUrl: `https://news.ceic.ac.cn/${v.EventID}.html`,
      };
    }),
  };
};
