var express = require('express');
var app = express();
var cheerio = require('cheerio-httpcli');
var rootUrl = "http://www.tenki.jp";

app.get('/', function (req, res) {
    var pref = req.query.pref;
    var city = req.query.city;
    var url = 'non';
    
    if(pref == '北海道') {
	var hokkaidoUrls = ['http://www.tenki.jp/forecast/1/2/',
			    'http://www.tenki.jp/forecast/1/3/',
			    'http://www.tenki.jp/forecast/1/1/',
			    'http://www.tenki.jp/forecast/1/4/'
			   ];
	for(var i = 0; i < 4; i++){
	    url = getCityPage(hokkaidoUrls[i], city);
	    if(typeof url !== "undefined") {
		break;
	    }
	}
    } else {
	url = getLocationPage(pref, city);
    }
    var weathers = getWeatherData(url);
    var data = {pref:pref, city:city, weathers:weathers};
    res.json(data);
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
    if(typeof cityPageUrl === "undefined") {
	return;
    } else {
	return rootUrl + cityPageUrl;
    }
}

function getLocationPage(pref, city){
    var prefPageUrl = getPrefPage(pref);
    var cityPageUrl = getCityPage(prefPageUrl, city);
    return cityPageUrl;
}

function getWeatherData(url) {
    var citySc = cheerio.fetchSync(url);

    var hours = [];
    citySc.$('tr.hour td span').each(function(tag){
	hours.push(citySc.$(this).text());
    });

    var temperatures = [];
    citySc.$('tr.temperature td span').each(function(tag){
	temperatures.push(citySc.$(this).text());
    });

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
});
