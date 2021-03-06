const redis = require('redis');
const benchmarker = require('../redis_benchmarker')

// Start Redis server with following options
const redisOpt = {
    host: 'localhost',
    port: 7000
}
const redisClient = redis.createClient(redisOpt);

const SAMPLE_TIME = 1577836800;
let replyCounter = 0;

/** redisTESTING REDIS SORTED SETS **/
const ZADDKEY = 'zaddkey';      // Create ZADD key in database

function asynchronousZADD() {
    for (let i = 0; i < benchmarker.BENCHMARK_ITERATIONS; i++) {
        redisClient.zadd(ZADDKEY, i + SAMPLE_TIME, i,
            // Callback func. to increase reply counter and call synchronously ZADDs
            function (error, result) {
                replyCounter++;
                synchronousZADD(1, i);
            })
    }
}

function synchronousZADD(recurDepth, uID) {
    redisClient.zadd(ZADDKEY, recurDepth + SAMPLE_TIME, recurDepth + (uID + 1) * benchmarker.BENCHMARK_ITERATIONS,
        function (error, result) {

            recurDepth++

            // Recursive Case: Recursion depth not reached
            if (recurDepth <= 10) {
                synchronousZADD(recurDepth, uID);
            }
            // Base Case: Last recursion
            else {
                // If reached last async. iteration
                if (uID >= benchmarker.BENCHMARK_ITERATIONS - 1) {
                    // Stop benchmarker clock and print result
                    benchmarker.stopClock();
                    benchmarker.printResult(replyCounter);
                    redisClient.flushall();
                }
            }
        })

}

function main() {
    benchmarker.startClock();
    asynchronousZADD();
}

main();