const context = typeof window !== 'undefined' ? window : global
context.chai = require('chai')
context.expect = global.chai.expect
