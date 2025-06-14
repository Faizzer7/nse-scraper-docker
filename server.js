const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://fib.co.ke/live-markets/', { waitUntil: 'networkidle2' });

    const stocks = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.map(row => {
        const cells = row.querySelectorAll('td');
        return {
          symbol: cells[0]?.innerText.trim(),
          name: cells[1]?.innerText.trim(),
          price: cells[2]?.innerText.trim(),
          change: cells[3]?.innerText.trim(),
          percent_change: cells[4]?.innerText.trim(),
          volume: cells[5]?.innerText.trim()
        };
      });
    });

    await browser.close();
    res.json({ success: true, stocks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
