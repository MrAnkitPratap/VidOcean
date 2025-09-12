/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://vidocean.xyz',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 0.7,
  
  // 🎯 EXCLUDE UNNECESSARY PAGES
  exclude: [
    '/admin/*',
    '/api/*',
    '/test/*',
    '/_next/*',
    '/404',
    '/500'
  ],

  // 🌍 MULTI-LANGUAGE SUPPORT
  alternateRefs: [
    {
      href: 'https://vidocean.xyz',
      hreflang: 'en-US',
    },
    {
      href: 'https://vidocean.xyz/es',
      hreflang: 'es-ES',
    },
  ],

  // 🤖 ROBOTS.TXT CONFIGURATION
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/test/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    additionalSitemaps: [
      'https://vidocean.xyz/sitemap.xml',
    ],
  },

  // 🔄 TRANSFORM FUNCTION FOR CUSTOM URLs
  transform: async (config , path ) => {
    // Set higher priority for important pages
    let priority = config.priority;
    let changefreq = config.changefreq;

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.includes('/youtube-downloader')) {
      priority = 0.9;
      changefreq = 'daily';
    } else if (path.includes('/instagram-downloader')) {
      priority = 0.9;
      changefreq = 'daily';
    } else if (path.includes('/tiktok-downloader')) {
      priority = 0.9;
      changefreq = 'daily';
    } else if (path.includes('/facebook-downloader')) {
      priority = 0.9;
      changefreq = 'daily';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
      alternateRefs: config.alternateRefs ?? [],
    };
  },

  // ➕ ADDITIONAL PATHS
  additionalPaths: async (config) => {
    const additionalPages = [
      '/youtube-downloader',
      '/instagram-downloader', 
      '/tiktok-downloader',
      '/facebook-downloader',
      '/twitter-downloader',
      '/about',
      '/privacy',
      '/terms',
      '/contact',
      '/guide',
      '/not-found',
    ];

    return additionalPages.map((path) => 
      config.transform(config, path)
    );
  },
}
