const blogs = require('./blog-output/blogsFallback.js');
blogs.forEach((b, i) => {
  const text = b.content.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ');
  const words = text.split(/\s+/).filter(w => w).length;
  console.log(\Blog \: \... (\ words)\);
});
