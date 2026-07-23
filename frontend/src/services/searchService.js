import API from "./api";

// ✅ GLOBAL SEARCH
export const globalSearch = async (keyword) => {
  const res = await API.get("/search/global", {
    params: { keyword }
  });
  return res.data;
};

