import { useEffect, useRef } from 'react'

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