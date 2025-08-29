"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("./index");
describe('GET /api/v1/status', () => {
    it('responds with json', async () => {
        const response = await (0, supertest_1.default)(index_1.app)
            .get('/api/v1/status')
            .set('Accept', 'application/json');
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({ status: 'ok' });
    });
});
