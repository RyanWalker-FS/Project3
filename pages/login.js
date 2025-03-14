import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    // Check if we already have a token stored in cookies
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="))
      ?.split("=")[1];

    if (token) {
      router.push("/search"); // Redirect to search if already logged in
    }
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Welcome to Spotify Search</h1>
      <p>Login to start searching for music</p>
      <a href="http://localhost:3001/login">
        <button style={{ padding: "10px 20px", fontSize: "16px" }}>
          Login with Spotify
        </button>
      </a>
    </div>
  );
}
