import { mockUsers } from "../mocks/mockMRs";

const delay = (ms = 200) => new Promise((res) => setTimeout(res, ms));

// In-memory registered users (starts with mock users)
let users = [...mockUsers];

export const authApi = {
    async login(email, password) {
        const response = await fetch(
            `${import.meta.env.VITE_BASE_URL}/users/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            },
        );
        
        const responseData = await response.json();

        if (!response.ok) {
            const errorMessage = responseData.message || `Login Failed! Status: ${response.status}`
            throw new Error(errorMessage);
        }
        return responseData.data;
    },

    async register(data) {
        const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/users/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },//firstName, lastName, email, phoneNo, password, role, manager
                body: JSON.stringify({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phoneNo: data.phoneNo,
                    password: data.password,
                    role: data.role,
                    managerEmployeeId: data.managerId
                }),
            },
        );

        if (!response.ok) {
            throw new Error(`Failed to Register! Status: ${response.status}`);
        }
        const responseData = await response.json();
        return {
            user: responseData.data
        };
       
    },

    async requestOtp(email) {
        const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/users/send-otp`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },//email
                body: JSON.stringify({
                    email: email
                }),
            },
        );

        if (!response.ok) {
            throw new Error(`OTP Request failed! Status: ${response.status}`);
        }
        const responseData = await response.json();
        return responseData;
        
    },

    async verifyOtp(data) {
        const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/users/verify-otp`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },//email, otp
                body: JSON.stringify({
                    email: data.email,
                    otp: data.otp
                }),
            },
        );

        if (!response.ok) {
            throw new Error(`OTP Verification Failed! Status: ${response.status}`);
        }
        const responseData = await response.json();
        return  responseData ;
        
    },

    async resetPassword(oldPassword, newPassword) { // parameter name has to be same as in backend
        //oldPassword, newPassword
        const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/users/change-password`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    oldPassword: oldPassword,
                    newPassword: newPassword
                }),
            },
        );

        if (!response.ok) {
            throw new Error(`Password cannot be changed! Status: ${response.status}`);
        }
        const responseData = await response.json();
        return  responseData ;
    },
    
};
