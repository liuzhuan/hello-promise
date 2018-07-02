// 参考 https://juejin.im/post/5b2f02cd5188252b937548ab
class Promise {
    constructor(executor) {
        this.state = 'pending'
        this.value = undefined
        this.reason = undefined

        this.onResolvedCallbacks = []
        this.onRejectedCallbacks = []

        let resolve = value => {
            if (this.state === 'pending') {
                this.state = 'fulfilled'
                this.value = value
                this.onResolvedCallbacks.forEach(fn => fn())
            }
        }

        let reject = reason => {
            if (this.state === 'pending') {
                this.state = 'rejected'
                this.reason = reason
                this.onRejectedCallbacks.forEach(fn => fn())
            }
        }

        try {
            executor(resolve, reject)
        } catch(err) {
            reject(err)
        }
    }

    then(onFulfilled, onRejected) {
        let promise2 = new Promise((resolve, reject) => {
            if (this.state === 'fulfilled') {
                let x = onFulfilled(this.value)
                // resolvePromise 函数，处理自己 return 的 promise 和默认的 promise2 的关系
                resolvePromise(promise2, x, resolve, reject)
            }
    
            if (this.state === 'rejected') {
                let x = onRejected(this.reason)
                resolvePromise(promise2, x, resolve, reject)
            }
    
            if (this.state === 'pending') {
                this.onResolvedCallbacks.push(() => {
                    let x = onFulfilled(this.value)
                    resolvePromise(promise2, x, resolve, reject)
                })
                this.onRejectedCallbacks.push(() => {
                    onRejected(this.reason)
                    resolvePromise(promise2, x, resolve, reject)
                })
            }
        })

        return promise2
    }
}

function resolvePromise(promise2, x, resolve, reject) {
    // 循环引用报错
    if (x === promise2) {
        return reject(new TypeError('Chaining cycle detected for promise'))
    }

    let called
    if (x != null && (typeof x === 'object' || typeof x === 'function')) {
        try {
            let then = x.then
            if (typeof then === 'function') {
                then.call(x, y => {
                    if (called) return
                    called = true
                    resolvePromise(promise2, y, resolve, reject)
                }, err => {
                    if (called) return
                    called = true
                    reject(err)
                })
            } else {
                resolve(x)
            }
        } catch(e) {
            if (called) return
            called = true
            reject(e)
        }
    } else {
        resolve(x)
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