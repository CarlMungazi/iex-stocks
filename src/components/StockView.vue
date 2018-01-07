<template>
  <div class="container-fluid">
    <div class="alert alert-danger" v-if="showError" role="alert">
            {{ errorMessage }}
    </div>
    <div class="row" style="margin-bottom: 10px">
      <div class="col-sm-12 search-container">
        <router-link to="/">
          <h1> IEX Search Engine </h1>
        </router-link>
        <p>Search through more than 8,000 company stock profiles</p>
          <div class="search-input input-group mb-3">
            <input 
              class="form-control"
              @keyup.enter="requestData"
              type="search"
              name="search"
              placeholder="Enter a stock symbol"
              v-model="stock" 
              aria-label="Stock symbol">
            <div class="input-group-append">
              <button class="btn btn-outline-secondary" type="button" @click="requestData">Find</button>
            </div>
          </div>
        <hr style="border-color: #000">
      </div>
      <div class="col-sm-12 search-container">
        <div v-if="loading" class="loading">
          <p>Loading Data...</p>
          <div class="sk-fading-circle">
            <div class="sk-circle1 sk-circle"></div>
            <div class="sk-circle2 sk-circle"></div>
            <div class="sk-circle3 sk-circle"></div>
            <div class="sk-circle4 sk-circle"></div>
            <div class="sk-circle5 sk-circle"></div>
            <div class="sk-circle6 sk-circle"></div>
            <div class="sk-circle7 sk-circle"></div>
            <div class="sk-circle8 sk-circle"></div>
            <div class="sk-circle9 sk-circle"></div>
            <div class="sk-circle10 sk-circle"></div>
            <div class="sk-circle11 sk-circle"></div>
            <div class="sk-circle12 sk-circle"></div>
          </div>
        </div>
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
      loading: false,
      showError: false,
      errorMessage: ''
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
      this.loading = true
      axios.get(`https://api.iextrading.com/1.0/stock/${this.stock}/chart/${evt.target.value}`)
        .then(res => {
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
          this.setURL()
          this.loaded = true
          this.loading = false
        })
        .catch(err => {
          console.log(err)
        })
    },
    requestData () {
      if (this.stock == null || this.stock === '' || this.stock === 'undefined') {
        this.showError = true
        return 
      }
      this.resetState()
      this.loading = true

      axios.get(`https://api.iextrading.com/1.0/stock/${this.stock}/batch?types=quote,peers,volume-by-venue,company,news,chart&range=1m&last=10`)
      .then(res => {
        //...remember: these callbacks will be executed only when both requests are complete.
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
        this.setURL()
        this.loaded = true
        this.loading = false
      })
      .catch(err => {
        if (err.response.data == 'Unknown symbol') {
          this.errorMessage = "The stock symbol you entered does not exist."
        } else {
          this.errorMessage = err.response.data
        } 
        
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
.search-container a {
  text-decoration: none;
}
.search-input {
  display: inline-flex;
}

.loading {
  text-align: center;
  color: black;
}

.loading p {
  font-size: 1.5rem;
}

.sk-fading-circle {
  margin: 100px auto;
  width: 40px;
  height: 40px;
  position: relative;
}

.sk-fading-circle .sk-circle {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
}

.sk-fading-circle .sk-circle:before {
  content: '';
  display: block;
  margin: 0 auto;
  width: 15%;
  height: 15%;
  background-color: #333;
  border-radius: 100%;
  -webkit-animation: sk-circleFadeDelay 1.2s infinite ease-in-out both;
          animation: sk-circleFadeDelay 1.2s infinite ease-in-out both;
}
.sk-fading-circle .sk-circle2 {
  -webkit-transform: rotate(30deg);
    -ms-transform: rotate(30deg);
        transform: rotate(30deg);
}
.sk-fading-circle .sk-circle3 {
  -webkit-transform: rotate(60deg);
      -ms-transform: rotate(60deg);
          transform: rotate(60deg);
}
.sk-fading-circle .sk-circle4 {
  -webkit-transform: rotate(90deg);
      -ms-transform: rotate(90deg);
          transform: rotate(90deg);
}
.sk-fading-circle .sk-circle5 {
  -webkit-transform: rotate(120deg);
      -ms-transform: rotate(120deg);
          transform: rotate(120deg);
}
.sk-fading-circle .sk-circle6 {
  -webkit-transform: rotate(150deg);
      -ms-transform: rotate(150deg);
          transform: rotate(150deg);
}
.sk-fading-circle .sk-circle7 {
  -webkit-transform: rotate(180deg);
      -ms-transform: rotate(180deg);
          transform: rotate(180deg);
}
.sk-fading-circle .sk-circle8 {
  -webkit-transform: rotate(210deg);
      -ms-transform: rotate(210deg);
          transform: rotate(210deg);
}
.sk-fading-circle .sk-circle9 {
  -webkit-transform: rotate(240deg);
      -ms-transform: rotate(240deg);
          transform: rotate(240deg);
}
.sk-fading-circle .sk-circle10 {
  -webkit-transform: rotate(270deg);
      -ms-transform: rotate(270deg);
          transform: rotate(270deg);
}
.sk-fading-circle .sk-circle11 {
  -webkit-transform: rotate(300deg);
      -ms-transform: rotate(300deg);
          transform: rotate(300deg); 
}
.sk-fading-circle .sk-circle12 {
  -webkit-transform: rotate(330deg);
      -ms-transform: rotate(330deg);
          transform: rotate(330deg); 
}
.sk-fading-circle .sk-circle2:before {
  -webkit-animation-delay: -1.1s;
          animation-delay: -1.1s; 
}
.sk-fading-circle .sk-circle3:before {
  -webkit-animation-delay: -1s;
          animation-delay: -1s; 
}
.sk-fading-circle .sk-circle4:before {
  -webkit-animation-delay: -0.9s;
          animation-delay: -0.9s; 
}
.sk-fading-circle .sk-circle5:before {
  -webkit-animation-delay: -0.8s;
          animation-delay: -0.8s; 
}
.sk-fading-circle .sk-circle6:before {
  -webkit-animation-delay: -0.7s;
          animation-delay: -0.7s; 
}
.sk-fading-circle .sk-circle7:before {
  -webkit-animation-delay: -0.6s;
          animation-delay: -0.6s; 
}
.sk-fading-circle .sk-circle8:before {
  -webkit-animation-delay: -0.5s;
          animation-delay: -0.5s; 
}
.sk-fading-circle .sk-circle9:before {
  -webkit-animation-delay: -0.4s;
          animation-delay: -0.4s;
}
.sk-fading-circle .sk-circle10:before {
  -webkit-animation-delay: -0.3s;
          animation-delay: -0.3s;
}
.sk-fading-circle .sk-circle11:before {
  -webkit-animation-delay: -0.2s;
          animation-delay: -0.2s;
}
.sk-fading-circle .sk-circle12:before {
  -webkit-animation-delay: -0.1s;
          animation-delay: -0.1s;
}

@-webkit-keyframes sk-circleFadeDelay {
  0%, 39%, 100% { opacity: 0; }
  40% { opacity: 1; }
}

@keyframes sk-circleFadeDelay {
  0%, 39%, 100% { opacity: 0; }
  40% { opacity: 1; } 
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