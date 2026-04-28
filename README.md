# Shopping Tracker

A local-first shopping, grocery, wishlist, price-comparison, sale-tracking, repurchase helper, and ChatGPT-assisted price-check workflow.

## What it tracks

- Grocery list items
- Things you want to try from shops
- Products you are considering buying
- Categories:
  - Food
  - Drinks
  - Clothes
  - Crafts
  - Home
  - Beauty
  - Study
  - Other
- Need / want classification:
  - Need
  - Want
  - Try
  - Maybe
- Product page URL
- Image URL
- Shop prices
- Sale prices
- Price notes, such as loyalty-card price, multipack, size, or sale details
- Purchase history
- Repurchase estimates based on buying habits
- Manual repurchase reminders

## ChatGPT price-check workaround

Because a static GitHub Pages app cannot reliably scrape retailer websites itself, the app includes a ChatGPT handoff flow.

Use it like this:

1. Add product names and product links to Shopping.
2. Click **Copy ChatGPT prompt**.
3. Open ChatGPT.
4. Paste the prompt.
5. ChatGPT should check product links / shop information and return strict JSON.
6. Copy the JSON response.
7. Paste it into **Paste ChatGPT JSON response** in Shopping.
8. Click **Apply price/image updates**.

The app then merges returned prices, sale prices, shop links, notes, and image URLs into your saved items.

## Important limitation

This is a static GitHub Pages app. It cannot reliably scrape live prices or product images from every shop automatically, because many retailer sites block browser scraping and prices change often.

Instead, it lets you save shop links, image links, price snapshots, sale prices, and purchase history yourself. The ChatGPT prompt workflow is a workaround for checking products outside the app and importing structured updates.

## How repurchase estimates work

- If you buy an item once, the app records the purchase date.
- If you buy it twice or more, it estimates the average gap between purchases.
- It then estimates when you might need to repurchase.
- You can also set a manual number of days.
- You can turn repurchase reminders off for items that are one-off wants.

## Privacy

Your shopping data is stored in your browser using localStorage. Export backups regularly if the list becomes important.

The generated ChatGPT prompt contains the product names and links you have saved. Review the prompt before pasting it elsewhere.

## GitHub Pages

After Pages is enabled, this app should be available at:

`https://izdrewz.github.io/shopping/`
