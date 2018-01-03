import Vue from 'vue'
import Router from 'vue-router'
import StockView from '@/components/StockView'


Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'StockView',
      component: StockView
    },
    {
      path: '/:stock',
      component: StockView
    }
  ]
})