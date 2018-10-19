/**
 * Dev Steps:
 * Run `npm run dev`
 * Run `npm run dev-client`
 */
import * as express from 'express'
import fetch from 'node-fetch';
const storage = require('node-persist');
import buildGatsbySourceData  from "./lib/Campaigns";

class App {
  public express
  
  constructor () {
    this.express = express()
    this.mountRoutes()
  }

  private mountRoutes (): void {
    const router = express.Router()
    router.get('/', (req, res) => {
      fetch('http://quotes.rest/qod.json')
        .then(x => x.json())
        .then(x => {
          res.set('html')
          res.send(`<p><i>"${x.contents.quotes[0].quote}</i>...."</p><p>- ${x.contents.quotes[0].author}</p>`)
        })
        .catch(e => {
          res.set('html')
          res.send('<p><i>"If you don\'t have confidence, you\'ll always find a way not to win..."</i></p><p>- Carl Lewis</p>')
        })
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
      const clientId = '2213485038928193'
      const appSecret = 'c7c1a3645065e59a912cbe12308562ed'
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

    router.get("/A203003943948", (req, res) => {
      console.log(typeof buildGatsbySourceData)
      console.log('Building source datas...')
      const run = async function() {
        const sourceData = await buildGatsbySourceData();
        res.send(sourceData)
      }
      run()  
    })

    router.get("/set-acct/:acctId", (req, res) => {
      const run = async function() {
        await storage.init();
        await storage.setItem('fbauth-acctid', req.params.acctId)
        const setAccount = await storage.getItem('fbauth-acctid')
        if(!!setAccount){
          res.type('html')
          res.send('Success! The current account is: '+setAccount)
        }else{
          res.type('html')
          res.send('There is no account set.  Please visit /set-acct/{account ID} in browser to set it.')
        }
      }
      run()
    })

    router.get("/set-acct", (req, res) => {
      const run = async function() {
        await storage.init();
        const existingAcct = await storage.getItem('fbauth-acctid')
        if(!!existingAcct){
          res.type('html')
          res.send('The current account is: '+existingAcct)
        }else{
          res.type('html')
          res.send('There is no account set.  Please visit /set-acct/{account ID} in browser to set it.')
        }
      }
      run()
    })

    router.get("/set-hook/build", (req, res) => {
      const run = async function() {
        await storage.init();
        if(!!req.query.url)
          await storage.setItem('set-build-www', req.query.url)
        const hook = await storage.getItem('set-build-www')
        if(!!hook){
          res.type('html')
          res.send('The current build hook URL is set: '+hook)
        }else{
          res.type('html')
          res.send('There is no build hook set.  Please visit <strong>/set-hook/build/?url=NETLIFY_BUILD_HOOK_URL</strong> in browser to set it.')
        }
      }
      run()
    })

    router.get("/hook/build", (req, res) => {
      const run = async function() {
        await storage.init();
        const hookUrl = await storage.getItem('set-build-www')
        if(!!hookUrl){
          fetch(hookUrl,{
              method: 'POST'
            })
            .then((response) => {
              res.send(`Build hook processed!  The request has been sent and received by the deployment system 
                        and it should take approximately 1 minute to fully rebuild the site.  Check the Netlify 
                        admin panel under site > "deploys" for the status of the build.`)
            })
            .catch(e => {
              res.send('Build Hook Error', e.message)
            })
        }else{
          res.type('html')
          res.send('There is no build hook set.  Please visit <strong>/set-hook/build/?url=NETLIFY_BUILD_HOOK_URL</strong> in browser to set it.')
        }
      }
      run()
    })

    router.get('/rebuild', (req, res) => {
      res.redirect('/hook/build')
    })

    this.express.use('/', router)
  }
}

export default new App().express
