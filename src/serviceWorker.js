function sortDescendingTimestamp(a, b) {
    return b.timestamp - a.timestamp
}

function isSameAddress(address0, address1) {
    return address0.toLowerCase() === address1.toLowerCase()
}

export const sortTransactions = (displayList, filterList) => {
    if (filterList && filterList.length > 0) {
        displayList = displayList.filter(action => {
            for (var selectedToken of filterList) {
                if (isSameAddress(action.token0, selectedToken.address) || 
                    isSameAddress(action.token1, selectedToken.address)) {
                    return true
                }
            }
            return false
        })
    }
    displayList = displayList.sort(sortDescendingTimestamp)
    return displayList
}