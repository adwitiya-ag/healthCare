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
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            },
        );

        if (!response.ok) {
            throw new Error(`Failed to login! Status: ${response.status}`);
        }
        const responseData = await response.json();
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
        await delay();
        const user = users.find((u) => u.email === email);
        if (!user) throw new Error("Email not found");
        return { message: "OTP sent to your email (mock OTP: 123456)" };
    },

    async verifyOtp(email, otp) {
        await delay(300);
        if (otp !== "123456") throw new Error("Invalid OTP");
        return { verified: true };
    },

    async resetPassword(email, newPassword) {
        await delay();
        const idx = users.findIndex((u) => u.email === email);
        if (idx === -1) throw new Error("User not found");
        users[idx].password = newPassword;
        return { message: "Password reset successfully" };
    },
};
