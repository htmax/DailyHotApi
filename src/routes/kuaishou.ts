import type { ListItem, RouterData } from "../types.js";
import { post } from "../utils/getData.js";
import { parseChineseNumber } from "../utils/getNum.js";

// 首页 HTML 里的 APOLLO_STATE 已被反爬拦截（返回 {"result":2}），改用官方 GraphQL 接口
const GRAPHQL_URL = "https://www.kuaishou.com/graphql";
const HOT_RANK_QUERY = `query visionHotRank($page: String) {
  visionHotRank(page: $page) {
    result
    items {
      id
      name
      hotValue
      photoIds
      poster
    }
  }
}`;

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "kuaishou",
    title: "快手",
    type: "热榜",
    description: "快手，拥抱每一种生活",
    link: "https://www.kuaishou.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

interface KuaishouHotItem {
  id: string;
  name: string;
  hotValue?: string | null;
  photoIds?: string[] | null;
  poster?: string | null;
}

interface KuaishouResponse {
  data?: {
    visionHotRank?: {
      result: number;
      items: KuaishouHotItem[];
    };
  };
}

const getList = async (noCache: boolean) => {
  const result = await post<KuaishouResponse>({
    url: GRAPHQL_URL,
    noCache,
    ttl: 600,
    headers: {
      "Content-Type": "application/json",
      Referer: "https://www.kuaishou.com/",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    },
    body: {
      operationName: "visionHotRank",
      variables: { page: "home" },
      query: HOT_RANK_QUERY,
    },
  });

  const items = result.data?.data?.visionHotRank?.items || [];
  const listData: ListItem[] = items.map((v) => {
    const photoId = v.photoIds?.[0];
    return {
      id: photoId || v.id,
      title: v.name,
      cover: v.poster || undefined,
      hot: parseChineseNumber(String(v.hotValue ?? "")),
      timestamp: undefined,
      url: photoId
        ? `https://www.kuaishou.com/short-video/${photoId}`
        : "https://www.kuaishou.com/",
      mobileUrl: photoId
        ? `https://www.kuaishou.com/short-video/${photoId}`
        : "https://www.kuaishou.com/",
    };
  });

  return { ...result, data: listData };
};
