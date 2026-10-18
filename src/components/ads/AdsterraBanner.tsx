import React from 'react';

interface AdsterraBannerProps {
  adKey: string;
  width: 160;
  height: 300 | 600;
  title: string;
}

/**
 * Runs the Adsterra-provided loader inside a sandboxed, fixed-size iframe.
 * The ad vendor's script stays isolated from the React app and cannot use
 * document.write to replace the host page.
 */
export const AdsterraBanner: React.FC<AdsterraBannerProps> = ({
  adKey,
  width,
  height,
  title,
}) => {
  const adDocument = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    html, body {
      box-sizing: border-box;
      width: ${width}px;
      height: ${height}px;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: transparent;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    var atOptions = {
      'key': '${adKey}',
      'format': 'iframe',
      'height': ${height},
      'width': ${width},
      'params': {}
    };
  </script>
  <script type="text/javascript" src="https://bicea.org/22/${adKey}"></script>
</body>
</html>`;

  return (
    <iframe
      title={title}
      srcDoc={adDocument}
      width={width}
      height={height}
      loading="lazy"
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="strict-origin-when-cross-origin"
      className="block border-0 bg-transparent"
      style={{ width, height, maxWidth: '100%' }}
    />
  );
};
