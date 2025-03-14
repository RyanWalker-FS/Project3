"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Search() {
  const [query, setQuery] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("access_token");

      if (token) {
        localStorage.setItem("spotify_access_token", token);
        setAccessToken(token);
        router.replace("/search"); // Ensure clean URL after storing the token
      } else {
        const storedToken = localStorage.getItem("spotify_access_token");
        if (!storedToken) {
          router.replace("/login");
        } else {
          setAccessToken(storedToken);
        }
      }
    }
  }, [router]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!accessToken) {
      console.error("No access token available. Redirecting to login.");
      router.replace("/login");
      return;
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${query}&type=track`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.status === 401) {
        console.error("Token expired. Redirecting to login.");
        localStorage.removeItem("spotify_access_token");
        router.replace("/login");
        return;
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-semibold mb-6">Search Spotify</h1>
      <form onSubmit={handleSearch} className="space-y-4">
        <input
          type="text"
          placeholder="Search for tracks, artists, or albums"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-gray-800 text-white w-full px-4 py-2 rounded-md"
        />
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
        >
          Search
        </button>
      </form>
    </div>
  );
}
