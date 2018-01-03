<script>
import { Bar, mixins} from 'vue-chartjs'

export default {
  name: 'BarChart',
  extends: Bar,
  mixins: [mixins.reactiveProp],
  data () {
    return {
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false
            },
            gridLines: {
              display: false
            }
          }],
          xAxes: [ {
            gridLines: {
              display: false
            }
          }]
        },
        legend: {
          display: false,
        },
        responsive: false,
        maintainAspectRatio: false
      }
    }
  },
  mounted () {
    // this.renderChart({
    //   labels: this.chartLabels,
    //   datasets: [
    //     {
    //       label: 'Close',
    //       borderColor: '#249EBF',
    //       pointBackgroundColor: 'white',
    //       borderWidth: 1,
    //       pointBorderColor: '#249EBF',
    //       backgroundColor: 'transparent',
    //       data: this.chartData
    //     }
    //   ]
    // }, this.options)
    this.renderChart(this.chartData, this.options)
  },
}
</script>