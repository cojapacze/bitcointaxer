import React from 'react';

export default {
  strong: function Strong(chunk) {
    return <strong>{chunk}</strong>;
  },
  b: function B(chunk) {
    return <strong>{chunk}</strong>;
  },
  a: function a(href_combo) {
    const chunks = String(href_combo).split(' ');
    const href = chunks[0];
    const title = chunks.slice(1).join(' ') || href;
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {title}
      </a>
    );
  },
  br: function br() {
    return <br />;
  },
};
