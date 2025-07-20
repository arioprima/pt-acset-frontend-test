import { publicApi } from './api';

export const getCountersByBranch = async (branchId) => {
    const { data } = await publicApi.get(`/counters?branch_id=${branchId}`);
    return data;
};
