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
      <h1 class="title" v-if="loaded">{{ companyName }}></h1>
      <div class="Chart__container" v-if="loaded">
        <div class="Chart__title">
          Historically adjusted market-wide data
          <hr>
        </div>
        <div class="Chart__content">
          <line-chart v-if="loaded" :chart-data="chartData" :chart-labels="labels"></line-chart>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import LineChart from '@/components/LineChart'

export default {
  name: 'StockView',
  components: {
    LineChart
  },
  props: {},
  data () {
    return {
      stock: null,
      chartData: [],
      companyName: '',
      quoteData: [],
      loaded: false,
      labels: [],
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
    requestData () { 
      // TO DO: create a nested promise which also gets quote data https://api.iextrading.com/1.0/stock/${sym}/quote
      if (this.stock == null || this.stock === '' || this.stock === 'undefined') {
        this.showError = true
        return 
      }
      this.resetState()
      axios.get(`https://api.iextrading.com/1.0/stock/${this.stock}/chart/1m`)
        .then(res => {
          console.log(res.data)
          this.chartData = res.data.map(stock => stock.close)
          this.labels = res.data.map(stock => stock.label)
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
</style>