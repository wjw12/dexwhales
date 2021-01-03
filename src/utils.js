import { useEffect, useRef } from 'react'
import { WHALE, WATER, REMOVE_WATER, CREATE_NEW_PAIR } from './const'

export function getTimeString(blockTimestamp) {
    blockTimestamp = parseInt(blockTimestamp) * 1000
    var date = new Date(blockTimestamp)
    return date.toLocaleString()
}

export function useInterval(callback, delay) {
    const savedCallback = useRef()

    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    useEffect(() => {
        function tick() {
            savedCallback.current()
        }

        if (delay !== null) {
            const id = setInterval(tick, delay)
            return () => {
                clearInterval(id)
            }
        }
    }, [callback, delay])
}

export function formatNumber(x) {
    x = x.toFixed(2)
    return x.toLocaleString()// toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
}

export function formatTx(hash) {
    return hash.substring(0, 12) + "..."
}

export function getTokenLink(address) {
    return "https://etherscan.io/token/" + address
}

export function getTxLink(hash) {
    return "https://etherscan.io/tx/" + hash
}

export function numberOfWhales(action) {
    var value = action.dollarValue
    var tier = action.tier
    if (tier == 1) {
        if (value < 250000) return 1
        if (value < 400000) return 2
        if (value < 1000000) return 3
        return 4
    }
    else {
        if (value < 100000) return 1
        if (value < 300000) return 2
        if (value < 800000) return 3
        return 4
    }
}

export function getNotificationDescription(action) {
    var action_type = action.name // string: Swap, AddLiquidity, RemoveLiquidity
    var whales = ""
    var emoji, conjunct
    switch (action_type) {
        case 'Swap':
            conjunct = " For "
            action_type = "Swap"
            emoji = WHALE
            break
        case 'AddLiquidity':
            conjunct = " And "
            action_type = "Add Liquidity"
            emoji = WATER
            break
        case 'RemoveLiquidity':
            conjunct = " And "
            emoji = REMOVE_WATER
            action_type = "Remove Liquidity"
            break
    }
    
    if (action.newPair) {
        emoji = CREATE_NEW_PAIR
        action_type = "Create New Pair"
    }
    for (var i = 0; i < numberOfWhales(action); ++i) {
        whales += emoji
    }

    var price0 = action.token0Price || null
    var price1 = action.token1Price || null
    if (price0 && !isNaN(price0)) {
        price0 = ` (\$${formatNumber(price0)})`
    }
    else price0 = null

    if (price1 && !isNaN(price1)) {
        price1 = ` (\$${formatNumber(price1)})`
    }
    else price1 = null

    var marketName
    switch (action.market) { // could be undefined
        case 'sushiswap':
            marketName = "Sushiswap"
            break
        default:
            marketName = 'Uniswap'
            break
    }

    return whales + ' ' + action_type + ' ' + formatNumber(action.token0Amount) + ' ' + action.token0Name + (price0 ? price0 : '') + 
      conjunct + formatNumber(action.token1Amount) + ' ' + action.token1Name + (price1 ? price1 : '') + ' at ' + marketName
}