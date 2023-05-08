const fetch = require('node-fetch');

async function reset() {
  const result = await fetch('https://f5n6d2t3cb.execute-api.us-east-1.amazonaws.com/prod/reset-redis', {
    method: 'POST'
  });

  if (result.status != 200) {
    console.error('Failed to reset cache.');
    throw new Error('Failed to reset cache.');
  }
}

async function charge() {
  const result = await fetch('https://f5n6d2t3cb.execute-api.us-east-1.amazonaws.com/prod/charge-request-redis', {
    method: 'POST'
  });

  if (result.status != 200) {
    console.error('Failed to charge.');
    throw new Error('Failed to charge.');
  }

  return result.json();
}

test('40 parallel requests', async () => {

  await reset();

  const promises = new Array(40).fill(0).map(charge);
  const results = await Promise.all(promises);

  const nonAuthorized = results.filter(r => r.isAuthorized === false);
  const authorized = results.filter(r => r.isAuthorized);

  expect(nonAuthorized.length).toBe(20);
  expect(nonAuthorized.every(r => r.remainingBalance === 0)).toBe(true);

  expect(authorized.length).toBe(20);
  authorized.sort((a, b) => a.remainingBalance - b.remainingBalance);
  expect(authorized.map(x => x.remainingBalance)).toStrictEqual(Array(20).fill(0).map((_, i) => i * 5));

});
