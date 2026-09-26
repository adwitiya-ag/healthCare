import { mockVisits } from '../mocks/mockVisits';


const delay = (ms = 150) => new Promise(res => setTimeout(res, ms));
let visits = [...mockVisits];

export const visitsApi = {

    async getAddress(coordinates){
        try{

            const {lat, lng} = coordinates;

            const response = await fetch(
                `${import.meta.env.VITE_BASE_URL}/location/revGeo?lat=${lat}&lng=${lng}`
            );
            const data = await response.json();
            return data;

        }catch(error){

            console.log(error);
            return null;
        }
    },

    async getAll(filters = {}) {
        
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/visit-proof`,
            {
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch visit proofs");
        }

        const JsonResult = await response.json();
        let result = JsonResult.data

        // if (filters.mrId) result = result.filter(v => v.mrId === filters.mrId);
        // if (filters.entityType) result = result.filter(v => v.entityType === filters.entityType);
        // if (filters.dateFrom) result = result.filter(v => v.date >= filters.dateFrom);
        // if (filters.dateTo) result = result.filter(v => v.date <= filters.dateTo);
        // return result.sort((a, b) => b.date.localeCompare(a.date));
        return result
    },

    async addVisitProof(formData) {
        const response = await fetch(
            `${import.meta.env.VITE_BASE_URL}/visit-proof/`,
            {
                method: "POST",
                credentials: "include",
                body: formData,
            },
        );
        
        const responseData = await response.json();

        if (!response.ok) {
            const errorMessage = responseData.message || `Saving Photo proofs Failed! Status: ${response.status}`
            throw new Error(errorMessage);
        }
        return responseData.data;
    },
};

export const tourPlansApi = {
    // Upload a tour plan excel file
    async upload(file) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
            `${import.meta.env.VITE_BASE_URL}/tour/upload`,
            {
                method: "POST",
                credentials: "include",
                body: formData,
            },
        );

        const responseData = await response.json();

        if (!response.ok) {
            const errorMessage = responseData.message || `Tour plan upload failed! Status: ${response.status}`;
            throw new Error(errorMessage);
        }
        return responseData.data;
    },

    // Get full upload history for the logged-in salesperson
    async getAll(filters = {}) {
        const response = await fetch(
            `${import.meta.env.VITE_BASE_URL}/tour/all`,
            { credentials: "include" },
        );

        const responseData = await response.json();

        if (!response.ok) {
            const errorMessage = responseData.message || `Failed to fetch tour plans! Status: ${response.status}`;
            throw new Error(errorMessage);
        }
        return responseData.data;
    },

    // Trigger download of the active tour plan (controller does res.redirect)
    async export() {
        window.location.href = `${import.meta.env.VITE_BASE_URL}/tour/export`;
    },
};
