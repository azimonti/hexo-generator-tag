'use strict';

const pagination = require('hexo-pagination');

module.exports = function(locals) {
  const config = this.config;
  const perPage = config.tag_generator.per_page;
  const paginationDir = config.pagination_dir || 'page';
  const orderBy = config.tag_generator.order_by || '-date';
  const tags = locals.tags;
  let tagDir;

  const pages = tags.reduce((result, tag) => {
    if (!tag.length) return result;

    const posts = tag.posts.sort(orderBy);
    const data = pagination(tag.path, posts, {
      perPage: perPage,
      layout: ['tag', 'archive', 'index'],
      format: paginationDir + '/%d/',
      explicitPaging: (config.tag_generator.explicit_paging || config.tag_generator.overwrite_latest || false),
      data: {
        tag: tag.name
      }
    });

    if ((config.tag_generator.overwrite_latest || false) && data.length > 0) {
      const lastPage = data[data.length - 1];
      lastPage.path = lastPage.path.replace(/\/page\/\d+\/?$/, '/latest/');
    }

    if (config.tag_generator.verbose || false) {
      data.forEach(page => {
        console.log(`Generated tag route: ${page.path}`);
      });
    }

    return result.concat(data);
  }, []);

  // generate tag index page, usually /tags/index.html
  if (config.tag_generator.enable_index_page) {
    tagDir = config.tag_dir;
    if (tagDir[tagDir.length - 1] !== '/') {
      tagDir += '/';
    }

    pages.push({
      path: tagDir,
      layout: ['tag-index', 'tag', 'archive', 'index'],
      posts: locals.posts,
      data: {
        base: tagDir,
        total: 1,
        current: 1,
        current_url: tagDir,
        posts: locals.posts,
        prev: 0,
        prev_link: '',
        next: 0,
        next_link: '',
        tags: tags
      }
    });
  }

  return pages;
};
