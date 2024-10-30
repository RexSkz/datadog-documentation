import { HugoConfig } from '../../schemas/hugoConfig';
import { HugoFunctions } from '../../helperModules/HugoFunctions';
import md5 from 'md5';

/**
 * All of the possible attributes an author can define in the img tag.
 */
type ImgTagAttrs = {
  src: string;
  alt: string;
  style: string;
  caption: string;
  video: boolean;
  inline: boolean;
  popup: boolean;
  width: string;
  height: string;
  wide: boolean;
  img_param: string;
  pop_param?: string;
  figure_class?: string;
  figure_style?: string;
  href?: string;
  target?: string;
};

/**
 * Top-level template for the img tag.
 */
export const ImgTemplate = (props: { attrs: ImgTagAttrs; hugoConfig: HugoConfig }) => {
  const { attrs, hugoConfig } = props;

  // Handle videos
  if (attrs.video) {
    return <Video attrs={attrs} hugoConfig={hugoConfig} />;
  }

  // Handle inline images
  if (attrs.inline) {
    return <InlineImage attrs={attrs} hugoConfig={hugoConfig} />;
  }

  // Handle block-display images
  const isGif = attrs.src.split('.')[1] === 'gif';

  if (attrs.popup && !isGif) {
    return (
      <PopUpLink attrs={attrs} hugoConfig={hugoConfig}>
        <Picture attrs={attrs} hugoConfig={hugoConfig} />
      </PopUpLink>
    );
  }

  // If there's an href, wrap the gif or image in a link
  if (attrs.href) {
    return <LinkWrappedImage attrs={attrs} hugoConfig={hugoConfig} />;
  }

  if (isGif) {
    return <Gif attrs={attrs} hugoConfig={hugoConfig} />;
  } else {
    return <Picture attrs={attrs} hugoConfig={hugoConfig} />;
  }
};

// Subcomponents ---------------------------------------------------------------

function Video(props: { attrs: ImgTagAttrs; hugoConfig: HugoConfig }) {
  const { attrs, hugoConfig } = props;
  const src = `${hugoConfig.siteParams.img_url}images/${attrs.src}`;

  return (
    <Figure attrs={attrs}>
      <video
        width={attrs.width || '100%'}
        height="auto"
        muted
        playsInline
        autoPlay
        loop
        controls
      >
        <source src={src} type="video/mp4" media="(min-width: 0px)" />
        <div className="play"></div>
        <div className="pause"></div>
      </video>
    </Figure>
  );
}

function InlineImage(props: { attrs: ImgTagAttrs; hugoConfig: HugoConfig }) {
  const { attrs, hugoConfig } = props;

  const imgProps: Record<string, any> = {
    srcSet: buildImagePermalink({ src: attrs.src, hugoConfig }) + '?auto=format'
  };

  if (attrs.style) {
    imgProps.style = cssStringToObject(attrs.style);
  }

  // Add any additional attributes that the author provided
  // to the img properties
  (['alt', 'width', 'height'] as (keyof ImgTagAttrs)[]).forEach((key) => {
    if (attrs[key]) {
      imgProps[key] = attrs[key];
    }
  });

  return (
    <Figure attrs={attrs}>
      <img {...imgProps} />
    </Figure>
  );
}

function Picture(props: { attrs: ImgTagAttrs; hugoConfig: HugoConfig }) {
  const { attrs, hugoConfig } = props;

  const pictureProps: Record<string, any> = {
    className: 'img-fluid',
    srcSet: buildImagePermalink({ src: attrs.src, hugoConfig }) + '?auto=format'
  };

  if (attrs.style) {
    pictureProps.style = cssStringToObject(attrs.style);
  }

  if (attrs.alt) {
    pictureProps.alt = attrs.alt;
  }

  if (!attrs.wide) {
    if (attrs.width) {
      pictureProps.width = attrs.width;
    }
    if (attrs.height) {
      pictureProps.height = attrs.height;
    }
  }

  return <picture {...pictureProps} />;
}

function Gif(props: { attrs: ImgTagAttrs; hugoConfig: HugoConfig }) {
  const { attrs, hugoConfig } = props;

  const imgProps: Record<string, any> = {
    className: 'img-fluid',
    src: buildImagePermalink({ src: props.attrs.src, hugoConfig })
  };

  if (attrs.style) {
    imgProps.style = cssStringToObject(attrs.style);
  }

  if (attrs.alt) {
    imgProps.alt = attrs.alt;
  }

  return <img {...imgProps} />;
}

// Wrapper components ---------------------------------------------------------

function LinkWrappedImage(props: { attrs: ImgTagAttrs; hugoConfig: HugoConfig }) {
  const { attrs, hugoConfig } = props;

  const linkProps: Record<string, string> = {
    href: attrs.href!
  };

  if (attrs.target) {
    linkProps.target = attrs.target;
  }

  const isGif = attrs.src.split('.')[1] === 'gif';

  if (isGif) {
    return (
      <a {...linkProps}>
        <Gif attrs={attrs} hugoConfig={hugoConfig} />
      </a>
    );
  } else {
    return (
      <a {...linkProps}>
        <Picture attrs={attrs} hugoConfig={hugoConfig} />
      </a>
    );
  }
}

function PopUpLink(props: {
  children: React.ReactNode;
  attrs: ImgTagAttrs;
  hugoConfig: HugoConfig;
}) {
  const { attrs, children, hugoConfig } = props;

  const isGif = attrs.src.split('.')[1] === 'gif';
  const popParam = attrs.pop_param || (isGif ? '?fit=max' : '?fit=max&auto=format');

  // TODO, make this a relative URL: {{ print $img_resource $pop_param | relURL }}
  const href = HugoFunctions.relUrl({
    hugoConfig,
    url: buildImagePermalink({ src: attrs.src, hugoConfig: props.hugoConfig }) + popParam
  });

  return (
    <a
      href={href}
      className="pop"
      data-bs-toggle="modal"
      data-bs-target="#popupImageModal"
    >
      {children}
    </a>
  );
}

function Figure(props: { attrs: ImgTagAttrs; children: React.ReactNode }) {
  let wrapperClass = 'shortcode-wrapper shortcode-img expand';
  let figureClass = 'text-center';

  if (props.attrs.wide) {
    wrapperClass += ' wide-parent';
    figureClass += ' wide';
  }

  let figureStyle = {};
  if (props.attrs.figure_style) {
    figureStyle = cssStringToObject(props.attrs.figure_style);
  }

  return (
    <div className={wrapperClass}>
      <figure className={figureClass} style={figureStyle}>
        {props.children}
        {props.attrs.caption && <figcaption>{props.attrs.caption}</figcaption>}
      </figure>
    </div>
  );
}

// Utility functions -----------------------------------------------------------

function buildImagePermalink(props: { src: string; hugoConfig: HugoConfig }) {
  const { src, hugoConfig } = props;

  // add branch to URL if in staging
  let prefix = '';
  if (hugoConfig.env === 'preview') {
    prefix = `${hugoConfig.siteParams.branch}/`;
  }

  const fingerprintedSrc = src.replace('.', `.${md5(src)}.`);
  const permalink = `${prefix}images/${fingerprintedSrc}`;

  return permalink;
}

function cssStringToObject(css: string) {
  const regex = /(?<=^|;)\s*([^:]+)\s*:\s*([^;]+)\s*/g;
  const result: Record<string, string> = {};
  css.replace(regex, (match, prop, val) => (result[prop] = val));
  return result;
}
