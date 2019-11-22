/*
    Dump all holidays for all countries and supported states for the years requested
*/
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
            //No states are defined for the country, so return only country level dates
            states = {'country': true};
        } else if (country != 'GB') {
            //Some states are defined for the country. However we can't be certain that all states have
            //been returned, so we must also return country level dates.
            states['country'] = true;
        }

        while (year <= queryData.end) {
            //The key of the array should be the subdivision ISO code
            for (let state in states) {
                let location = country
                if (states[state] && state != 'country') {
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