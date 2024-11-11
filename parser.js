const Nightmare = require("nightmare");
const arguments = process.argv.slice(2);

if (arguments.length !== 2) {
  console.error("Error: Exactly two arguments are required.");
  console.error("Usage: node parser.js <amazon-url> <minimum-price>");
  process.exit(1);
}

const url = arguments[0];
if (!url.includes("amazon.")) {
  console.error("Error: URL must be an Amazon product link");
  process.exit(1);
}

const minprice = parseFloat(arguments[1]);
if (isNaN(minprice) || minprice < 0) {
  console.error("Error: Minimum price must be a valid positive number");
  process.exit(1);
}

const nightmare = Nightmare({ show: false });

async function checkPrice() {
  try {
    const price = await nightmare
      .goto(url)
      .wait(".a-price-whole")
      .evaluate(() => {
        const priceElement = document.querySelector(".a-price-whole");
        return priceElement ? priceElement.innerText : null;
      })
      .end();

    if (price === null) {
      console.error("Price element not found on the page.");
      return;
    }

    const priceNumber = parseFloat(price.replace(/[^0-9.]/g, ""));
    if (isNaN(priceNumber)) {
      console.error("Failed to parse the price.");
      return;
    }

    if (priceNumber < minprice) {
      console.log(
        `Price is less than ${minprice} which is ${priceNumber} and the product url is ${url}`
      );
    } else {
      console.log(
        `Price is greater than ${minprice} which is ${priceNumber} and the product url is ${url}`
      );
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

checkPrice();
