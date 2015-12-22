var UI = require('ui');
var ajax = require('ajax');

var splashCard = new UI.Card({
  title: "Henter nyheder",
  body: "Vent venligst..."
});

splashCard.show();

var URL = 'http://www.dr.dk/nyheder/service/feeds/allenyheder';

ajax({url: URL, type: 'xml'},
  function(xml) {
    var myRegexp = /<title><!\[CDATA\[(.*?)\]\]><\/title><description><!\[CDATA\[(.*?)\]\]><\/description>.*?<pubDate>(.*?)<\/pubDate>/g;
    var titles = [];
    var currentTitleIndex = -1;

    var match = myRegexp.exec(xml);

    while (match !== null) {
      var date = new Date(match[3]);
      var hour = ('0' + date.getHours()).slice(-2);
      var minute = ('0' + date.getMinutes()).slice(-2);
      
      titles.push({ title: hour + ':' + minute, subtitle: match[1], text: match[2] });
     
      match = myRegexp.exec(xml);
    }
    
    var makeDetailCard = function() {
      var detailCard = new UI.Card({
        title: titles[currentTitleIndex].subtitle,
        body: titles[currentTitleIndex].text,
        scrollable: true
      });          
    
      detailCard.on('click', function(event) {
        if (currentTitleIndex < titles.length - 1) {
          currentTitleIndex++;

          detailCard.hide();
          
          makeDetailCard(currentTitleIndex);
        }
      });
      
      detailCard.show();    
    };
    
    var newsListCard = new UI.Menu({
      sections: [{
        title: 'DR Nyheder',
        items: titles
      }]
    });
    
    newsListCard.on('select', function(event) {
      currentTitleIndex = event.itemIndex;
      makeDetailCard();      
    });

    newsListCard.show();
    splashCard.hide();
  },
  function(error) {
    console.log('Ajax failed: ' + error);
    
    var failedCard = new UI.Card({
      title: "Fejl",
      body: "Det var ikke muligt at hente nyheder."
    });
    
    failedCard.show();
    splashCard.hide();    
  }
);