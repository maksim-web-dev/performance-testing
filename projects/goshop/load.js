
import http from 'k6/http';
import { check } from 'k6';

export const options = {
    scenarios: {
        load: {
            executor: 'constant-arrival-rate',
            rate: 200,
            timeUnit: '1s',
            duration: '5m',
            preAllocatedVUs: 50,
            maxVUs: 200,
        },
    },

    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: [
            'p(95)<500',
            'p(99)<1000',
        ],
        checks: ['rate>0.99'],
        dropped_iterations: ['count==0'],
    },
};

export default function () {
    const res = http.get(
        `${__ENV.BASE_URL}${__ENV.API_PATH}`
    );

    check(res, {
        'HTTP 200': (r) => r.status === 200,
    });
}
