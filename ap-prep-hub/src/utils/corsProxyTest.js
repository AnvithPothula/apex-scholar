/**
 * CORS Proxy Testing Utility
 * Tests different CORS proxy services to find working ones
 */

class CorsProxyTester {
  constructor() {
    this.proxies = [
      'https://corsproxy.io/?',
      'https://cors-anywhere.herokuapp.com/',
      'https://api.allorigins.win/raw?url=',
      'https://proxy.cors.sh/'
    ];
  }

  /**
   * Test a simple HTTP request through each proxy
   */
  async testProxies(testUrl = 'https://httpbin.org/get') {
    console.log('🧪 Testing CORS proxies...');
    const results = [];

    for (let i = 0; i < this.proxies.length; i++) {
      const proxy = this.proxies[i];
      const proxiedUrl = proxy + encodeURIComponent(testUrl);
      
      try {
        console.log(`Testing proxy ${i + 1}/${this.proxies.length}: ${proxy}`);
        
        const startTime = performance.now();
        const response = await fetch(proxiedUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'Apex Scholar CORS Test'
          },
          mode: 'cors',
          credentials: 'omit'
        });

        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        if (response.ok) {
          const data = await response.text();
          results.push({
            proxy,
            status: 'SUCCESS',
            responseTime,
            dataLength: data.length,
            statusCode: response.status
          });
          console.log(`✅ Proxy ${i + 1} SUCCESS (${responseTime}ms)`);
        } else {
          results.push({
            proxy,
            status: 'FAILED',
            responseTime,
            error: `HTTP ${response.status}: ${response.statusText}`,
            statusCode: response.status
          });
          console.log(`❌ Proxy ${i + 1} FAILED: HTTP ${response.status}`);
        }
      } catch (error) {
        results.push({
          proxy,
          status: 'ERROR',
          error: error.message
        });
        console.log(`💥 Proxy ${i + 1} ERROR: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Get the best working proxy based on test results
   */
  getBestProxy(testResults) {
    const workingProxies = testResults.filter(result => result.status === 'SUCCESS');
    
    if (workingProxies.length === 0) {
      return null;
    }

    // Sort by response time (fastest first)
    workingProxies.sort((a, b) => a.responseTime - b.responseTime);
    
    return workingProxies[0].proxy;
  }

  /**
   * Test proxies and update SchoologyCalendarService
   */
  async updateSchoologyProxies() {
    const testResults = await this.testProxies();
    const workingProxies = testResults
      .filter(result => result.status === 'SUCCESS')
      .map(result => result.proxy);

    console.log('📊 CORS Proxy Test Results:');
    console.table(testResults);

    if (workingProxies.length > 0) {
      console.log(`✅ Found ${workingProxies.length} working proxies`);
      console.log('🚀 Recommended proxy order:', workingProxies);
      return workingProxies;
    } else {
      console.log('❌ No working proxies found');
      return [];
    }
  }
}

// Export for use in development
window.corsProxyTester = new CorsProxyTester();

export default CorsProxyTester;
