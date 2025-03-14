export const getAccessToken = async (userId) => {
  try {
    const res = await fetch(
      `http://localhost:3001/refresh_token?userId=${userId}`
    );
    const data = await res.json();
    return data.access_token;
  } catch (error) {
    console.error("Error fetching access token", error);
    return null;
  }
};
