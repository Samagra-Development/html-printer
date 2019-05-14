const express = require('express')
const port = process.env.PORT || 3022
const puppeteer = require('puppeteer')
var cors = require('cors')

const app = express()
app.use(cors())
app.set('view engine', 'html')

app.get('/export/pdf', (req, res) => {
  (async () => {
      console.log(req.query);
      const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
      const page = await browser.newPage()
      page.setViewport({width: 1400, height: 1000});
      await page.goto(req.query.url, {"waitUntil" : "networkidle0"});
      
      const buffer = await page.pdf({
        format: 'A4', 
        landscape: true, 
        printBackground: true,
        displayHeaderFooter: true
      });
      res.type('application/pdf')
      res.send(buffer)
      browser.close()
  })()
});

app.listen(port, "0.0.0.0", function() {
  console.log('Server listening at http://localhost:' + port)
});
