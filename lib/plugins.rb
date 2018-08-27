module Jekyll

  class FitBlock < Liquid::Block

    def initialize(tag_name, text, tokens)
      super
      @text = text
    end

    def render(context)
      "<span class='fit'>#{super}</span>"
    end

  end

end

Liquid::Template.register_tag('fit', Jekyll::FitBlock)
