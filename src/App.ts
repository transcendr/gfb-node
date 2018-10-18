/**
 * Dev Steps:
 * Run `npm run dev`
 * Run `npm run dev-client`
 */
import * as express from 'express'
import fetch from 'node-fetch';
const storage = require('node-persist');

class App {
  public express
  
  constructor () {
    this.express = express()
    this.mountRoutes()
  }

  private mountRoutes (): void {
    const router = express.Router()
    router.get('/', (req, res) => {
      res.redirect('https://facebook.com')
    })

    router.get('/oauth', (req, res) => {
      const protocol = req.get('host').includes('localhost') ? 'http' : 'https'
      const redirect = protocol + "://" + req.get('host') + '/oauth-cb/'
      const reauthUrl = protocol + "://" + req.get('host') + '/reauth/'
      const runAuth = async function() {
        await storage.init();
        const existingToken = await storage.getItem('fbauth-ll-token')
        if(!!existingToken){
          res.type('html')
          res.send('A saved token exists. <br /><a href="'+reauthUrl+'">Click here to generate a new token</a>')
        }else{
          res.redirect(`https://www.facebook.com/v3.1/dialog/oauth?client_id=2806157496076867&redirect_uri=${redirect}&scope=ads_management`)
        }
      }
      runAuth()
    })

    router.get('/reauth', (req, res) => {
      const protocol = req.get('host').includes('localhost') ? 'http' : 'https'
      const redirect = protocol + "://" + req.get('host') + '/oauth-cb/'
      res.redirect(`https://www.facebook.com/v3.1/dialog/oauth?client_id=2806157496076867&redirect_uri=${redirect}&scope=ads_management`)
    })

    router.get('/oauth-cb', (req, res) => {
      const clientId = '2806157496076867'
      const appSecret = '8dfd4059c0e83a75cd778ee9a7c5ec1f'
      const protocol = req.get('host').includes('localhost') ? 'http' : 'https'
      const redirect = protocol + "://" + req.get('host') + '/oauth-cb/'
      const retryUrl = protocol + "://" + req.get('host') + '/oauth/'
      const authCode = req.query.code
      let longLiveTokenUrl = `https://graph.facebook.com/v3.1/oauth/access_token?client_id=${clientId}&redirect_uri=${redirect}&client_secret=${appSecret}&code=${authCode}`
      if(!!authCode){
        // res.send(longLiveTokenUrl)
        const runAuth = async function() {
          fetch(longLiveTokenUrl)
            .then(response => response.json())
            .then(response => {
              const saveToken = async function() {
                await storage.init();
                await storage.setItem('fbauth-ll-token',response.access_token)
                const savedToken = await storage.getItem('fbauth-ll-token')
                if(!!savedToken){
                  res.type('html')
                  res.send('Authentication successful. You can now close this window. (Token: '+savedToken+') <br /><a href="'+retryUrl+'">Click here to generate a new token</a>')
                }else{
                  res.type('html')
                  res.send('There was an error saving the access token. Please retry by <a href="'+retryUrl+'">clicking here</a>')
                }
              }
              saveToken()
            })
        }
        // Run
        runAuth()
      }else{
        res.send('Authorization, cancelled.  Please retry.')
      }
    })

    router.get("/llat-cb", (req, res) => {
      res.send(JSON.stringify(req.query))
    })

    this.express.use('/', router)
  }
}

export default new App().express
