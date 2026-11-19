import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

const podRequests = new Counter('pod_requests');

const thresholds = {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<100'],
    dropped_iterations: ['count==0'],
    checks: ['rate==1'],
};

const pods = (__ENV.POD_NAMES || '')
    .split(',')
    .filter(Boolean);

for (const pod of pods) {
    thresholds[`pod_requests{pod:${pod}}`] = ['count>0'];
}

export const options = {
    scenarios: {
        pricing_load: {
            executor: 'constant-arrival-rate',
            rate: Number(__ENV.RATE || 100),
            timeUnit: '1s',
            duration: __ENV.DURATION || '60s',
            preAllocatedVUs: Number(__ENV.PRE_ALLOCATED_VUS || 50),
            maxVUs: Number(__ENV.MAX_VUS || 200),
        },
    },

    summaryTrendStats: [
        'avg',
        'min',
        'med',
        'max',
        'p(90)',
        'p(95)',
        'p(99)',
    ],

    thresholds,

    noConnectionReuse: __ENV.NO_REUSE === 'true',
};

const BASE_URL =
    __ENV.BASE_URL || 'http://pricing-service:8080';

const API_PATH =
    __ENV.API_PATH || '/api/exchange-rates';

export default function () {
    const response = http.get(`${BASE_URL}${API_PATH}`, {
        timeout: '5s',
    });

    const podName =
        response.headers['X-Pod-Name'] || 'unknown';

    check(response, {
        'status is 200': (r) => r.status === 200,
        'pod header exists': () => podName !== 'unknown',
    });

    podRequests.add(1, { pod: podName });
}
