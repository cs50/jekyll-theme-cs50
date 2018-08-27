# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "jekyll-theme-cs50"
  spec.version       = "0.1.1"
  spec.authors       = ["David J. Malan"]
  spec.email         = ["malan@harvard.edu"]

  spec.summary       = "This is CS50's theme for Jekyll."
  spec.homepage      = "https://github.com/cs50/jekyll-theme-cs50/"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").select { |f| f.match(%r!^(_includes|_layouts|_plugins|_sass|assets|LICENSE.txt)!i) }

  spec.add_runtime_dependency "jekyll", "~> 3.8"
  spec.add_runtime_dependency "jekyll-commonmark-ghpages", "~> 0.1.5"
  spec.add_runtime_dependency "jekyll-optional-front-matter", "~> 0.3.0"
  spec.add_runtime_dependency "jekyll-relative-links", "~> 0.5.3"
  spec.add_runtime_dependency "jekyll-titles-from-headings", "~> 0.5.1"
  spec.add_runtime_dependency "jekyll-toc", "~> 0.6.0"
  spec.add_runtime_dependency "jemoji", "~> 0.10.1"
  spec.add_runtime_dependency "replace_regex", "~> 0.1.0"

  spec.add_development_dependency "bundler", "~> 1.16"
  spec.add_development_dependency "rake", "~> 12.0"
end
