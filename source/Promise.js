// 参考 https://juejin.im/post/5b2f02cd5188252b937548ab
class Promise {
    constructor(executor) {
        this.state = 'pending'
        this.value = undefined
        this.reason = undefined

        let resolve = value => {
            if (this.state === 'pending') {
                this.state = 'fulfilled'
                this.value = value
            }
        }

        let reject = reason => {
            if (this.state === 'pending') {
                this.state = 'rejected'
                this.reason = reason
            }
        }

        try {
            executor(resolve, reject)
        } catch(err) {
            reject(err)
        }
    }

    then(onFulfilled, onRejected) {
        if (this.state === 'fulfilled') {
            onFulfilled(this.value)
        }

        if (this.state === 'rejected') {
            onRejected(this.reason)
        }
    }
}

// Test Demo
const promise = new Promise((resolve, reject) => {
    setTimeout(function(){
        resolve(42)
    }, 1000)
})

promise.then(res => {
    console.log('then ' + res)
})