// content of index.js
const http = require('http')
const url = require('url');
const port = 3000
const Holidays = require('./src/Holidays')
const hd = new Holidays()

const requestHandler = (request, response) => {
    const queryData = url.parse(request.url, true).query;
    let data = [];
    let holidays = [];
    for (let country in hd.getCountries()) {
        let year = queryData.start;
        let states = hd.getStates(country)
        if (!states) {
            states = [null];
        }
        
        while (year <= queryData.end) {
            for (let state in states) {
                let location = country
                if (state) {
                    hd.init(country, state)
                    location = country + '-' + state
                } else {
                    hd.init(country)
                }
                
                holidays = hd.getHolidays(year)
                holidays = holidays.map(function(item) {
                    item['region'] = location;
                    return item;
                });
                data = data.concat(holidays);
            }
            year ++;
        }
    }

    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(data));
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})