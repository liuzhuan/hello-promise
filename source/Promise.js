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
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
        onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err }
        let promise2 = new Promise((resolve, reject) => {
            if (this.state === 'fulfilled') {
                setTimeout(() => {
                    try {
                        let x = onFulfilled(this.value)
                        // resolvePromise 函数，处理自己 return 的 promise 和默认的 promise2 的关系
                        resolvePromise(promise2, x, resolve, reject)
                    } catch(e) {
                        reject(e)
                    }
                }, 0)
            }
    
            if (this.state === 'rejected') {
                setTimeout(() => {
                    try {
                        let x = onRejected(this.reason)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch(e) {
                        reject(e)
                    }
                }, 0)
            }
    
            if (this.state === 'pending') {
                this.onResolvedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(this.value)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch(e) {
                            reject(e)
                        }
                    }, 0)
                })

                this.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            onRejected(this.reason)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch(e) {
                            reject(e)
                        }
                    }, 0)
                })
            }
        })

        return promise2
    }

    catch(fn) {
        return this.then(null, fn)
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

Promise.resolve = function(val) {
    return new Promise((resolve, reject) => {
        resolve(val)
    })
}

Promise.reject = function(val) {
    return new Promise((resolve, reject) => {
        reject(val)
    })
}

Promise.race = function(promises) {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(resolve, reject)
        }
    })
}

Promise.all = function(promises) {
    let arr = []
    let i = 0
    function processData(index, data) {
        arr[index] = data
        i++
        if (i == promises.length) {
            resolve(arr)
        }
    }

    return new Promise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(data => {
                processData(i, data)
            }, reject)
        }
    })
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