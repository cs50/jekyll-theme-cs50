require "cgi"
require "jekyll"
require "kramdown/parser/gfm"
require "liquid/tag/parser"
require "sanitize"
require "uri"

require "jekyll-theme-cs50/constants"

module CS50

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
        if @args[:ctz] == true
          <<~EOT
            <iframe data-calendar="#{@src}" data-ctz style="height: #{@height}px;"></iframe>
          EOT
        else
          <<~EOT
            <iframe data-calendar="#{@src}" style="height: #{@height}px;"></iframe>
          EOT
        end
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
      button = Sanitize.fragment(converter.convert(@text), :elements => ["b", "code", "em", "i", "img", "span", "strong", "sub", "sup"])
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

# Prepend site.baseurl to absolute paths
# https://github.com/benbalter/jekyll-relative-links/blob/master/lib/jekyll-relative-links/generator.rb
LINK_TEXT_REGEX = %r!(.*?)!.freeze
FRAGMENT_REGEX = %r!(#.+?)?!.freeze
INLINE_LINK_REGEX = %r!\[#{LINK_TEXT_REGEX}\]\(([^\)]+?)#{FRAGMENT_REGEX}\)!.freeze
Jekyll::Hooks.register [:pages], :pre_render do |doc, payload|

  puts "HERE"
  puts doc.inspect
  puts payload.inspect
  next

  # If no site.baseurl
  next if !doc.site.baseurl

  # If .md file
  markdown_converter ||= doc.site.find_converter_instance(Jekyll::Converters::Markdown)
  if markdown_converter.matches(doc.extname)

    # For each link
    doc.content = doc.content.dup.gsub(INLINE_LINK_REGEX) do |original|

      # []
      a = Regexp.last_match[1]

      # ()
      href = Regexp.last_match[2]

      # If absolute path, prepend site.baseurl
      if href.start_with?("/")
        href = doc.site.baseurl.gsub(/\/\Z/, "") + "/" + href.gsub(/\A\//, "")
        "[#{a}](#{href})"

      # Else leave unchanged
      else
        original
      end
    end
  end
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
