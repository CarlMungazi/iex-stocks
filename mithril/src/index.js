let m = require("mithril")
let root = document.getElementById('app')

const Data = {
  stocks: {},
  peers: [],
  getStocks: function getStocks (sym) {
    return m.request({
      method: "GET",
      url: `https://api.iextrading.com/1.0/stock/${sym}/quote`,
    })
    .then(function(result) {
      Data.stocks = result
    })
  },
  getPeers: function getPeers (sym) {
    return m.request({
      method: "GET",
      url: `https://api.iextrading.com/1.0/stock/${sym}/peers`,
    })
    .then(function(result) {
      Data.peers = result
    })
  } 
}

let Comp = {
  oninit: function (vnode) {
    Data.getStocks('aapl')
    Data.getPeers('aapl')
  },
  view: function (vnode) {
    function showPeers () {
      return Data.peers.map(function(el) {
        return m('span', el + ', ')
      })
    }
    return m('div',
      m('div',  
        m('h1', {
          style: {display: "inline-block"}
        }, Data.stocks.companyName),
        m('span', ' (' + Data.stocks.symbol + ')')
      ),
      m('div', 
        m('span', {style: {marginRight: '5px', fontSize: '80px'}}, Data.stocks.close),
        m('span', {style: {color: 'red'}}, Data.stocks.change)
      ),
      m('div', 
        m('span', {style: {marginRight: '5px'}}, 'Peer stocks: '),
        m('span', showPeers())
      )
    )
  }
}

m.mount(root, Comp)