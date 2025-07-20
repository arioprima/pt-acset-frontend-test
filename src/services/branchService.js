import { publicApi } from "./api";

export const getBranches = async () => {
    const { data } = await publicApi.get("/branches");
    return data;
};
