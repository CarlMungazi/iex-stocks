<script>
import { Line, mixins} from 'vue-chartjs'

export default {
  name: 'LineChart',
  extends: Line,
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
        responsive: true,
        maintainAspectRatio: true
      }
    }
  },
  mounted () {
    this.renderChart(this.chartData, this.options)
  },
}
</script>