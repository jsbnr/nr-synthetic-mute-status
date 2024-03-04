
// --- Runtime code --
async function runScript()  {
    // Add your runtime code here!

    // Simple example
    let response = await got.get('https://www.newrelic.com');
    assert.ok(response.statusCode == 200, 'Expected 200 OK response'); 
}
  
