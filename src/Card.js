import { useEffect, useState } from 'react'
import { WHALE, WATER, REMOVE_WATER, CREATE_NEW_PAIR } from './const'
import { getTimeString, numberOfWhales, formatNumber, formatTx, getTxLink, getTokenLink } from './utils'
import uniswap_logo from './uniswap.png'
import sushiswap_logo from './sushiswap.png'
import oneinch_logo from './1inch.png'


export default function Card(props) {
    var action = props.action
    var action_type = action.name // string: Swap, AddLiquidity, RemoveLiquidity
    var whales = ""
    var emoji, conjunct
    switch (action_type) {
        case 'Swap':
            conjunct = " For "
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
        case '1inch':
            logo = oneinch_logo
            marketName = "1inch"
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
                <a href={getTxLink(action.hash) } target={"_blank"} style={{color: 'gray'}}>{" tx:" + formatTx(action.hash)}</a>
            </p>
            <div style={{
                display: 'flex',
                alignContent: 'center',
                justifyContent: 'center'
            }}>

                <p style={{marginTop: 5, marginBottom: 5}}>
                    {whales + " " + action_type + " " + formatNumber(action.token0Amount) + " "} 
                    <a href={token0Link} target={"_blank"}>{action.token0Name}</a> {price0}
                    {conjunct}
                    {formatNumber(action.token1Amount) + " "}
                    <a href={token1Link} target={"_blank"}>{action.token1Name}</a> {price1}
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