import api from "./api";

export const createQueue = async (branch_id, counter_id) => {
    const { data } = await api.post("/queue/take", { branch_id, counter_id });
    return data;
};

export const getLatestQueue = async (branch_id, counter_id) => {
    const { data } = await api.get(`/queue/latest?branch_id=${branch_id}&counter_id=${counter_id}`);
    return data;
}

