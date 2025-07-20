import { api, publicApi } from "./api";

export const createQueue = async (branch_id, counter_id) => {
    const { data } = await publicApi.post("/queue/take", { branch_id, counter_id });
    return data;
};

export const getLatestQueue = async (branch_id, counter_id) => {
    const { data } = await publicApi.get(`/queue/latest?branch_id=${branch_id}&counter_id=${counter_id}`);
    return data;
}

export const getQueue = async (params = {}) => {
    const { data } = await api.get(`/queue`, { params });
    return data;
};

export const markQueueAsDone = async (id) => {
    const { data } = await api.put(`/queue/${id}/done`);
    return data;
}