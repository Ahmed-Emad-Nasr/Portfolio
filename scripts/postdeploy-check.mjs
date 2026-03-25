const defaultBaseUrl = "https://ahmed-emad-nasr.github.io/Portfolio";
const rawBaseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || defaultBaseUrl;
const baseUrl = rawBaseUrl.replace(/\/$/, "");

const paths = ["/", "/robots.txt", "/sitemap.xml", "/manifest.webmanifest"];

console.log("\nPost-deploy quick check URLs:\n");
for (const path of paths) {
  console.log(`- ${baseUrl}${path}`);
}

console.log("\nExpected status: 200 for all endpoints.\n");
