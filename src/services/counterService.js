import api from './api';

export const getCountersByBranch = async (branchId) => {
    const { data } = await api.get(`/counters?branch_id=${branchId}`);
    return data;
};
