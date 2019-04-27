var express = require('express');
const fetch = require("node-fetch");
var router = express.Router();


var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retrieve_data(url)
{
  let response = await fetch(url);
  let data = await response.json()
  data.forEach(function(element){
    delete element['quality']
    delete element['sell_price_max']
    delete element['sell_price_max_date']
    delete element['buy_price_min']
    delete element['buy_price_max']
    delete element['buy_price_min_date']
    delete element['buy_price_max_date']
  })

  var groupe_by_item_id = groupBy(data, 'item_id')

  for (const [key, value] of Object.entries(groupe_by_item_id)) {
      value.forEach(function(item_city){
        delete item_city['item_id']
      })
  }

  return groupe_by_item_id
}

async function merge_dict(list_url){
  var total = 0
  for (let url of list_url){
    await sleep(1)
    retrieve_data(url).then(data =>{
      console.log(data)
      total += 1
      console.log(total+'/'+list_url.length)
    }
    )
  }
}




/* GET home page. */
router.get('/', function(req, res, next) {
  const items = req.app.get('items')

  var  list_items_input = [];
  var tmp = "https://www.albion-online-data.com/api/v1/stats/Prices/";


  items.forEach(function(item){
    name = item['UniqueName']+'%2C'

    if (tmp.length + name.length < 2048){
      tmp += name;
    }
    else{
      list_items_input.push(tmp);
      tmp = "https://www.albion-online-data.com/api/v1/stats/Prices/"+name;
    }
  })

  merge_dict(list_items_input)





  res.render('index', { title: 'Express' });
});

module.exports = router;
