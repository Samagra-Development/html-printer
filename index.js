const express = require('express')
const port = process.env.PORT || 3022
const puppeteer = require('puppeteer')
var cors = require('cors')

const app = express()
app.use(cors())
app.set('view engine', 'html')
let browser;

function validateUrl(value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

app.get('/export/pdf', (req, res) => {
  (async () => {
      console.log(req.query);
      if(validateUrl(req.query.url)){
        try{
          const page = await browser.newPage()
          page.setViewport({width: 1400, height: 10000});
          await page.goto(req.query.url, {"waitUntil" : "networkidle0"});
          
          const buffer = await page.pdf({
            format: 'A4', 
            landscape: true, 
            printBackground: true,
            displayHeaderFooter: true
          });
          await page.close();
          res.type('application/pdf');
          res.send(buffer);
        }catch(e){
          res.send({status: "Couldn't complete download",url:req.query.url });
        }
      }else{
        res.send({status: "Malformed URL", url:req.query.url});
      }
      
  })()
});

app.get('/', (req, res) => {
  res.send({status: "OK"})
});

(async () => {
  browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  app.listen(port, "0.0.0.0", function() {
    console.log('Server listening at http://localhost:' + port)
  });
})();


