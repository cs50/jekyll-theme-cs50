# frozen_string_literal: true

require File.expand_path("../lib/jekyll-theme-cs50/constants", __FILE__)

Gem::Specification.new do |spec|

  spec.authors = ["CS50"]
  spec.files = `git ls-files -z`.split("\x0").select { |f| f.match(%r!^(_layouts|_includes|_sass|assets|lib|node_modules)/|LICENSE.txt$!i) }
  spec.homepage = "https://cs50.harvard.edu/"
  spec.license = "MIT"
  spec.name = "jekyll-theme-cs50"
  spec.summary = "This is CS50's theme for Jekyll."
  spec.version = "1.1.0"

  spec.add_runtime_dependency "deep_merge", "1.2.2"
  spec.add_runtime_dependency "jekyll", "4.2.1"
  spec.add_runtime_dependency "sanitize", "6.0.0"
  spec.add_runtime_dependency "webrick", "1.7.0" # https://github.com/jekyll/jekyll/issues/8523

  CS50::PLUGINS.each do |gem, version|
    spec.add_runtime_dependency gem, version
  end

end
