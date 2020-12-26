import react, { useEffect, useState } from 'react'
import Select from 'react-select';
import Loader from 'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import { getTimeString, useInterval } from './utils'
import Card from './Card'
import Tip from './Tip'
import { TITLE, API_URL, INTERVAL, action_types, markets, PINK } from './const'
import './App.css';

function buildQuery(queryParams) {
  var query = "?"
  for (var key of Object.keys(queryParams)) {
    query = query + key + `=${queryParams[key]}`
  }
  return API_URL + query
}

function sortDescendingTimestamp(a, b) {
  return b.timestamp - a.timestamp
}

// fetch transactions order by timestamp, descending order
async function fetchData(from_timestamp, to_timestamp) {
  var params = {}
  if (from_timestamp) params.from_timestamp = from_timestamp
  if (to_timestamp) params.to_timestamp = to_timestamp
  var res = await fetch(buildQuery(params))
  if (!res.ok) {
    console.log(`error: ${res.status}`)
    return {
      success: false,
      swaps: [],
      addLP: [],
      removeLP: [],
    }
  }

  var result = await res.json()
  console.log("count:", result.Count)
  var actions = result.Items
  var swaps = []
  var addLP = []
  var removeLP = []

  for (var action of actions) {
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

  return {
    success: true,
    swaps: swaps,
    addLP: addLP,
    removeLP: removeLP,
  }

}

var defaultDisplayConfig = {
  SWAPS: true,
  ADD_LP: false,
  REMOVE_LP: false
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
  const [swaps, setSwaps] = useState([])
  const [addLP, setAddLP] = useState([])
  const [removeLP, setRemoveLP] = useState([])
  const [actionList, setActionList] = useState([])
  const [loading, setLoading] = useState(false)
  const [displayConfig, setDisplayConfig] = useState(defaultDisplayConfig)

  function refreshData() {
    if (loading) return
    setLoading(true)
    
    console.log('refreshData')
    fetchData(lastTime).then(data => {
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
      var _swaps = swaps.concat(data.swaps)
      var _addLP = addLP.concat(data.addLP)
      var _removeLP = removeLP.concat(data.removeLP)

      setSwaps(_swaps)
      setAddLP(_addLP)
      setRemoveLP(_removeLP)

      refreshDisplay()
    })
  }
  
  const refreshDisplay = (config) => {
    if (!config) config = displayConfig
    var displayList = []
    if (config.SWAPS) displayList = displayList.concat(swaps)
    if (config.ADD_LP) displayList = displayList.concat(addLP)
    if (config.REMOVE_LP) displayList = displayList.concat(removeLP)
    displayList = displayList.sort(sortDescendingTimestamp)
    setActionList(displayList)
  }

  useEffect(() => {
    refreshDisplay()
  }, [swaps, addLP, removeLP])

  useEffect(() => {
    document.title = TITLE
    refreshData()
  }, [])

  useInterval(refreshData, INTERVAL)


  return (
    <>
      <div className="App">
        <h1>
          {TITLE}
        </h1>

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

        { loading &&
          <Loader
            type="Audio"
            color={PINK}
            height={16}
            width={16}
            style={{
              position: 'fixed',
              left: '16px',
              top: '16px',
              display: 'inline-block'
            }}
          />
        }

        <p style={{
          position: 'fixed',
          textAlign: 'left',
          left: '4px',
          top: '4px',
          marginTop: 0,
          marginLeft: 0,
          fontSize: '10px'
        }}>Last Updated at {getTimeString(lastTime)}</p>

        {actionList.map(action => {
          return (
            <Card action={action}></Card>
          )
        })}

      </div>

      <Tip></Tip>

    </>
  );
}

export default App;
