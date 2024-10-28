import { render } from '.';
import { Tag, Config } from 'markdoc-static-compiler';
import MarkdownIt from 'markdown-it';
const { escapeHtml, unescapeAll } = MarkdownIt().utils;

export abstract class CustomHtmlComponent {
  contents = '';
  tag: Tag;
  config: Config | undefined;
  // TODO: What kind of type should be used for components?
  components: Record<string, any> | undefined;

  constructor(
    tag: Tag,
    config?: Config,
    components?: Record<string, CustomHtmlComponent>
  ) {
    this.config = config;
    this.components = components;
    this.tag = tag;
    if (tag.children.length > 0) {
      this.contents = render(tag.children, config, components);
    }
  }

  forwardNamedAttributes(): string {
    let result = '';
    Object.keys(this.tag.attributes).forEach((key) => {
      result += ` ${key}="${this.tag.attributes[key]}"`;
    });
    return result;
  }

  escapeHtml(str: string): string {
    return escapeHtml(str);
  }

  unescapeAll(str: string): string {
    return unescapeAll(str);
  }

  abstract render(): string;
}
