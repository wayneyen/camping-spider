const puppeteer = require("puppeteer")
const cheerio = require("cheerio")
const conn = require("./models/Database").conn()

;(async () => {
  conn.connect()
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  conn.query(
    "SELECT * FROM `campsites` WHERE id > 1963 AND `website` IS NULL AND `address` IS NULL AND `tel` IS NULL LIMIT 500",
    async function (err, results, fields) {
      if (err) throw err

      for (let i = 0; i < results.length; i++) {
        const id = results[i].id
        const name = results[i].name
        await page.goto(`https://www.google.com.tw/search?q=${name}%20訂位`)

        const body = await page.content()
        const $ = await cheerio.load(body)

        const stores = $("div.kp-hc").first()
        const contents = $("div.wp-ms").first()

        if ($.text().substring(0, 20) != 'https://www.google.c') {
          const store = {
            website: '',
            address: '',
            tel: ''
          }

          stores.find('a').each(function (i, element) {
            if ($(this).text() == '網站') {
              store.website = $(this).attr('href');
            }
          })

          contents.find('span').each(function (i, element) {
            if ($(this).text() == '地址： ') {
              store.address = contents.find('span').eq(i + 1).text()
            }
            if ($(this).text() == '電話： ') {
              store.tel = contents.find('span').eq(i + 1).text()
            }
          })

          console.log(id, store)

          if (store.website != '') {
            const sql = `UPDATE campsites SET website = '${store.website}' WHERE id = ${id}`
            conn.query(sql)
          }
          if (store.address != '') {
            const sql = `UPDATE campsites SET address = '${store.address}' WHERE id = ${id}`
            conn.query(sql)
          }
          if (store.tel != '') {
            const sql = `UPDATE campsites SET tel = '${store.tel}' WHERE id = ${id}`
            conn.query(sql)
          }
        } else {
          break
        }
      }

      console.log("Done.")
    }
  )
})()
