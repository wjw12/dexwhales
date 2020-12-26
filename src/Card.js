import { useEffect, useState } from 'react'
import { markets, DEFAULT_MARKET, WHALE } from './const'
import { getTimeString } from './utils'
import uniswap_logo from './uniswap.png'
import sushiswap_logo from './sushiswap.png'

function numberOfWhales(price) {
    if (price < 80000) return 1
    if (price < 300000) return 2
    if (price < 1000000) return 3
    return 4
}

function formatNumber(x) {
    x = x.toFixed(2)
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
}

function formatTx(hash) {
    return hash.substring(0, 12) + "..."
}

function getTokenLink(address) {
    return "https://etherscan.io/token/" + address
}

function getTxLink(hash) {
    return "https://etherscan.io/tx/" + hash
}



export default function Card(props) {
    var action = props.action
    var whales = ""
    for (var i = 0; i < numberOfWhales(action.dollarValue); ++i) {
        whales += WHALE
    }


    var action_type = action.name // string: Swap, AddLiquidity, RemoveLiquidity
    var conjunct = " For "
    if (action_type === "AddLiquidity") {
        action_type = "Add Liquidity"
        conjunct = " And "
    }
    else if (action_type === "RemoveLiquidity") {
        action_type = "Remove Liquidity"
        conjunct = " And "
    }

    var token0Link = getTokenLink(action.token0)
    var token1Link = getTokenLink(action.token1)
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

    var logo = uniswap_logo
    var marketName
    switch (action.market) { // could be undefined
        case 'sushiswap':
            logo = sushiswap_logo
            marketName = "Sushiswap"
            break
        default:
            logo = uniswap_logo
            marketName = 'Uniswap'
            break
    }


    return(
        <>
        <div style={{
            width: '55%', 
            margin: 'auto'
            }}>
            <p style={{fontSize: 11, color: '#442211', textAlign: 'left', marginTop: 30, marginBottom: 4}}>
                {getTimeString(action.timestamp)}
                <a href={getTxLink(action.hash)} style={{color: 'gray'}}>{" tx:" + formatTx(action.hash)}</a>
            </p>
            <div style={{
                display: 'flex',
                alignContent: 'center',
                justifyContent: 'center'
            }}>

                <p style={{marginTop: 5, marginBottom: 5}}>
                    {whales + " " + action_type + " " + formatNumber(action.token0Amount) + " "} 
                    <a href={token0Link}>{action.token0Name}</a> {price0}
                    {conjunct}
                    {formatNumber(action.token1Amount) + " "}
                    <a href={token1Link}>{action.token1Name}</a> {price1}
                    {" at " + marketName}
                    
                </p>

                <img src={logo} style={{
                    marginTop: 'auto',
                    marginBottom: 'auto',
                    width: '35px',
                    height: '35px',
                    display: 'inline-block'
                }}
                ></img>
            </div>
            

        </div>

        </>
    )
}