import puppeteer from "puppeteer";
import fs from "fs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { Product } from "../model/product.js";
import { Review } from "../model/review.js";
import { connectDB } from "./features.js";

const data = { list: [] };

function generateRandomPublicId() {
  return `${crypto.randomUUID()}`;
}

function generateRandomStock() {
  return Math.floor(Math.random() * (83 - 5 + 1)) + 5;
}

function generateRandomDiscountPercentage() {
  return Math.floor(Math.random() * (50 - 10 + 1)) + 10;
}

function generateRandomShippingFee() {
  return Math.floor(Math.random() * (120 - 20 + 1)) + 20;
}

function generateRandomRating() {
  return Math.floor(Math.random() * (5 - 3 + 1)) + 3;
}

function generateRandomReviewCount() {
  return Math.floor(Math.random() * (5 - 2 + 1)) + 2;
}

function getRandomReviewComment() {
  const comments = [
    "Good product for daily use.",
    "Worth the price and quality is decent.",
    "Value for money, recommended.",
    "Build quality is good and useful.",
    "Satisfied with the product.",
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

export async function scrapeData() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.flipkart.com/search?q=sports", {
    timeout: 0,
    waitUntil: "networkidle0",
  });

  const productData = await page.evaluate(() => {
    const extractAmount = (value) =>
      parseInt((value || "").replace(/[^\d]/g, ""), 10) || 0;

    const pickText = (root, selectors = []) => {
      for (const selector of selectors) {
        const text = root.querySelector(selector)?.textContent?.trim();
        if (text) return text;
      }
      return "";
    };

    const data = { list: [] };
    const items = document.querySelectorAll("div[data-id]");
    const maxItems = 10; 

    items.forEach((item, index) => {
      if (index >= maxItems) return;

      const name =
        pickText(item, [".wjcEIp", "a[title]", "h2", "h3", "h4"]) ||
        "Unknown Product";
      const priceText = pickText(item, [".Nx9bqj", "._30jeq3", "div[class*='Nx9bqj']"]);
      const originalPriceText = pickText(item, [".yRaY8j", "._3I9_wc"]);
      const discountPercentageText = pickText(item, [".UkUFwK > span", "._3Ay6Sb span"]);
      const link = item.querySelector("a")?.href || null;

      data.list.push({
        name,
        price: extractAmount(priceText),
        originalPrice: extractAmount(originalPriceText),
        discountPercentage: extractAmount(discountPercentageText),
        link,
      });
    });

    return data;
  });

  console.log(`Successfully collected ${productData.list.length} products`);

  for (const product of productData.list) {
    if (product.link) {
      try {
        const productPage = await browser.newPage();
        await productPage.goto(product.link, {
          timeout: 0,
          waitUntil: "networkidle0",
        });
        await productPage.waitForSelector("h1, meta[property='og:title']", {
          timeout: 15000,
        });

        const additionalData = await productPage.evaluate(() => {
          const extractAmount = (value) =>
            parseInt((value || "").replace(/[^\d]/g, ""), 10) || 0;

          const pickText = (selectors = []) => {
            for (const selector of selectors) {
              const text = document.querySelector(selector)?.textContent?.trim();
              if (text) return text;
            }
            return "";
          };

          const pickMeta = (propertyOrName) =>
            document
              .querySelector(
                `meta[property='${propertyOrName}'], meta[name='${propertyOrName}']`
              )
              ?.getAttribute("content")
              ?.trim() || "";

          const parseStructuredProduct = () => {
            const scripts = Array.from(
              document.querySelectorAll("script[type='application/ld+json']")
            );

            for (const script of scripts) {
              try {
                const raw = JSON.parse(script.textContent || "{}");
                const nodes = Array.isArray(raw)
                  ? raw
                  : raw["@graph"] && Array.isArray(raw["@graph"])
                    ? raw["@graph"]
                    : [raw];

                const productNode = nodes.find((node) => {
                  const type = node?.["@type"];
                  if (Array.isArray(type)) return type.includes("Product");
                  return type === "Product";
                });

                if (!productNode) continue;

                const offers = Array.isArray(productNode.offers)
                  ? productNode.offers[0]
                  : productNode.offers;

                return {
                  name: productNode.name || "",
                  price: extractAmount(String(offers?.price || "")),
                  originalPrice: 0,
                  discount: 0,
                };
              } catch {
                // Ignore malformed JSON-LD blocks.
              }
            }

            return {
              name: "",
              price: 0,
              originalPrice: 0,
              discount: 0,
            };
          };

          const resolveImageUrl = () => {
            // Prefer stable structure selectors over volatile class names.
            const imgEl =
              document.querySelector("div.OfydJ4 picture img") ||
              document.querySelector("picture img") ||
              document.querySelector("img[src]");

            if (imgEl?.src) return imgEl.src;

            const srcset = imgEl?.getAttribute("srcset");
            if (srcset) {
              const firstCandidate = srcset
                .split(",")[0]
                ?.trim()
                .split(" ")[0];
              if (firstCandidate) return firstCandidate;
            }

            const ogImage = document
              .querySelector("meta[property='og:image']")
              ?.getAttribute("content");
            return ogImage || null;
          };

          const structuredProduct = parseStructuredProduct();

          const pageName =
            structuredProduct.name ||
            pickText(["h1 span", "h1", "span.B_NuCI"]) ||
            document
              .querySelector("meta[property='og:title']")
              ?.getAttribute("content")
              ?.replace(/\s*\|\s*Flipkart.*$/i, "")
              ?.trim() ||
            pickMeta("twitter:title") ||
            "Unknown Product";

          const pagePriceText = pickText([
            ".Nx9bqj",
            "._30jeq3",
            "div[class*='Nx9bqj']",
            "div[class*='_30jeq3']",
          ]);
          const pageOriginalPriceText = pickText([".yRaY8j", "._3I9_wc"]);
          const pageDiscountText = pickText([".UkUFwK > span", "._3Ay6Sb span"]);
          const metaPriceText =
            pickMeta("product:price:amount") || pickMeta("twitter:data1");

          const pageDescription =
            pickText([
              ".w9jEaj",
              "div[class*='X3BRps']",
              "div[class*='fMghEO']",
              "div[class*='_4gvKMe'] li",
            ]) ||
            pickMeta("og:description") ||
            pickMeta("twitter:description") ||
            "";
          const image = resolveImageUrl();
          const shippingFeeText =
            document.querySelector(".Xksjzr")?.innerText || "0";

          const reviewStats = {
            overallRating: null,
            totalReviews: 0,
            ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            reviews: [],
          };

          const ratingElement = document.querySelector(".ipqd2A");
          if (ratingElement) {
            reviewStats.overallRating =
              parseFloat(ratingElement.innerText) || null;
          }

          const totalReviewsElement = document.querySelector(
            ".j-aW8Z > .col-12-12 > span"
          );
          if (totalReviewsElement) {
            reviewStats.totalReviews =
              parseInt(
                totalReviewsElement.innerText.replace(/[^\d]/g, ""),
                10
              ) || 0;
          }

          for (let i = 1; i <= 5; i++) {
            const reviewElement = document.querySelector(
              `ul:nth-child(3) > .fQ-FC1:nth-child(${i}) > div`
            );
            if (reviewElement) {
              reviewStats.ratingBreakdown[i] =
                parseInt(reviewElement.innerText.replace(/[^\d]/g, ""), 10) ||
                0;
            }
          }

          const reviewElements = document.querySelectorAll("._8-rIO3 .RcXBOT");
          reviewElements.forEach((reviewElement) => {
            const rating =
              reviewElement.querySelector(".XQDdHH.Ga3i8K")?.innerText || "0";
            const comment =
              reviewElement.querySelector("p.z9E0IG")?.innerText ||
              "No Comment";

            if (rating && comment) {
              reviewStats.reviews.push({
                rating: parseInt(rating, 10),
                comment,
              });
            }
          });

          return {
            pageName,
            pagePrice:
              structuredProduct.price ||
              extractAmount(metaPriceText) ||
              extractAmount(pagePriceText),
            pageOriginalPrice: extractAmount(pageOriginalPriceText),
            pageDiscountPercentage: extractAmount(pageDiscountText),
            description: pageDescription,
            image,
            shippingFee:
              parseInt(shippingFeeText.replace(/[^\d]/g, ""), 10) || 0,
            reviewStats,
          };
        });

        const hasTruncatedName = (value = "") => value.includes("...");
        const finalName =
          product.name &&
          product.name !== "Unknown Product" &&
          !hasTruncatedName(product.name)
            ? product.name
            : additionalData.pageName;
        const finalPrice =
          product.price > 0 ? product.price : additionalData.pagePrice;
        let finalOriginalPrice =
          product.originalPrice > 0
            ? product.originalPrice
            : additionalData.pageOriginalPrice;
        let finalDiscountPercentage =
          product.discountPercentage > 0
            ? product.discountPercentage
            : additionalData.pageDiscountPercentage;

        if (finalOriginalPrice <= 0 && finalDiscountPercentage > 0 && finalPrice > 0) {
          finalOriginalPrice = Math.round(
            finalPrice / (1 - finalDiscountPercentage / 100)
          );
        }

        if (
          finalDiscountPercentage <= 0 &&
          finalOriginalPrice > finalPrice &&
          finalPrice > 0
        ) {
          finalDiscountPercentage = Math.round(
            ((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100
          );
        }

        if (finalOriginalPrice <= 0 && finalPrice > 0) {
          finalOriginalPrice = finalPrice;
        }

        if (finalDiscountPercentage <= 0) {
          finalDiscountPercentage = generateRandomDiscountPercentage();
        }

        if (finalPrice > 0 && finalOriginalPrice <= finalPrice) {
          finalOriginalPrice = Math.round(
            finalPrice / (1 - finalDiscountPercentage / 100)
          );
        }

        const finalShippingFee =
          additionalData.shippingFee > 0
            ? additionalData.shippingFee
            : generateRandomShippingFee();

        const productRecord = new Product({
          name: finalName || "Unknown Product",
          price: finalPrice,
          originalPrice: finalOriginalPrice,
          discountPercentage: finalDiscountPercentage,
          description: additionalData.description || "",
          image: {
            public_id: generateRandomPublicId(),
            url: additionalData.image,
          },
          stock: generateRandomStock(),
          seller: "6761114426417d6fdeaf0bd0",
          category: "Sports",
          shippingFee: finalShippingFee,
        });

        const savedProduct = await productRecord.save();
        console.log(`Product ${savedProduct.name} saved successfully`);

        let reviews = additionalData.reviewStats.reviews.map((review) => {
          return new Review({
            productId: savedProduct._id,
            userId: "69f2f0d4edd098999c646b0f",
            rating: parseInt(review.rating, 10),
            comment: review.comment,
          });
        });

        if (reviews.length === 0) {
          const randomCount = generateRandomReviewCount();
          reviews = Array.from({ length: randomCount }).map(() => {
            return new Review({
              productId: savedProduct._id,
              userId: "69f2f0d4edd098999c646b0f",
              rating: generateRandomRating(),
              comment: getRandomReviewComment(),
            });
          });
        }

        if (reviews.length > 0) {
          await Review.insertMany(reviews);
          console.log(
            `Successfully added ${reviews.length} reviews for ${savedProduct.name}`
          );
        }

        await productPage.close();
      } catch (err) {
        console.error(`Error processing product ${product.link}:`, err);
      }
    }
  }

  const json = JSON.stringify(productData, null, 2);
  fs.writeFileSync("product.json", json, "utf8");
  console.log("Successfully written data to product.json");

  await browser.close();
  console.log("Scraping complete!");
}

async function runScraper() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const envPath = path.resolve(__dirname, "../.env");
    dotenv.config({ path: envPath });
    await connectDB(process.env.MONGO_URI);
    await scrapeData();
  } catch (error) {
    console.error("Scraper failed:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// if (process.argv[1] === fileURLToPath(import.meta.url)) {
//   runScraper();
// }