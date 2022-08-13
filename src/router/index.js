import { createRouter , createWebHashHistory} from 'vue-router'

const Home = () =>import('../view/Home')
const About = () =>import('../view/About')

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/home",
      component:Home
    },
    {
      path: "/about",
      component:About
    }
  ]
})