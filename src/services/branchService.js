import api from "./api";

export const getBranches = async () => {
    const { data } = await api.get("/branches");
    return data;
};
