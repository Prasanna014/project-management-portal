import axios from "axios";

const BASE_URL = "http://57.154.241.153:8080/api/search";

// ✅ GLOBAL SEARCH
export const globalSearch = async (keyword) => {
  const res = await axios.get(`${BASE_URL}/global`, {
    params: { keyword }
  });
  return res.data;
};

