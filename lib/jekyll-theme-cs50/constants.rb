module CS50

  PLUGINS = {
    "jekyll-default-layout" => "0.1.4",
    "jekyll-optional-front-matter" => "0.3.0",
    "jekyll-redirect-from" => "0.15.0",
    "jekyll-relative-links" => "0.6.0",
    "jekyll-titles-from-headings" => "0.5.1",
    "jemoji" => "0.11.1",
    "liquid-tag-parser" => "1.9.0"
  }.freeze

  DEFAULTS = {
    "optional_front_matter" => {
      "remove_originals" => true
    },
    "plugins"  => CS50::PLUGINS
  }.freeze
  puts CS50::PLUGINS

  OVERRIDES = {
    "exclude" => [
      "redirects.json",
      "vendor"
    ],
    "kramdown" => {
      "gfm_quirks" => "paragraph_end",
      "hard_wrap" => false,
      "input" => "GFM",
      "math_engine" => "mathjax",
      "syntax_highlighter" => "rouge",
      "template" => ""
    },
    "markdown" => "kramdown",
    "permalink" => "pretty",
    "theme" => "jekyll-theme-cs50"
  }.freeze

end
