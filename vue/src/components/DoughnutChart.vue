<script>
import { Doughnut, mixins} from 'vue-chartjs'

export default {
  name: 'DoughnutChart',
  extends: Doughnut,
  mixins: [mixins.reactiveProp],
  data () {
    return {
      options: {
        responsive: false, 
        maintainAspectRatio: false
      }
    }
  },
  mounted () {
    this.renderChart(this.chartData, this.options)
  },
}
</script>