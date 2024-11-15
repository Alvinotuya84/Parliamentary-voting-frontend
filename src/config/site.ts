export const siteConfig = {
  name: "Parliamentary Voting System",
  description: "Digital voting system for the Kenyan Parliament",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000",
};
