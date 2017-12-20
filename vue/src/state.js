import axios from 'axios'

const Data = {
	chartData: [],
	getChartData (sym = 'aapl') { // 
		axios.get(`https://api.iextrading.com/1.0/stock/${sym}/chart/1m`)
        .then(response => {
          Data.chartData = response.data
        })
        .catch(error => {
          console.error(error)
        })
	}
}

export default Data