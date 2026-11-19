
import http from 'k6/http';

export const options = {
    scenarios: {
        stress: {
            executor: 'ramping-arrival-rate',
            startRate: 50,
            timeUnit: '1s',
            preAllocatedVUs: 100,
            maxVUs: 500,

            stages: [
                { duration: '2m', target: 100 },
                { duration: '2m', target: 200 },
                { duration: '2m', target: 400 },
                { duration: '2m', target: 600 },
                { duration: '2m', target: 1000 },
                { duration: '2m', target: 1000 },
                { duration: '2m', target: 50 },
            ],
        },
    },

    thresholds: {
        http_req_failed: ['rate<0.05'],
        http_req_duration: ['p(95)<1000'],
        dropped_iterations: ['count==0'],
    },
};

export default function () {
    http.get(`${__ENV.BASE_URL}${__ENV.API_PATH}`);
}
