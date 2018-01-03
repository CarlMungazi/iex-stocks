<template>
  <div class="container-fluid">
    <div class="row" style="margin-bottom: 10px">
      <div class="col-sm-12 search-container">
        <h1> IEX Search Engine </h1>
        <p>Search through more than 8,000 company stock profiles</p>
          <input
            class="search-input"
            @keyup.enter="requestData"
            placeholder="Please enter a stock symbol"
            type="search" name="search"
            v-model="stock"
          >
          <button class="search__button" @click="requestData">Find</button>
      </div>
      <div class="error-message" v-if="showError">
        {{ errorMessage }}
      </div>
    </div>
    <div v-if="loaded" class="row" style="margin-bottom: 10px">
      <div class="col-sm-4">
        <div class="stock-summary">
          <p class="title"> {{ quoteData.companyName }} <span>{{ `(${quoteData.symbol})` }}</span></p>
          <p>Stock Exchange: {{ companyStats.exchange }} </p>
          <p>Website: <a :href="companyStats.website" target="blank">{{ companyStats.website }} </a></p>
          <p class="stock__close">Latest market price: ${{ quoteData.latestPrice }}</p>
          <div> Peer stocks: <span v-for="stock in stockPeers" @click="changeStock">{{ stock }} </span> </div>
          <div class="stock-news">
            <h5> Latest News </h5>
            <div v-for="news in companyNews">
              <span> {{ news.datetime }} || </span><span> {{ news.source }} </span>
              <a :href="news.url" target="blank"><p>{{ news.headline }} </p></a>
            </div>
          </div>
        </div>
      </div>
      <div class="col-sm-8">
        <div class="chart chart-line">
          <div class="chart-title">
            Historically adjusted market-wide data
          </div>
          <div class="chart-line__ranges">
            <button value ='1m' @click="changeRange">1 month (default)</button><button value ='3m' @click="changeRange">3 months</button><button value ='6m' @click="changeRange">6 months</button><button value ='ytd' @click="changeRange">Year-to-date</button><button value ='1y' @click="changeRange">1 Year</button><button value ='2y' @click="changeRange">2 Years</button><button value ='5y' @click="changeRange">5 Years</button>
          </div>
          <div class="chart-area">
            <line-chart :chart-data="lineData" :height="250"></line-chart>
          </div>
        </div>
      </div>
    </div>
    <div v-if="loaded" class="row">
      <div class="col-sm-6">
        <div class="chart chart-bar">
          <div class="chart-title">
            Volume by Market
          </div>
          <div class="chart-area">
            <bar-chart :chart-data="barData" :height="400"></bar-chart>
          </div>
        </div>
      </div>
      <div class="col-sm-6">
        <div class="chart chart-doughnut">
          <div class="chart-title">
            Peer Stocks Market Capitalization
          </div>
          <div class="chart-area">
            <doughnut-chart :chart-data="doughtnutData" :height="400"></doughnut-chart>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import LineChart from '@/components/LineChart'
import BarChart from '@/components/BarChart'
import DoughnutChart from '@/components/DoughnutChart'

export default {
  name: 'StockView',
  components: {
    LineChart,
    BarChart,
    DoughnutChart
  },
  props: {},
  data () {
    return {
      stock: null,
      stockPeers: null,
      companyStats: null,
      volumeByVenue: null,
      lineData: null,
      barData: null,
      doughtnutData: null,
      companyName: '',
      companyNews: null,
      quoteData: null,
      loaded: false,
      showError: false,
      errorMessage: 'Please enter a stock symbol'
    }
  },
  mounted () {
    if (this.$route.params.stock) {
      this.stock = this.$route.params.stock
      this.requestData()
    }
  },
  methods: {
    resetState () {
      this.loaded = false
      this.showError = false
    },
    changeStock (evt) {
      this.stock = evt.target.innerHTML.trim()
      this.requestData()
    },
    changeRange (evt) {
      axios.get(`https://api.iextrading.com/1.0/stock/${this.stock}/chart/${evt.target.value}`)
        .then(res => {
          console.log(res.data)
          this.lineData = {
            labels: res.data.map(stock => stock.label),
            datasets: [{
              label: 'Close',
              borderColor: '#249EBF',
              pointBackgroundColor: 'white',
              borderWidth: 1,
              pointBorderColor: '#249EBF',
              backgroundColor: 'transparent',
              data: res.data.map(stock => stock.close)
            }]
          }
          this.loaded = true
        })
        .catch(err => {
          this.errorMessage = err.response.data.error
          this.showError = true
        })
    },
    requestData () {
      // TO DO: cache responses to prevent unnecessary requests
      // TO DO: fallback for empty data, like year-to-date
      // TO DO: add spinner to signal loading data http://tobiasahlin.com/spinkit/
      if (this.stock == null || this.stock === '' || this.stock === 'undefined') {
        this.showError = true
        return 
      }
      this.resetState()
      axios.get(`https://api.iextrading.com/1.0/stock/${this.stock}/batch?types=quote,peers,volume-by-venue,company
,news,chart&range=1m&last=10`)
      .then(res => {
        //...remember: these callbacks will be executed only when both requests are complete.
        console.log(res.data)
        res.data.news.length = 3 // we only want the first three news stories
        this.lineData = {
          labels: res.data.chart.map(stock => stock.label),
          datasets: [{
            label: 'Close',
            borderColor: '#249EBF',
            pointBackgroundColor: 'white',
            borderWidth: 1,
            pointBorderColor: '#249EBF',
            backgroundColor: 'transparent',
            data: res.data.chart.map(stock => stock.close)
          }]
        }
        this.barData = {
          labels: res.data["volume-by-venue"].map(stock => stock.venueName),
          datasets: [{
            label: res.data.quote.symbol,
            borderColor: '#249EBF',
            pointBackgroundColor: 'white',
            borderWidth: 1,
            pointBorderColor: '#249EBF',
            backgroundColor: 'transparent',
            data: res.data["volume-by-venue"].map(stock => stock.volume)
          }]
        }

        this.quoteData = res.data.quote
        this.stockPeers = res.data.peers
        this.volumeByVenue = res.data["volume-by-venue"]
        this.companyStats = res.data.company
        this.companyNews = res.data.news
        
        return axios.get(`https://api.iextrading.com/1.0/stock/market/batch?symbols=${this.stockPeers}&types=quote`)
      })
      .then(res => {
        let arr = []
        Object.keys(res.data).forEach(el => {
          arr.push(res.data[el].quote)
        })

        this.doughtnutData = {
          labels: arr.map(stock => stock.symbol),
          datasets: [
            {
              backgroundColor: [
                '#41B883',
                '#E46651',
                '#00D8FF',
                '#DD1B16',
                '#FF6600',
                '#0747A6',
                '#F6F6eF',
                '#563D7C',
                '#3C763D'
              ],
              data: arr.map(stock => stock.marketCap)
            }
          ]
        }
        this.loaded = true
      })
      .catch(err => {
        this.errorMessage = err.response.data.error
        this.showError = true
      })
    },
    setURL () {
      history.pushState({ 
        info: `iex-stock ${this.stock}` }, 
        this.stock, `/#/${this.stock}` )
    }
  }
}
</script>

<style>
.search-input {
  padding: 1.25rem;
  background-color: #fff;
  border: 1px solid #e8e9ed;
  font-size: 1rem;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
}
.stock-summary {
  padding: 10px;
}
.chart, .stock-summary {
  background: #fff;
  border: 1px solid #e7e7e7;
  border-radius: 2px;
  box-sizing: border-box;
}
.chart-title {
  color: #4D4D4D;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 200;
  line-height: 32px;
  border-bottom: 1px solid #e7e7e7;
  border-radius: 2px 2px 0 0;
  font-size: 13px;
  padding: 2px 10px 0;
  text-transform: uppercase;
}

.chart-line__ranges {
  margin-top: 10px;
}

.chart-area {
  padding: 10px;
}

#doughnut-chart {
  display: inline-block !important;
}
</style>