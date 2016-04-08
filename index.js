const request = require('request')
const cheerio = require('cheerio')
const csv = require('csv-parser')
const toCsv = require('to-csv')
const _ = require('lodash')

var u = 'https://nodejs.org/metrics/summaries/total/'

var results = {}

var files = []

function finish () {
  console.log(toCsv(_.keys(results).map(k => ({month:k, downloads:results[k]}))))
}

function get () {
  if (!files.length) return finish()
  var file = files.shift()
  request(`${u}${file}`)
  .pipe(csv())
  .on('data', row => {
    var month = row.day.slice(0, '2014-05'.length)
    if (!results[month]) results[month] = 0
    results[month] += parseInt(row.downloads)
  })
  .on('end', get)
}

request(u, (err, resp, body) => {
  var $ = cheerio.load(body)
  $('pre a').each(function (i, elem) {
    var file = $(this).text()
    if (file.slice(0, 'nodejs.org-'.length) === 'nodejs.org-') {
      files.push(file)
    }
  })
  
  get()
})