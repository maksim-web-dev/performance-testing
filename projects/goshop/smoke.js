import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 5,
    duration: '30s',

    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<500'],
    },
};

const baseUrl = __ENV.BASE_URL;
const apiPath = __ENV.API_PATH;

if (!baseUrl || !apiPath) {
    throw new Error('BASE_URL and API_PATH are required');
}

export default function () {
    const response = http.get(`${baseUrl}${apiPath}`);

    check(response, {
        'status is 200': (r) => r.status === 200,
    });

    sleep(1);
}
