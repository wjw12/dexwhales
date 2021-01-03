import { useEffect, useState, useRef } from 'react'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import Loader from 'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import { getTimeString, useInterval, getNotificationDescription } from './utils'
import Card from './Card'
import Tip from './Tip'
import { TITLE, API_URL, INTERVAL, action_types, markets, PINK } from './const'
import './App.css';
import uniswap_logo from './uniswap.png'
import sushiswap_logo from './sushiswap.png'
import oneinch_logo from './1inch.png'


import worker from 'workerize-loader!./serviceWorker'; // eslint-disable-line import/no-webpack-loader-syntax

const workerInstance = worker()

const animatedComponents = makeAnimated();

function buildQuery(queryParams) {
  var query = "?"
  for (var key of Object.keys(queryParams)) {
    query = query + key + `=${queryParams[key]}`
  }
  return API_URL + query
}

// fetch transactions order by timestamp, descending order
async function fetchData(from_timestamp, to_timestamp) {
  var params = {}
  if (from_timestamp) params.from_timestamp = from_timestamp
  if (to_timestamp) params.to_timestamp = to_timestamp

  // params.debug = true
  var res = await fetch(buildQuery(params))
  if (!res.ok) {
    console.error(`error: ${res.status}`)
    return {
      success: false,
      swaps: [],
      addLP: [],
      removeLP: [],
    }
  }

  var result = await res.json()

  var swaps = []
  var addLP = []
  var removeLP = []
  var latestTime = null
  for (var actionsWithinBlock of result) {
    var actions = JSON.parse(actionsWithinBlock)
    for (var action of actions) {
      if (!latestTime || action.timestamp > latestTime) latestTime = action.timestamp

      switch (action.name) {
        case 'Swap':
          swaps.push(action)
          break
        case 'AddLiquidity':
          addLP.push(action)
          break
        case 'RemoveLiquidity':
          removeLP.push(action)
          break
        default:
          break
      }
    }
  }

  return {
    success: true,
    swaps: swaps,
    addLP: addLP,
    removeLP: removeLP,
    latestTime: latestTime
  }

}

var defaultDisplayConfig = {
  SWAPS: true,
  ADD_LP: false,
  REMOVE_LP: false,
  NEW_PAIR: false
}

for (var key of Object.keys(markets)) {
  defaultDisplayConfig[key] = true
}

// https://github.com/JedWatson/react-select/blob/master/docs/styled-components.js
const Note = ({ Tag = 'div', ...props }) => (
  <Tag
    css={{
      color: 'hsl(0, 0%, 40%)',
      display: 'inline-block',
      fontSize: 12,
      fontStyle: 'italic',
      marginTop: '1em',
    }}
    {...props}
  />
);

// https://react-select.com/home
const Checkbox = props => <input type="checkbox" {...props} />;

function App() {
  const [lastTime, setLastTime] = useState(0)
  const [txData, setTxData] = useState({
    swaps: [],
    addLP: [],
    removeLP: []
  })
  const [actionList, setActionList] = useState([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [displayConfig, setDisplayConfig] = useState(defaultDisplayConfig)
  const [tokenList, setTokenList] = useState([])
  const [selectedTokens, setSelectedTokens] = useState(JSON.parse(localStorage.getItem('selectedTokens')) || [])
  const [notify, setNotify] = useState(false)
  const latestTxTime = useRef(0)
  // const [clientId, setClientId] = useState(null)

  // function initClient() {
  //   fetch(API_URL, { method: 'POST' })
  //   .then(res => res.json())
  //   .then(res => {
  //     setClientId(res)
  //   })
  // }

  const toggleNotification = () => {
    if (notify) {
      // turn off notification
      setNotify(false)
    }
    else {
      // start notification
      Notification.requestPermission().then(status => {
        if (status === 'granted') {
          setNotify(true)
        }
      })
      .catch(_ => {
        alert('Notification is not supported by the browser')
      })
    }
  }

  const createNotification = (action) => {
    var description = getNotificationDescription(action)
    var img = uniswap_logo
    switch (action.market) { // could be undefined
      case 'sushiswap':
          img = sushiswap_logo
          break
      case '1inch':
          img = oneinch_logo
          break
      default:
          img = uniswap_logo
          break
    }
    console.log(description)
    var notification = new Notification('New Whale Transaction', { body: description, icon: img})
  }

  const isTokenSelected = (address) => {
    if (tokenList.length == 0) return true
    address = address.toLowerCase()
    for (var tokenData of tokenList) {
      if (address === tokenData.address) {
        return true
      }
    }
    return false
  }

  const refreshData = () => {
    if (loading) return
    setLoading(true)
    
    // console.log('refreshData last sync time=',lastTime)
    fetchData(latestTxTime.current).then(data => {
      setLoading(false)
      if (data.success) {
        var now = Math.floor(Date.now() / 1000)
        setLastTime(now + 1)
      }
      else {
        // retry
        setTimeout(() => { refreshData()}, 1000)
        return
      }
      if (data.swaps.length == 0 && data.addLP.length == 0 && data.removeLP.length == 0) {
        return
      }

      if (notify && latestTxTime.current > 0) {
        if (displayConfig.SWAPS && data.swaps.length > 0) {
          for (var action of data.swaps) {
            if (isTokenSelected(action.token0) || isTokenSelected(action.token1)) {
              createNotification(action)
            }
          }
        }
        if (displayConfig.ADD_LP && data.addLP.length > 0) {
          for (var action of data.addLP) {
            if (isTokenSelected(action.token0) || isTokenSelected(action.token1)) {
              createNotification(action)
            }
          }
        }
        if (displayConfig.REMOVE_LP && data.removeLP.length > 0) {
          for (var action of data.removeLP) {
            if (isTokenSelected(action.token0) || isTokenSelected(action.token1)) {
              createNotification(action)
            }
          }
        }

        // for new pairs, ignore the token filter
        if (displayConfig.NEW_PAIR && data.addLP.length > 0) {
          for (var action of data.addLP) {
            if (action.newPair) {
              createNotification(action)
            }
          }
        }
      }

      if (data.latestTime) {
        latestTxTime.current = data.latestTime + 1
        // console.log('latest tx time', data.latestTime)
      }

      var _swaps = txData.swaps.concat(data.swaps)
      var _addLP = txData.addLP.concat(data.addLP)
      var _removeLP = txData.removeLP.concat(data.removeLP)


      setTxData({
        swaps: _swaps,
        addLP: _addLP,
        removeLP: _removeLP
      })
    })
    .catch (e => {
      setTimeout(() => { refreshData()}, 1000)
    })
  }
  
  const refreshDisplay = (config) => {
    if (!config) config = displayConfig
    var displayList = []
    if (config.SWAPS) displayList = displayList.concat(txData.swaps)
    if (config.ADD_LP) displayList = displayList.concat(txData.addLP)
    if (config.REMOVE_LP) displayList = displayList.concat(txData.removeLP)
    if (config.NEW_PAIR) displayList = displayList.concat(txData.addLP.filter(action => { return action.newPair }))
    if (displayList.length == 0) {
      setActionList(displayList) // empty
      return
    }
    setProcessing(true) // begin processing transaction data
    workerInstance.sortTransactions(displayList, selectedTokens).then(sortedList => {
      setActionList(sortedList)
      setProcessing(false)
    })
    // displayList = displayList.sort(sortDescendingTimestamp)
    // setActionList(displayList)
  }

  const loadTokenList = () => {
    fetch(buildQuery({token_list: true}))
    .then(res => res.json())
    .then(result => {
       setTokenList(result)
    })
  }

  useEffect(() => {
    refreshDisplay()
  }, [txData, selectedTokens])

  useEffect(() => {
    localStorage.setItem('selectedTokens', JSON.stringify(selectedTokens))
  }, [selectedTokens])

  useEffect(() => {
    // on page loaded
    document.title = TITLE
    refreshData()
    loadTokenList()
    // initClient()
  }, [])

  // useEffect(() => {
  //   refreshData()
  // }, [clientId])

  useInterval(refreshData, INTERVAL)


  return (
    <>
      <div className="App">
        <h1>
          {TITLE}
        </h1>

        <div 
          style={{
            width: '55%', 
            margin: 'auto'
        }}>
        <p style={{
          fontSize: '10px',
          textAlign: 'left'
        }}>Last Updated at {getTimeString(lastTime)} {'  '}
         <a  href="/#" onClick={() => toggleNotification()}>Notification {notify ? 'On' : 'Off'}</a> 
        </p>
        
        <Select
          closeMenuOnSelect={false}
          components={animatedComponents}
          placeholder={"Select tokens..."}
          isMulti
          options={tokenList}
          defaultValue={selectedTokens}
          getOptionLabel={tokenData => `${tokenData.symbol}`}
          getOptionValue={tokenData => `${tokenData.symbol}`}
          onChange={action => setSelectedTokens(action)}
        />
        </div>


        <Note Tag="label">
          <Checkbox
            checked={displayConfig.SWAPS}
            onChange={() => { 
              var newConfig = {...displayConfig, SWAPS: !displayConfig.SWAPS}
              setDisplayConfig(newConfig); 
              refreshDisplay(newConfig); 
            }}
            id="cypress-single__clearable-checkbox"
          />
          SWAPS
        </Note>
        <Note Tag="label" style={{ marginLeft: '1em' }}>
          <Checkbox
            checked={displayConfig.ADD_LP}
            onChange={() => { 
              var newConfig = {...displayConfig, ADD_LP: !displayConfig.ADD_LP}
              setDisplayConfig(newConfig); 
              refreshDisplay(newConfig); 
            }}
            id="cypress-single__searchable-checkbox"
          />
          ADD LIQUIDITY
        </Note>
        <Note Tag="label" style={{ marginLeft: '1em' }}>
          <Checkbox
            checked={displayConfig.REMOVE_LP}
            onChange={() => { 
              var newConfig = {...displayConfig, REMOVE_LP: !displayConfig.REMOVE_LP}
              setDisplayConfig(newConfig); 
              refreshDisplay(newConfig); 
            }}
            id="cypress-single__searchable-checkbox"
          />
          REMOVE LIQUIDITY
        </Note>
        <Note Tag="label" style={{ marginLeft: '1em' }}>
          <Checkbox
            checked={displayConfig.NEW_PAIR}
            onChange={() => { 
              var newConfig = {...displayConfig, NEW_PAIR: !displayConfig.NEW_PAIR}
              setDisplayConfig(newConfig); 
              refreshDisplay(newConfig); 
            }}
            id="cypress-single__searchable-checkbox"
          />
          NEW PAIRS
        </Note>

        { loading &&
          <Loader
            type="Audio"
            color={PINK}
            height={16}
            width={16}
            style={{
              position: 'fixed',
              left: '8px',
              top: '8px',
              display: 'inline-block'
            }}
          />
        }

        {actionList.map(action => {
          return (
            <Card action={action}></Card>
          )
        })}

        { (!loading && !processing && actionList.length < 5) &&
          <div style={{
            width: '55%', 
            margin: 'auto',
            fontSize: '15px'
          }}>
            <p>No more whale activities within the past 24 hours</p>
          </div>

        }

      </div>

      <Tip></Tip>

    </>
  );
}

export default App;
