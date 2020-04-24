const batchSize = 200,
    maxQueueSize = 10000

class HorizonStreamer {
    constructor(horizonCallBuilder, cursor, onNewRecord, onError) {
        if (typeof horizonCallBuilder.call !== 'function' || typeof horizonCallBuilder.cursor !== 'function')
            throw new TypeError(`Invalid horizonCallBuilder argument - CallBuilder instance expected.`)
        if (typeof horizonCallBuilder.call !== 'function' || typeof horizonCallBuilder.cursor !== 'function')
            throw new TypeError(`Invalid horizonCallBuilder argument - CallBuilder instance expected.`)
        this.callBuilder = horizonCallBuilder
        if (cursor) {
            this.cursor = cursor
            this.callBuilder.cursor(cursor)
        }
        this.callBuilder.limit(batchSize)
        this.queue = []
        this.onNewRecord = onNewRecord
        if (onError) {
            this.onError = onError
        }
    }

    cursor

    onNewRecord

    streamCloseHandle = null

    queue = []

    busy = false

    get pendingCount() {
        return this.queue.length
    }

    onError = function (e) {
        console.error(e)
    }

    processEntry(entry) {
        if (!entry)
            return this.onError(new Error('Invalid entry fetched from Horizon'))
        if (entry.paging_token > this.cursor) {
            this.cursor = entry.paging_token
        }
        this.queue.push(entry)
        this.notify()
    }

    notify() {
        if (this.busy || !this.streamCloseHandle) return
        this.busy = true
        const entry = this.queue.shift()
        if (entry === undefined) {
            //the queue is empty
            this.busy = false
            return
        }
        let response = this.onNewRecord(entry)
        //we imply that the handler returns a promise, but if not - we just use the empty one
        if (!(response instanceof Promise))
            response = Promise.resolve()
        //once the promise is resolved, we are ready to resume
        response
            .catch(() => {
            })
            .then(() => {
                this.busy = false
                this.notify()
            })
    }

    startStreaming() {
        this.streamCloseHandle = this.callBuilder.cursor(this.cursor).stream({
            onmessage: entry => this.processEntry(entry),
            onerror: e => this.onError(e)
        })
    }

    stopStreaming() {
        if (this.streamCloseHandle) {
            this.streamCloseHandle()
            this.streamCloseHandle = null
        }
    }

    finalize() {
        this.stopStreaming()
        this.queue = []
    }
}

function streamer({callBuilder, cursor, onNewRecord, onError}) {
    const hs = new HorizonStreamer(callBuilder, cursor, onNewRecord, onError)
    hs.startStreaming()
    return hs.finalize.bind(hs)
}

module.exports = streamer