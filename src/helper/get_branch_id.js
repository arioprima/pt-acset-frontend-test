import { jwtDecode } from "jwt-decode"


export const getBranchIdFromToken = () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return null;
        const decoded = jwtDecode(token);
        return decoded.branch_id || null;
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};
