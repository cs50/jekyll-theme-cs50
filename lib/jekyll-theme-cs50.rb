require "cgi"
require "jekyll"
require "kramdown/parser/gfm"
require "sanitize"
require "uri"

require "jekyll-theme-cs50/constants"

module CS50

  class AlertBlock < Liquid::Block

    def initialize(tag_name, text, tokens)
      super
      alert = text.strip().gsub(/\A"|"\Z/, "").gsub(/\A"|"\Z/, "")
      @alert = (["primary", "secondary", "success", "danger", "warning", "info", "light", "dark"].include? alert) ? alert : ""
    end

    def render(context)
      site = context.registers[:site]
      converter = site.find_converter_instance(::Jekyll::Converters::Markdown)
      message = converter.convert(super(context))
      <<~EOT
        <div class="alert" data-alert="#{@alert}" role="alert">
          #{message}
        </div>
      EOT
    end

    Liquid::Template.register_tag("alert", self)

  end

  class NextTag < Liquid::Tag

    def initialize(tag_name, text, tokens)
      super
      @text = (text.length > 0) ? CGI.escapeHTML(text.strip().gsub(/\A"|"\Z/, "").gsub(/\A"|"\Z/, "")) : "Next"
    end

    def render(context)
      site = context.registers[:site]
      converter = site.find_converter_instance(::Jekyll::Converters::Markdown)
      button = Sanitize.fragment(converter.convert(@text), :elements => ["b", "code", "em", "i", "img", "span", "strong", "sub", "sup"])
      <<~EOT
        <button class="btn btn-dark btn-sm" data-next type="button">#{button}</button>
      EOT
    end

    Liquid::Template.register_tag("next", self)

  end

  class SpoilerBlock < Liquid::Block

    def initialize(tag_name, text, tokens)
      super
      @text = (text.length > 0) ? CGI.escapeHTML(text.strip().gsub(/\A"|"\Z/, "").gsub(/\A"|"\Z/, "")) : "Spoiler"
    end

    # https://stackoverflow.com/q/19169849/5156190
    # https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button (re phrasing, but not interactive, content)
    def render(context)
      site = context.registers[:site]
      converter = site.find_converter_instance(::Jekyll::Converters::Markdown)
      summary = Sanitize.fragment(converter.convert(@text), :elements => ["b", "code", "em", "i", "img", "span", "strong", "sub", "sup"])
      details = converter.convert(super(context))
      <<~EOT
        <details>
            <summary>#{summary}</summary>
            #{details}
        </details>
      EOT
    end

    Liquid::Template.register_tag("spoiler", self)

  end

  class VideoTag < Liquid::Tag

    # https://gist.github.com/niquepa/4c59b7d52a15dde2367a
    def initialize(tag_name, text, tokens)
      super
      if text =~ /^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        @v = $1
        components = {
          rel: "0",
          showinfo: "0"
        }
        params = CGI::parse(URI::parse(text.strip).query || "")
        ["autoplay", "end", "index", "list", "start", "t"].each do |param|
            if params.key?(param)
              components[param] = params[param].first
            end
        end
        @src = URI::HTTPS.build(:host => "www.youtube.com", :path => "/embed/#{@v}", :query => URI.encode_www_form(components))
      end
    end

    def render(context)
      if @v and @src
        <<~EOT
          <div class="embed-responsive embed-responsive-16by9">
              <iframe allowfullscreen class="border embed-responsive-item" src="#{@src}" style="background-image: url('https://img.youtube.com/vi/#{@v}/sddefault.jpg'); background-repeat: no-repeat; background-size: cover;"></iframe>
          </div>
        EOT
      else
        <<~EOT
          <p><img alt="static" class="border" data-video src="https://i.imgur.com/xnZ5A2u.gif"></p>
        EOT
      end
    end

    Liquid::Template.register_tag("video", self)

  end
end

# Configure site
Jekyll::Hooks.register :site, :after_reset do |site|
  site.config = Jekyll::Utils.deep_merge_hashes(Jekyll::Utils.deep_merge_hashes(CS50::DEFAULTS, site.config), CS50::OVERRIDES)
end

# TODO: In offline mode, base64-encode images, embed CSS (in style tags) and JS (in script tags), a la
# https://github.com/jekyll/jekyll-mentions/blob/master/lib/jekyll-mentions.rb and
# https://github.com/jekyll/jemoji/blob/master/lib/jemoji.rb
Jekyll::Hooks.register [:pages, :documents], :post_render do |doc|
end

# Remember list markers
module Kramdown
  module Parser
    class GFM < Kramdown::Parser::Kramdown
      def parse_list
        super
        current_list = @tree.children.select{ |element| [:ul].include?(element.type) }.last
        current_list.children.each do |li|
          location = li.options[:location]
          li.attr["data-marker"] = @source.lines[location-1].lstrip[0]
        end
        true
      end
    end
  end
end
