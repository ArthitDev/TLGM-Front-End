import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <Html lang="th">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
            rel="stylesheet"
          />
          <meta
            name="description"
            content="Smart Wound Care - วินิจฉัยและให้คำแนะนำในการดูแลรักษาแผลด้วย AI อัจฉริยะ"
          />
          <meta
            name="keywords"
            content="Wound Care, AI, Smart Wound Care, วิธี , รักษาแผล, วินิจฉัยแผล ,ปัญญาประดิษฐ์"
          />
          <meta property="og:title" content="SWC Web Application" />
          <meta
            property="og:description"
            content="Smart Wound Care - วินิจฉัยและให้คำแนะนำในการดูแลรักษาแผลด้วย AI อัจฉริยะ"
          />
          <meta property="og:url" content="https://smartwoundcare.site" />
          <meta property="og:image" content="/images/og-image.png" />
          <meta property="og:type" content="website" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
