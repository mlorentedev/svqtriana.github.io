module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      staticDistDir: './dist',
      url: [
        'http://localhost/index.html',
        'http://localhost/nosotros/index.html',
        'http://localhost/productos/index.html',
        'http://localhost/media/index.html',
        'http://localhost/encuentro/index.html'
      ],
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1
        },
        // Skip admin pages and styles directory
        skipAudits: ['uses-http2']
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.8 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
