import { publicApi } from "./api"

export const login = async (username, password) => {
    const { data } = await publicApi.post("/auth/login", { username, password });
    return data;
}
