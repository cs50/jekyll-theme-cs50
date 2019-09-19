require "cgi"
require "jekyll"
require "jekyll-redirect-from"
require "kramdown/parser/gfm"
require "kramdown/parser/kramdown/link"
require "liquid/tag/parser"
require "sanitize"
require "uri"

require "jekyll-theme-cs50/constants"

module CS50

  # Sanitize string, allowing only these tags, which are a (reasonable) subset of
  # https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Phrasing_content
  def self.sanitize(s)
    Sanitize.fragment(s, :elements => ["b", "code", "em", "i", "img", "kbd", "span", "strong", "sub", "sup"]).strip
  end

  class AlertBlock < Liquid::Block

    def initialize(tag_name, markup, options)
      super
      @args = Liquid::Tag::Parser.new(markup)
      alert = @args[:argv1]
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

  class CalendarTag < Liquid::Tag

    # https://gist.github.com/niquepa/4c59b7d52a15dde2367a
    def initialize(tag_name, markup, options)
      super

      # Parse arguments
      @args = Liquid::Tag::Parser.new(markup)

      # Calendar's height
      @height = @args[:height] || "480"

      # Default components
      components = {
        height: @height,
        mode: @args[:mode] || "AGENDA",
        showCalendars: "0",
        showDate: "0",
        showNav: "0",
        showPrint: "0",
        showTabs: "0",
        showTitle: "0",
        showTz: "1",
        src: @args[:argv1]
      }

      # Build URL
      @src = URI::HTTPS.build(:host => "calendar.google.com", :path => "/calendar/embed", :query => URI.encode_www_form(components))

    end

    def render(context)
      if @height and @src
        <<~EOT
          <iframe data-calendar="#{@src}" #{@args[:ctz] ? 'data-ctz' : ''} style="height: #{@height}px;"></iframe>
        EOT
      else
        <<~EOT
          📅
        EOT
      end
    end

    Liquid::Template.register_tag("calendar", self)

  end

  class NextTag < Liquid::Tag

    def initialize(tag_name, markup, options)
      super
      @args = Liquid::Tag::Parser.new(markup)
      @text = (@args[:argv1]) ? CGI.escapeHTML(@args[:argv1]) : "Next"
    end

    def render(context)
      site = context.registers[:site]
      converter = site.find_converter_instance(::Jekyll::Converters::Markdown)
      button = CS50::sanitize(converter.convert(@text))
      <<~EOT
        <button class="btn btn-dark btn-sm" data-next type="button">#{button}</button>
      EOT
    end

    Liquid::Template.register_tag("next", self)

  end

  class SpoilerBlock < Liquid::Block

    def initialize(tag_name, markup, options)
      super
      @args = Liquid::Tag::Parser.new(markup)
      @text = (@args[:argv1]) ? CGI.escapeHTML(@args[:argv1]) : "Spoiler"
    end

    # https://stackoverflow.com/q/19169849/5156190
    # https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button (re phrasing, but not interactive, content)
    def render(context)
      site = context.registers[:site]
      converter = site.find_converter_instance(::Jekyll::Converters::Markdown)
      summary = CS50::sanitize(converter.convert(@text))
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
    def initialize(tag_name, markup, options)
      super

      # Allow unquoted URLs in argv1
      begin
        tokens = markup.split(" ", 2)
        uri = URI.parse(tokens[0])
        if uri.kind_of?(URI::HTTP) or uri.kind_of?(URI::HTTPS)
          markup = "'#{tokens[0]}' #{tokens[1]}"
        end
      rescue
      end

      # Parse arguments
      @args = Liquid::Tag::Parser.new(markup)

      # Parse YouTube URL
      if @args[:argv1] and @args[:argv1] =~ /^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

        # Video's ID
        @v = $1

        # Determine aspect ratio
        @ratio = "16by9" # Default
        ["21by9", "4by3", "1by1"].each do |ratio|
          if @args.args.keys[1].to_s == ratio
            @ratio = ratio
          end
        end

        # Default components
        components = {
          rel: "0",
          showinfo: "0"
        }

        # Supported components
        params = CGI::parse(URI::parse(@args[:argv1]).query || "")
        ["autoplay", "end", "index", "list", "start", "t"].each do |param|
            if params.key?(param)
              components[param] = params[param].first
            end
        end

        # Build URL
        @src = URI::HTTPS.build(:host => "www.youtube.com", :path => "/embed/#{@v}", :query => URI.encode_www_form(components))
      end
    end

    def render(context)
      if @v and @src and @ratio
        <<~EOT
          <div class="embed-responsive embed-responsive-#{@ratio}" data-video>
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

Jekyll::Hooks.register :site, :pre_render do |site|
  $site = site
end

# TODO: In offline mode, base64-encode images, embed CSS (in style tags) and JS (in script tags), a la
# https://github.com/jekyll/jekyll-mentions/blob/master/lib/jekyll-mentions.rb and
# https://github.com/jekyll/jemoji/blob/master/lib/jemoji.rb
Jekyll::Hooks.register [:pages, :documents], :post_render do |doc|
end

# Disable relative_url filter, since we prepend site.baseurl to all absolute paths
module Jekyll
  module Filters
    module URLFilters
      def relative_url(input)
        Jekyll.logger.warn "CS50 warning: no need to use relative_url with this theme"
        input
      end
    end
  end
end

# Disable redirects.json
module JekyllRedirectFrom
  class Generator < Jekyll::Generator
    def generate_redirects_json
    end
  end
end

module Kramdown
  module Parser
    class GFM < Kramdown::Parser::Kramdown

      def parse_link
        super

        # Get link
        current_link = @tree.children.select{ |element| [:a].include?(element.type) }.last

        # If absolute path, prepend site.baseurl
        unless current_link.nil? or $site.baseurl.nil?

          # Trim leading whitespace from inline link
          # https://github.github.com/gfm/#links
          href = current_link.attr["href"].sub(/\A\s*/, "")  # https://github.github.com/gfm/#whitespace-character

          # If absolute path
          if href.start_with?("/")

              # Prepend site.baseurl
              current_link.attr["href"] = $site.baseurl.sub(/\/\Z/, "") + "/" + href.sub(/\A\//, "")
          end
        end
      end

      # Remember list markers
      def parse_list
        super
        current_list = @tree.children.select{ |element| [:ul].include?(element.type) }.last
        unless current_list.nil?
          current_list.children.each do |li|
            location = li.options[:location]
            li.attr["data-marker"] = @source.lines[location-1].lstrip[0]
          end
        end
        true
      end

    end
  end
end
