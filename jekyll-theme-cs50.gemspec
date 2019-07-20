# frozen_string_literal: true

Gem::Specification.new do |spec|

  spec.authors       = ["CS50"]
  spec.files         = `git ls-files -z`.split("\x0").select { |f| f.match(%r!^(_layouts|_includes|_sass|assets|LICENSE)!i) }
  spec.homepage      = "https://cs50.harvard.edu/"
  spec.license       = "MIT"
  spec.name          = "jekyll-theme-cs50"
  spec.summary       = "This is CS50's theme for Jekyll."
  spec.version       = "0.1.7"

  spec.add_runtime_dependency "jekyll", "~> 3.8.6"
  spec.add_runtime_dependency "jekyll-default-layout", "~> 0.1.4"
  spec.add_runtime_dependency "jekyll-optional-front-matter", "~> 0.3.0"
  spec.add_runtime_dependency "jekyll-redirect-from", "~> 0.15.0"
  spec.add_runtime_dependency "jekyll-relative-links", "~> 0.6.0"
  spec.add_runtime_dependency "jekyll-titles-from-headings", "~> 0.5.1"
  spec.add_runtime_dependency "jemoji", "~> 0.11.0"

end
