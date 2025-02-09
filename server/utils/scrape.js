import puppeteer from "puppeteer";
import fs from "fs";
import { Product } from "../model/product.js";
import { Review } from "../model/review.js";

const data = { list: [] };

function generateRandomPublicId() {
  return `${crypto.randomUUID()}`;
}
bhsrtiartl 24 cd 1700
function generateRandomStock() {
  return Math.floor(Math.random() * (83 - 5 + 1)) + 5;
}

export async function scrapeData() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.flipkart.com/search?q=Sports", {
    timeout: 0,
    waitUntil: "networkidle0",
  });

  const productData = await page.evaluate(() => {
    const data = { list: [] };
    const items = document.querySelectorAll("div[data-id]");
    const maxItems = 10; 

    items.forEach((item, index) => {
      if (index >= maxItems) return;

      const name =
        item.querySelector(".wjcEIp")?.innerText || "Unknown Product";
      const priceText = item.querySelector(".Nx9bqj")?.innerText || "0";
      const originalPriceText = item.querySelector(".yRaY8j")?.innerText || "0";
      const discountPercentageText =
        item.querySelector(".UkUFwK > span")?.innerText || "0";
      const link = item.querySelector("a")?.href || null;

      data.list.push({
        name,
        price: parseInt(priceText.replace(/[^\d]/g, ""), 10) || 0,
        originalPrice:
          parseInt(originalPriceText.replace(/[^\d]/g, ""), 10) || 0,
        discountPercentage:
          parseInt(discountPercentageText.replace(/[^\d]/g, ""), 10) || 0,
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

        const additionalData = await productPage.evaluate(() => {
          const description =
            document.querySelector(".w9jEaj")?.innerText || "";
          const image = document.querySelector(".DByuf4")?.src || null;
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
            description,
            image,
            shippingFee:
              parseInt(shippingFeeText.replace(/[^\d]/g, ""), 10) || 0,
            reviewStats,
          };
        });

        const productRecord = new Product({
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          discountPercentage: product.discountPercentage,
          description: additionalData.description || "",
          image: {
            public_id: generateRandomPublicId(),
            url: additionalData.image,
          },
          stock: generateRandomStock(),
          seller: "6761114426417d6fdeaf0bd0",
          category: "Sports",
          shippingFee: additionalData.shippingFee,
        });

        const savedProduct = await productRecord.save();
        console.log(`Product ${savedProduct.name} saved successfully`);

        const reviews = additionalData.reviewStats.reviews.map((review) => {
          return new Review({
            productId: savedProduct._id,
            userId: "6761114426417d6fdeaf0bd0",
            rating: parseInt(review.rating, 10),
            comment: review.comment,
          });
        });

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
