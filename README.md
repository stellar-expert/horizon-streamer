# Horizon Streamer

Streaming wrapper for Stellar Horizon server.


## Usage

Install the package. 

```
npm install -S @stellar-expert/horizon-streamer
```

Stream effects.

```js
import horizonStreamer from '@stellar-expert/horizon-streamer'
import {Server} from 'stellar-sdk'

const horizon = new Server('https://horizon.stellar.org/')

const finalize = streamer({
    //any horizon call builder which supports streaming
    callBuilder: horizon.effects(),
    //cursor to start from, live blank to stream from the start or use 'now' to start from the most recent record 
    cursor: '12884905985-3', 
    //callback handler that returns fetched entries one by one
    onNewRecord: function (entry) {
        console.log(entry)
        return Promise.resolve()
    }
})

//destroy the streamer when finished
setTimeout(() => finalize(), 1000)
```

## Tests

```
npm run test
```