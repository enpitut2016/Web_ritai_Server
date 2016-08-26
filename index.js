var express = require('express');
var app = express();
var cheerio = require('cheerio-httpcli');
var rootUrl = "http://www.tenki.jp";

app.get('/', function (req, res) {
    var pref = req.query.pref;
    var city = req.query.city;

    var url = getLocationPage(pref, city);
    var weathers = getWeatherData(url);
    var data = {pref:pref, city:city, weathers:weathers};
    res.send(data);
});

function getPrefPage(pref) {
    var prefPageUrl;
    var indexSc = cheerio.fetchSync(rootUrl);
    indexSc.$('ul.localList a').each(function(tag){
	if(indexSc.$(this).text() == pref){
	    prefPageUrl = indexSc.$(this).attr('href');
	}
    });
    console.log(prefPageUrl);
    return rootUrl + prefPageUrl;
}

function getCityPage(prefPageUrl, city) {
    var cityPageUrl;
    var prefSc = cheerio.fetchSync(prefPageUrl);
    prefSc.$('.weatherWaveBox ul li a').each(function(tag){
	if(prefSc.$(this).text() == city){
	    cityPageUrl = prefSc.$(this).attr('href');
	}
    });
    console.log(cityPageUrl);
    return rootUrl + cityPageUrl;
}

function getLocationPage(pref, city){
    var prefPageUrl = getPrefPage(pref);
    var cityPageUrl = getCityPage(prefPageUrl, city);
    return cityPageUrl;
}

function getWeatherData(url) {
//    url = 'http://www.tenki.jp/forecast/3/11/4020/8220.html';
    var citySc = cheerio.fetchSync(url);
    //    var hours = citySc.$('tr.hour td span');
    var hours = [];
    citySc.$('tr.hour td span').each(function(tag){
	hours.push(citySc.$(this).text());
    });
//    var temperatures = citySc.$('tr.temperature td span');
    var temperatures = [];
    citySc.$('tr.temperature td span').each(function(tag){
	temperatures.push(citySc.$(this).text());
    });
    //var probPrecips = citySc.$('tr.prob_precip td span');
    var probPrecips = [];
    citySc.$('tr.prob_precip td span').each(function(tag){
	probPrecips.push(citySc.$(this).text());
    });
    var weathers = [];
    var weather;
    for(var i = 0; i < 8; i++){
	weather = {hour:hours[i], prob:probPrecips[i], temperature:temperatures[i]};
	weathers.push(weather);
    }
    return weathers;
}

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
//    getWeatherData("a");
});
