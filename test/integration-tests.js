const {Server} = require('stellar-sdk'),
    streamer = require('../src/index')

describe('Integration tests', function () {
    it('Streams effects', function (done) {
        const horizon = new Server('https://horizon.stellar.org/'),
            callBuilder = horizon.effects()

        const expectedPagingTokens = ['12884905986-1', '12884905986-2']

        const finalize = streamer({
            callBuilder,
            cursor: '12884905985-3',
            onNewRecord: function (entry) {
                const expectedToken = expectedPagingTokens.shift()
                if (!expectedToken) {
                    finalize()
                    return done()
                }
                expect(entry.paging_token).to.be.equal(expectedToken)
            }
        })
    })

})