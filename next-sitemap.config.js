/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://vidocean.xyz',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,

  // 🎯 SEO OPTIMIZATION: Exclude crawl-heavy pages
  exclude: [
    '/admin/*',
    '/api/*',
    '/test/*',
    '/_next/*',
    '/404',
    '/500',
    '/_error',
    '/manifest.json',
    '/favicon.ico'
  ],

  // 🤖 ADVANCED ROBOTS.TXT FOR SEO
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/', 
          '/api/', 
          '/test/',
          '/_next/',
          '/static/',
          '/*.json$',
          '/manifest.json',
          '/sw.js'
        ],
        crawlDelay: 1, // SEO: Respectful crawling
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/test/'],
        crawlDelay: 0, // SEO: Fast Googlebot access
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/test/'],
        crawlDelay: 1,
      }
    ],
    // SEO: Additional sitemaps for future expansion
    additionalSitemaps: [
      // Only add if you have image/video sitemaps in future
    ],
  },

  // 🔄 ADVANCED SEO-OPTIMIZED TRANSFORM
  transform: async (config, path) => {
    // SEO: Dynamic priority and frequency based on page type
    let priority = 0.5;
    let changefreq = 'monthly';

    // 🏠 Homepage - Highest Priority
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } 
    // 📱 Main Downloader Pages - Very High Priority
    else if (path === '/youtube-downloader') {
      priority = 0.95;
      changefreq = 'daily';
    }
    else if (path === '/instagram-downloader') {
      priority = 0.95;
      changefreq = 'daily';
    }
    else if (path === '/tiktok-downloader') {
      priority = 0.94;
      changefreq = 'daily';
    }
    else if (path === '/facebook-downloader') {
      priority = 0.94;
      changefreq = 'daily';
    }
    // 📖 Content Pages - High Priority
    else if (path === '/about') {
      priority = 0.8;
      changefreq = 'monthly';
    }
    else if (path === '/guide') {
      priority = 0.85;
      changefreq = 'weekly'; // SEO: Guides updated more often
    }
    // ⚖️ Legal Pages - Medium Priority
    else if (path === '/privacy') {
      priority = 0.6;
      changefreq = 'yearly';
    }
    else if (path === '/terms') {
      priority = 0.6;
      changefreq = 'yearly';
    }
    // ⚙️ Settings - Low Priority
    else if (path === '/settings') {
      priority = 0.5;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
      // SEO: Add alternate language refs if needed in future
      alternateRefs: [],
    };
  },

  // ➕ SEO-OPTIMIZED ADDITIONAL PATHS
  additionalPaths: async (config) => {
    const seoPages = [
      // Main service pages - highest priority
      {
        path: '/youtube-downloader',
        priority: 0.95,
        changefreq: 'daily'
      },
      {
        path: '/instagram-downloader', 
        priority: 0.95,
        changefreq: 'daily'
      },
      {
        path: '/tiktok-downloader',
        priority: 0.94,
        changefreq: 'daily'
      },
      {
        path: '/facebook-downloader',
        priority: 0.94,
        changefreq: 'daily'
      },
      // Content pages
      {
        path: '/about',
        priority: 0.8,
        changefreq: 'monthly'
      },
      {
        path: '/guide',
        priority: 0.85,
        changefreq: 'weekly'
      },
      // Legal pages
      {
        path: '/privacy',
        priority: 0.6,
        changefreq: 'yearly'
      },
      {
        path: '/terms',
        priority: 0.6,
        changefreq: 'yearly'  
      },
      // Settings
      {
        path: '/settings',
        priority: 0.5,
        changefreq: 'monthly'
      }
    ];

    return seoPages.map((page) => ({
      loc: page.path,
      changefreq: page.changefreq,
      priority: page.priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [],
    }));
  },

  // 🔧 SEO ADVANCED OPTIONS
  trailingSlash: false, // SEO: Clean URLs without trailing slash
  outDir: './public', // Ensure proper output directory
  
  // 🎯 CUSTOM SITEMAP GENERATION
  additionalPaths: async (config) => {
    return [
      // Future: Add dynamic pages here
      // Blog posts, categories, etc.
    ];
  },
}
