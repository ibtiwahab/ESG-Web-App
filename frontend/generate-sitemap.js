const { SitemapStream, streamToPromise } = require("sitemap");
const { createWriteStream } = require("fs");

// Define your routes
const routes = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/Visa", changefreq: "weekly", priority: 0.8 },
  { url: "/Umrah", changefreq: "weekly", priority: 0.8 },
  { url: "/Tickets", changefreq: "weekly", priority: 0.8 },
  { url: "/Pakistan", changefreq: "weekly", priority: 0.8 },
  { url: "/Saudia-Arabia", changefreq: "weekly", priority: 0.8 },
  { url: "/Afghanistan", changefreq: "weekly", priority: 0.8 },
  { url: "/India", changefreq: "weekly", priority: 0.8 },
  { url: "/Africa", changefreq: "weekly", priority: 0.8 },
  { url: "/Others", changefreq: "weekly", priority: 0.8 },
  { url: "/Hotel-Booking", changefreq: "weekly", priority: 0.8 },
  { url: "/Contact-Us", changefreq: "weekly", priority: 0.6 },
  { url: "/Pakistani-Visa", changefreq: "weekly", priority: 0.7 },
  { url: "/Tourist-Visa-Saudi", changefreq: "weekly", priority: 0.7 },
  { url: "/UAE", changefreq: "weekly", priority: 0.7 },
  { url: "/Netherlands", changefreq: "weekly", priority: 0.7 },
  { url: "/Terms-&-Conditions", changefreq: "monthly", priority: 0.5 },
  { url: "/Disclaimer", changefreq: "monthly", priority: 0.5 },
  { url: "/General-Terms-&-Conditions", changefreq: "monthly", priority: 0.5 },
  { url: "/About-Us", changefreq: "monthly", priority: 0.5 },
];

// Base URL of your website
const baseUrl = "https://devhassaantravels.itsolutionsworldwide.com/";

// Create sitemap
async function generateSitemap() {
  const sitemapStream = new SitemapStream({ hostname: baseUrl });

  const writeStream = createWriteStream("./public/sitemap.xml");
  sitemapStream.pipe(writeStream);

  routes.forEach((route) => sitemapStream.write(route));
  sitemapStream.end();

  await streamToPromise(sitemapStream);
  console.log("Sitemap has been generated successfully.");
}

generateSitemap().catch((error) => {
  console.error("Error generating sitemap:", error);
});
