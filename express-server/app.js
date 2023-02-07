const express = require("express");
const axios = require("axios");
const app = express();
const debug = require("debug")("express");
const fs = require("fs");

const fetchData = async () => {
  const data = await axios
    .get("https://boi.org.il/PublicApi/GetExchangeRates")
    .then((response) => {
      return response.data;
    });

  const filteredRates = data.exchangeRates
    .filter(
      (coin) => coin.key === "USD" || coin.key === "EUR" || coin.key === "GBP"
    )
    .map((coin) => {
      fs.appendFileSync(
        "currency.txt",
        "\r\n" + coin.key + "-->" + JSON.stringify(coin.currentExchangeRate)
      );

      return { key: coin.key, exRate: coin.currentExchangeRate };
    });

  fs.appendFileSync(
    "currency.txt",
    "\r\n" + data.exchangeRates[0].lastUpdate + "\r\n"
  );
  return filteredRates;
};
setInterval(fetchData, 3000);

app.get("/", async (req, res) => {
  fs.writeFileSync("currency.txt", "The Exchange Values:");
  const data = fetchData().then((data) => {
    return data;
  });

  debug(`${req.headers["user-agent"]} has access root URL`);
  res.send(`hello there!`);
});

const port = process.env.EXPRESS_PORT || 3000;
app.listen(port, (err) => {
  if (!err) debug(`server is running on ${port}`);
});
