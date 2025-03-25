const axios = require('axios');
const { serverHost, apiRootUrl } = require('../config.json');

const apiClient = axios.create({
    baseURL: `${serverHost}${apiRootUrl}`,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000,
    validateStatus: status => status < 500
});

apiClient.interceptors.response.use(
    response => {
        if(response.status == 200) {
            return response.data;
        }
        return response;
    },
    error => {
        if(error.response) {
            switch(error.response.status) {
                case 400:
                    error.message = '잘못된 요청입니다.';
                    break;
                case 404:
                    error.message = '리소스를 찾을 수 없습니다.';
                    break;
                case 500:
                    error.message = '서버 내부 오류입니다.';
                    break;
                default:
                    error.message = `오류 발생: ${error.response.status}`;
            }
        }
        return Promise.reject(error);
    }
);

module.exports = apiClient;