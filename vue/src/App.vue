<template>
  <div id="app">
    <LineChart/>
  </div>
</template>

<script>
import LineChart from './components/LineChart'

export default {
  name: 'app',
  components: {
    LineChart
  },
  mounted () {
    this.$appState.getChartData()
    this.$appState.getChartData('googl')
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
