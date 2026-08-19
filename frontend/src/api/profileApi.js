const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));

export const profileApi = {
  /**
   * Update basic profile fields (name, phone, city, area).
   * In production this would be a PATCH /api/profile.
   */
  async updateProfile(firstName, lastName, email) {
    //firstName, lastName, email
     const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/users/update-account`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    email:  email
                }),
            },
        );

        if (!response.ok) {
            throw new Error(`Profile cannot be updated! Status: ${response.status}`);
        }
        const responseData = await response.json();
        return  responseData ;
    },
  

  /**
   * Change the user's password.
   * Validates old password against the provided value (mock-only).
   */
//   async changePassword(userId, { currentPassword, newPassword }) {
//     await delay(400);
//     // Mock: accept any non-empty current password
//     if (!currentPassword) throw new Error('Current password is required');
//     if (newPassword.length < 6) throw new Error('New password must be at least 6 characters');
//     return { success: true, message: 'Password changed successfully' };
//   },
  }
