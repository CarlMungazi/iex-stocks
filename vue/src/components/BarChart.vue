<script>
import { Bar, mixins} from 'vue-chartjs'

export default {
  name: 'BarChart',
  extends: Bar,
  mixins: [mixins.reactiveProp],
  // props: {
  //   chartData: {
  //     type: Array,
  //     required: false
  //   },
  //   chartLabels: {
  //     type: Array,
  //     required: true
  //   }
  // },
  data () {
    return {
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            },
            gridLines: {
              display: true
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