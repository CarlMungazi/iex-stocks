<template>
  <div class="content">
    <div class="container">
      <div class="Search__container">
        <input
          class="Search__input"
          @keyup.enter="requestData"
          placeholder="Stock Symbol"
          type="search" name="search"
          v-model="stock"
        >
        <button class="Search__button" @click="requestData">Find</button>  
      </div>
      <div class="error-message" v-if="showError">
      {{ errorMessage }}
      </div>
      <hr>
      <h1 class="title" v-if="loaded">{{ quoteData.companyName }} <span>{{ `(${quoteData.symbol})` }}</span></h1>
      <h2 class="Stock__close" v-if="loaded">{{ quoteData.latestPrice }} <span>{{ quoteData.change }}</span><span>{{ ` (${quoteData.changePercent})` }}</span></h2>
      <div v-if="loaded" <span>Peer stocks: </span><span v-for="stock in stockPeers" @click="changeStock"> {{ stock }} </span> </div>
      <div class="Chart__container" v-if="loaded">
        <div class="Chart__title">
          <div class="Chart__ranges">
          <button value ='1m' @click="changeRange">1 month (default)</button><button value ='3m' @click="changeRange">3 months</button><button value ='6m' @click="changeRange">6 months</button><button value ='ytd' @click="changeRange">Year-to-date</button><button value ='1y' @click="changeRange">1 Year</button><button value ='2y' @click="changeRange">2 Years</button><button value ='5y' @click="changeRange">5 Years</button>
          </div>
          Historically adjusted market-wide data
          <hr>
        </div>
        <div class="Chart__content">
          <line-chart v-if="loaded" :chart-data="lineData"></line-chart>
        </div>
        <div class="Chart__content">
          <bar-chart v-if="loaded" :chart-data="barData"></bar-chart>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import LineChart from '@/components/LineChart'
import BarChart from '@/components/BarChart'

export default {
  name: 'StockView',
  components: {
    LineChart,
    BarChart
  },
  props: {},
  data () {
    return {
      stock: null,
      stockPeers: [],
      volumeByVenue: [],
      lineData: null,
      barData: null,
      // chartData: [],
      companyName: '',
      quoteData: [],
      loaded: false,
      // labels: [],
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
      // TO DO: change chained requests to batch request
      // TO DO: create a nested promise which also gets quote data https://api.iextrading.com/1.0/stock/${sym}/quote
      // TO DO: fallback for empty data, like year-to-date
      // TO DO: make sure promise chain error handling is correct
      // TO DO: add spinner to signal loading data http://tobiasahlin.com/spinkit/
      if (this.stock == null || this.stock === '' || this.stock === 'undefined') {
        this.showError = true
        return 
      }
      this.resetState()
      axios.all([
        axios.get(`https://api.iextrading.com/1.0/stock/${this.stock}/chart/1m`),
        axios.get(`https://api.iextrading.com/1.0/stock/${this.stock}/quote`),
        axios.get(`https://api.iextrading.com/1.0/stock/${this.stock}/peers`),
        axios.get(`https://api.iextrading.com/1.0/stock/${this.stock}/volume-by-venue`)
      ])
      .then(axios.spread((chartRes, quoteRes, peerRes, volumeByVenueRes) => {
        //...remember: these callbacks will be executed only when both requests are complete.
        console.log(quoteRes.data)
        this.lineData = {
          labels: chartRes.data.map(stock => stock.label),
          datasets: [{
            label: 'Close',
            borderColor: '#249EBF',
            pointBackgroundColor: 'white',
            borderWidth: 1,
            pointBorderColor: '#249EBF',
            backgroundColor: 'transparent',
            data: chartRes.data.map(stock => stock.close)
          }]
        }
        this.barData = {
          labels: volumeByVenueRes.data.map(stock => stock.venueName),
          datasets: [{
            label: quoteRes.data.symbol,
            borderColor: '#249EBF',
            pointBackgroundColor: 'white',
            borderWidth: 1,
            pointBorderColor: '#249EBF',
            backgroundColor: 'transparent',
            data: volumeByVenueRes.data.map(stock => stock.volume)
          }]
        }

        this.quoteData = quoteRes.data
        this.stockPeers = peerRes.data
        this.volumeByVenue = volumeByVenueRes.data
        this.loaded = true
      }))
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
</style>