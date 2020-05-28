const benchmarker = require('../redis_benchmarker')
var redisTimeSeriesTs = require('redis-time-series-ts')
const { TimestampRange } = require( "../node_modules/redis-time-series-ts/lib/entity/timestampRange");


const redisOpt = {
    host: 'localhost',
    port: 7000
}
const factory = new redisTimeSeriesTs.RedisTimeSeriesFactory(redisOpt);
const redisTSClient = factory.create();

const SAMPLE_TIME = 1577836800;
let replyCounter = 0;

/** TESTING REDIS TIME SERIES **/
const rtsKey = "rtsKey";

async function asynchronousTSADD() {
    await redisTSClient.create(rtsKey);
    benchmarker.startClock();
    for (let i = 0; i < benchmarker.BENCHMARK_ITERATIONS; i++) {
        redisTSClient.add(new redisTimeSeriesTs.Sample (rtsKey, 100, i+SAMPLE_TIME)).then(
            // Callback to increase reply counter, which stops the timer and print results if last reply
            (error) => {
                replyCounter++;
                if (replyCounter >= benchmarker.BENCHMARK_ITERATIONS) {
                    benchmarker.stopClock();
                    benchmarker.printResult(replyCounter);
                    replyCounter =0;
                    asynchronousTSRANGE();
                }
            })
            .catch(console.log)
    }
}


function asynchronousTSRANGE() {
    benchmarker.startClock();
    for (let i = 0; i < benchmarker.BENCHMARK_ITERATIONS; i++) {
        redisTSClient.range(rtsKey, new TimestampRange(i+SAMPLE_TIME, i+SAMPLE_TIME+1 )).then(
            // Callback to increase reply counter, which stops the timer and print results if last reply
            (result) => {
                replyCounter++;
                if (replyCounter >= benchmarker.BENCHMARK_ITERATIONS) {
                    benchmarker.stopClock();
                    benchmarker.printResult(replyCounter);
                }
            })
            .catch(console.log)
    }
}

function main() {
    asynchronousTSADD();
}

main();