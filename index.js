var express = require('express');
var app = express();
var cheerio = require('cheerio-httpcli');
var rootUrl = "http://www.tenki.jp";

app.get('/', function (req, res) {
    var pref = req.query.pref;
    var city = req.query.city;

    res.send(getLocationPage(pref, city));
});

function getPrefPage(pref) {
    var prefPageUrl;
    var prefSc = cheerio.fetchSync(rootUrl);
    prefSc.$('ul.localList a').each(function(tag){
	if(prefSc.$(this).text() == pref){
	    prefPageUrl = prefSc.$(this).attr('href');
	}
    });
    return rootUrl + prefPageUrl;
}

function getCityPage(prefPageUrl, city) {
    var cityPageUrl;
    var citySc = cheerio.fetchSync(prefPageUrl);
    citySc.$('.weatherWaveBox ul li a').each(function(tag){
	if(citySc.$(this).text() == city){
	    cityPageUrl = citySc.$(this).attr('href');
	}
    });
    return rootUrl + cityPageUrl;
}

function getLocationPage(pref, city){
    var prefPageUrl = getPrefPage(pref);
    var cityPageUrl = getCityPage(prefPageUrl, city);
    return cityPageUrl;
}

function getWeatherData(url) {
    url = 'http://www.tenki.jp/forecast/3/11/4020/8220-daily.html';
    cheerio.fetch(url, function(err, $, res){
	console.log(res.headers);
    });
}

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
