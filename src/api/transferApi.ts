const BASE_URL = 'http://localhost:8080/api/v1';

export async function getTransferPlans(year: number, month: number) {
  // GET /transfer-plans?year={year}&month={month}
  console.log('API 연동 전');
}

export async function createTransferPlans(body: unknown) {
  // POST /transfer-plans
  console.log('API 연동 전');
}

export async function updateTransferPlan(id: number | string, amount: number) {
  // PATCH /transfer-plans/{id}
  console.log('API 연동 전');
}

export async function confirmAllPlans() {
  // POST /transfer-plans/confirm-all
  console.log('API 연동 전');
}

export async function executeTransfer() {
  // POST /transfer-executions/execute
  console.log('API 연동 전');
}

export async function getTransferExecutions() {
  // GET /transfer-executions
  console.log('API 연동 전');
}
