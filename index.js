const express = require("express");
const port = process.env.PORT || 3022;
const puppeteer = require("puppeteer");
var cors = require("cors");

const app = express();
app.use(cors());
app.set("view engine", "html");
let browser;

function validateUrl(value) {
  return /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi.test(
    value
  );
}

app.get("/export/pdf", (req, res) => {
  (async () => {
    console.log(req.query);
    if (validateUrl(req.query.url)) {
      try {
        const page = await browser.newPage();
        page.setViewport({ width: 1400, height: 10000 });
        await page.goto(req.query.url, { waitUntil: "networkidle0" });

        const buffer = await page.pdf({
          format: "A4",
          landscape: true,
          printBackground: true,
          displayHeaderFooter: true
        });
        await page.close();
        res.type("application/pdf");
        res.send(buffer);
      } catch (e) {
        console.log(e);
        res.send({ status: "Couldn't complete download", url: req.query.url });
      }
    } else {
      res.send({ status: "Malformed URL", url: req.query.url });
    }
  })();
});

app.get("/", (req, res) => {
  res.send({ status: "OK" });
});

(async () => {
  browser = await puppeteer.launch({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  });
  app.listen(port, "0.0.0.0", function() {
    console.log("Server listening at http://localhost:" + port);
  });
})();
