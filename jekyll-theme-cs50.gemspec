# frozen_string_literal: true

lib = File.expand_path("../lib", __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

Gem::Specification.new do |spec|
  spec.name          = "jekyll-theme-cs50"
  spec.version       = "0.1.2"
  spec.authors       = ["David J. Malan"]
  spec.email         = ["malan@harvard.edu"]

  spec.summary       = "This is CS50's theme for Jekyll."
  spec.homepage      = "https://github.com/cs50/jekyll-theme-cs50"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").select { |f| f.match(%r!^(_includes|_layouts|_sass|assets|lib|LICENSE.txt)!i) }

  spec.require_paths = ["lib"]

  spec.add_runtime_dependency "jekyll", "~> 3.8"

  spec.add_runtime_dependency "jekyll-commonmark-ghpages"
  spec.add_runtime_dependency "jekyll-optional-front-matter"
  spec.add_runtime_dependency "jekyll-relative-links"
  spec.add_runtime_dependency "jekyll-titles-from-headings"
  spec.add_runtime_dependency "jekyll-toc"
  spec.add_runtime_dependency "jemoji"
  spec.add_runtime_dependency "plugins"
  spec.add_runtime_dependency "replace_regex"

  spec.add_development_dependency "bundler", "~> 1.16"
  spec.add_development_dependency "rake", "~> 12.0"
end
